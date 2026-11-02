"use client";

import * as React from "react";
import { formatINR, formatDate } from "@/lib/utils/format";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { BillWithPayment } from "@/lib/dashboard/dashboard.types";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";

interface BillsTableProps {
  bills: BillWithPayment[];
  onSelectBill: (bill: BillWithPayment) => void;
}

export function BillsTable({ bills, onSelectBill }: BillsTableProps) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [yearFilter, setYearFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<"due_date" | "amount">("due_date");
  const [sortAsc, setSortAsc] = React.useState(false);

  // Filter
  const filtered = bills.filter((b) => {
    const matchesSearch =
      (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesYear = yearFilter === "all" || String(b.billing_year) === yearFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesYear;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortField === "amount") {
      return sortAsc ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
    }
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const availableYears = Array.from(new Set(bills.map((b) => b.billing_year))).sort((a, b) => b - a);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setYearFilter("all");
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search bills by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--border-focus)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSortField("due_date");
              setSortAsc(!sortAsc);
            }}
            className="px-2 py-1.5 rounded-md bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
            title="Toggle sort date"
          >
            Date {sortField === "due_date" ? (sortAsc ? "↑" : "↓") : ""}
          </button>

          {(search || categoryFilter !== "all" || statusFilter !== "all" || yearFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-2">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] app-card">
        <table className="w-full text-xs text-left">
          <thead className="bg-[var(--surface)] text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Title / Category</th>
              <th className="py-2.5 px-3 font-semibold">Period</th>
              <th className="py-2.5 px-3 font-semibold">Amount</th>
              <th className="py-2.5 px-3 font-semibold">Paid</th>
              <th className="py-2.5 px-3 font-semibold">Outstanding</th>
              <th className="py-2.5 px-3 font-semibold">Due Date</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => onSelectBill(b)}
                  className="hover:bg-[var(--surface)]/70 cursor-pointer transition-colors text-[var(--foreground)]"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-xs">{b.title}</p>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)]">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                    {String(b.billing_month).padStart(2, "0")}/{b.billing_year}
                  </td>
                  <td className="py-2.5 px-3 font-bold">{formatINR(Number(b.amount))}</td>
                  <td className="py-2.5 px-3 text-[var(--success)] font-medium">
                    {formatINR(b.total_paid)}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    <span className={b.outstanding > 0 ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}>
                      {formatINR(b.outstanding)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-dim)]">{formatDate(b.due_date)}</td>
                  <td className="py-2.5 px-3">
                    <PaymentStatusBadge status={b.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBill(b);
                      }}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-subtle)]"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  No bills match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
