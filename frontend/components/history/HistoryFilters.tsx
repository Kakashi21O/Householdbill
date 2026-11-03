"use client";

import { Button } from "@/components/ui/button";
import { Filter, Calendar, RotateCcw } from "lucide-react";

export type DateFilterPreset = "all" | "current_year" | "prev_year" | "last_6_months" | "last_12_months" | "custom";

interface HistoryFiltersProps {
  preset: DateFilterPreset;
  onSelectPreset: (preset: DateFilterPreset) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onReset: () => void;
}

export function HistoryFilters({
  preset,
  onSelectPreset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: HistoryFiltersProps) {
  const presets: { id: DateFilterPreset; label: string }[] = [
    { id: "all", label: "All Records" },
    { id: "current_year", label: "Current Year" },
    { id: "prev_year", label: "Previous Year" },
    { id: "last_6_months", label: "Last 6 Months" },
    { id: "last_12_months", label: "Last 12 Months" },
    { id: "custom", label: "Custom Range" },
  ];

  return (
    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--foreground)] mr-1">
          <Filter size={13} className="text-[var(--primary)]" /> Filter:
        </span>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              preset === p.id
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium shadow-xs"
                : "text-[var(--text-muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar size={13} className="text-[var(--text-muted)]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2 py-1 rounded bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
            />
          </div>
          <span className="text-[var(--text-dim)]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-2 py-1 rounded bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xs"
          />
        </div>
      )}

      {preset !== "all" && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs text-[var(--text-muted)] gap-1 px-2">
          <RotateCcw size={12} /> Reset
        </Button>
      )}
    </div>
  );
}
