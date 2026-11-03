import { BillWithPayment } from "../dashboard/dashboard.types";
import { EnrichedPayment } from "./history.service";

export interface MonthlyBreakdown {
  month: number;
  monthName: string;
  rentBilled: number;
  electricityBilled: number;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  hasRecords: boolean;
  isComplete: boolean; // Both rent & electricity present
  status: "paid" | "partial" | "unpaid" | "missing";
  bills: BillWithPayment[];
  payments: EnrichedPayment[];
}

export interface YearStats {
  year: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  rentTotal: number;
  elecTotal: number;
  monthlyAverageElec: number;
  highestElecBill: number;
  lowestElecBill: number;
  completedMonthsCount: number;
  months: MonthlyBreakdown[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function calculateYearStats(year: number, bills: BillWithPayment[], payments: EnrichedPayment[]): YearStats {
  const yearBills = bills.filter((b) => b.billing_year === year);
  const months: MonthlyBreakdown[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const mBills = yearBills.filter((b) => b.billing_month === m);
    const mBillIds = new Set(mBills.map((b) => b.id));
    const mPayments = payments.filter((p) => mBillIds.has(p.bill_id));

    const rentBilled = mBills.filter((b) => b.category === "rent").reduce((s, b) => s + Number(b.amount), 0);
    const electricityBilled = mBills.filter((b) => b.category === "electricity").reduce((s, b) => s + Number(b.amount), 0);
    const totalBilled = mBills.reduce((s, b) => s + Number(b.amount), 0);
    const totalPaid = mBills.reduce((s, b) => s + b.total_paid, 0);
    const outstanding = mBills.reduce((s, b) => s + b.outstanding, 0);

    const hasRent = mBills.some((b) => b.category === "rent");
    const hasElec = mBills.some((b) => b.category === "electricity");
    const hasRecords = mBills.length > 0;
    const isComplete = hasRent && hasElec;

    let status: MonthlyBreakdown["status"] = "missing";
    if (hasRecords) {
      if (outstanding === 0 && totalBilled > 0) status = "paid";
      else if (totalPaid > 0) status = "partial";
      else status = "unpaid";
    }

    return {
      month: m,
      monthName: MONTH_NAMES[i],
      rentBilled,
      electricityBilled,
      totalBilled,
      totalPaid,
      outstanding,
      hasRecords,
      isComplete,
      status,
      bills: mBills,
      payments: mPayments,
    };
  });

  const totalBilled = yearBills.reduce((s, b) => s + Number(b.amount), 0);
  const totalPaid = yearBills.reduce((s, b) => s + b.total_paid, 0);
  const totalOutstanding = yearBills.reduce((s, b) => s + b.outstanding, 0);
  const rentTotal = yearBills.filter((b) => b.category === "rent").reduce((s, b) => s + Number(b.amount), 0);
  const elecBills = yearBills.filter((b) => b.category === "electricity");
  const elecTotal = elecBills.reduce((s, b) => s + Number(b.amount), 0);

  const highestElecBill = elecBills.length > 0 ? Math.max(...elecBills.map((b) => Number(b.amount))) : 0;
  const lowestElecBill = elecBills.length > 0 ? Math.min(...elecBills.map((b) => Number(b.amount))) : 0;
  const completedMonthsCount = months.filter((m) => m.hasRecords && m.status === "paid").length;
  const elecCount = elecBills.length;
  const monthlyAverageElec = elecCount > 0 ? Math.round(elecTotal / elecCount) : 0;

  return {
    year,
    totalBilled,
    totalPaid,
    totalOutstanding,
    rentTotal,
    elecTotal,
    monthlyAverageElec,
    highestElecBill,
    lowestElecBill,
    completedMonthsCount,
    months,
  };
}
