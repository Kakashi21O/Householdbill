import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { LucideIcon } from "lucide-react";

interface CategoryOverviewCardProps {
  title: string;
  icon: LucideIcon;
  bill: BillWithPayment | null;
  emptyLabel: string;
}

export function CategoryOverviewCard({
  title,
  icon: Icon,
  bill,
  emptyLabel,
}: CategoryOverviewCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--secondary)] border border-[var(--border)]">
            <Icon size={18} />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {bill && <PaymentStatusBadge status={bill.status} />}
      </CardHeader>

      <CardContent>
        {bill ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs text-[var(--text-muted)]">Bill Amount</span>
              <span className="text-lg font-bold text-[var(--foreground)]">
                {formatINR(Number(bill.amount))}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Paid</span>
                <span className="font-semibold text-[var(--success)]">
                  {formatINR(bill.total_paid)}
                </span>
              </div>
              <div className="p-2 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Remaining</span>
                <span className={`font-semibold ${bill.outstanding > 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                  {formatINR(bill.outstanding)}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-dim)] flex justify-between pt-1">
              <span>Due Date:</span>
              <span className="font-medium text-[var(--foreground)]">{formatDate(bill.due_date)}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
