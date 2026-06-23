import { useMemo } from "react";
import { Panel } from "./panel";
import { StatCard } from "./stat-card";
import { DeltaPill } from "./delta-pill";
import { MonthlyTrend } from "./monthly-trend";
import { CoverageStatusBadge } from "./coverage";
import { money } from "./fmt";
import { usePortfolio, usePortfolioCoverage } from "./use-portfolio";
import { useNav } from "@/lib/propnest-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function Finance() {
  const { allTenants, totals } = usePortfolio();
  const { coverageMap } = usePortfolioCoverage();
  const { openProperty, openTenant } = useNav();

  const buckets = useMemo(() => {
    const groups: Record<string, { count: number; balance: number }> = {
      OVERDUE:       { count: 0, balance: 0 },
      DUE_TODAY:     { count: 0, balance: 0 },
      EXPIRING_SOON: { count: 0, balance: 0 },
      CURRENT:       { count: 0, balance: 0 },
    };
    for (const t of allTenants) {
      const status = coverageMap.get(t.id)?.status ?? "EXCLUDED";
      if (groups[status]) {
        groups[status].count += 1;
        groups[status].balance += t.balance;
      }
    }
    return groups;
  }, [allTenants, coverageMap]);

  const outstanding = allTenants
    .map((t) => ({ ...t, coverage: coverageMap.get(t.id) ?? null }))
    .filter((t) => t.balance > 0 || ["OVERDUE", "DUE_TODAY"].includes(t.coverage?.status ?? ""))
    .sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span className="text-brand-gradient">Finance</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Collection performance and outstanding balances across the portfolio.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          featured
          label="Collected"
          value={money(totals.collected)}
          delta={<DeltaPill tone={totals.collectionRate >= 90 ? "positive" : "neutral"}>{totals.collectionRate}%</DeltaPill>}
          caption={`of ${money(totals.expected)} expected this month`}
          progress={totals.collectionRate}
        />
        <StatCard
          label="Outstanding"
          value={money(totals.outstanding)}
          delta={totals.outstanding > 0 ? <DeltaPill tone="negative">owed</DeltaPill> : <DeltaPill tone="positive">clear</DeltaPill>}
          caption="Unpaid this month"
        />
        <StatCard
          label="Overdue tenants"
          value={String(buckets.OVERDUE.count)}
          caption={`${money(buckets.OVERDUE.balance)} outstanding`}
        />
        <StatCard
          label="Expiring soon"
          value={String(buckets.EXPIRING_SOON.count + buckets.DUE_TODAY.count)}
          caption={`Within ${"7"} days`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyTrend />
        <Panel>
          <header className="border-b px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">Coverage mix</h3>
            <p className="text-xs text-muted-foreground">Where every active tenant currently sits.</p>
          </header>
          <div className="space-y-3 px-5 py-5">
            {[
              { key: "OVERDUE",       label: "Overdue",       tone: "bg-rose-500" },
              { key: "DUE_TODAY",     label: "Due today",     tone: "bg-orange-500" },
              { key: "EXPIRING_SOON", label: "Expiring soon", tone: "bg-amber-500" },
              { key: "CURRENT",       label: "Current",       tone: "bg-emerald-500" },
            ].map((b) => {
              const data = buckets[b.key]!;
              const pct = allTenants.length > 0 ? Math.round((data.count / allTenants.length) * 100) : 0;
              return (
                <div key={b.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{b.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">{data.count}</span> · {money(data.balance)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`${b.tone} h-full rounded-full transition-[width]`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <Panel>
        <header className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Outstanding ledger</h3>
          <p className="text-xs text-muted-foreground">
            {outstanding.length} tenant{outstanding.length === 1 ? "" : "s"} with a balance owed or attention status.
          </p>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-5">Tenant</TableHead>
              <TableHead>Property / Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right tabular-nums">Rent</TableHead>
              <TableHead className="pe-5 text-right tabular-nums">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outstanding.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  Everyone is paid up. 🎉
                </TableCell>
              </TableRow>
            ) : outstanding.map((t) => (
              <TableRow key={t.id} className="h-12">
                <TableCell className="ps-5 font-medium">
                  <button
                    type="button"
                    onClick={() => openTenant(t.id)}
                    className="text-left hover:underline"
                  >
                    {t.name}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => openProperty(t.propertyId)}
                    className="text-left text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="font-medium" style={{ color: t.propertyColor }}>{t.property}</span>
                    <span className="text-muted-foreground/70"> · {t.room}</span>
                  </button>
                </TableCell>
                <TableCell><CoverageStatusBadge coverage={t.coverage} /></TableCell>
                <TableCell className="text-right tabular-nums">{money(t.rent)}</TableCell>
                <TableCell className="pe-5 text-right tabular-nums">
                  <span className={cn("font-semibold", t.balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
                    {money(t.balance)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
