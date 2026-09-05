import { CheckCircle2, AlertTriangle, XCircle, Wrench, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "good" | "warning" | "serious" | "critical" | "neutral";

const STATUS_MAP: Record<string, { tone: Tone; icon: LucideIcon; label?: string }> = {
  ACTIVE: { tone: "good", icon: CheckCircle2 },
  ONLINE: { tone: "good", icon: CheckCircle2 },
  healthy: { tone: "good", icon: CheckCircle2, label: "Healthy" },
  DISABLED: { tone: "neutral", icon: XCircle },
  OFFLINE: { tone: "critical", icon: XCircle },
  degraded: { tone: "serious", icon: AlertTriangle, label: "Degraded" },
  DEGRADED: { tone: "serious", icon: AlertTriangle },
  MAINTENANCE: { tone: "warning", icon: Wrench },
  REVOKED: { tone: "critical", icon: XCircle },
  EXPIRED: { tone: "warning", icon: Clock },
};

const TONE_CLASSES: Record<Tone, string> = {
  good: "text-[var(--status-good)] bg-[var(--status-good)]/10",
  warning: "text-[var(--status-warning)] bg-[var(--status-warning)]/15",
  serious: "text-[var(--status-serious)] bg-[var(--status-serious)]/15",
  critical: "text-[var(--status-critical)] bg-[var(--status-critical)]/10",
  neutral: "text-muted-foreground bg-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? { tone: "neutral" as const, icon: CheckCircle2 };
  const Icon = entry.icon;
  const label = entry.label ?? status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[entry.tone]
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
