"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { useDeleteUser, useDisableUser, useUsers } from "@/hooks/useUsers";
import { formatBytes, formatDateShort } from "@/lib/format";
import type { VPNUser } from "@/types/api";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VPNUser | undefined>();
  const [disableTarget, setDisableTarget] = useState<VPNUser | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<VPNUser | undefined>();

  const users = useUsers({
    page,
    page_size: 20,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });
  const disableUser = useDisableUser();
  const deleteUser = useDeleteUser();

  function openCreate() {
    setEditingUser(undefined);
    setFormOpen(true);
  }

  function openEdit(user: VPNUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function confirmDisable() {
    if (!disableTarget) return;
    try {
      await disableUser.mutateAsync(disableTarget.id);
      toast.success(`${disableTarget.name} disabled`);
      setDisableTarget(undefined);
    } catch {
      // toast surfaced globally
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(undefined);
    } catch {
      // toast surfaced globally
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage VPN users, their devices, and access keys.</p>
        </div>
        <RoleGate allow={["ADMIN", "OPERATOR"]}>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New user
          </Button>
        </RoleGate>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email"
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) {
              setStatus(v);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DISABLED">Disabled</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users.isLoading && <LoadingRows />}
      {users.isError && <ErrorState onRetry={() => users.refetch()} />}
      {users.data && users.data.data.length === 0 && (
        <EmptyState title="No users found" description="Create your first VPN user to get started." />
      )}

      {users.data && users.data.data.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Access Keys</TableHead>
                <TableHead>Traffic Usage</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <Link href={`/users/${user.id}`} className="hover:underline">
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{user.devices?.length ?? 0}</TableCell>
                  <TableCell>{user.access_keys?.length ?? 0}</TableCell>
                  <TableCell>
                    {formatBytes(user.traffic_used_bytes)}
                    {user.traffic_limit_bytes > 0 && ` / ${formatBytes(user.traffic_limit_bytes)}`}
                  </TableCell>
                  <TableCell>{formatDateShort(user.expires_at)}</TableCell>
                  <TableCell>{formatDateShort(user.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/users/${user.id}`} />}>
                          View details
                        </DropdownMenuItem>
                        <RoleGate allow={["ADMIN", "OPERATOR"]}>
                          <DropdownMenuItem onClick={() => openEdit(user)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={user.status === "DISABLED"}
                            onClick={() => setDisableTarget(user)}
                          >
                            Disable
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(user)}>
                            Delete
                          </DropdownMenuItem>
                        </RoleGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination meta={users.data?.meta} onPageChange={setPage} />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} />

      <ConfirmDialog
        open={!!disableTarget}
        onOpenChange={(open) => !open && setDisableTarget(undefined)}
        title="Disable user?"
        description={`${disableTarget?.name} will lose all VPN access immediately. Their devices and access keys will be revoked.`}
        confirmLabel="Disable"
        pending={disableUser.isPending}
        onConfirm={confirmDisable}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete user?"
        description={`This permanently removes ${deleteTarget?.name} and revokes all their access. This cannot be undone.`}
        confirmLabel="Delete"
        pending={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
