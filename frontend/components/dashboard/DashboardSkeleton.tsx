import { Card } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-[var(--surface)] rounded-lg w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-28 bg-[var(--surface)]/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-44 bg-[var(--surface)]/60" />
        <Card className="h-44 bg-[var(--surface)]/60" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-56 bg-[var(--surface)]/60" />
        <Card className="h-56 bg-[var(--surface)]/60" />
      </div>
    </div>
  );
}
