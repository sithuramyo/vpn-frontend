"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/states";
import { RoleGate } from "@/components/common/role-gate";
import { StatusBadge } from "@/components/common/status-badge";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { useUser } from "@/hooks/useUsers";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { formatBytes, formatDate, formatDateShort } from "@/lib/format";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const activity = useAuditLogs({ resource_id: id, page_size: 20 });
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <LoadingRows count={8} />;
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />;

  const trafficPct =
    user.traffic_limit_bytes > 0
      ? Math.min(100, Math.round((user.traffic_used_bytes / user.traffic_limit_bytes) * 100))
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/users" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <StatusBadge status={user.status} />
        <RoleGate allow={["ADMIN", "OPERATOR"]}>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </RoleGate>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Traffic usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tabular-nums">
              {formatBytes(user.traffic_used_bytes)}
              {user.traffic_limit_bytes > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {formatBytes(user.traffic_limit_bytes)} ({trafficPct}%)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Expiration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatDateShort(user.expires_at)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatDateShort(user.created_at)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices">Devices ({user.devices?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="access-keys">Access Keys ({user.access_keys?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          {!user.devices?.length ? (
            <EmptyState title="No devices" description="This user hasn't registered any devices yet." />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.devices.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.platform}</TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell>{formatDate(d.last_seen_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="access-keys">
          {!user.access_keys?.length ? (
            <EmptyState title="No access keys" description="Create an access key for this user from the Access Keys page." />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Traffic</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.access_keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">
                        <Link href={`/access-keys/${k.id}`} className="hover:underline">
                          {k.name}
                        </Link>
                      </TableCell>
                      <TableCell>{k.server?.name ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={k.status} />
                      </TableCell>
                      <TableCell>{formatBytes(k.traffic_used_bytes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          {activity.isLoading && <LoadingRows count={4} />}
          {activity.data?.data.length === 0 && <EmptyState title="No activity recorded" />}
          {!!activity.data?.data.length && (
            <div className="space-y-2">
              {activity.data.data.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <Badge variant="secondary">{log.action}</Badge>
                    <span className="ml-2 text-muted-foreground">by {log.admin?.name ?? "system"}</span>
                  </div>
                  <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
    </div>
  );
}
