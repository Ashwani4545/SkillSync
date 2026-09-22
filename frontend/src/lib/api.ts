import axios from "axios";

// NEXT_PUBLIC_BACKEND_URL must be set (browser-visible) for this to work
// outside of localhost — it is NOT the same as the server-only BACKEND_URL
// used by next.config.js's rewrite proxy.
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrl && process.env.NODE_ENV === "production") {
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_BACKEND_URL is not set — API calls will incorrectly default to localhost:8000."
  );
}

export const apiClient = axios.create({
  baseURL: (backendUrl ?? "http://localhost:8000") + "/api/v1",
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
