"use client";

import { Database, Calendar, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { BandwidthChart } from "@/components/charts/bandwidth-chart";
import { ConnectionsChart } from "@/components/charts/connections-chart";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/states";
import { useUsage, useUsageByServer, useUsageByUser } from "@/hooks/useUsage";
import { formatBytes } from "@/lib/format";

export default function UsagePage() {
  const summary = useUsage();
  const byUser = useUsageByUser({ page_size: 20 });
  const byServer = useUsageByServer();

  const dailyTotal = summary.data?.daily_bandwidth.reduce((sum, p) => sum + p.bytes_in + p.bytes_out, 0) ?? 0;
  const monthlyTotal = summary.data?.monthly_bandwidth.reduce((sum, p) => sum + p.bytes_in + p.bytes_out, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usage</h1>
        <p className="text-sm text-muted-foreground">Bandwidth and traffic across your fleet.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Traffic"
          value={formatBytes(summary.data?.total_traffic_bytes ?? 0)}
          icon={Database}
          loading={summary.isLoading}
        />
        <StatCard label="Daily Traffic (24h)" value={formatBytes(dailyTotal)} icon={Calendar} loading={summary.isLoading} />
        <StatCard
          label="Monthly Traffic (30d)"
          value={formatBytes(monthlyTotal)}
          icon={CalendarDays}
          loading={summary.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bandwidth</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.isError ? (
            <ErrorState onRetry={() => summary.refetch()} />
          ) : (
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily bandwidth</TabsTrigger>
                <TabsTrigger value="monthly">Monthly bandwidth</TabsTrigger>
                <TabsTrigger value="connections">Active connections</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <BandwidthChart data={summary.data?.daily_bandwidth ?? []} />
              </TabsContent>
              <TabsContent value="monthly">
                <BandwidthChart data={summary.data?.monthly_bandwidth ?? []} />
              </TabsContent>
              <TabsContent value="connections">
                <ConnectionsChart data={summary.data?.daily_bandwidth ?? []} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic by user</CardTitle>
          </CardHeader>
          <CardContent>
            {byUser.isLoading && <LoadingRows count={4} />}
            {byUser.isError && <ErrorState onRetry={() => byUser.refetch()} />}
            {byUser.data?.data.length === 0 && <EmptyState title="No usage data yet" />}
            {!!byUser.data?.data.length && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byUser.data.data.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{formatBytes(u.traffic_used_bytes)}</TableCell>
                      <TableCell>{u.traffic_limit_bytes > 0 ? formatBytes(u.traffic_limit_bytes) : "Unlimited"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic by server</CardTitle>
          </CardHeader>
          <CardContent>
            {byServer.isLoading && <LoadingRows count={3} />}
            {byServer.isError && <ErrorState onRetry={() => byServer.refetch()} />}
            {byServer.data?.length === 0 && <EmptyState title="No usage data yet" />}
            {!!byServer.data?.length && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Traffic used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byServer.data.map((s) => (
                    <TableRow key={s.server_id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{formatBytes(s.traffic_used_bytes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
