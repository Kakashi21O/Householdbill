"use client";

import * as React from "react";
import { formatINR, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Payment } from "@/types";
import { Search, Eye } from "lucide-react";

interface PaymentHistoryTableProps {
  payments: (Payment & { bill_title?: string; bill_category?: string; billing_period?: string })[];
  onSelectPayment: (payment: Payment & { bill_title?: string; bill_category?: string; billing_period?: string }) => void;
}

export function PaymentHistoryTable({ payments, onSelectPayment }: PaymentHistoryTableProps) {
  const [search, setSearch] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [sortAsc, setSortAsc] = React.useState(false);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.bill_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;
    const matchesCategory = categoryFilter === "all" || p.bill_category === categoryFilter;
    return matchesSearch && matchesMethod && matchesCategory;
  });

  filtered.sort((a, b) => {
    const dateA = new Date(a.payment_date).getTime();
    const dateB = new Date(b.payment_date).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const clearFilters = () => {
    setSearch("");
    setMethodFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search payments by bill, reference, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--border-focus)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
            title="Toggle sort date"
          >
            Date {sortAsc ? "↑" : "↓"}
          </button>

          {(search || methodFilter !== "all" || categoryFilter !== "all") && (
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
              <th className="py-2.5 px-3 font-semibold">Bill / Period</th>
              <th className="py-2.5 px-3 font-semibold">Payment Date</th>
              <th className="py-2.5 px-3 font-semibold">Method</th>
              <th className="py-2.5 px-3 font-semibold">Reference</th>
              <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
              <th className="py-2.5 px-3 text-right font-semibold">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectPayment(p)}
                  className="hover:bg-[var(--surface)]/70 cursor-pointer transition-colors text-[var(--foreground)]"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-xs">{p.bill_title}</p>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)]">
                      {p.bill_category} • {p.billing_period}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-dim)]">{formatDate(p.payment_date)}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="default" className="text-[10px] uppercase font-mono">
                      {p.payment_method}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                    {p.transaction_id || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[var(--success)]">
                    {formatINR(Number(p.amount))}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPayment(p);
                      }}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-subtle)]"
                      title="View Receipt"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  No payment records match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
