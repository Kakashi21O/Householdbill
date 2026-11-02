import { SummaryCard } from "./SummaryCard";
import { Receipt, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

interface SummaryCardsProps {
  totalMonthlyBills: number;
  totalPaid: number;
  totalOutstanding: number;
  upcomingDueTotal: number;
  nearestDueDate: string | null;
}

export function SummaryCards({
  totalMonthlyBills,
  totalPaid,
  totalOutstanding,
  upcomingDueTotal,
  nearestDueDate,
}: SummaryCardsProps) {
  const paidPercentage =
    totalMonthlyBills > 0 ? Math.round((totalPaid / totalMonthlyBills) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Monthly Bills"
        amount={totalMonthlyBills}
        description="Current billing period"
        icon={Receipt}
        variant="primary"
      />
      <SummaryCard
        title="Total Paid"
        amount={totalPaid}
        description={`${paidPercentage}% settled`}
        icon={CheckCircle2}
        variant="success"
        progress={paidPercentage}
      />
      <SummaryCard
        title="Outstanding Amount"
        amount={totalOutstanding}
        description={totalOutstanding > 0 ? "Pending payment" : "Fully cleared"}
        icon={AlertCircle}
        variant={totalOutstanding > 0 ? "danger" : "success"}
      />
      <SummaryCard
        title="Upcoming Due"
        amount={upcomingDueTotal}
        description={nearestDueDate ? `Due by ${formatDate(nearestDueDate)}` : "No urgent dues"}
        icon={Clock}
        variant="warning"
      />
    </div>
  );
}
