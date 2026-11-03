import { BillWithPayment } from "../dashboard/dashboard.types";
import { EnrichedPayment } from "./history.service";

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBillsCsv(bills: BillWithPayment[], filenameSuffix = "records"): void {
  const headers = ["Bill ID", "Title", "Category", "Billing Month", "Billing Year", "Amount (INR)", "Due Date", "Paid Amount (INR)", "Outstanding (INR)", "Status"];
  const rows = bills.map((b) => [
    `"${b.id}"`,
    `"${(b.title || "").replace(/"/g, '""')}"`,
    b.category,
    b.billing_month,
    b.billing_year,
    Number(b.amount).toFixed(2),
    b.due_date,
    Number(b.total_paid).toFixed(2),
    Number(b.outstanding).toFixed(2),
    b.status,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCsv(csv, `bills_${filenameSuffix}_${new Date().toISOString().split("T")[0]}.csv`);
}

export function exportPaymentsCsv(payments: EnrichedPayment[], filenameSuffix = "records"): void {
  const headers = ["Payment ID", "Associated Bill", "Category", "Billing Period", "Amount (INR)", "Payment Date", "Payment Method", "Transaction ID", "Notes"];
  const rows = payments.map((p) => [
    `"${p.id}"`,
    `"${(p.bill_title || "").replace(/"/g, '""')}"`,
    p.bill_category || "-",
    p.billing_month && p.billing_year ? `${String(p.billing_month).padStart(2, "0")}/${p.billing_year}` : "-",
    Number(p.amount).toFixed(2),
    p.payment_date,
    p.payment_method,
    `"${(p.transaction_id || "").replace(/"/g, '""')}"`,
    `"${(p.notes || "").replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCsv(csv, `payments_${filenameSuffix}_${new Date().toISOString().split("T")[0]}.csv`);
}
