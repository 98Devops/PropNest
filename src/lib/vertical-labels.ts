/**
 * Vertical-neutral label config (UI brief §7).
 *
 * Phase 2 will swap this for a real vertical config (students / lodges /
 * short-stay / long-term). For now, the student vertical is the default and
 * every label-aware component reads from here so the swap is a config change
 * later, not a rewrite.
 */

export type RatePeriod = "month" | "night";

export type VerticalLabels = {
  /** Singular noun for the person being billed. */
  occupant: string;
  /** Plural noun. */
  occupantPlural: string;
  /** Verb form of "add a new one" — used on CTAs. */
  addOccupant: string;
  /** Unit being occupied: room / unit / listing. */
  unit: string;
  unitPlural: string;
  /** Building-level container. */
  property: string;
  /** Billing cadence. Drives "$120/mo" vs "$45/night" affordances. */
  ratePeriod: RatePeriod;
  /** Currency glyph from settings. */
  currencySymbol: string;
};

export const STUDENT_LABELS: VerticalLabels = {
  occupant:       "Tenant",
  occupantPlural: "Tenants",
  addOccupant:    "Add tenant",
  unit:           "Room",
  unitPlural:     "Rooms",
  property:       "Property",
  ratePeriod:     "month",
  currencySymbol: "$",
};

// Hook stays minimal until Phase 2 wires a provider. Components import the
// hook (not the constant) so we can switch the source without touching them.
export function useLabels(): VerticalLabels {
  return STUDENT_LABELS;
}
