"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  deleteDevice,
  getDevice,
  listDevices,
  updateDeviceStatus,
  type ListDevicesParams,
} from "@/lib/api/devices";
import type { DeviceStatus } from "@/types/api";

export function useDevices(params: ListDevicesParams = {}) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["devices", params],
    queryFn: () => listDevices(session?.backendToken, params),
    enabled: !!session?.backendToken,
  });
}

export function useDevice(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["devices", id],
    queryFn: () => getDevice(session?.backendToken, id),
    enabled: !!session?.backendToken && !!id,
  });
}

export function useUpdateDeviceStatus() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeviceStatus }) =>
      updateDeviceStatus(session?.backendToken, id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices", id] });
    },
  });
}

export function useDeleteDevice() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDevice(session?.backendToken, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });
}
