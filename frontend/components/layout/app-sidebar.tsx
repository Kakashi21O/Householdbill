"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Payments", href: "#payments", icon: CreditCard, badge: "Part 4" },
  { label: "History", href: "#history", icon: History, badge: "Part 5" },
  { label: "Reports", href: "#reports", icon: BarChart3, badge: "Part 6" },
  { label: "Settings", href: "#settings", icon: Settings, badge: "Part 7" },
];

export function AppSidebar({ onClose, isMobile }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] transition-all",
        isMobile ? "w-64 p-4" : "w-64 p-5 hidden md:flex"
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[var(--foreground)]">Household Bill</h1>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Part 1 • Foundation</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--card-subtle)]">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-subtle)]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-subtle)] text-[var(--text-dim)] border border-[var(--border)]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[var(--border)] text-[11px] text-[var(--text-dim)]">
        <p className="font-mono">v0.1.0 • Supabase RLS</p>
      </div>
    </aside>
  );
}
