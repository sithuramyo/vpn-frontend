"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGate } from "@/components/common/role-gate";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/states";
import { ServerFormDialog } from "@/components/servers/server-form-dialog";
import { useServers } from "@/hooks/useServers";

export default function ServersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const servers = useServers({ page_size: 50 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Servers</h1>
          <p className="text-sm text-muted-foreground">VPN data-plane servers.</p>
        </div>
        <RoleGate allow={["ADMIN"]}>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add server
          </Button>
        </RoleGate>
      </div>

      {servers.isLoading && <LoadingRows />}
      {servers.isError && <ErrorState onRetry={() => servers.refetch()} />}
      {servers.data && servers.data.data.length === 0 && (
        <EmptyState title="No servers configured" description="Add your first VPN server to start provisioning access keys." />
      )}

      {servers.data && servers.data.data.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.data.data.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    <Link href={`/servers/${server.id}`} className="hover:underline">
                      {server.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {server.city}
                    {server.country ? `, ${server.country}` : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{server.public_ip || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={server.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServerFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
