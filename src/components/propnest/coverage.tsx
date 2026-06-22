import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CoverageStatus = "CURRENT" | "EXPIRING_SOON" | "DUE_TODAY" | "OVERDUE" | "EXCLUDED";

type Coverage = {
  status: CoverageStatus;
  daysRemaining?: number | null;
  daysOverdue?: number | null;
  coverageEnd?: string | null;
};

const LABEL: Record<CoverageStatus, string> = {
  CURRENT: "Current",
  EXPIRING_SOON: "Expiring soon",
  DUE_TODAY: "Due today",
  OVERDUE: "Overdue",
  EXCLUDED: "Inactive",
};

const VARIANT: Record<CoverageStatus, "default" | "secondary" | "destructive" | "outline"> = {
  CURRENT: "secondary",
  EXPIRING_SOON: "secondary",
  DUE_TODAY: "destructive",
  OVERDUE: "destructive",
  EXCLUDED: "outline",
};

const BAR_TONE: Record<CoverageStatus, string> = {
  CURRENT: "bg-emerald-500",
  EXPIRING_SOON: "bg-amber-500",
  DUE_TODAY: "bg-orange-500",
  OVERDUE: "bg-red-500",
  EXCLUDED: "bg-muted-foreground/30",
};

export function CoverageStatusBadge({ coverage }: { coverage?: Coverage | null }) {
  const status: CoverageStatus = coverage?.status ?? "EXCLUDED";
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}

/**
 * A 30-day battery showing coverage runway. Mirrors legacy CoverageBar but
 * styled with Tailwind so it sits naturally in the new shell.
 */
export function CoverageRunwayBar({ coverage, className }: { coverage?: Coverage | null; className?: string }) {
  if (!coverage || coverage.status === "EXCLUDED") return null;
  const CAP = 30;
  const days = coverage.daysRemaining ?? 0;
  const overdue = coverage.status === "OVERDUE";
  const pct = overdue ? 12 : Math.max(6, Math.min(100, Math.round((days / CAP) * 100)));
  const title = overdue
    ? `${coverage.daysOverdue ?? Math.abs(days)} days overdue`
    : `${days} days of coverage remaining`;

  return (
    <div title={title} className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width]", BAR_TONE[coverage.status])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function coverageSubLabel(coverage?: Coverage | null): string {
  if (!coverage) return "";
  if (coverage.status === "EXCLUDED") return "Not active";
  if (coverage.status === "OVERDUE") {
    const d = coverage.daysOverdue ?? Math.abs(coverage.daysRemaining ?? 0);
    return `${d} day${d === 1 ? "" : "s"} overdue`;
  }
  if (coverage.status === "DUE_TODAY") return "Due today";
  const d = coverage.daysRemaining ?? 0;
  return `${d} day${d === 1 ? "" : "s"} remaining`;
}
