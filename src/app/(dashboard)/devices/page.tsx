"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleGate } from "@/components/common/role-gate";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/states";
import { Pagination } from "@/components/common/pagination";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDevices, useUpdateDeviceStatus } from "@/hooks/useDevices";
import { formatDate, formatDateShort } from "@/lib/format";
import type { VPNDevice } from "@/types/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
  { value: "REVOKED", label: "Revoked" },
];

const PLATFORM_OPTIONS = [
  { value: "all", label: "All platforms" },
  { value: "ANDROID", label: "Android" },
  { value: "IOS", label: "iOS" },
  { value: "WINDOWS", label: "Windows" },
  { value: "MACOS", label: "macOS" },
];

export default function DevicesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [revokeTarget, setRevokeTarget] = useState<VPNDevice | undefined>();

  const devices = useDevices({
    page,
    page_size: 20,
    status: status === "all" ? undefined : status,
    platform: platform === "all" ? undefined : platform,
  });
  const updateStatus = useUpdateDeviceStatus();

  async function confirmRevoke() {
    if (!revokeTarget) return;
    try {
      await updateStatus.mutateAsync({ id: revokeTarget.id, status: "REVOKED" });
      toast.success(`${revokeTarget.name} revoked`);
      setRevokeTarget(undefined);
    } catch {
      // toast surfaced globally
    }
  }

  async function disableDevice(device: VPNDevice) {
    try {
      await updateStatus.mutateAsync({ id: device.id, status: "DISABLED" });
      toast.success(`${device.name} disabled`);
    } catch {
      // toast surfaced globally
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Devices</h1>
        <p className="text-sm text-muted-foreground">Devices registered by VPN users.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select items={STATUS_OPTIONS} value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={PLATFORM_OPTIONS} value={platform} onValueChange={(v) => { if (v) { setPlatform(v); setPage(1); } }}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORM_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {devices.isLoading && <LoadingRows />}
      {devices.isError && <ErrorState onRetry={() => devices.refetch()} />}
      {devices.data && devices.data.data.length === 0 && (
        <EmptyState title="No devices found" description="Devices appear here once users connect from a client." />
      )}

      {devices.data && devices.data.data.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.data.data.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.platform}</TableCell>
                  <TableCell>
                    {device.user ? (
                      <Link href={`/users/${device.user.id}`} className="hover:underline">
                        {device.user.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={device.status} />
                  </TableCell>
                  <TableCell>{formatDate(device.last_seen_at)}</TableCell>
                  <TableCell>{formatDateShort(device.created_at)}</TableCell>
                  <TableCell>
                    <RoleGate allow={["ADMIN", "OPERATOR"]}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={device.status === "DISABLED"}
                            onClick={() => disableDevice(device)}
                          >
                            Disable
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={device.status === "REVOKED"}
                            onClick={() => setRevokeTarget(device)}
                          >
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination meta={devices.data?.meta} onPageChange={setPage} />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(undefined)}
        title="Revoke device?"
        description={`${revokeTarget?.name} will immediately lose VPN access.`}
        confirmLabel="Revoke"
        pending={updateStatus.isPending}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}
