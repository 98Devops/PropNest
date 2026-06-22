import { useMemo } from "react";
// @ts-expect-error - JS module without types (Phase 1 will type these)
import { useData } from "@/parts/p1_imports_context.jsx";
// @ts-expect-error - JS helper
import { buildProps } from "@/parts/p2_helpers.jsx";
// @ts-expect-error - JS module
import { useCoverageStore } from "@/hooks/useCoverageStore.js";
// @ts-expect-error - JS module
import { isConfigured } from "@/lib/supabase";

export type PortfolioRow = {
  id: string;
  name: string;
  location: string;
  color: string;
  collected: number;
  expected: number;
  students: number;
  totalBeds: number;
  vacantBeds: number;
  overdue: Array<{
    id: string;
    name: string;
    room: string;
    balance: number;
    paid: number;
    roomRent: number;
    status: string;
  }>;
  rooms: Array<{
    id: string;
    no: string;
    beds: number;
    rent: number;
    students: Array<{
      id: string;
      name: string;
      paid: number;
      balance: number;
      status: string;
      date: string;
      payHistory: Array<{
        id: string;
        amount: number;
        date: string;
        method?: string;
        receipt?: string;
        notes?: string;
      }>;
    }>;
  }>;
};

export type PortfolioTotals = {
  collected: number;
  expected: number;
  outstanding: number;
  collectionRate: number;  // 0..100
  occupancyRate: number;   // 0..100
  occupiedBeds: number;
  totalBeds: number;
  attentionCount: number;
};

export type RecentPayment = {
  id: string;
  studentName: string;
  property: string;
  room: string;
  amount: number;
  date: string;
  method?: string;
};

/**
 * Adapter — turns the raw `useData()` rows into the shapes the PropNest
 * dashboard tiles want. Keeps engine reads in one place so each tile component
 * stays a pure presenter.
 */
export function usePortfolio() {
  const { properties: rawProps, loading } = useData() as { properties: unknown[]; loading: boolean };

  const properties = useMemo<PortfolioRow[]>(
    () => (rawProps.length ? buildProps(rawProps) : []),
    [rawProps],
  );

  const totals = useMemo<PortfolioTotals>(() => {
    let collected = 0, expected = 0, totalBeds = 0, occupiedBeds = 0, attentionCount = 0;
    for (const p of properties) {
      collected += p.collected;
      expected += p.expected;
      totalBeds += p.totalBeds;
      occupiedBeds += p.students;
      attentionCount += p.overdue.length;
    }
    return {
      collected, expected,
      outstanding: Math.max(0, expected - collected),
      collectionRate: expected > 0 ? Math.round((collected / expected) * 100) : 0,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      occupiedBeds, totalBeds, attentionCount,
    };
  }, [properties]);

  const recentPayments = useMemo<RecentPayment[]>(() => {
    const out: RecentPayment[] = [];
    for (const p of properties) {
      for (const r of p.rooms) {
        for (const s of r.students) {
          for (const pay of s.payHistory ?? []) {
            if (!pay.date) continue;
            out.push({
              id: pay.id,
              studentName: s.name,
              property: p.name,
              room: r.no,
              amount: pay.amount,
              date: pay.date,
              method: pay.method,
            });
          }
        }
      }
    }
    out.sort((a, b) => b.date.localeCompare(a.date));
    return out.slice(0, 6);
  }, [properties]);

  const attention = useMemo(() => {
    const rows: Array<{ id: string; name: string; property: string; room: string; balance: number; status: string }> = [];
    for (const p of properties) {
      for (const o of p.overdue) {
        rows.push({ id: o.id, name: o.name, property: p.name, room: o.room, balance: o.balance, status: o.status });
      }
    }
    rows.sort((a, b) => b.balance - a.balance);
    return rows.slice(0, 6);
  }, [properties]);

  return { properties, totals, recentPayments, attention, loading };
}

/**
 * Coverage map shared with PropertyDetail / RoomRow — wraps useCoverageStore
 * so the rest of the UI doesn't import engine modules directly.
 */
export function usePortfolioCoverage() {
  const store = useCoverageStore(isConfigured) as {
    coverageMap: Map<string, { status: string; daysRemaining?: number; daysOverdue?: number; coverageEnd?: string }>;
    loading: boolean;
    refresh: () => void;
  };
  return store;
}
