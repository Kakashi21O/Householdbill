"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { Receipt, CreditCard, Banknote, CheckCircle2, AlertCircle, CalendarCheck } from "lucide-react";

interface HistorySummaryProps {
  totalBills: number;
  totalPayments: number;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  completedMonths: number;
}

export function HistorySummary({
  totalBills,
  totalPayments,
  totalBilled,
  totalCollected,
  totalOutstanding,
  completedMonths,
}: HistorySummaryProps) {
  const cards = [
    { label: "Total Historical Bills", value: totalBills, icon: Receipt, color: "text-[var(--primary)]" },
    { label: "Total Historical Payments", value: totalPayments, icon: CreditCard, color: "text-[var(--secondary)]" },
    { label: "Total Amount Billed", value: formatINR(totalBilled), icon: Banknote, color: "text-[var(--primary)]" },
    { label: "Total Amount Collected", value: formatINR(totalCollected), icon: CheckCircle2, color: "text-[var(--success)]" },
    { label: "Total Outstanding", value: formatINR(totalOutstanding), icon: AlertCircle, color: totalOutstanding > 0 ? "text-[var(--danger)]" : "text-[var(--success)]" },
    { label: "Completed Billing Months", value: `${completedMonths} Months`, icon: CalendarCheck, color: "text-[var(--secondary)]" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="p-3">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--text-muted)] line-clamp-1">{c.label}</span>
                <Icon size={14} className={c.color} />
              </div>
              <div className="text-base font-bold text-[var(--foreground)] truncate">{c.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
