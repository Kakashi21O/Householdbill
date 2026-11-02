import { Bill, Payment, HouseholdSettings } from "@/types";

export type BillStatus = "paid" | "unpaid" | "partial" | "overdue";

export interface BillWithPayment extends Bill {
  total_paid: number;
  outstanding: number;
  status: BillStatus;
  is_overdue: boolean;
}

export interface MonthlySpending {
  monthYear: string;
  billed: number;
  paid: number;
}

export interface DashboardData {
  household: HouseholdSettings | null;
  totalMonthlyBills: number;
  totalPaid: number;
  totalOutstanding: number;
  upcomingDueTotal: number;
  nearestDueDate: string | null;
  currentRentBill: BillWithPayment | null;
  currentElectricityBill: BillWithPayment | null;
  upcomingBills: BillWithPayment[];
  recentPayments: (Payment & { bill_category?: string })[];
  monthlyChartData: MonthlySpending[];
}
