import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { usePortfolio } from "./use-portfolio";
import { moneyCompact } from "./fmt";

export function PropertyMix() {
  const { properties } = usePortfolio();

  const max = Math.max(1, ...properties.map((p) => p.expected));

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Collection by property</CardTitle>
        <CardDescription>Collected vs. expected for the current month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-6">
        {properties.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No properties yet.
          </div>
        ) : properties.map((p) => {
          const pct = p.expected > 0 ? Math.round((p.collected / p.expected) * 100) : 0;
          const widthPct = Math.round((p.expected / max) * 100);
          return (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {moneyCompact(p.collected)} <span className="text-muted-foreground/60">/ {moneyCompact(p.expected)}</span>
                  <span className="ms-2 text-foreground/80">{pct}%</span>
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted" style={{ maxWidth: `${widthPct}%` }}>
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </DashboardCard>
  );
}
