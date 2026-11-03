"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HistorySummary } from "@/components/history/HistorySummary";
import { YearSelector } from "@/components/history/YearSelector";
import { MonthlyHistory } from "@/components/history/MonthlyHistory";
import { MonthlyDetailsModal } from "@/components/history/MonthlyDetailsModal";
import { HistoryCharts } from "@/components/history/HistoryCharts";
import { HistoryFilters, DateFilterPreset } from "@/components/history/HistoryFilters";
import { HistoricalBillsTable } from "@/components/history/HistoricalBillsTable";
import { HistoricalPaymentsTable } from "@/components/history/HistoricalPaymentsTable";
import { BillDetailsModal } from "@/components/billing/BillDetailsModal";
import { PaymentDetailsModal } from "@/components/payments/PaymentDetailsModal";
import { fetchHistoryData, HistoryData, EnrichedPayment } from "@/lib/history/history.service";
import { calculateYearStats, YearStats } from "@/lib/history/history.calculations";
import { exportBillsCsv, exportPaymentsCsv } from "@/lib/history/history.export";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { Button } from "@/components/ui/button";
import { History, Receipt, CreditCard, Download, RefreshCw } from "lucide-react";

export default function HistoryPage() {
  const [data, setData] = React.useState<HistoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = React.useState<"overview" | "bills" | "payments">("overview");

  // Date filter state
  const [datePreset, setDatePreset] = React.useState<DateFilterPreset>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  // Modals
  const [selectedBill, setSelectedBill] = React.useState<BillWithPayment | null>(null);
  const [selectedPayment, setSelectedPayment] = React.useState<EnrichedPayment | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const res = await fetchHistoryData();
      setData(res);
      if (res.availableYears.length > 0 && !res.availableYears.includes(selectedYear)) {
        setSelectedYear(res.availableYears[res.availableYears.length - 1]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  React.useEffect(() => {
    let mounted = true;
    fetchHistoryData()
      .then((res) => {
        if (mounted) {
          setData(res);
          if (res.availableYears.length > 0 && !res.availableYears.includes(selectedYear)) {
            setSelectedYear(res.availableYears[res.availableYears.length - 1]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedYear]);

  if (loading || !data) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-xs text-[var(--text-muted)]">
          <RefreshCw size={24} className="animate-spin text-[var(--primary)]" />
          <span>Loading historical records...</span>
        </div>
      </AppShell>
    );
  }

  // Filter bills & payments according to date filter preset
  const now = new Date();
  const currentYear = now.getFullYear();

  const filterByDateRange = <T extends { billing_year?: number; payment_date?: string; due_date?: string }>(
    items: T[],
    getDate: (i: T) => string
  ) => {
    if (datePreset === "all") return items;
    if (datePreset === "current_year") {
      return items.filter((i) => i.billing_year === currentYear || (i.payment_date && i.payment_date.startsWith(String(currentYear))));
    }
    if (datePreset === "prev_year") {
      return items.filter((i) => i.billing_year === currentYear - 1 || (i.payment_date && i.payment_date.startsWith(String(currentYear - 1))));
    }
    if (datePreset === "last_6_months" || datePreset === "last_12_months") {
      const monthsBack = datePreset === "last_6_months" ? 6 : 12;
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - monthsBack);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      return items.filter((i) => {
        const d = getDate(i);
        return d >= cutoffStr;
      });
    }
    if (datePreset === "custom") {
      return items.filter((i) => {
        const d = getDate(i);
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    return items;
  };

  const filteredBills = filterByDateRange(data.bills, (b) => b.due_date || `${b.billing_year}-${String(b.billing_month).padStart(2, "0")}-01`);
  const filteredPayments = filterByDateRange(data.payments, (p) => p.payment_date || `${p.billing_year || currentYear}-01-01`);

  // Overall Historical totals
  const totalBills = data.bills.length;
  const totalPayments = data.payments.length;
  const totalBilled = data.bills.reduce((s, b) => s + Number(b.amount), 0);
  const totalCollected = data.payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalOutstanding = data.bills.reduce((s, b) => s + b.outstanding, 0);

  // Year Stats
  const years = data.availableYears.length > 0 ? data.availableYears : [currentYear];
  const activeYear = years.includes(selectedYear) ? selectedYear : years[years.length - 1];
  const yearStats = calculateYearStats(activeYear, data.bills, data.payments);
  const prevYear = years.includes(activeYear - 1) ? activeYear - 1 : undefined;
  const prevYearStats: YearStats | undefined = prevYear ? calculateYearStats(prevYear, data.bills, data.payments) : undefined;

  const totalCompletedMonthsAllTime = years.reduce(
    (acc, y) => acc + calculateYearStats(y, data.bills, data.payments).completedMonthsCount,
    0
  );

  const selectedMonthData = selectedMonth ? yearStats.months.find((m) => m.month === selectedMonth) : null;

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shadow-xs">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Historical Records</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Audit, review, and export multi-year billing and payment archives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportBillsCsv(filteredBills, "all")}
              className="h-8 gap-1.5 text-xs"
            >
              <Download size={13} /> Export All Bills
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportPaymentsCsv(filteredPayments, "all")}
              className="h-8 gap-1.5 text-xs"
            >
              <Download size={13} /> Export All Payments
            </Button>
          </div>
        </div>

        {/* Historical Summary Cards */}
        <HistorySummary
          totalBills={totalBills}
          totalPayments={totalPayments}
          totalBilled={totalBilled}
          totalCollected={totalCollected}
          totalOutstanding={totalOutstanding}
          completedMonths={totalCompletedMonthsAllTime}
        />

        {/* Global Date Filter Bar */}
        <HistoryFilters
          preset={datePreset}
          onSelectPreset={setDatePreset}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={() => {
            setDatePreset("all");
            setStartDate("");
            setEndDate("");
          }}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                : "text-[var(--text-muted)] hover:bg-[var(--card-subtle)]"
            }`}
          >
            <History size={14} /> Yearly Overview & Trends
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "bills"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                : "text-[var(--text-muted)] hover:bg-[var(--card-subtle)]"
            }`}
          >
            <Receipt size={14} /> Historical Bills ({filteredBills.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "payments"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                : "text-[var(--text-muted)] hover:bg-[var(--card-subtle)]"
            }`}
          >
            <CreditCard size={14} /> Historical Payments ({filteredPayments.length})
          </button>
        </div>

        {/* Tab 1: Yearly Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <YearSelector
              years={years}
              selectedYear={activeYear}
              onSelectYear={(y) => {
                setSelectedYear(y);
                setSelectedMonth(null);
              }}
            />

            <HistoryCharts currentStats={yearStats} prevStats={prevYearStats} />

            <MonthlyHistory
              stats={yearStats}
              selectedMonth={selectedMonth}
              onSelectMonth={(m) => setSelectedMonth(m)}
            />
          </div>
        )}

        {/* Tab 2: Historical Bills */}
        {activeTab === "bills" && (
          <HistoricalBillsTable
            bills={filteredBills}
            onSelectBill={(b) => setSelectedBill(b)}
            onExport={() => exportBillsCsv(filteredBills, `filtered_${datePreset}`)}
          />
        )}

        {/* Tab 3: Historical Payments */}
        {activeTab === "payments" && (
          <HistoricalPaymentsTable
            payments={filteredPayments}
            onSelectPayment={(p) => setSelectedPayment(p)}
            onExport={() => exportPaymentsCsv(filteredPayments, `filtered_${datePreset}`)}
          />
        )}

        {/* Month Detail Modal */}
        {selectedMonthData && (
          <MonthlyDetailsModal
            monthData={selectedMonthData}
            year={activeYear}
            onClose={() => setSelectedMonth(null)}
            onSelectBill={(b) => setSelectedBill(b)}
            onSelectPayment={(p) => setSelectedPayment(p)}
            onExportMonth={() => {
              exportBillsCsv(selectedMonthData.bills, `${activeYear}_M${selectedMonthData.month}`);
              exportPaymentsCsv(selectedMonthData.payments, `${activeYear}_M${selectedMonthData.month}`);
            }}
          />
        )}

        {/* Bill Details Modal Reused */}
        {selectedBill && (
          <BillDetailsModal
            bill={selectedBill}
            payments={data.payments}
            isAdmin={true}
            onClose={() => setSelectedBill(null)}
            onUpdated={() => {
              setSelectedBill(null);
              loadData();
            }}
          />
        )}

        {/* Payment Details Modal Reused */}
        {selectedPayment && (
          <PaymentDetailsModal
            payment={selectedPayment}
            isAdmin={true}
            onClose={() => setSelectedPayment(null)}
            onUpdated={() => {
              setSelectedPayment(null);
              loadData();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
