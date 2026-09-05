"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Plus, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { AccessKeyFormDialog } from "@/components/access-keys/access-key-form-dialog";
import { QRModal } from "@/components/access-keys/qr-modal";
import { useAccessKeys, useRevokeAccessKey, useRotateAccessKey } from "@/hooks/useAccessKeys";
import { formatBytes, formatDateShort } from "@/lib/format";
import type { AccessKey } from "@/types/api";

export default function AccessKeysPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<AccessKey | undefined>();
  const [revokeTarget, setRevokeTarget] = useState<AccessKey | undefined>();

  const keys = useAccessKeys({
    page,
    page_size: 20,
    status: status === "all" ? undefined : status,
  });
  const revokeKey = useRevokeAccessKey();
  const rotateKey = useRotateAccessKey();

  async function confirmRevoke() {
    if (!revokeTarget) return;
    try {
      await revokeKey.mutateAsync(revokeTarget.id);
      toast.success(`${revokeTarget.name} revoked`);
      setRevokeTarget(undefined);
    } catch {
      // toast surfaced globally
    }
  }

  async function rotate(key: AccessKey) {
    try {
      await rotateKey.mutateAsync(key.id);
      toast.success(`${key.name} rotated`);
    } catch {
      // toast surfaced globally
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Access Keys</h1>
          <p className="text-sm text-muted-foreground">Shadowsocks credentials for your VPN users.</p>
        </div>
        <RoleGate allow={["ADMIN", "OPERATOR"]}>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New access key
          </Button>
        </RoleGate>
      </div>

      <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="REVOKED">Revoked</SelectItem>
          <SelectItem value="EXPIRED">Expired</SelectItem>
        </SelectContent>
      </Select>

      {keys.isLoading && <LoadingRows />}
      {keys.isError && <ErrorState onRetry={() => keys.refetch()} />}
      {keys.data && keys.data.data.length === 0 && (
        <EmptyState title="No access keys found" description="Create an access key to give a user VPN access." />
      )}

      {keys.data && keys.data.data.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.data.data.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">
                    <Link href={`/access-keys/${key.id}`} className="hover:underline">
                      {key.name}
                    </Link>
                  </TableCell>
                  <TableCell>{key.user?.name ?? "—"}</TableCell>
                  <TableCell>{key.server?.name ?? "—"}</TableCell>
                  <TableCell>{key.protocol}</TableCell>
                  <TableCell>
                    <StatusBadge status={key.status} />
                  </TableCell>
                  <TableCell>{formatBytes(key.traffic_used_bytes)}</TableCell>
                  <TableCell>{formatDateShort(key.expires_at)}</TableCell>
                  <TableCell>{formatDateShort(key.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setQrTarget(key)} title="Show QR">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/access-keys/${key.id}`} />}>
                            View details
                          </DropdownMenuItem>
                          <RoleGate allow={["ADMIN", "OPERATOR"]}>
                            <DropdownMenuItem onClick={() => rotate(key)}>Rotate</DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={key.status !== "ACTIVE"}
                              onClick={() => setRevokeTarget(key)}
                            >
                              Revoke
                            </DropdownMenuItem>
                          </RoleGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination meta={keys.data?.meta} onPageChange={setPage} />

      <AccessKeyFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {qrTarget && (
        <QRModal
          open={!!qrTarget}
          onOpenChange={(open) => !open && setQrTarget(undefined)}
          accessKeyId={qrTarget.id}
          accessKeyName={qrTarget.name}
        />
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(undefined)}
        title="Revoke access key?"
        description={`${revokeTarget?.name} will immediately stop working.`}
        confirmLabel="Revoke"
        pending={revokeKey.isPending}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}
