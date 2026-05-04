import { config } from "../constants/config";
import type { ApiResponse, ApiError } from "../types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      code: "UNKNOWN",
      message: "不明なエラーが発生しました",
    }));
    throw error;
  }

  return response.json() as Promise<ApiResponse<T>>;
}
