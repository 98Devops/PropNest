import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SearchIcon } from "lucide-react";
import { PropertyCard } from "./property-card";
import { PropertyDetail } from "./property-detail";
import { usePortfolio } from "./use-portfolio";
import { useNav } from "@/lib/propnest-nav";

export function Properties() {
  const { properties, loading } = usePortfolio();
  const { selectedPropertyId, setSelectedPropertyId } = useNav();
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  if (selected) {
    return <PropertyDetail property={selected} onBack={() => setSelectedPropertyId(null)} />;
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? properties.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q),
      )
    : properties;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground">
            {properties.length} propert{properties.length === 1 ? "y" : "ies"} in the portfolio
            {loading && <span className="ml-2 italic">· loading…</span>}
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {properties.length === 0
              ? "No properties yet."
              : "No properties match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onClick={() => setSelectedPropertyId(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
