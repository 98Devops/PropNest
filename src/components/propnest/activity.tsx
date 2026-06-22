import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { CreditCardIcon } from "lucide-react";
import { usePortfolio } from "./use-portfolio";
import { money, formatDate } from "./fmt";

export function PropNestActivity() {
  const { recentPayments } = usePortfolio();

  return (
    <DashboardCard className="gap-0">
      <CardHeader className="border-b">
        <CardTitle>Recent payments</CardTitle>
        <CardDescription>Latest payments received across the portfolio.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {recentPayments.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No payments recorded yet.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentPayments.map((p) => (
              <li className="flex h-16 items-center gap-3 px-6" key={p.id}>
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted [&_svg]:size-4"
                >
                  <CreditCardIcon />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-1 text-pretty text-foreground text-sm leading-snug">
                    {p.studentName} <span className="text-muted-foreground">paid {money(p.amount)}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {p.property} · {p.room} · {formatDate(p.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </DashboardCard>
  );
}
