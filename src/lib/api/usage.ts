import { apiGet, apiGetWithMeta } from "@/lib/api/client";
import type { ServerUsage, UsageSummary, UserUsage } from "@/types/api";

export function getUsageSummary(token: string | undefined) {
  return apiGet<UsageSummary>("/api/v1/usage/summary", token);
}

export function getUsageByUser(token: string | undefined, params: { page?: number; page_size?: number } = {}) {
  return apiGetWithMeta<UserUsage[]>("/api/v1/usage/users", token, params);
}

export function getUsageByServer(token: string | undefined) {
  return apiGet<ServerUsage[]>("/api/v1/usage/servers", token);
}
