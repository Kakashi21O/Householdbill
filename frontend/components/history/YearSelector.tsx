"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export function YearSelector({ years, selectedYear, onSelectYear }: YearSelectorProps) {
  const currentIndex = years.indexOf(selectedYear);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < years.length - 1;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-[var(--primary)]" />
        <span className="text-xs font-semibold text-[var(--foreground)]">Billing Year:</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => hasPrev && onSelectYear(years[currentIndex - 1])}
          className="h-8 w-8 p-0"
          title="Previous Year"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="flex items-center gap-1">
          {years.map((y) => (
            <Button
              key={y}
              variant={y === selectedYear ? "primary" : "outline"}
              size="sm"
              onClick={() => onSelectYear(y)}
              className="h-8 px-3 text-xs"
            >
              {y}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => hasNext && onSelectYear(years[currentIndex + 1])}
          className="h-8 w-8 p-0"
          title="Next Year"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
