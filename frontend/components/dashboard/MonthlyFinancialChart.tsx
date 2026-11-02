import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { MonthlySpending } from "@/lib/dashboard/dashboard.types";
import { BarChart3 } from "lucide-react";

export function MonthlyFinancialChart({ data }: { data: MonthlySpending[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.billed, d.paid]), 1);
  const hasRecords = data.some((d) => d.billed > 0 || d.paid > 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[var(--primary)]" />
          <CardTitle className="text-base">6-Month Spending Trend</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--primary)] inline-block" /> Billed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--success)] inline-block" /> Paid
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {hasRecords ? (
          <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-[var(--border)] pb-2">
            {data.map((item) => {
              const billedH = Math.round((item.billed / maxVal) * 100);
              const paidH = Math.round((item.paid / maxVal) * 100);
              return (
                <div key={item.monthYear} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      title={`Billed: ${formatINR(item.billed)}`}
                      style={{ height: `${billedH}%` }}
                      className="w-1/2 max-w-[14px] bg-[var(--primary)]/80 hover:bg-[var(--primary)] rounded-t transition-all min-h-[2px]"
                    />
                    <div
                      title={`Paid: ${formatINR(item.paid)}`}
                      style={{ height: `${paidH}%` }}
                      className="w-1/2 max-w-[14px] bg-[var(--success)]/80 hover:bg-[var(--success)] rounded-t transition-all min-h-[2px]"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] font-medium">
                    {item.monthYear}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
            No historical records yet. Bills and payments will automatically chart here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
