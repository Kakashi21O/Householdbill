import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { TrendingUp, PieChart } from "lucide-react";

export function BillingOverviewCharts({ bills }: { bills: BillWithPayment[] }) {
  // Aggregate Rent vs Electricity totals
  const rentTotal = bills.filter((b) => b.category === "rent").reduce((acc, b) => acc + Number(b.amount), 0);
  const elecTotal = bills.filter((b) => b.category === "electricity").reduce((acc, b) => acc + Number(b.amount), 0);
  const totalBilled = rentTotal + elecTotal || 1;

  // Aggregate Paid vs Unpaid totals
  const totalPaid = bills.reduce((acc, b) => acc + b.total_paid, 0);
  const totalOutstanding = bills.reduce((acc, b) => acc + b.outstanding, 0);
  const totalStatusAmount = totalPaid + totalOutstanding || 1;

  const rentPercent = Math.round((rentTotal / totalBilled) * 100);
  const elecPercent = 100 - rentPercent;

  const paidPercent = Math.round((totalPaid / totalStatusAmount) * 100);
  const unpaidPercent = 100 - paidPercent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Category Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[var(--primary)]" />
            <CardTitle className="text-base">Rent vs Electricity Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 w-full bg-[var(--surface)] rounded-full overflow-hidden flex">
              <div style={{ width: `${rentPercent}%` }} className="bg-[var(--primary)] h-full" title={`Rent: ${rentPercent}%`} />
              <div style={{ width: `${elecPercent}%` }} className="bg-[var(--secondary)] h-full" title={`Electricity: ${elecPercent}%`} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">House Rent ({rentPercent}%)</span>
                <span className="font-bold text-[var(--foreground)]">{formatINR(rentTotal)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Electricity ({elecPercent}%)</span>
                <span className="font-bold text-[var(--foreground)]">{formatINR(elecTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paid vs Outstanding Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--success)]" />
            <CardTitle className="text-base">Settlement Health Ratio</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 w-full bg-[var(--surface)] rounded-full overflow-hidden flex">
              <div style={{ width: `${paidPercent}%` }} className="bg-[var(--success)] h-full" title={`Paid: ${paidPercent}%`} />
              <div style={{ width: `${unpaidPercent}%` }} className="bg-[var(--danger)] h-full" title={`Outstanding: ${unpaidPercent}%`} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Total Settled ({paidPercent}%)</span>
                <span className="font-bold text-[var(--success)]">{formatINR(totalPaid)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Total Outstanding ({unpaidPercent}%)</span>
                <span className={`font-bold ${totalOutstanding > 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                  {formatINR(totalOutstanding)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
