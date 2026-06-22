import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDownIcon, BedSingleIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "./fmt";
import { CoverageStatusBadge, CoverageRunwayBar, coverageSubLabel } from "./coverage";
import type { PortfolioRow } from "./use-portfolio";

type Room = PortfolioRow["rooms"][number];
type CoverageMap = Map<string, { status: string; daysRemaining?: number; daysOverdue?: number; coverageEnd?: string }>;

export function RoomRow({
  room,
  coverageMap,
}: {
  room: Room;
  coverageMap: CoverageMap;
}) {
  const [open, setOpen] = useState(false);

  const real = room.students.filter((s) => s.status !== "VACANT" && s.status !== "VACATED");
  const vacant = Math.max(0, room.beds - real.length);

  const covered = real.filter((s) => {
    const c = coverageMap.get(s.id);
    return c && ["CURRENT", "EXPIRING_SOON", "DUE_TODAY"].includes(c.status);
  }).length;
  const overdue = real.filter((s) => coverageMap.get(s.id)?.status === "OVERDUE").length;
  const coveragePct = real.length > 0 ? Math.round((covered / real.length) * 100) : 0;

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={open}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <BedSingleIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{room.no}</span>
            <span className="text-xs text-muted-foreground">· {room.beds} bed{room.beds === 1 ? "" : "s"}</span>
            <span className="text-xs text-muted-foreground">· {money(room.rent)}/mo</span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <CoverageRunwayBar
              className="max-w-[180px]"
              coverage={{
                status: overdue > 0 ? "OVERDUE" : coveragePct === 100 ? "CURRENT" : "EXPIRING_SOON",
                daysRemaining: coveragePct,
              }}
            />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {covered}/{real.length} covered
              {vacant > 0 && <> · <span className="text-amber-600">{vacant} vacant</span></>}
            </span>
          </div>
        </div>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <CardContent className="border-t bg-muted/30 px-4 py-3">
          {real.length === 0 ? (
            <div className="py-3 text-center text-sm text-muted-foreground">
              All beds vacant.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {real.map((s) => {
                const cov = coverageMap.get(s.id) ?? null;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                      <UserIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{coverageSubLabel(cov)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tabular-nums text-muted-foreground">
                        Balance <span className={cn("font-medium text-foreground", s.balance > 0 && "text-destructive")}>{money(s.balance)}</span>
                      </div>
                      <div className="mt-1">
                        <CoverageStatusBadge coverage={cov} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
