"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBytes } from "@/lib/format";
import type { BandwidthDataPoint } from "@/types/api";
import { EmptyState } from "@/components/common/states";

function formatTick(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function BandwidthChart({ data }: { data: BandwidthDataPoint[] }) {
  if (data.length === 0) {
    return <EmptyState title="No bandwidth data yet" description="Metrics will appear once the server reports usage." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTick}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatBytes(v)}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatBytes(Number(value))}
          labelFormatter={(label) => new Date(String(label)).toLocaleString()}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="bytes_in"
          name="Inbound"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="bytes_out"
          name="Outbound"
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
