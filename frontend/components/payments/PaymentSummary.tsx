import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CreditCard, CheckCircle2, Clock, AlertCircle, TrendingUp, Layers } from "lucide-react";

interface PaymentSummaryProps {
  totalPaymentsThisMonth: number;
  totalCollectedThisMonth: number;
  fullyPaidBillsCount: number;
  partiallyPaidBillsCount: number;
  unpaidBillsCount: number;
  totalOutstandingBalance: number;
}

export function PaymentSummary({
  totalPaymentsThisMonth,
  totalCollectedThisMonth,
  fullyPaidBillsCount,
  partiallyPaidBillsCount,
  unpaidBillsCount,
  totalOutstandingBalance,
}: PaymentSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <SummaryCard
        title="Payments This Month"
        amount={totalPaymentsThisMonth}
        description="Transactions recorded"
        icon={CreditCard}
        variant="primary"
      />
      <SummaryCard
        title="Collected This Month"
        amount={totalCollectedThisMonth}
        description="Total paid towards bills"
        icon={TrendingUp}
        variant="success"
      />
      <SummaryCard
        title="Fully Paid Bills"
        amount={fullyPaidBillsCount}
        description="Settled in full"
        icon={CheckCircle2}
        variant="success"
      />
      <SummaryCard
        title="Partially Paid"
        amount={partiallyPaidBillsCount}
        description="Installments active"
        icon={Clock}
        variant="warning"
      />
      <SummaryCard
        title="Unpaid / Overdue"
        amount={unpaidBillsCount}
        description="Awaiting payment"
        icon={AlertCircle}
        variant={unpaidBillsCount > 0 ? "danger" : "success"}
      />
      <SummaryCard
        title="Total Outstanding"
        amount={totalOutstandingBalance}
        description="Across all historical bills"
        icon={Layers}
        variant={totalOutstandingBalance > 0 ? "danger" : "success"}
      />
    </div>
  );
}
