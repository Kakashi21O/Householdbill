"use client";

import * as React from "react";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { Button } from "@/components/ui/button";
import { Search, Eye, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface HistoricalBillsTableProps {
  bills: BillWithPayment[];
  onSelectBill: (bill: BillWithPayment) => void;
  onExport: () => void;
}

export function HistoricalBillsTable({ bills, onSelectBill, onExport }: HistoricalBillsTableProps) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [yearFilter, setYearFilter] = React.useState<string>("all");
  const [monthFilter, setMonthFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<"due_date" | "amount">("due_date");
  const [sortAsc, setSortAsc] = React.useState(false);

  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const filtered = bills.filter((b) => {
    const matchesSearch =
      (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesYear = yearFilter === "all" || String(b.billing_year) === yearFilter;
    const matchesMonth = monthFilter === "all" || String(b.billing_month) === monthFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesYear && matchesMonth;
  });

  filtered.sort((a, b) => {
    if (sortField === "amount") {
      return sortAsc ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
    }
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedBills = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availableYears = Array.from(new Set(bills.map((b) => b.billing_year))).sort((a, b) => b - a);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search bills by title, description..."
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
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortField === "due_date") setSortAsc(!sortAsc);
              else { setSortField("due_date"); setSortAsc(false); }
            }}
            className="h-8 text-xs"
          >
            Due Date {sortField === "due_date" ? (sortAsc ? "↑" : "↓") : ""}
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
              <th className="py-2.5 px-3 font-medium">Bill Details</th>
              <th className="py-2.5 px-3 font-medium">Period</th>
              <th className="py-2.5 px-3 font-medium">Due Date</th>
              <th className="py-2.5 px-3 font-medium">Amount</th>
              <th className="py-2.5 px-3 font-medium">Paid</th>
              <th className="py-2.5 px-3 font-medium">Outstanding</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {paginatedBills.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  No historical bills match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedBills.map((b) => (
                <tr key={b.id} className="hover:bg-[var(--card-subtle)] transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[var(--foreground)]">{b.title}</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wide">{b.category}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-dim)]">
                    {String(b.billing_month).padStart(2, "0")}/{b.billing_year}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-dim)]">{formatDate(b.due_date)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[var(--foreground)]">{formatINR(b.amount)}</td>
                  <td className="py-2.5 px-3 font-mono text-[var(--success)]">{formatINR(b.total_paid)}</td>
                  <td className={`py-2.5 px-3 font-mono ${b.outstanding > 0 ? "text-[var(--danger)] font-semibold" : "text-[var(--text-dim)]"}`}>
                    {formatINR(b.outstanding)}
                  </td>
                  <td className="py-2.5 px-3"><PaymentStatusBadge status={b.status} /></td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => onSelectBill(b)} className="h-7 px-2 text-xs gap-1">
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
          <span>Showing page {currentPage} of {totalPages} ({filtered.length} total bills)</span>
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
