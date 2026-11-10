import axios, { type InternalAxiosRequestConfig } from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_BACKEND_URL must be configured in production.");
}

let getSessionToken: (() => Promise<string | null>) | null = null;

/** Installed by the ClerkTokenBridge once Clerk's auth context is ready. */
export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  getSessionToken = getter;
}

export const apiClient = axios.create({
  baseURL: (backendUrl ?? "http://localhost:8000") + "/api/v1",
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (getSessionToken) {
    try {
      const token = await getSessionToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      else delete config.headers.Authorization;
    } catch {
      delete config.headers.Authorization;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail;
    if (detail) error.message = typeof detail === "string" ? detail : JSON.stringify(detail);
    return Promise.reject(error);
  }
);
