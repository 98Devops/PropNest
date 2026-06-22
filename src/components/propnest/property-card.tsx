import { Card, CardContent } from "@/components/ui/card";
import { Building2Icon, AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { moneyCompact } from "./fmt";
import type { PortfolioRow } from "./use-portfolio";

export function PropertyCard({
  property,
  onClick,
}: {
  property: PortfolioRow;
  onClick?: () => void;
}) {
  const pct = property.expected > 0
    ? Math.round((property.collected / property.expected) * 100)
    : 0;
  const occPct = property.totalBeds > 0
    ? Math.round((property.students / property.totalBeds) * 100)
    : 0;
  const attentionCount = property.overdue.length;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md",
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${property.color}1a`, color: property.color }}
              aria-hidden
            >
              <Building2Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{property.name}</div>
              <div className="truncate text-xs text-muted-foreground">{property.location}</div>
            </div>
          </div>
          {attentionCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
              <AlertCircleIcon className="size-3" />
              {attentionCount}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 border-t pt-3 text-xs">
          <Stat label="Rooms"   value={String(property.rooms.length)} />
          <Stat label="Tenants" value={`${property.students} / ${property.totalBeds}`} />
          <Stat label="Vacant"  value={String(property.vacantBeds)} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Collection</span>
            <span className="tabular-nums text-foreground">
              {moneyCompact(property.collected)}
              <span className="text-muted-foreground"> / {moneyCompact(property.expected)}</span>
              <span className="ms-2 font-medium">{pct}%</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Occupancy</span>
            <span className="tabular-nums font-medium">{occPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${occPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 tabular-nums font-semibold text-foreground">{value}</div>
    </div>
  );
}
