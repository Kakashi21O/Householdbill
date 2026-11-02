import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Receipt, DollarSign, CheckCircle2, AlertCircle, AlertTriangle, CalendarClock } from "lucide-react";

interface BillingSummaryProps {
  totalBillsThisMonth: number;
  totalBilledThisMonth: number;
  totalPaidThisMonth: number;
  outstandingThisMonth: number;
  totalOverdueBills: number;
  totalUpcomingBills: number;
}

export function BillingSummary({
  totalBillsThisMonth,
  totalBilledThisMonth,
  totalPaidThisMonth,
  outstandingThisMonth,
  totalOverdueBills,
  totalUpcomingBills,
}: BillingSummaryProps) {
  const paidPercent =
    totalBilledThisMonth > 0 ? Math.round((totalPaidThisMonth / totalBilledThisMonth) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <SummaryCard
        title="Bills This Month"
        amount={totalBillsThisMonth}
        description="Active monthly bills"
        icon={Receipt}
        variant="primary"
      />
      <SummaryCard
        title="Billed Amount"
        amount={totalBilledThisMonth}
        description="Total for this month"
        icon={DollarSign}
        variant="primary"
      />
      <SummaryCard
        title="Paid This Month"
        amount={totalPaidThisMonth}
        description={`${paidPercent}% settled`}
        icon={CheckCircle2}
        variant="success"
        progress={paidPercent}
      />
      <SummaryCard
        title="Outstanding"
        amount={outstandingThisMonth}
        description={outstandingThisMonth > 0 ? "Pending collection" : "Fully cleared"}
        icon={AlertCircle}
        variant={outstandingThisMonth > 0 ? "warning" : "success"}
      />
      <SummaryCard
        title="Overdue Bills"
        amount={totalOverdueBills}
        description={totalOverdueBills > 0 ? "Past due date" : "No overdue bills"}
        icon={AlertTriangle}
        variant={totalOverdueBills > 0 ? "danger" : "success"}
      />
      <SummaryCard
        title="Upcoming Dues"
        amount={totalUpcomingBills}
        description="Due in future dates"
        icon={CalendarClock}
        variant="primary"
      />
    </div>
  );
}
