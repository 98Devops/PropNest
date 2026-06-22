import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { DashboardCard } from "@/components/dashboard-card";
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
    <DashboardCard className="relative gap-0 md:col-span-2">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Needs attention</CardTitle>
        <CardDescription>Tenants with outstanding balances or expiring coverage.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableCaption className="sr-only">
            Tenants requiring attention, sorted by balance owed.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-6">Tenant</TableHead>
              <TableHead>Property / Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pe-6 text-right tabular-nums">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attention.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nothing outstanding. Coverage is up to date.
                </TableCell>
              </TableRow>
            ) : attention.map((row) => (
              <TableRow className="h-12" key={row.id}>
                <TableCell className="max-w-40 truncate ps-6 font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.property} <span className="text-muted-foreground/70">· {row.room}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={TONE[row.status] ?? "outline"}>
                    {row.status.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="pe-6 text-right tabular-nums">{money(row.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </DashboardCard>
  );
}
