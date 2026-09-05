import type { ApiEnvelope, PaginationMeta } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** User-facing copy for each status the backend documents returning. */
export function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "That item could not be found. It may have already been removed.";
    case 409:
      return "This already exists or conflicts with an existing item.";
    case 422:
      return "Please check the form for errors and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "The server is unavailable right now. Please try again shortly.";
    default:
      return fallback;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildQuery(params?: RequestOptions["params"]): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function request<T>(
  path: string,
  token: string | undefined,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: PaginationMeta }> {
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", messageForStatus(401, "Not authenticated."));
  }

  const res = await fetch(`${API_URL}${path}${buildQuery(options.params)}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return { data: undefined as T };
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) {
      throw new ApiError(res.status, "UNKNOWN", messageForStatus(res.status, "Request failed."));
    }
    // Non-JSON success (e.g. the QR PNG endpoint) - caller handles it.
    return { data: (await res.blob()) as unknown as T };
  }

  const body = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || body.error) {
    const code = body.error?.code ?? "UNKNOWN";
    const message = body.error?.message ?? messageForStatus(res.status, "Request failed.");
    throw new ApiError(res.status, code, message);
  }

  return { data: body.data as T, meta: body.meta };
}

export async function apiGet<T>(
  path: string,
  token: string | undefined,
  params?: RequestOptions["params"]
): Promise<T> {
  const { data } = await request<T>(path, token, { method: "GET", params });
  return data;
}

export async function apiGetWithMeta<T>(
  path: string,
  token: string | undefined,
  params?: RequestOptions["params"]
): Promise<{ data: T; meta?: PaginationMeta }> {
  return request<T>(path, token, { method: "GET", params });
}

export async function apiPost<T>(path: string, token: string | undefined, body?: unknown): Promise<T> {
  const { data } = await request<T>(path, token, { method: "POST", body });
  return data;
}

export async function apiPatch<T>(path: string, token: string | undefined, body?: unknown): Promise<T> {
  const { data } = await request<T>(path, token, { method: "PATCH", body });
  return data;
}

export async function apiDelete(path: string, token: string | undefined): Promise<void> {
  await request<void>(path, token, { method: "DELETE" });
}

export async function apiGetBlob(path: string, token: string | undefined): Promise<Blob> {
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", messageForStatus(401, "Not authenticated."));
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new ApiError(res.status, "UNKNOWN", messageForStatus(res.status, "Request failed."));
  }
  return res.blob();
}
