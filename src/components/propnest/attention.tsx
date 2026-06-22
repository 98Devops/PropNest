import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Panel } from "./panel";
import { usePortfolio } from "./use-portfolio";
import { money } from "./fmt";

const TONE: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
  OVERDUE: "destructive",
  DUE_TODAY: "destructive",
  EXPIRING_SOON: "secondary",
  PARTIAL: "secondary",
};

export function PropNestAttention() {
  const { attention } = usePortfolio();

  return (
    <Panel className="md:col-span-2">
      <header className="flex items-baseline justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Needs attention</h3>
          <p className="text-xs text-muted-foreground">Tenants with outstanding balances or expiring coverage.</p>
        </div>
        {attention.length > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {attention.length}
          </span>
        )}
      </header>
      <div>
        <Table>
          <TableCaption className="sr-only">
            Tenants requiring attention, sorted by balance owed.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-5">Tenant</TableHead>
              <TableHead>Property / Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pe-5 text-right tabular-nums">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attention.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                  Nothing outstanding. Coverage is up to date.
                </TableCell>
              </TableRow>
            ) : attention.map((row) => (
              <TableRow className="h-12" key={row.id}>
                <TableCell className="max-w-40 truncate ps-5 font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.property} <span className="text-muted-foreground/70">· {row.room}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={TONE[row.status] ?? "outline"}>
                    {row.status.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="pe-5 text-right tabular-nums font-semibold">{money(row.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}
