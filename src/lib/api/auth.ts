import { apiGet, apiPost } from "@/lib/api/client";
import type { Admin } from "@/types/api";

export function getMe(token: string | undefined) {
  return apiGet<Admin>("/api/v1/auth/me", token);
}

export function logout(token: string | undefined) {
  return apiPost<void>("/api/v1/auth/logout", token);
}
