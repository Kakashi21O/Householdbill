"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Palette, Layers, Terminal } from "lucide-react";

export default function Home() {
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              System Foundation
            </h1>
            <Badge variant="info">Part 1 Only</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Core technical foundation, dual-identity design tokens, Supabase database schema, and authentication shell.
          </p>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)]">
                <Database size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Database Connection</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {isSupabaseConfigured ? "Connected" : "Awaiting Credentials"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] text-[var(--secondary)] border border-[var(--border)]">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Security & RLS</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="paid">Active</Badge>
                  <span className="text-xs text-[var(--text-muted)]">Admin vs Visitor</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)]">
                <Palette size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium">Dual Design Themes</p>
                <p className="text-xs font-semibold text-[var(--foreground)] mt-1">
                  Portfolio Dark &bull; SIH-2026 Light
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Architectural Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[var(--primary)]" />
                <CardTitle>Architecture Status</CardTitle>
              </div>
              <CardDescription>
                Established components and services ready for upcoming phases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                <li className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span>Next.js App Router & TypeScript Strict</span>
                  <Badge variant="paid">Configured</Badge>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span>Supabase PostgreSQL Schema Migrations</span>
                  <Badge variant="paid">Ready</Badge>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span>Admin vs Visitor Access & Row Level Security</span>
                  <Badge variant="paid">Configured</Badge>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span>SIH-2026 Ice-Blue Light & Dark Palette</span>
                  <Badge variant="paid">Implemented</Badge>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span>Future Dashboard & Billing Logic</span>
                  <Badge variant="default">Strictly Deferred (Part 2+)</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[var(--secondary)]" />
                <CardTitle>Migration Summary</CardTitle>
              </div>
              <CardDescription>
                Migration scripts located in <code className="font-mono text-[11px] text-[var(--foreground)]">database/migrations/</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-[11px] space-y-1.5 text-[var(--text-muted)]">
                <p className="text-[var(--foreground)] font-semibold">001_initial_schema.sql</p>
                <p>&bull; profiles (id, email, full_name, role)</p>
                <p>&bull; household_settings (currency, rent, due days)</p>
                <p>&bull; bills (unique category / billing period)</p>
                <p>&bull; payments (transaction_id & proof security)</p>
                <p className="text-[var(--foreground)] font-semibold pt-1">002_rls_policies.sql</p>
                <p>&bull; Admin full privileges / Visitor read-only</p>
                <p>&bull; Sensitive field protection via visitor view</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
