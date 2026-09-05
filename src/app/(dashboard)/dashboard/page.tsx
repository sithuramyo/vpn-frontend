"use client";

import { Users, UserCheck, Smartphone, KeyRound, Wifi, Database } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ServerCard } from "@/components/dashboard/server-card";
import { BandwidthChart } from "@/components/charts/bandwidth-chart";
import { ConnectionsChart } from "@/components/charts/connections-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/common/states";
import { useDashboardSummary } from "@/hooks/useAuditLogs";
import { useUsage } from "@/hooks/useUsage";
import { useServers } from "@/hooks/useServers";
import { formatBytes } from "@/lib/format";

export default function DashboardPage() {
  const summary = useDashboardSummary();
  const usage = useUsage();
  const servers = useServers({ page_size: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your VPN fleet.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={summary.data?.total_users ?? 0}
          icon={Users}
          loading={summary.isLoading}
        />
        <StatCard
          label="Active Users"
          value={summary.data?.active_users ?? 0}
          icon={UserCheck}
          loading={summary.isLoading}
        />
        <StatCard
          label="Active Devices"
          value={summary.data?.active_devices ?? 0}
          icon={Smartphone}
          loading={summary.isLoading}
        />
        <StatCard
          label="Active Access Keys"
          value={summary.data?.active_access_keys ?? 0}
          icon={KeyRound}
          loading={summary.isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Bandwidth"
          value={formatBytes(usage.data?.total_traffic_bytes ?? 0)}
          icon={Database}
          loading={usage.isLoading}
        />
        <StatCard
          label="Online Connections"
          value={usage.data?.daily_bandwidth.at(-1)?.active_connections ?? 0}
          icon={Wifi}
          loading={usage.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            {usage.isError ? (
              <ErrorState onRetry={() => usage.refetch()} />
            ) : (
              <Tabs defaultValue="daily">
                <TabsList>
                  <TabsTrigger value="daily">Bandwidth (24h)</TabsTrigger>
                  <TabsTrigger value="monthly">Traffic over time (30d)</TabsTrigger>
                  <TabsTrigger value="connections">Active connections</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                  <BandwidthChart data={usage.data?.daily_bandwidth ?? []} />
                </TabsContent>
                <TabsContent value="monthly">
                  <BandwidthChart data={usage.data?.monthly_bandwidth ?? []} />
                </TabsContent>
                <TabsContent value="connections">
                  <ConnectionsChart data={usage.data?.daily_bandwidth ?? []} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {servers.isLoading && <Card className="h-64 animate-pulse" />}
          {servers.isError && <ErrorState onRetry={() => servers.refetch()} />}
          {servers.data?.data.length === 0 && (
            <EmptyState title="No servers configured" description="Add a VPN server to see its health here." />
          )}
          {servers.data?.data.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </div>
    </div>
  );
}
