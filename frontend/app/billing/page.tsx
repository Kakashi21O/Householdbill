"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BillingSummary } from "@/components/billing/BillingSummary";
import { BillingOverviewCharts } from "@/components/billing/BillingOverviewCharts";
import { BillsTable } from "@/components/billing/BillsTable";
import { BillForm } from "@/components/billing/BillForm";
import { BillDetailsModal } from "@/components/billing/BillDetailsModal";
import { fetchBillingData, BillingSummaryData } from "@/lib/billing/billing.service";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BillingPage() {
  const [data, setData] = React.useState<BillingSummaryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<BillWithPayment | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const res = await fetchBillingData();
      setData(res);
      setLoading(false);
    } catch {
      setError("Failed to load billing records. Please verify database connection.");
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    fetchBillingData()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load billing records. Please verify database connection.");
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

  const defaultRent = data?.household?.monthly_rent || 10500;
  const householdId = data?.household?.id || "demo-household-sunrise";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Billing Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Household rent (₹10,500/mo) and electricity billing ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              title="Refresh bills"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
            {isAdmin && !showAddForm && (
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus size={15} className="mr-1" />
                Add Monthly Bill
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
              <BillingSummary
                totalBillsThisMonth={data.totalBillsThisMonth}
                totalBilledThisMonth={data.totalBilledThisMonth}
                totalPaidThisMonth={data.totalPaidThisMonth}
                outstandingThisMonth={data.outstandingThisMonth}
                totalOverdueBills={data.totalOverdueBills}
                totalUpcomingBills={data.totalUpcomingBills}
              />

              {/* Add Bill Form Modal/Inline */}
              {showAddForm && (
                <BillForm
                  householdId={householdId}
                  defaultRent={defaultRent}
                  onSuccess={() => {
                    setShowAddForm(false);
                    loadData();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {/* Charts & Analytics */}
              <BillingOverviewCharts bills={data.bills} />

              {/* Bills Table with Search/Filters */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[var(--foreground)]">All Billing Records</h3>
                <BillsTable bills={data.bills} onSelectBill={(b) => setSelectedBill(b)} />
              </div>

              {/* Bill Details Modal */}
              {selectedBill && (
                <BillDetailsModal
                  bill={selectedBill}
                  payments={data.payments}
                  isAdmin={isAdmin}
                  onClose={() => setSelectedBill(null)}
                  onUpdated={() => {
                    setSelectedBill(null);
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
