"use client";

import * as React from "react";
import { formatINR, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnrichedPayment } from "@/lib/history/history.service";
import { Search, Eye, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface HistoricalPaymentsTableProps {
  payments: EnrichedPayment[];
  onSelectPayment: (payment: EnrichedPayment) => void;
  onExport: () => void;
}

export function HistoricalPaymentsTable({
  payments,
  onSelectPayment,
  onExport,
}: HistoricalPaymentsTableProps) {
  const [search, setSearch] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [yearFilter, setYearFilter] = React.useState("all");
  const [monthFilter, setMonthFilter] = React.useState("all");
  const [sortAsc, setSortAsc] = React.useState(false); // Default newest first
  const [sortField, setSortField] = React.useState<"date" | "amount">("date");

  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.bill_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;
    const matchesCategory = categoryFilter === "all" || p.bill_category === categoryFilter;

    let matchesYear = true;
    let matchesMonth = true;
    if (yearFilter !== "all") {
      matchesYear = p.payment_date.startsWith(yearFilter) || p.billing_year === Number(yearFilter);
    }
    if (monthFilter !== "all") {
      const mStr = String(monthFilter).padStart(2, "0");
      matchesMonth = p.payment_date.includes(`-${mStr}-`) || p.billing_month === Number(monthFilter);
    }

    return matchesSearch && matchesMethod && matchesCategory && matchesYear && matchesMonth;
  });

  filtered.sort((a, b) => {
    if (sortField === "amount") {
      return sortAsc ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
    }
    const dateA = new Date(a.payment_date).getTime();
    const dateB = new Date(b.payment_date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedPayments = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availableYears = Array.from(
    new Set(payments.map((p) => (p.payment_date ? new Date(p.payment_date).getFullYear() : p.billing_year)).filter(Boolean))
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search payments by bill, reference, or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Month {i + 1}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="NetBanking">NetBanking</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortField === "date") setSortAsc(!sortAsc);
              else { setSortField("date"); setSortAsc(false); }
            }}
            className="h-8 text-xs"
          >
            Date {sortField === "date" ? (sortAsc ? "↑ Oldest" : "↓ Newest") : ""}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortField === "amount") setSortAsc(!sortAsc);
              else { setSortField("amount"); setSortAsc(false); }
            }}
            className="h-8 text-xs"
          >
            Amount {sortField === "amount" ? (sortAsc ? "↑" : "↓") : ""}
          </Button>

          <Button size="sm" variant="outline" onClick={onExport} className="h-8 gap-1 text-xs">
            <Download size={13} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--card-subtle)] text-[var(--text-muted)]">
              <th className="py-2.5 px-3 font-medium">Payment ID</th>
              <th className="py-2.5 px-3 font-medium">Associated Bill</th>
              <th className="py-2.5 px-3 font-medium">Date</th>
              <th className="py-2.5 px-3 font-medium">Method</th>
              <th className="py-2.5 px-3 font-medium">Reference</th>
              <th className="py-2.5 px-3 font-medium">Amount</th>
              <th className="py-2.5 px-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                  No historical payments match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--card-subtle)] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">{p.id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[var(--foreground)]">{p.bill_title}</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wide">
                      {p.bill_category} • {p.billing_month && p.billing_year ? `${String(p.billing_month).padStart(2, "0")}/${p.billing_year}` : "-"}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-dim)]">{formatDate(p.payment_date)}</td>
                  <td className="py-2.5 px-3"><Badge variant="default" className="text-[10px] py-0">{p.payment_method}</Badge></td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">{p.transaction_id || "-"}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[var(--success)]">{formatINR(p.amount)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => onSelectPayment(p)} className="h-7 px-2 text-xs gap-1">
                      <Eye size={12} /> View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
          <span>Showing page {currentPage} of {totalPages} ({filtered.length} total payments)</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
