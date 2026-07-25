import axios, { type AxiosError, type AxiosInstance } from "axios";
import { API_BASE_URL, AUTH_PATHS, TOKEN_KEY, USER_KEY } from "./constants";

export interface ApiErrorBody {
  error?: string;
  errors?: string[];
  message?: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: Boolean(API_BASE_URL),
});

/** In-memory token mirror so requests never miss auth during hydration. */
let memoryAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  memoryAuthToken = token;
}

function resolveAuthToken(): string | null {
  if (typeof window === "undefined") return memoryAuthToken;
  return memoryAuthToken ?? localStorage.getItem(TOKEN_KEY);
}

function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setApiAuthToken(null);
}

apiClient.interceptors.request.use((config) => {
  const token = resolveAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const pathname = window.location.pathname;
      const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
      if (!isAuthPage) {
        clearStoredSession();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

/** True when axios failed before receiving any HTTP response (server down, refused, offline). */
export function isApiUnreachableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response) return false;
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ERR_CONNECTION_REFUSED" ||
    error.code === "ECONNABORTED"
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      if (isApiUnreachableError(error)) {
        if (error.code === "ECONNABORTED") {
          const url = String(error.config?.url || "");
          if (url.includes("/api/ai/")) {
            return "AI generation timed out. The model is taking longer than usual — please try again.";
          }
          return "Request timed out. Check that the API server is running.";
        }
        return "Cannot reach the API server. Make sure hirehub-api is running on port 5000.";
      }
      return error.message || "Network error. Check your connection and API server.";
    }
    const status = error.response.status;
    const data = error.response.data;
    if (data?.errors?.length) return data.errors.join(" ");
    if (data?.error) return data.error;
    if (data?.message) return data.message;

    // Next.js rewrite/proxy failures often surface as generic 500 plain text.
    // That is not the same as "Flask is not running" — keep messaging accurate.
    if (status >= 500) {
      if (typeof data === "string" && /internal server error/i.test(data)) {
        return "API request failed (server error). If AI is running, wait and retry; otherwise restart hirehub-api.";
      }
      if (
        !data ||
        (typeof data === "object" &&
          !data.error &&
          !data.errors?.length &&
          !data.message)
      ) {
        return "API request failed. Confirm hirehub-api is running on port 5000, then retry.";
      }
    }

    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default apiClient;
