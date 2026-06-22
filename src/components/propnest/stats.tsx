import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { usePortfolio } from "./use-portfolio";
import { money } from "./fmt";

export function PropNestStats() {
  const { totals } = usePortfolio();

  const tiles = [
    { label: "Collected this month", value: money(totals.collected), foot: `${totals.collectionRate}% of expected` },
    { label: "Expected", value: money(totals.expected), foot: `${totals.occupiedBeds} occupied beds` },
    { label: "Outstanding", value: money(totals.outstanding), foot: totals.attentionCount === 1 ? "1 tenant needs attention" : `${totals.attentionCount} tenants need attention` },
    { label: "Occupancy", value: `${totals.occupancyRate}%`, foot: `${totals.occupiedBeds} / ${totals.totalBeds} beds` },
  ];

  return (
    <>
      {tiles.map((t) => (
        <DashboardCard key={t.label}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-normal text-xs tracking-wide text-muted-foreground">
              {t.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-2">
            <p className="font-semibold text-2xl tabular-nums">{t.value}</p>
          </CardContent>
          <CardFooter className="gap-1 rounded-none bg-background text-xs text-muted-foreground">
            {t.foot}
          </CardFooter>
        </DashboardCard>
      ))}
    </>
  );
}
