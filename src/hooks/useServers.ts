"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  createServer,
  deleteServer,
  getServer,
  getServerHealth,
  getServerMetricsHistory,
  listServers,
  updateServer,
  type CreateServerInput,
} from "@/lib/api/servers";

export function useServers(params: { page?: number; page_size?: number } = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["servers", params],
    queryFn: () => listServers(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useServer(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["servers", id],
    queryFn: () => getServer(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id,
  });
}

export function useServerHealth(id: string, refetchIntervalMs = 30_000) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["servers", id, "health"],
    queryFn: () => getServerHealth(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id,
    refetchInterval: refetchIntervalMs,
  });
}

export function useServerMetricsHistory(id: string, window = "24h") {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["servers", id, "metrics", window],
    queryFn: () => getServerMetricsHistory(session?.backendToken, id, window),
    enabled: !!session?.backendToken && !!id,
    refetchInterval: 60_000,
  });
}

export function useCreateServer() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServerInput) => createServer(session?.backendToken, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["servers"] }),
  });
}

export function useUpdateServer(id: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateServerInput & { status: string }>) =>
      updateServer(session?.backendToken, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["servers", id] });
    },
  });
}

export function useDeleteServer() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteServer(session?.backendToken, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["servers"] }),
  });
}
