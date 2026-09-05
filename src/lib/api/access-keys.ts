import { apiDelete, apiGetBlob, apiGetWithMeta, apiPost } from "@/lib/api/client";
import type { AccessKey, AccessKeyConfig } from "@/types/api";

export interface ListAccessKeysParams {
  page?: number;
  page_size?: number;
  status?: string;
  user_id?: string;
  server_id?: string;
  [key: string]: string | number | boolean | undefined;
}

export function listAccessKeys(token: string | undefined, params: ListAccessKeysParams = {}) {
  return apiGetWithMeta<AccessKey[]>("/api/v1/access-keys", token, params);
}

export function getAccessKey(token: string | undefined, id: string) {
  return apiGetWithMeta<AccessKey>(`/api/v1/access-keys/${id}`, token).then((r) => r.data);
}

export interface CreateAccessKeyInput {
  vpn_user_id: string;
  vpn_server_id: string;
  name: string;
  expires_at?: string;
  traffic_limit_bytes?: number;
  tcp_enabled: boolean;
  udp_enabled: boolean;
  websocket_enabled: boolean;
}

export function createAccessKey(token: string | undefined, input: CreateAccessKeyInput) {
  return apiPost<AccessKey>("/api/v1/access-keys", token, input);
}

export function revokeAccessKey(token: string | undefined, id: string) {
  return apiPost<AccessKey>(`/api/v1/access-keys/${id}/revoke`, token);
}

export function rotateAccessKey(token: string | undefined, id: string) {
  return apiPost<AccessKey>(`/api/v1/access-keys/${id}/rotate`, token);
}

export function getAccessKeyConfig(token: string | undefined, id: string) {
  return apiGetWithMeta<AccessKeyConfig>(`/api/v1/access-keys/${id}/config`, token).then((r) => r.data);
}

export function getAccessKeyQR(token: string | undefined, id: string) {
  return apiGetBlob(`/api/v1/access-keys/${id}/qr`, token);
}

export function deleteAccessKey(token: string | undefined, id: string) {
  return apiDelete(`/api/v1/access-keys/${id}`, token);
}
