import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { CalendarClock } from "lucide-react";

export function UpcomingPayments({ bills }: { bills: BillWithPayment[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-[var(--warning)]" />
          <CardTitle className="text-base">Upcoming & Pending Dues</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {bills.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold capitalize text-[var(--foreground)]">{b.category} Bill</p>
                  <p className="text-[11px] text-[var(--text-dim)]">Due: {formatDate(b.due_date)}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-bold text-[var(--danger)] block">{formatINR(b.outstanding)}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">of {formatINR(Number(b.amount))}</span>
                  </div>
                  <PaymentStatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
            All clear! No pending or upcoming dues found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
