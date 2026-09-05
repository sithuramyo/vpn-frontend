"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { getDashboardSummary, listAuditLogs, type ListAuditLogsParams } from "@/lib/api/audit-logs";

export function useAuditLogs(params: ListAuditLogsParams = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => listAuditLogs(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useDashboardSummary() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["metrics", "summary"],
    queryFn: () => getDashboardSummary(session?.backendToken),
    enabled: !!session?.backendToken,
  });
}
