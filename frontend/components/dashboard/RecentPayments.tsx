import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types";
import { History } from "lucide-react";

export function RecentPayments({
  payments,
}: {
  payments: (Payment & { bill_category?: string })[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-2">
          <History size={18} className="text-[var(--secondary)]" />
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((p) => (
                  <tr key={p.id} className="text-[var(--foreground)] hover:bg-[var(--surface)]/50">
                    <td className="py-2.5 pr-4 capitalize font-semibold">{p.bill_category || "Bill"}</td>
                    <td className="py-2.5 pr-4 text-[var(--text-dim)]">{formatDate(p.payment_date)}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="default" className="text-[10px] uppercase font-mono">
                        {p.payment_method}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-bold text-[var(--success)]">
                      {formatINR(Number(p.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
            No recent payment activity recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
