"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  createAccessKey,
  deleteAccessKey,
  getAccessKey,
  getAccessKeyConfig,
  getAccessKeyQR,
  listAccessKeys,
  revokeAccessKey,
  rotateAccessKey,
  type CreateAccessKeyInput,
  type ListAccessKeysParams,
} from "@/lib/api/access-keys";

export function useAccessKeys(params: ListAccessKeysParams = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["access-keys", params],
    queryFn: () => listAccessKeys(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useAccessKey(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["access-keys", id],
    queryFn: () => getAccessKey(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id,
  });
}

export function useAccessKeyConfig(id: string, enabled: boolean) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["access-keys", id, "config"],
    queryFn: () => getAccessKeyConfig(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id && enabled,
  });
}

export function useAccessKeyQR(id: string, enabled: boolean) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["access-keys", id, "qr"],
    queryFn: async () => {
      const blob = await getAccessKeyQR(session?.backendToken, id);
      return URL.createObjectURL(blob);
    },
    enabled: !!session?.backendToken && !!id && enabled,
    staleTime: Infinity,
  });
}

export function useCreateAccessKey() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccessKeyInput) => createAccessKey(session?.backendToken, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["access-keys"] }),
  });
}

export function useRevokeAccessKey() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeAccessKey(session?.backendToken, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["access-keys"] });
      queryClient.invalidateQueries({ queryKey: ["access-keys", id] });
    },
  });
}

export function useRotateAccessKey() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rotateAccessKey(session?.backendToken, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["access-keys"] });
      queryClient.invalidateQueries({ queryKey: ["access-keys", id] });
      queryClient.invalidateQueries({ queryKey: ["access-keys", id, "config"] });
      queryClient.invalidateQueries({ queryKey: ["access-keys", id, "qr"] });
    },
  });
}

export function useDeleteAccessKey() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccessKey(session?.backendToken, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["access-keys"] }),
  });
}
