import { PropNestStats } from "./stats";
import { PropNestAttention } from "./attention";
import { PropNestActivity } from "./activity";
import { PropertyMix } from "./property-mix";

export function PropNestDashboard() {
  return (
    <div className="grid grid-cols-1 gap-px bg-border p-px md:grid-cols-2 lg:grid-cols-4">
      <PropNestStats />
      <PropertyMix />
      <PropNestAttention />
      <PropNestActivity />
    </div>
  );
}
