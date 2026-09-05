"use client";

import { Cpu, HardDrive, MapPin, Wifi } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/status-badge";
import { useServerHealth } from "@/hooks/useServers";
import { formatPercent, formatUptime } from "@/lib/format";
import type { VPNServer } from "@/types/api";

export function ServerCard({ server }: { server: VPNServer }) {
  const { data: health, isLoading } = useServerHealth(server.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{server.name || server.city || "VPN Server"}</CardTitle>
        </div>
        <StatusBadge status={health?.status ?? server.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5" /> CPU
                </span>
                <span className="tabular-nums">{formatPercent(health?.cpu_usage ?? 0)}</span>
              </div>
              <Progress value={health?.cpu_usage ?? 0} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5" /> Memory
                </span>
                <span className="tabular-nums">{formatPercent(health?.memory_usage ?? 0)}</span>
              </div>
              <Progress value={health?.memory_usage ?? 0} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Wifi className="h-3.5 w-3.5" /> Active connections
              </span>
              <span className="tabular-nums">{health?.active_connections ?? 0}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Uptime</span>
              <span className="tabular-nums">{formatUptime(health?.uptime_seconds ?? 0)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
