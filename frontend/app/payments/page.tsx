"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PaymentSummary } from "@/components/payments/PaymentSummary";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentHistoryTable } from "@/components/payments/PaymentHistoryTable";
import { PaymentDetailsModal } from "@/components/payments/PaymentDetailsModal";
import { fetchPaymentData, PaymentSummaryData } from "@/lib/payments/payment.service";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PaymentsPage() {
  const [data, setData] = React.useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<
    (Payment & { bill_title?: string; bill_category?: string; billing_period?: string }) | null
  >(null);
  const [isAdmin, setIsAdmin] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const res = await fetchPaymentData();
      setData(res);
      setLoading(false);
    } catch {
      setError("Failed to load payment records.");
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    fetchPaymentData()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load payment records.");
          setLoading(false);
        }
      });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && mounted) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role && mounted) {
              setIsAdmin(profile.role === "admin");
            }
          });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Payment Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Record payments, track settlement history, and inspect receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              title="Refresh payments"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
            {isAdmin && !showAddForm && (
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus size={15} className="mr-1" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && !data ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-[var(--surface)]" />
              ))}
            </div>
            <div className="h-64 rounded-lg bg-[var(--surface)]" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--danger)]/30 text-center space-y-2">
            <AlertTriangle className="mx-auto text-[var(--danger)]" size={32} />
            <p className="text-sm font-semibold text-[var(--foreground)]">{error}</p>
            <Button size="sm" onClick={loadData}>
              Retry
            </Button>
          </div>
        ) : (
          data && (
            <>
              {/* Summary Cards */}
              <PaymentSummary
                totalPaymentsThisMonth={data.totalPaymentsThisMonth}
                totalCollectedThisMonth={data.totalCollectedThisMonth}
                fullyPaidBillsCount={data.fullyPaidBillsCount}
                partiallyPaidBillsCount={data.partiallyPaidBillsCount}
                unpaidBillsCount={data.unpaidBillsCount}
                totalOutstandingBalance={data.totalOutstandingBalance}
              />

              {/* Record Payment Form */}
              {showAddForm && (
                <PaymentForm
                  bills={data.bills}
                  onSuccess={() => {
                    setShowAddForm(false);
                    loadData();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {/* Payment History Table */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[var(--foreground)]">Payment Transaction Ledger</h3>
                <PaymentHistoryTable
                  payments={data.payments}
                  onSelectPayment={(p) => setSelectedPayment(p)}
                />
              </div>

              {/* Payment Receipt / Details Modal */}
              {selectedPayment && (
                <PaymentDetailsModal
                  payment={selectedPayment}
                  isAdmin={isAdmin}
                  onClose={() => setSelectedPayment(null)}
                  onUpdated={() => {
                    setSelectedPayment(null);
                    loadData();
                  }}
                />
              )}
            </>
          )
        )}
      </div>
    </AppShell>
  );
}
