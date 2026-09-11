import axios from "axios";

// Use the same-origin proxy in the browser. The Next.js rewrite forwards this
// path to the backend without exposing a separate backend origin to the client.
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrl && process.env.NODE_ENV === "production") {
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_BACKEND_URL is not set — API calls will incorrectly default to localhost:8000."
  );
}

export const apiClient = axios.create({
  baseURL: (typeof window !== "undefined" && !backendUrl ? "" : (backendUrl ?? "http://localhost:8000")) + "/api/v1",
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
