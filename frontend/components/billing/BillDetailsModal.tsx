"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { Payment } from "@/types";
import { updateBill, deleteBill } from "@/lib/billing/billing.service";
import { X, Trash2, Edit3, Check, FileText } from "lucide-react";

interface BillDetailsModalProps {
  bill: BillWithPayment;
  payments: Payment[];
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function BillDetailsModal({
  bill,
  payments,
  isAdmin,
  onClose,
  onUpdated,
}: BillDetailsModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(bill.title || "");
  const [amount, setAmount] = React.useState(String(bill.amount));
  const [dueDate, setDueDate] = React.useState(bill.due_date);
  const [description, setDescription] = React.useState(bill.description || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const associatedPayments = payments.filter((p) => p.bill_id === bill.id);
  const hasPayments = associatedPayments.length > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < bill.total_paid) {
      setError(`Amount cannot be less than total already paid (${formatINR(bill.total_paid)}).`);
      setLoading(false);
      return;
    }

    const res = await updateBill(bill.id, {
      title,
      amount: numAmount,
      due_date: dueDate,
      description,
    });

    setLoading(false);
    if (res.success) {
      setIsEditing(false);
      onUpdated();
    } else {
      setError(res.error || "Failed to update bill.");
    }
  };

  const handleDelete = async () => {
    if (hasPayments) {
      alert("Cannot delete a bill that already has payment history.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${bill.title || bill.category}"?`)) {
      return;
    }

    setLoading(true);
    const res = await deleteBill(bill.id, hasPayments);
    setLoading(false);

    if (res.success) {
      onClose();
      onUpdated();
    } else {
      setError(res.error || "Failed to delete bill.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <Card className="w-full max-w-lg shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--primary)]" />
            <CardTitle className="text-base">{isEditing ? "Edit Bill Details" : "Bill Details"}</CardTitle>
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
            <form onSubmit={handleSave} className="space-y-3">
              <Input
                label="Bill Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="Bill Amount (₹)"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={bill.category === "rent"}
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <Input
                label="Notes / Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  <Check size={14} className="mr-1" />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">{bill.title}</h4>
                  <p className="text-[var(--text-muted)] font-mono text-[11px] mt-0.5">ID: {bill.id}</p>
                </div>
                <PaymentStatusBadge status={bill.status} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Total Billed</span>
                  <span className="font-bold text-sm text-[var(--foreground)]">{formatINR(Number(bill.amount))}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Paid Amount</span>
                  <span className="font-bold text-sm text-[var(--success)]">{formatINR(bill.total_paid)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Remaining Balance</span>
                  <span className={`font-bold text-sm ${bill.outstanding > 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
                    {formatINR(bill.outstanding)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Due Date</span>
                  <span className="font-bold text-sm text-[var(--foreground)]">{formatDate(bill.due_date)}</span>
                </div>
              </div>

              {bill.description && (
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px] mb-1">Description / Notes</span>
                  <p className="text-[var(--foreground)]">{bill.description}</p>
                </div>
              )}

              {/* Payment Summary */}
              <div>
                <h5 className="font-semibold text-xs text-[var(--foreground)] mb-2">
                  Payment History ({associatedPayments.length})
                </h5>
                {associatedPayments.length > 0 ? (
                  <div className="space-y-1.5">
                    {associatedPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-[var(--success)] block">{formatINR(Number(p.amount))}</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{formatDate(p.payment_date)} • {p.payment_method}</span>
                        </div>
                        {p.notes && <span className="text-[10px] text-[var(--text-muted)]">{p.notes}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-[var(--text-dim)] rounded-lg border border-dashed border-[var(--border)]">
                    No payment records associated with this bill.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isAdmin && (
                <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading || hasPayments}
                    title={hasPayments ? "Cannot delete bill with existing payments" : "Delete bill"}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete Bill
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 size={14} className="mr-1" />
                    Edit Bill
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
