import axios from "axios";

export const apiClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000") + "/api/v1",
  timeout: 30_000,
});

// Inject Clerk session token into every request
apiClient.interceptors.request.use(async (config) => {
  try {
    // @ts-ignore — Clerk's window object
    const token = await window?.Clerk?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Not authenticated — public route
  }
  return config;
});

// Normalize error messages
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err?.response?.data?.detail;
    if (detail) err.message = typeof detail === "string" ? detail : JSON.stringify(detail);
    return Promise.reject(err);
  }
);
