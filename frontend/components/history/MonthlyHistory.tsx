"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/format";
import { YearStats, MonthlyBreakdown } from "@/lib/history/history.calculations";
import { AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react";

interface MonthlyHistoryProps {
  stats: YearStats;
  selectedMonth: number | null;
  onSelectMonth: (month: number) => void;
}

export function MonthlyHistory({ stats, selectedMonth, onSelectMonth }: MonthlyHistoryProps) {
  const getStatusBadge = (m: MonthlyBreakdown) => {
    if (!m.hasRecords) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-subtle)] text-[var(--text-dim)] border border-dashed border-[var(--border)]">
          <AlertTriangle size={10} /> Missing
        </span>
      );
    }
    if (m.status === "paid") {
      return (
        <Badge variant="paid" className="text-[10px] gap-1 py-0">
          <CheckCircle size={10} /> Paid
        </Badge>
      );
    }
    if (m.status === "partial") {
      return (
        <Badge variant="partial" className="text-[10px] gap-1 py-0">
          <Clock size={10} /> Partial
        </Badge>
      );
    }
    return (
      <Badge variant="unpaid" className="text-[10px] gap-1 py-0">
        <Clock size={10} /> Unpaid
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{stats.year} Monthly Records</CardTitle>
        <span className="text-[11px] text-[var(--text-muted)]">Click any month to inspect details</span>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--card-subtle)] text-[var(--text-muted)]">
              <th className="py-2.5 px-3 font-medium">Month</th>
              <th className="py-2.5 px-3 font-medium">Rent</th>
              <th className="py-2.5 px-3 font-medium">Electricity</th>
              <th className="py-2.5 px-3 font-medium">Total Billed</th>
              <th className="py-2.5 px-3 font-medium">Payments</th>
              <th className="py-2.5 px-3 font-medium">Balance</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {stats.months.map((m) => {
              const isSelected = selectedMonth === m.month;
              return (
                <tr
                  key={m.month}
                  onClick={() => onSelectMonth(m.month)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-[var(--primary)]/10 font-medium" : "hover:bg-[var(--card-subtle)]"
                  } ${!m.hasRecords ? "opacity-60 bg-[var(--surface)]/50" : ""}`}
                >
                  <td className="py-2 px-3 font-semibold text-[var(--foreground)]">
                    {m.monthName} {stats.year}
                  </td>
                  <td className="py-2 px-3 font-mono">{m.hasRecords ? formatINR(m.rentBilled) : "-"}</td>
                  <td className="py-2 px-3 font-mono">{m.hasRecords ? formatINR(m.electricityBilled) : "-"}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-[var(--foreground)]">
                    {m.hasRecords ? formatINR(m.totalBilled) : "-"}
                  </td>
                  <td className="py-2 px-3 font-mono text-[var(--success)]">{m.hasRecords ? formatINR(m.totalPaid) : "-"}</td>
                  <td
                    className={`py-2 px-3 font-mono ${
                      m.outstanding > 0 ? "text-[var(--danger)] font-medium" : "text-[var(--text-dim)]"
                    }`}
                  >
                    {m.hasRecords ? formatINR(m.outstanding) : "-"}
                  </td>
                  <td className="py-2 px-3">{getStatusBadge(m)}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMonth(m.month);
                      }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
