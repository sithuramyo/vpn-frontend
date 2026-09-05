"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { getUsageByServer, getUsageByUser, getUsageSummary } from "@/lib/api/usage";

export function useUsage() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["usage", "summary"],
    queryFn: () => getUsageSummary(session?.backendToken),
    enabled: !!session?.backendToken,
  });
}

export function useUsageByUser(params: { page?: number; page_size?: number } = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["usage", "users", params],
    queryFn: () => getUsageByUser(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useUsageByServer() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["usage", "servers"],
    queryFn: () => getUsageByServer(session?.backendToken),
    enabled: !!session?.backendToken,
  });
}
