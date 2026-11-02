# Household Billing System — Architecture

## 1. Overview
The Household Billing Management System is a Next.js (App Router) + Supabase PostgreSQL web application designed to track and manage household rent, electricity bills, and payment records with role-based access (Administrator vs. Visitor).

## 2. Technology Stack
- **Frontend Framework**: Next.js (App Router, React 19 / TypeScript strict)
- **Styling**: Tailwind CSS + Custom centralized design tokens (Portfolio dark theme + SIH-2026 ice-blue light theme)
- **Icons**: Lucide React
- **Backend / DB**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (Cookie-based SSR session management)
- **Deployment**: Vercel + GitHub

## 3. Directory Layout
```text
Householdbill/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── theme/
│   ├── lib/
│   │   └── supabase/
│   └── types/
├── database/
│   ├── migrations/
│   ├── policies/
│   └── seed/
├── docs/
└── .env.example
```

## 4. Role Hierarchy
- **Administrator**: Full privileges to edit household settings, add/edit/delete bills and payments, review transaction receipts.
- **Visitor**: Read-only access to household settings, bill overviews, and safe payment summaries. Sensitive fields (UPI transaction IDs, screenshot URLs) are withheld.
