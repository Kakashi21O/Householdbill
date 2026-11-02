import { Bill, Payment } from "@/types";
import { BillWithPayment, BillStatus } from "./dashboard.types";

export function computeBillPayments(bills: Bill[], payments: Payment[]): BillWithPayment[] {
  const paymentSumByBill = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.bill_id] = (acc[p.bill_id] || 0) + Number(p.amount);
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];

  return bills.map((bill) => {
    const billAmt = Number(bill.amount);
    const total_paid = paymentSumByBill[bill.id] || 0;
    const outstanding = Math.max(0, billAmt - total_paid);
    const is_overdue = outstanding > 0 && Boolean(bill.due_date && bill.due_date < today);

    let status: BillStatus = "unpaid";
    if (total_paid >= billAmt) {
      status = "paid";
    } else if (is_overdue) {
      status = "overdue";
    } else if (total_paid > 0) {
      status = "partial";
    }

    return {
      ...bill,
      title: bill.title || `${bill.category.toUpperCase()} Bill - ${bill.billing_month}/${bill.billing_year}`,
      issue_date: bill.issue_date || bill.due_date,
      total_paid,
      outstanding,
      is_overdue,
      status,
    };
  });
}
