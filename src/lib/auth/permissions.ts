import type { AdminRole } from "@/types/api";

/**
 * UI-level role gating only. The backend re-checks every role on every
 * request (see vpn-backend/internal/middleware.RequireRole) and is always
 * the source of truth - these helpers exist purely to avoid flashing
 * controls a user isn't allowed to use, not to enforce security.
 */
export function canWrite(role: AdminRole | undefined): boolean {
  return role === "ADMIN" || role === "OPERATOR";
}

export function isAdmin(role: AdminRole | undefined): boolean {
  return role === "ADMIN";
}
