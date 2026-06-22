import { usePortfolio } from "./use-portfolio";
import { money } from "./fmt";
import { StatCard } from "./stat-card";
import { DeltaPill } from "./delta-pill";

export function PropNestStats() {
  const { totals } = usePortfolio();

  return (
    <>
      <StatCard
        featured
        label="Collected this month"
        value={money(totals.collected)}
        delta={
          <DeltaPill tone={totals.collectionRate >= 90 ? "positive" : totals.collectionRate >= 70 ? "neutral" : "negative"}>
            {totals.collectionRate}%
          </DeltaPill>
        }
        caption={`${money(totals.collected)} of ${money(totals.expected)} expected`}
        progress={totals.collectionRate}
      />
      <StatCard
        label="Expected"
        value={money(totals.expected)}
        caption={`${totals.occupiedBeds} occupied bed${totals.occupiedBeds === 1 ? "" : "s"}`}
      />
      <StatCard
        label="Outstanding"
        value={money(totals.outstanding)}
        delta={totals.attentionCount > 0 ? (
          <DeltaPill tone="negative">{totals.attentionCount}</DeltaPill>
        ) : (
          <DeltaPill tone="positive">0</DeltaPill>
        )}
        caption={totals.attentionCount === 0 ? "Nothing needs attention" : `${totals.attentionCount} tenant${totals.attentionCount === 1 ? "" : "s"} need attention`}
      />
      <StatCard
        label="Occupancy"
        value={`${totals.occupancyRate}%`}
        caption={`${totals.occupiedBeds} of ${totals.totalBeds} beds`}
        progress={totals.occupancyRate}
      />
    </>
  );
}
