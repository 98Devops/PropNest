import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { money } from "./fmt";
// Engine module (brief §3) — display-only replay of the ledger through the SAME
// authoritative engine the writer uses, so it always agrees with coverage_end.
import { buildCoverageBreakdown } from "@/services/coverageBreakdown.js";

type Step = {
  amount: number;
  dateLabel: string;
  days: number;
  endLabel: string;
  isEarly: boolean;
  prepaidDaysPreserved: number;
};
type Chain = {
  steps: Step[];
  startLabel: string;
  endLabel: string;
  days: number;
  isCurrent: boolean;
};
type Breakdown = {
  chains: Chain[];
  totalDays: number;
  coverageEndLabel: string | null;
};

type PayHistoryItem = { amount: number | string; date?: string | null };

/**
 * Chain-aware coverage timeline (Trevis parity). Shows how each payment buys days
 * of coverage that stack from the prior coverage end — the CURRENT chain vs. any
 * previous (expired) chains — so "why N days remaining" is self-evident from the
 * ledger. Pure display: no new billing math (see services/coverageBreakdown.js).
 */
export function CoverageBreakdown({ payHistory, monthlyRent }: { payHistory: PayHistoryItem[]; monthlyRent: number }) {
  const breakdown = useMemo<Breakdown>(() => {
    // Engine expects { amount, payment_date }; the drawer carries { amount, date }.
    const payments = (payHistory ?? [])
      .filter((p) => p.date)
      .map((p) => ({ amount: p.amount, payment_date: p.date as string }));
    return buildCoverageBreakdown(payments, monthlyRent) as unknown as Breakdown;
  }, [payHistory, monthlyRent]);

  if (!breakdown.chains.length) return null;

  return (
    <section className="space-y-3 border-b p-5">
      <h3 className="flex items-center justify-between text-sm font-semibold text-foreground">
        Coverage breakdown
        <span className="text-xs font-normal text-muted-foreground">
          {breakdown.totalDays} day{breakdown.totalDays === 1 ? "" : "s"} bought
          {breakdown.coverageEndLabel ? ` · through ${breakdown.coverageEndLabel}` : ""}
        </span>
      </h3>

      <div className="space-y-3">
        {breakdown.chains.map((chain, ci) => (
          <div
            key={ci}
            className={cn(
              "rounded-lg border p-3",
              chain.isCurrent ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold",
                chain.isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}>
                <span className={cn("size-2 rounded-full", chain.isCurrent ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                {chain.isCurrent ? "Current coverage" : "Expired chain"}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {chain.startLabel} → {chain.endLabel} · {chain.days}d
              </span>
            </div>

            <ul className="space-y-1.5">
              {chain.steps.map((step, si) => (
                <li key={si} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums font-medium text-foreground">{money(step.amount)}</span>
                    <span className="text-muted-foreground">{step.dateLabel}</span>
                    {step.isEarly && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        early{step.prepaidDaysPreserved ? ` · +${step.prepaidDaysPreserved}d kept` : ""}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    +{step.days}d → <span className="font-medium text-foreground">{step.endLabel}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
