"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/states";
import { Pagination } from "@/components/common/pagination";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { formatDate } from "@/lib/format";

const ACTIONS = [
  "ADMIN_LOGIN",
  "ADMIN_DISABLED",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DISABLED",
  "DEVICE_REVOKED",
  "ACCESS_KEY_CREATED",
  "ACCESS_KEY_REVOKED",
  "ACCESS_KEY_ROTATED",
  "SERVER_CREATED",
  "SERVER_UPDATED",
  "SERVER_DELETED",
];

const RESOURCE_TYPES = ["admin", "vpn_user", "vpn_device", "access_key", "vpn_server"];

const ACTION_OPTIONS = [{ value: "all", label: "All actions" }, ...ACTIONS.map((a) => ({ value: a, label: a }))];

const RESOURCE_OPTIONS = [
  { value: "all", label: "All resources" },
  ...RESOURCE_TYPES.map((r) => ({ value: r, label: r })),
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("all");
  const [resourceType, setResourceType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const logs = useAuditLogs({
    page,
    page_size: 25,
    action: action === "all" ? undefined : action,
    resource_type: resourceType === "all" ? undefined : resourceType,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Every administrative action taken in this system.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select items={ACTION_OPTIONS} value={action} onValueChange={(v) => { if (v) { setAction(v); setPage(1); } }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={RESOURCE_OPTIONS}
          value={resourceType}
          onValueChange={(v) => { if (v) { setResourceType(v); setPage(1); } }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-40" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </div>

      {logs.isLoading && <LoadingRows />}
      {logs.isError && <ErrorState onRetry={() => logs.refetch()} />}
      {logs.data && logs.data.data.length === 0 && <EmptyState title="No audit log entries found" />}

      {logs.data && logs.data.data.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.data.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                  <TableCell>{log.admin?.name ?? "system"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.resource_type}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address || "—"}</TableCell>
                  <TableCell className="text-[var(--status-good)]">Success</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination meta={logs.data?.meta} onPageChange={setPage} />
    </div>
  );
}
