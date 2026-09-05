import { apiDelete, apiGetWithMeta, apiPatch } from "@/lib/api/client";
import type { VPNDevice } from "@/types/api";

export interface ListDevicesParams {
  page?: number;
  page_size?: number;
  status?: string;
  platform?: string;
  user_id?: string;
  [key: string]: string | number | boolean | undefined;
}

export function listDevices(token: string | undefined, params: ListDevicesParams = {}) {
  return apiGetWithMeta<VPNDevice[]>("/api/v1/devices", token, params);
}

export function getDevice(token: string | undefined, id: string) {
  return apiGetWithMeta<VPNDevice>(`/api/v1/devices/${id}`, token).then((r) => r.data);
}

export function updateDeviceStatus(
  token: string | undefined,
  id: string,
  status: "ACTIVE" | "DISABLED" | "REVOKED"
) {
  return apiPatch<VPNDevice>(`/api/v1/devices/${id}`, token, { status });
}

export function deleteDevice(token: string | undefined, id: string) {
  return apiDelete(`/api/v1/devices/${id}`, token);
}
