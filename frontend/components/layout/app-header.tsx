"use client";

import { Menu, LogIn, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface AppHeaderProps {
  onMenuClick: () => void;
  userRole?: "admin" | "visitor" | null;
  userEmail?: string | null;
  onLogout?: () => void;
}

export function AppHeader({ onMenuClick, userRole = "visitor", userEmail, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-transparent backdrop-blur-[99px] md:border-b-0 border-b border-[var(--border)] px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--card-subtle)] md:hidden focus:outline-none"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">System Overview</h2>
          <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">Foundation & Authentication</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {userEmail ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]">
              <User size={14} className="text-[var(--text-muted)]" />
              <span className="font-mono text-[11px] hidden sm:inline">{userEmail}</span>
            </div>
            <Badge variant={userRole === "admin" ? "paid" : "info"}>
              {userRole || "visitor"}
            </Badge>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--card-subtle)]"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card-subtle)]"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
