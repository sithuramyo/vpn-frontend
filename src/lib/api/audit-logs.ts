import { apiGet, apiGetWithMeta } from "@/lib/api/client";
import type { AuditLog, DashboardSummary } from "@/types/api";

export interface ListAuditLogsParams {
  page?: number;
  page_size?: number;
  admin_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  from?: string;
  to?: string;
  [key: string]: string | number | boolean | undefined;
}

export function listAuditLogs(token: string | undefined, params: ListAuditLogsParams = {}) {
  return apiGetWithMeta<AuditLog[]>("/api/v1/audit-logs", token, params);
}

export function getDashboardSummary(token: string | undefined) {
  return apiGet<DashboardSummary>("/api/v1/metrics/summary", token);
}
