"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CategoryOverviewCard } from "@/components/dashboard/CategoryOverviewCard";
import { MonthlyFinancialChart } from "@/components/dashboard/MonthlyFinancialChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { fetchDashboardData } from "@/lib/dashboard/dashboard.service";
import { DashboardData } from "@/lib/dashboard/dashboard.types";
import { Home, Zap, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const monthName = React.useSyncExternalStore(
    () => () => {},
    () => new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
    () => ""
  );

  React.useEffect(() => {
    let mounted = true;
    fetchDashboardData()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load dashboard data. Please verify database connection.");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const householdName = data?.household?.household_name || "My Household";

  return (
    <AppShell>
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--danger)]/30 text-center space-y-2">
          <AlertTriangle className="mx-auto text-[var(--danger)]" size={32} />
          <p className="text-sm font-semibold text-[var(--foreground)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:brightness-110"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Here&apos;s the financial overview for <span className="font-semibold text-[var(--foreground)]">{householdName}</span> for {monthName}.
            </p>
          </div>

          {/* 4 Financial Summary Cards */}
          <SummaryCards
            totalMonthlyBills={data?.totalMonthlyBills || 0}
            totalPaid={data?.totalPaid || 0}
            totalOutstanding={data?.totalOutstanding || 0}
            upcomingDueTotal={data?.upcomingDueTotal || 0}
            nearestDueDate={data?.nearestDueDate || null}
          />

          {/* Rent & Electricity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryOverviewCard
              title="House Rent"
              icon={Home}
              bill={data?.currentRentBill || null}
              emptyLabel={`No rent bill generated for ${monthName}.`}
            />
            <CategoryOverviewCard
              title="Electricity Bill"
              icon={Zap}
              bill={data?.currentElectricityBill || null}
              emptyLabel={`No electricity bill added for ${monthName}.`}
            />
          </div>

          {/* 6-Month Chart & Upcoming Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonthlyFinancialChart data={data?.monthlyChartData || []} />
            <UpcomingPayments bills={data?.upcomingBills || []} />
          </div>

          {/* Recent Payment Activity */}
          <RecentPayments payments={data?.recentPayments || []} />
        </div>
      )}
    </AppShell>
  );
}
