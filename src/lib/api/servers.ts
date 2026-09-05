import { apiDelete, apiGetWithMeta, apiPatch, apiPost } from "@/lib/api/client";
import type { ServerHealth, ServerMetricPoint, VPNServer } from "@/types/api";

export function listServers(token: string | undefined, params: { page?: number; page_size?: number } = {}) {
  return apiGetWithMeta<VPNServer[]>("/api/v1/servers", token, params);
}

export function getServer(token: string | undefined, id: string) {
  return apiGetWithMeta<VPNServer>(`/api/v1/servers/${id}`, token).then((r) => r.data);
}

export function getServerHealth(token: string | undefined, id: string) {
  return apiGetWithMeta<ServerHealth>(`/api/v1/servers/${id}/health`, token).then((r) => r.data);
}

export function getServerMetricsHistory(token: string | undefined, id: string, window = "24h") {
  return apiGetWithMeta<ServerMetricPoint[]>(`/api/v1/servers/${id}/metrics`, token, { window }).then(
    (r) => r.data ?? []
  );
}

export interface CreateServerInput {
  name: string;
  hostname: string;
  public_ip?: string;
  country?: string;
  city?: string;
  vpn_port?: number;
  tls_port?: number;
}

export function createServer(token: string | undefined, input: CreateServerInput) {
  return apiPost<VPNServer>("/api/v1/servers", token, input);
}

export function updateServer(
  token: string | undefined,
  id: string,
  input: Partial<CreateServerInput & { status: string }>
) {
  return apiPatch<VPNServer>(`/api/v1/servers/${id}`, token, input);
}

export function deleteServer(token: string | undefined, id: string) {
  return apiDelete(`/api/v1/servers/${id}`, token);
}
