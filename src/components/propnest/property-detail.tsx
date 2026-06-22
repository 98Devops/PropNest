import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, PlusIcon, SearchIcon } from "lucide-react";
import { money, moneyCompact } from "./fmt";
import { RoomRow } from "./room-row";
import { Panel } from "./panel";
import { StatCard } from "./stat-card";
import { DeltaPill } from "./delta-pill";
import { usePortfolioCoverage, type PortfolioRow } from "./use-portfolio";
import { RecordPaymentSheet } from "./modals/record-payment-sheet";

export function PropertyDetail({
  property,
  onBack,
}: {
  property: PortfolioRow;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [payOpen, setPayOpen] = useState(false);
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
  const attentionCount = property.overdue.length;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 gap-1.5 text-muted-foreground">
        <ArrowLeftIcon className="size-3.5" />
        Back to properties
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: property.color }}
          >
            {property.location}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span className="text-brand-gradient">{property.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {property.rooms.length} room{property.rooms.length === 1 ? "" : "s"} · {property.totalBeds} bed{property.totalBeds === 1 ? "" : "s"} · {property.students} tenant{property.students === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setPayOpen(true)} disabled={property.students === 0}>
          <PlusIcon /> Record payment
        </Button>
      </header>

      <RecordPaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        propertyId={property.id}
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          featured
          label="Collected"
          value={moneyCompact(property.collected)}
          delta={<DeltaPill tone={collectionPct >= 90 ? "positive" : collectionPct >= 70 ? "neutral" : "negative"}>{collectionPct}%</DeltaPill>}
          caption={`of ${moneyCompact(property.expected)} expected`}
          progress={collectionPct}
        />
        <StatCard
          label="Occupancy"
          value={`${occPct}%`}
          caption={`${property.students} of ${property.totalBeds} beds`}
          progress={occPct}
        />
        <StatCard
          label="Rooms"
          value={String(property.rooms.length)}
          caption="In this property"
        />
        <StatCard
          label="Vacant"
          value={String(property.vacantBeds)}
          caption={property.vacantBeds === 0 ? "Fully occupied" : "Beds available"}
        />
        <StatCard
          label="Attention"
          value={String(attentionCount)}
          delta={attentionCount > 0
            ? <DeltaPill tone="negative">need follow-up</DeltaPill>
            : <DeltaPill tone="positive">all clear</DeltaPill>}
          caption={attentionCount === 0 ? "Coverage up to date" : `${money(property.overdue.reduce((s, o) => s + o.balance, 0))} outstanding`}
        />
      </section>

      <Panel>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Rooms & tenants</h3>
            <p className="text-xs text-muted-foreground">
              {filteredRooms.length} of {property.rooms.length} room{property.rooms.length === 1 ? "" : "s"}
              {coverageLoading && <span className="ml-2 italic">· loading coverage…</span>}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms or tenants…"
              className="pl-9"
            />
          </div>
        </header>
        <div className="p-5">
          {filteredRooms.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No rooms match your search.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRooms.map((room) => (
                <RoomRow key={room.id} room={room} coverageMap={coverageMap} />
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
