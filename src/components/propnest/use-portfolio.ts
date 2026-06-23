import { useMemo } from "react";
// Engine modules (brief §3) — JS-typed, consumed without modification.
import { useData } from "@/parts/p1_imports_context.jsx";
import { buildProps } from "@/parts/p2_helpers.jsx";
import { useCoverageStore } from "@/hooks/useCoverageStore.js";
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
      notes?: string | null;
      phone?: string | null;
      idNumber?: string | null;
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

export type FlatTenant = {
  id: string;
  name: string;
  property: string;
  propertyId: string;
  propertyColor: string;
  room: string;
  rent: number;
  paid: number;
  balance: number;
  status: string;
  checkIn: string;
  phone?: string | null;
};

export type MonthlyPoint = {
  key: string;       // 2026-05
  label: string;     // May
  collected: number;
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
  const { properties: rawProps, loading } = useData() as unknown as { properties: unknown[]; loading: boolean };

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

  const allTenants = useMemo<FlatTenant[]>(() => {
    const out: FlatTenant[] = [];
    for (const p of properties) {
      for (const r of p.rooms) {
        for (const s of r.students) {
          if (s.status === "VACANT" || s.status === "VACATED") continue;
          out.push({
            id: s.id,
            name: s.name,
            property: p.name,
            propertyId: p.id,
            propertyColor: p.color,
            room: r.no,
            rent: r.rent,
            paid: s.paid,
            balance: s.balance,
            status: s.status,
            checkIn: s.date,
          });
        }
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [properties]);

  const monthlyTrend = useMemo<MonthlyPoint[]>(() => {
    const map = new Map<string, number>();
    for (const p of properties) {
      for (const r of p.rooms) {
        for (const s of r.students) {
          for (const pay of s.payHistory ?? []) {
            if (!pay.date) continue;
            const key = pay.date.slice(0, 7); // YYYY-MM
            map.set(key, (map.get(key) ?? 0) + Number(pay.amount || 0));
          }
        }
      }
    }
    // Anchor to the last 12 months ending current month
    const now = new Date();
    const months: MonthlyPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: d.toLocaleString("en-US", { month: "short" }),
        collected: map.get(key) ?? 0,
      });
    }
    return months;
  }, [properties]);

  /**
   * Locate a tenant + their property + room in one walk. Returns the full
   * student record (with payHistory) so the profile drawer doesn't need a
   * second fetch.
   */
  const findTenant = (id: string | null) => {
    if (!id) return null;
    for (const p of properties) {
      for (const r of p.rooms) {
        const s = r.students.find((x) => x.id === id);
        if (s) return { tenant: s, property: p, room: r };
      }
    }
    return null;
  };

  return { properties, totals, recentPayments, attention, allTenants, monthlyTrend, findTenant, loading };
}

/**
 * Coverage map shared with PropertyDetail / RoomRow — wraps useCoverageStore
 * so the rest of the UI doesn't import engine modules directly.
 */
export function usePortfolioCoverage() {
  const store = useCoverageStore(isConfigured) as unknown as {
    coverageMap: Map<string, { status: string; daysRemaining?: number; daysOverdue?: number; coverageEnd?: string }>;
    loading: boolean;
    refresh: () => void;
  };
  return store;
}
