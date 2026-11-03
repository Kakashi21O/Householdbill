"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { MonthlyBreakdown } from "@/lib/history/history.calculations";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { EnrichedPayment } from "@/lib/history/history.service";
import { X, Calendar, Receipt, CreditCard, ExternalLink, Download } from "lucide-react";

interface MonthlyDetailsModalProps {
  monthData: MonthlyBreakdown;
  year: number;
  onClose: () => void;
  onSelectBill: (bill: BillWithPayment) => void;
  onSelectPayment: (payment: EnrichedPayment) => void;
  onExportMonth: () => void;
}

export function MonthlyDetailsModal({
  monthData,
  year,
  onClose,
  onSelectBill,
  onSelectPayment,
  onExportMonth,
}: MonthlyDetailsModalProps) {
  const uniqueMethods = Array.from(new Set(monthData.payments.map((p) => p.payment_method)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl bg-[var(--card)] border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <CardTitle className="text-base">
              Financial Breakdown — {monthData.monthName} {year}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onExportMonth} className="h-8 gap-1.5 text-xs">
              <Download size={13} /> Export Month CSV
            </Button>
            <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--card-subtle)]">
              <X size={18} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 overflow-y-auto flex-1">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] block text-[10px]">Rent Billed</span>
              <span className="font-bold text-[var(--foreground)] font-mono">{formatINR(monthData.rentBilled)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] block text-[10px]">Electricity Billed</span>
              <span className="font-bold text-[var(--foreground)] font-mono">{formatINR(monthData.electricityBilled)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] block text-[10px]">Total Billed</span>
              <span className="font-bold text-[var(--foreground)] font-mono">{formatINR(monthData.totalBilled)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] block text-[10px]">Total Paid</span>
              <span className="font-bold text-[var(--success)] font-mono">{formatINR(monthData.totalPaid)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] block text-[10px]">Remaining Balance</span>
              <span className={`font-bold font-mono ${monthData.outstanding > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                {formatINR(monthData.outstanding)}
              </span>
            </div>
          </div>

          {/* Payment Summary Info */}
          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-[var(--secondary)]" />
              <span className="text-[var(--text-muted)]">Payment Summary:</span>
              <span className="font-semibold text-[var(--foreground)]">{monthData.payments.length} Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">Methods:</span>
              {uniqueMethods.length > 0 ? (
                uniqueMethods.map((m) => (
                  <Badge key={m} variant="default" className="text-[10px] py-0">
                    {m}
                  </Badge>
                ))
              ) : (
                <span className="text-[var(--text-dim)]">None</span>
              )}
            </div>
          </div>

          {/* Month's Bills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-[var(--foreground)]">
              <Receipt size={14} className="text-[var(--primary)]" />
              Bills for {monthData.monthName} {year} ({monthData.bills.length})
            </h4>
            {monthData.bills.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
                No bills recorded for this month.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--card-subtle)] border-b border-[var(--border)] text-[var(--text-muted)]">
                      <th className="p-2">Category</th>
                      <th className="p-2">Bill Title</th>
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Paid</th>
                      <th className="p-2">Outstanding</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {monthData.bills.map((b) => (
                      <tr key={b.id} className="hover:bg-[var(--card-subtle)]">
                        <td className="p-2 uppercase text-[10px] font-bold text-[var(--text-muted)]">{b.category}</td>
                        <td className="p-2 font-medium">{b.title}</td>
                        <td className="p-2 text-[var(--text-dim)]">{formatDate(b.due_date)}</td>
                        <td className="p-2 font-mono font-semibold">{formatINR(b.amount)}</td>
                        <td className="p-2 font-mono text-[var(--success)]">{formatINR(b.total_paid)}</td>
                        <td className="p-2 font-mono text-[var(--danger)]">{formatINR(b.outstanding)}</td>
                        <td className="p-2"><PaymentStatusBadge status={b.status} /></td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => onSelectBill(b)}
                            className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline"
                          >
                            <ExternalLink size={12} /> View Bill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Month's Payments */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-[var(--foreground)]">
              <CreditCard size={14} className="text-[var(--secondary)]" />
              Payments for {monthData.monthName} {year} ({monthData.payments.length})
            </h4>
            {monthData.payments.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
                No payments recorded for this month.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--card-subtle)] border-b border-[var(--border)] text-[var(--text-muted)]">
                      <th className="p-2">Date</th>
                      <th className="p-2">Associated Bill</th>
                      <th className="p-2">Method</th>
                      <th className="p-2">Ref ID</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {monthData.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--card-subtle)]">
                        <td className="p-2 text-[var(--text-dim)]">{formatDate(p.payment_date)}</td>
                        <td className="p-2 font-medium">{p.bill_title}</td>
                        <td className="p-2"><Badge variant="default" className="text-[10px] py-0">{p.payment_method}</Badge></td>
                        <td className="p-2 font-mono text-[11px] text-[var(--text-muted)]">{p.transaction_id || "-"}</td>
                        <td className="p-2 font-mono font-semibold text-[var(--success)]">{formatINR(p.amount)}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => onSelectPayment(p)}
                            className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline"
                          >
                            <ExternalLink size={12} /> View Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
