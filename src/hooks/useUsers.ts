"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  createUser,
  deleteUser,
  disableUser,
  getUser,
  listUsers,
  updateUser,
  type CreateUserInput,
  type ListUsersParams,
  type UpdateUserInput,
} from "@/lib/api/users";

export function useUsers(params: ListUsersParams = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => listUsers(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useUser(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id,
  });
}

export function useCreateUser() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(session?.backendToken, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser(id: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(session?.backendToken, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useDisableUser() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disableUser(session?.backendToken, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useDeleteUser() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(session?.backendToken, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
