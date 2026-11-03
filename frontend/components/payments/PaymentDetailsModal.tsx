"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR, formatDate } from "@/lib/utils/format";
import { Payment } from "@/types";
import { updatePayment, deletePayment } from "@/lib/payments/payment.service";
import { X, Printer, Trash2, Edit3, Check, ReceiptText } from "lucide-react";

interface PaymentDetailsModalProps {
  payment: Payment & { bill_title?: string; bill_category?: string; billing_period?: string };
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function PaymentDetailsModal({
  payment,
  isAdmin,
  onClose,
  onUpdated,
}: PaymentDetailsModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [amount, setAmount] = React.useState(String(payment.amount));
  const [paymentDate, setPaymentDate] = React.useState(payment.payment_date);
  const [paymentMethod, setPaymentMethod] = React.useState(payment.payment_method);
  const [transactionId, setTransactionId] = React.useState(payment.transaction_id || "");
  const [notes, setNotes] = React.useState(payment.notes || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      setLoading(false);
      return;
    }

    const res = await updatePayment(payment.id, {
      amount: numAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      transaction_id: transactionId.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);
    if (res.success) {
      setIsEditing(false);
      onUpdated();
    } else {
      setError(res.error || "Failed to update payment.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this payment of ${formatINR(Number(payment.amount))}?`)) {
      return;
    }

    setLoading(true);
    const res = await deletePayment(payment.id);
    setLoading(false);

    if (res.success) {
      onClose();
      onUpdated();
    } else {
      setError(res.error || "Failed to delete payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <Card className="w-full max-w-md shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-[var(--success)]" />
            <CardTitle className="text-base">{isEditing ? "Edit Payment" : "Payment Receipt"}</CardTitle>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--surface)]">
            <X size={18} />
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <Input
                label="Payment Amount (₹)"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                label="Payment Date"
                type="date"
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
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <Input
                label="Transaction Reference"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <Input
                label="Notes / Description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  <Check size={14} className="mr-1" />
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Receipt Header */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-1">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  Payment Confirmation
                </p>
                <h3 className="text-2xl font-bold text-[var(--success)]">
                  {formatINR(Number(payment.amount))}
                </h3>
                <p className="text-xs text-[var(--foreground)] font-medium">
                  {payment.bill_title} ({payment.billing_period})
                </p>
              </div>

              {/* Receipt Details Grid */}
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg p-3 bg-[var(--surface)]/50 space-y-2">
                <div className="flex justify-between pt-1">
                  <span className="text-[var(--text-muted)]">Payment Date:</span>
                  <span className="font-semibold text-[var(--foreground)]">{formatDate(payment.payment_date)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[var(--text-muted)]">Method:</span>
                  <span className="font-semibold text-[var(--foreground)]">{payment.payment_method}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[var(--text-muted)]">Transaction Ref:</span>
                  <span className="font-mono text-[var(--foreground)]">{payment.transaction_id || "None"}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[var(--text-muted)]">Payment ID:</span>
                  <span className="font-mono text-[10px] text-[var(--text-dim)]">{payment.id}</span>
                </div>
                {payment.notes && (
                  <div className="flex justify-between pt-2">
                    <span className="text-[var(--text-muted)]">Notes:</span>
                    <span className="text-[var(--foreground)]">{payment.notes}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer size={14} className="mr-1" />
                  Print Receipt
                </Button>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 size={14} className="mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
