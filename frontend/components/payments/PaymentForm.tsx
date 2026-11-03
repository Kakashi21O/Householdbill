"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { recordPayment } from "@/lib/payments/payment.service";
import { X, Check } from "lucide-react";

interface PaymentFormProps {
  bills: BillWithPayment[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ bills, onSuccess, onCancel }: PaymentFormProps) {
  // Only unpaid or partial bills can accept new payments
  const payableBills = bills.filter((b) => b.outstanding > 0);

  const [selectedBillId, setSelectedBillId] = React.useState<string>(payableBills[0]?.id || "");
  const selectedBill = bills.find((b) => b.id === selectedBillId);

  const [amount, setAmount] = React.useState<string>(
    selectedBill ? String(selectedBill.outstanding) : ""
  );
  const [paymentDate, setPaymentDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = React.useState<string>("UPI");
  const [transactionId, setTransactionId] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleBillChange = (id: string) => {
    setSelectedBillId(id);
    const b = bills.find((item) => item.id === id);
    if (b) {
      setAmount(String(b.outstanding));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBill) {
      setError("Please select a bill to pay.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (numAmount > selectedBill.outstanding) {
      setError(`Payment cannot exceed the remaining balance of ${formatINR(selectedBill.outstanding)}.`);
      return;
    }

    setSaving(true);
    const res = await recordPayment({
      bill_id: selectedBill.id,
      amount: numAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      transaction_id: transactionId.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSaving(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to record payment.");
    }
  };

  return (
    <Card className="border border-[var(--border)] shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <CardTitle className="text-base">Record Payment</CardTitle>
        <button onClick={onCancel} className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--surface)]">
          <X size={18} />
        </button>
      </CardHeader>
      <CardContent>
        {payableBills.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
            All bills are fully paid! No outstanding dues to record payments against.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-xs text-[var(--danger)]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Select Bill with Outstanding Due
              </label>
              <select
                value={selectedBillId}
                onChange={(e) => handleBillChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none"
                required
              >
                {payableBills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — Balance: {formatINR(b.outstanding)} (Total: {formatINR(Number(b.amount))})
                  </option>
                ))}
              </select>
            </div>

            {selectedBill && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Total Bill</span>
                  <span className="font-semibold text-[var(--foreground)]">{formatINR(Number(selectedBill.amount))}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Previously Paid</span>
                  <span className="font-semibold text-[var(--success)]">{formatINR(selectedBill.total_paid)}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Remaining Due</span>
                  <span className="font-bold text-[var(--danger)]">{formatINR(selectedBill.outstanding)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                id="amount"
                type="number"
                step="0.01"
                label="Payment Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <Input
                id="date"
                type="date"
                label="Payment Date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="txRef"
                label="Transaction Reference / ID (Optional)"
                placeholder="e.g. UPI Ref / NEFT Ref"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />

              <Input
                id="notes"
                label="Notes / Remarks (Optional)"
                placeholder="e.g. Paid via GPay by Vijay"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                <Check size={14} className="mr-1.5" />
                {saving ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
