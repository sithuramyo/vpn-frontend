"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/states";

function formatTick(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function MetricLineChart<T extends { recorded_at: string }>({
  data,
  dataKey,
  name,
  unit,
  color = "var(--chart-1)",
  yDomain,
}: {
  data: T[];
  dataKey: string;
  name: string;
  unit?: string;
  color?: string;
  yDomain?: [number, number];
}) {
  if (data.length === 0) {
    return <EmptyState title="No data yet" description="Samples appear as the server reports health." />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="recorded_at"
          tickFormatter={formatTick}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={yDomain}
          tickFormatter={(v: number) => `${v}${unit ?? ""}`}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value) => `${value}${unit ?? ""}`}
          labelFormatter={(label) => new Date(String(label)).toLocaleString()}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
