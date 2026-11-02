import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  description: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "danger";
  progress?: number;
}

export function SummaryCard({
  title,
  amount,
  description,
  icon: Icon,
  variant = "primary",
  progress,
}: SummaryCardProps) {
  const iconColors = {
    primary: "text-[var(--primary)] border-[var(--primary)]/20",
    success: "text-[var(--success)] border-[var(--success)]/20",
    warning: "text-[var(--warning)] border-[var(--warning)]/20",
    danger: "text-[var(--danger)] border-[var(--danger)]/20",
  };

  return (
    <Card className="hover:border-[var(--border-focus)] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
        <div className={`p-2 rounded-lg bg-[var(--surface)] border ${iconColors[variant]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {formatINR(amount)}
        </h3>
        <p className="text-xs text-[var(--text-dim)] mt-1">{description}</p>
      </div>
      {typeof progress === "number" && (
        <div className="mt-3 w-full bg-[var(--surface)] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[var(--success)] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Card>
  );
}
