"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingRows } from "@/components/common/states";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricLineChart } from "@/components/charts/metric-line-chart";
import { BandwidthChart } from "@/components/charts/bandwidth-chart";
import { ConnectionsChart } from "@/components/charts/connections-chart";
import { useServer, useServerHealth, useServerMetricsHistory } from "@/hooks/useServers";
import { formatUptime } from "@/lib/format";

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: server, isLoading, isError, refetch } = useServer(id);
  const { data: health } = useServerHealth(id);
  const { data: history } = useServerMetricsHistory(id, "24h");

  if (isLoading) return <LoadingRows count={6} />;
  if (isError || !server) return <ErrorState onRetry={() => refetch()} />;

  const bandwidthData =
    history?.map((h) => ({
      timestamp: h.recorded_at,
      bytes_in: h.bandwidth_in,
      bytes_out: h.bandwidth_out,
      active_connections: h.active_connections,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/servers" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{server.name}</h1>
          <p className="text-sm text-muted-foreground">
            {server.hostname} &middot; {server.city}, {server.country}
          </p>
        </div>
        <StatusBadge status={health?.status ?? server.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Uptime</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatUptime(health?.uptime_seconds ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Active connections</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{health?.active_connections ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Shadowsocks / Caddy</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 text-sm">
            <span className={health?.shadowsocks_healthy ? "text-[var(--status-good)]" : "text-[var(--status-critical)]"}>
              Shadowsocks {health?.shadowsocks_healthy ? "up" : "down"}
            </span>
            <span className="text-muted-foreground">&middot;</span>
            <span className={health?.caddy_healthy ? "text-[var(--status-good)]" : "text-[var(--status-critical)]"}>
              Caddy {health?.caddy_healthy ? "up" : "down"}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CPU usage</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricLineChart data={history ?? []} dataKey="cpu_usage" name="CPU" unit="%" yDomain={[0, 100]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Memory usage</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricLineChart
              data={history ?? []}
              dataKey="memory_usage"
              name="Memory"
              unit="%"
              color="var(--chart-2)"
              yDomain={[0, 100]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bandwidth</CardTitle>
          </CardHeader>
          <CardContent>
            <BandwidthChart data={bandwidthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionsChart data={bandwidthData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
