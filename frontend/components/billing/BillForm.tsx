"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createBill } from "@/lib/billing/billing.service";
import { X, Check } from "lucide-react";

interface BillFormProps {
  householdId: string;
  defaultRent: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BillForm({ householdId, defaultRent, onSuccess, onCancel }: BillFormProps) {
  const [category, setCategory] = React.useState<"rent" | "electricity">("rent");
  const [billingMonth, setBillingMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = React.useState<number>(new Date().getFullYear());
  const [amount, setAmount] = React.useState<string>(String(defaultRent));
  const [title, setTitle] = React.useState<string>(`Monthly Rent - ${billingMonth}/${billingYear}`);
  const [issueDate, setIssueDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = React.useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-05`
  );
  const [description, setDescription] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCategoryChange = (cat: "rent" | "electricity") => {
    setCategory(cat);
    if (cat === "rent") {
      setAmount(String(defaultRent));
      setTitle(`Monthly Rent - ${billingMonth}/${billingYear}`);
      setDueDate(`${billingYear}-${String(billingMonth).padStart(2, "0")}-05`);
    } else {
      setAmount("");
      setTitle(`Electricity Bill - ${billingMonth}/${billingYear}`);
      setDueDate(`${billingYear}-${String(billingMonth).padStart(2, "0")}-10`);
    }
  };

  const handleMonthChange = (m: number) => {
    setBillingMonth(m);
    setTitle(
      category === "rent" ? `Monthly Rent - ${m}/${billingYear}` : `Electricity Bill - ${m}/${billingYear}`
    );
    setDueDate(`${billingYear}-${String(m).padStart(2, "0")}-${category === "rent" ? "05" : "10"}`);
  };

  const handleYearChange = (y: number) => {
    setBillingYear(y);
    setTitle(
      category === "rent" ? `Monthly Rent - ${billingMonth}/${y}` : `Electricity Bill - ${billingMonth}/${y}`
    );
    setDueDate(`${y}-${String(billingMonth).padStart(2, "0")}-${category === "rent" ? "05" : "10"}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number greater than 0.");
      return;
    }

    if (dueDate < issueDate) {
      setError("Due date cannot be earlier than issue date.");
      return;
    }

    setSaving(true);
    const result = await createBill({
      household_id: householdId,
      category,
      billing_month: Number(billingMonth),
      billing_year: Number(billingYear),
      amount: numAmount,
      title,
      issue_date: issueDate,
      due_date: dueDate,
      description,
    });

    setSaving(false);
    if (!result.success) {
      setError(result.error || "Failed to create bill.");
    } else {
      onSuccess();
    }
  };

  return (
    <Card className="border border-[var(--border)] shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
        <CardTitle className="text-base">Create New Bill</CardTitle>
        <button onClick={onCancel} className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--surface)]">
          <X size={18} />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Bill Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as "rent" | "electricity")}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none"
              >
                <option value="rent">Rent (Single payer - ₹{defaultRent})</option>
                <option value="electricity">Electricity Bill</option>
              </select>
            </div>

            <Input
              id="title"
              label="Bill Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Billing Month
              </label>
              <select
                value={billingMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("en", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="year"
              type="number"
              label="Billing Year"
              min={2000}
              max={2099}
              value={billingYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              required
            />

            <Input
              id="amount"
              type="number"
              step="0.01"
              label="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={category === "rent"}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="issueDate"
              type="date"
              label="Issue Date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />

            <Input
              id="dueDate"
              type="date"
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <Input
            id="desc"
            label="Notes / Description (Optional)"
            placeholder="e.g. meter reading: 1420 units"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              <Check size={14} className="mr-1.5" />
              {saving ? "Saving Bill..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
