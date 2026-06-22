import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { money, moneyCompact } from "./fmt";
import { RoomRow } from "./room-row";
import { usePortfolioCoverage, type PortfolioRow } from "./use-portfolio";

export function PropertyDetail({
  property,
  onBack,
}: {
  property: PortfolioRow;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const { coverageMap, loading: coverageLoading } = usePortfolioCoverage();

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return property.rooms;
    return property.rooms.filter(
      (r) =>
        r.no.toLowerCase().includes(q) ||
        r.students.some((s) => s.name.toLowerCase().includes(q)),
    );
  }, [property.rooms, search]);

  const collectionPct = property.expected > 0
    ? Math.round((property.collected / property.expected) * 100)
    : 0;
  const occPct = property.totalBeds > 0
    ? Math.round((property.students / property.totalBeds) * 100)
    : 0;

  const kpis = [
    { label: "Rooms",     value: String(property.rooms.length) },
    { label: "Tenants",   value: `${property.students} / ${property.totalBeds}` },
    { label: "Collected", value: moneyCompact(property.collected) },
    { label: "Vacant",    value: String(property.vacantBeds) },
    { label: "Rate",      value: `${collectionPct}%` },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 gap-1.5 text-muted-foreground">
        <ArrowLeftIcon className="size-3.5" />
        Back to properties
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: property.color }}
          >
            {property.location}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{property.name}</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpis.map((k) => (
              <div key={k.label}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="mt-1 tabular-nums text-2xl font-semibold text-foreground">{k.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProgressLine label="Collection" pct={collectionPct} sub={`${money(property.collected)} / ${money(property.expected)}`} tone="primary" />
            <ProgressLine label="Occupancy" pct={occPct} sub={`${property.students} / ${property.totalBeds} beds`} tone="success" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms or tenants…"
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filteredRooms.length} of {property.rooms.length} room{property.rooms.length === 1 ? "" : "s"}
          {coverageLoading && <span className="ml-2 italic">loading coverage…</span>}
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No rooms match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredRooms.map((room) => (
            <RoomRow key={room.id} room={room} coverageMap={coverageMap} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressLine({
  label, pct, sub, tone,
}: { label: string; pct: number; sub: string; tone: "primary" | "success" }) {
  const bar = tone === "success" ? "bg-emerald-500" : "bg-primary";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{sub} <span className="ms-1 font-medium text-foreground">{pct}%</span></span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-[width]`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
