"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { YearStats } from "@/lib/history/history.calculations";
import { TrendingUp, BarChart3, PieChart, ArrowUpRight, Zap } from "lucide-react";

interface HistoryChartsProps {
  currentStats: YearStats;
  prevStats?: YearStats;
}

export function HistoryCharts({ currentStats, prevStats }: HistoryChartsProps) {
  // Monthly spending trend
  const maxVal = Math.max(
    ...currentStats.months.flatMap((m) => [m.totalBilled, m.totalPaid]),
    1
  );

  // Category totals
  const totalCategoryBilled = currentStats.rentTotal + currentStats.elecTotal || 1;
  const rentPercent = Math.round((currentStats.rentTotal / totalCategoryBilled) * 100);
  const elecPercent = 100 - rentPercent;

  // Paid vs Outstanding
  const totalSettlement = currentStats.totalPaid + currentStats.totalOutstanding || 1;
  const paidPercent = Math.round((currentStats.totalPaid / totalSettlement) * 100);
  const outstandingPercent = 100 - paidPercent;

  return (
    <div className="space-y-4">
      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[var(--primary)]" />
              <CardTitle className="text-base">{currentStats.year} Monthly Trend</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--primary)] inline-block" /> Billed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--success)] inline-block" /> Paid
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="pt-2 flex items-end justify-between gap-1.5 h-40 border-b border-[var(--border)] pb-2">
              {currentStats.months.map((m) => {
                const billedH = Math.round((m.totalBilled / maxVal) * 100);
                const paidH = Math.round((m.totalPaid / maxVal) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-28">
                      <div
                        title={`${m.monthName} Billed: ${formatINR(m.totalBilled)}`}
                        style={{ height: `${billedH}%` }}
                        className="w-1/2 max-w-[12px] bg-[var(--primary)]/80 hover:bg-[var(--primary)] rounded-t transition-all min-h-[2px]"
                      />
                      <div
                        title={`${m.monthName} Paid: ${formatINR(m.totalPaid)}`}
                        style={{ height: `${paidH}%` }}
                        className="w-1/2 max-w-[12px] bg-[var(--success)]/80 hover:bg-[var(--success)] rounded-t transition-all min-h-[2px]"
                      />
                    </div>
                    <span className="text-[10px] text-[var(--text-dim)] font-medium">{m.monthName}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expenses & Settlements Breakdown */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieChart size={16} className="text-[var(--primary)]" />
                <CardTitle className="text-xs font-semibold">Rent vs Electricity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs">
              <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden flex">
                <div style={{ width: `${rentPercent}%` }} className="bg-[var(--primary)] h-full" />
                <div style={{ width: `${elecPercent}%` }} className="bg-[var(--secondary)] h-full" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Rent ({rentPercent}%): <strong className="text-[var(--foreground)]">{formatINR(currentStats.rentTotal)}</strong></span>
                <span className="text-[var(--text-muted)]">Elec ({elecPercent}%): <strong className="text-[var(--foreground)]">{formatINR(currentStats.elecTotal)}</strong></span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--success)]" />
                <CardTitle className="text-xs font-semibold">Paid vs Outstanding</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs">
              <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden flex">
                <div style={{ width: `${paidPercent}%` }} className="bg-[var(--success)] h-full" />
                <div style={{ width: `${outstandingPercent}%` }} className="bg-[var(--danger)] h-full" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Paid ({paidPercent}%): <strong className="text-[var(--foreground)]">{formatINR(currentStats.totalPaid)}</strong></span>
                <span className="text-[var(--text-muted)]">Due ({outstandingPercent}%): <strong className="text-[var(--danger)]">{formatINR(currentStats.totalOutstanding)}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparisons & Electricity Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-[10px] mb-1">
            <span>Monthly Avg Electricity</span>
            <Zap size={13} className="text-[var(--secondary)]" />
          </div>
          <div className="font-bold font-mono text-sm text-[var(--foreground)]">
            {formatINR(currentStats.monthlyAverageElec)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-[var(--text-muted)] text-[10px] mb-1">Highest Electricity Bill</div>
          <div className="font-bold font-mono text-sm text-[var(--foreground)]">
            {formatINR(currentStats.highestElecBill)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-[var(--text-muted)] text-[10px] mb-1">Lowest Electricity Bill</div>
          <div className="font-bold font-mono text-sm text-[var(--foreground)]">
            {formatINR(currentStats.lowestElecBill)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-[10px] mb-1">
            <span>Year-over-Year comparison</span>
            <ArrowUpRight size={13} className="text-[var(--primary)]" />
          </div>
          <div className="font-semibold text-xs text-[var(--foreground)]">
            {prevStats ? (
              <span>
                vs {prevStats.year}: {currentStats.totalBilled >= prevStats.totalBilled ? "+" : ""}
                {formatINR(currentStats.totalBilled - prevStats.totalBilled)}
              </span>
            ) : (
              <span className="text-[var(--text-dim)]">No prior year baseline</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
