import { apiDelete, apiGetWithMeta, apiPatch, apiPost } from "@/lib/api/client";
import type { VPNUser } from "@/types/api";

export interface ListUsersParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export function listUsers(token: string | undefined, params: ListUsersParams = {}) {
  return apiGetWithMeta<VPNUser[]>("/api/v1/users", token, params);
}

export function getUser(token: string | undefined, id: string) {
  return apiGetWithMeta<VPNUser>(`/api/v1/users/${id}`, token).then((r) => r.data);
}

export interface CreateUserInput {
  name: string;
  email: string;
  expires_at?: string;
  traffic_limit_bytes?: number;
}

export function createUser(token: string | undefined, input: CreateUserInput) {
  return apiPost<VPNUser>("/api/v1/users", token, input);
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  expires_at?: string;
  clear_expires_at?: boolean;
  traffic_limit_bytes?: number;
}

export function updateUser(token: string | undefined, id: string, input: UpdateUserInput) {
  return apiPatch<VPNUser>(`/api/v1/users/${id}`, token, input);
}

export function disableUser(token: string | undefined, id: string) {
  return apiPost<VPNUser>(`/api/v1/users/${id}/disable`, token);
}

export function deleteUser(token: string | undefined, id: string) {
  return apiDelete(`/api/v1/users/${id}`, token);
}
