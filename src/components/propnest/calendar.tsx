import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "./panel";
import { usePortfolio, usePortfolioCoverage } from "./use-portfolio";
import { money } from "./fmt";
import { cn } from "@/lib/utils";

type DayEvents = {
  payments: Array<{ id: string; tenant: string; amount: number; property: string }>;
  expiries: Array<{ id: string; tenant: string; property: string; status: string }>;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarScreen() {
  const { properties } = usePortfolio();
  const { coverageMap } = usePortfolioCoverage();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const { byDay, monthLabel, firstWeekday, daysInMonth } = useMemo(() => {
    const map = new Map<string, DayEvents>();
    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { payments: [], expiries: [] });
      return map.get(key)!;
    };
    for (const p of properties) {
      for (const r of p.rooms) {
        for (const s of r.students) {
          for (const pay of s.payHistory ?? []) {
            if (!pay.date) continue;
            ensure(pay.date.slice(0, 10)).payments.push({
              id: pay.id, tenant: s.name, amount: pay.amount, property: p.name,
            });
          }
          const cov = coverageMap.get(s.id);
          if (cov && cov.coverageEnd && ["EXPIRING_SOON", "DUE_TODAY", "OVERDUE"].includes(cov.status)) {
            ensure(cov.coverageEnd.slice(0, 10)).expiries.push({
              id: s.id, tenant: s.name, property: p.name, status: cov.status,
            });
          }
        }
      }
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last  = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return {
      byDay: map,
      monthLabel: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }),
      firstWeekday: first.getDay(),
      daysInMonth: last.getDate(),
    };
  }, [properties, coverageMap, cursor]);

  const todayISO = ymd(new Date());
  const cells: Array<{ date: Date | null; iso: string; events?: DayEvents }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, iso: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const iso = ymd(date);
    cells.push({ date, iso, events: byDay.get(iso) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, iso: "" });

  const upcoming: Array<{ iso: string; events: DayEvents }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = ymd(d);
    const ev = byDay.get(iso);
    if (ev && (ev.expiries.length > 0 || ev.payments.length > 0)) upcoming.push({ iso, events: ev });
    if (upcoming.length >= 6) break;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span className="text-brand-gradient">Calendar</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Coverage expiries and payments by day.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">{monthLabel}</h3>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} aria-label="Previous month">
                <ChevronLeftIcon />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { const n = new Date(); setCursor(new Date(n.getFullYear(), n.getMonth(), 1)); }}>Today</Button>
              <Button variant="outline" size="icon-sm" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} aria-label="Next month">
                <ChevronRightIcon />
              </Button>
            </div>
          </header>
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => <div key={w} className="py-1">{w}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                if (!c.date) return <div key={i} className="aspect-square rounded-md bg-muted/30" />;
                const isToday = c.iso === todayISO;
                const payCount = c.events?.payments.length ?? 0;
                const expCount = c.events?.expiries.length ?? 0;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex aspect-square flex-col rounded-md border bg-card p-1.5 text-xs transition-colors",
                      isToday && "ring-2 ring-brand-blue",
                    )}
                  >
                    <div className={cn("text-right font-semibold tabular-nums", isToday ? "text-brand-blue" : "text-foreground")}>
                      {c.date.getDate()}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {payCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          ${payCount}
                        </span>
                      )}
                      {expCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 text-[10px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                          ⏳{expCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Payment received</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" /> Coverage expiring</span>
            </div>
          </div>
        </Panel>

        <Panel>
          <header className="border-b px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">Upcoming</h3>
            <p className="text-xs text-muted-foreground">Next 30 days · expiries & payments.</p>
          </header>
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing scheduled in the next 30 days.</div>
            ) : upcoming.map((u) => (
              <div key={u.iso} className="px-5 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  {new Date(u.iso).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                </div>
                <ul className="mt-1.5 space-y-1">
                  {u.events.expiries.map((e) => (
                    <li key={`x-${e.id}`} className="text-xs">
                      <span className="font-medium text-foreground">{e.tenant}</span>{" "}
                      <span className="text-muted-foreground">coverage {e.status.replace(/_/g, " ").toLowerCase()}</span>{" "}
                      <span className="text-muted-foreground/70">· {e.property}</span>
                    </li>
                  ))}
                  {u.events.payments.map((p) => (
                    <li key={`p-${p.id}`} className="text-xs">
                      <span className="text-muted-foreground">payment </span>
                      <span className="tabular-nums font-medium text-foreground">{money(p.amount)}</span>{" "}
                      <span className="text-muted-foreground">from {p.tenant}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
