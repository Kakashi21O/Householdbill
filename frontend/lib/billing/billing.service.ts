import { createClient } from "@/lib/supabase/client";
import { Bill, Payment, HouseholdSettings } from "@/types";
import { BillWithPayment } from "../dashboard/dashboard.types";
import { computeBillPayments } from "../dashboard/dashboard.calculations";
import { DEMO_HOUSEHOLD, DEMO_BILLS, DEMO_PAYMENTS } from "../dashboard/demo-data";

export interface BillingSummaryData {
  household: HouseholdSettings | null;
  bills: BillWithPayment[];
  payments: Payment[];
  totalBillsThisMonth: number;
  totalBilledThisMonth: number;
  totalPaidThisMonth: number;
  outstandingThisMonth: number;
  totalOverdueBills: number;
  totalUpcomingBills: number;
}

export async function fetchBillingData(): Promise<BillingSummaryData> {
  const supabase = createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let household: HouseholdSettings | null = null;
  let bills: Bill[] = [];
  let payments: Payment[] = [];

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    try {
      const { data: dbHousehold } = await supabase.from("household_settings").select("*").limit(1).maybeSingle();
      const { data: dbBills } = await supabase.from("bills").select("*").order("billing_year", { ascending: false }).order("billing_month", { ascending: false });
      const { data: dbPayments } = await supabase.from("payments").select("id, bill_id, amount, payment_date, payment_method, notes, created_at, updated_at").order("payment_date", { ascending: false });

      if (dbBills && dbBills.length > 0) {
        household = dbHousehold;
        bills = dbBills;
        payments = dbPayments || [];
      }
    } catch {
      // offline/error
    }
  }

  if (bills.length === 0) {
    household = DEMO_HOUSEHOLD;
    bills = [...DEMO_BILLS];
    payments = [...DEMO_PAYMENTS];
  }

  const calculatedBills = computeBillPayments(bills, payments);

  const currentMonthBills = calculatedBills.filter(
    (b) => b.billing_month === currentMonth && b.billing_year === currentYear
  );

  const totalBillsThisMonth = currentMonthBills.length;
  const totalBilledThisMonth = currentMonthBills.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalPaidThisMonth = currentMonthBills.reduce((acc, b) => acc + b.total_paid, 0);
  const outstandingThisMonth = currentMonthBills.reduce((acc, b) => acc + b.outstanding, 0);

  const totalOverdueBills = calculatedBills.filter((b) => b.status === "overdue").length;
  const totalUpcomingBills = calculatedBills.filter((b) => b.outstanding > 0 && !b.is_overdue).length;

  return {
    household,
    bills: calculatedBills,
    payments,
    totalBillsThisMonth,
    totalBilledThisMonth,
    totalPaidThisMonth,
    outstandingThisMonth,
    totalOverdueBills,
    totalUpcomingBills,
  };
}

export async function createBill(billData: Omit<Bill, "id">): Promise<{ success: boolean; error?: string; bill?: Bill }> {
  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { data, error } = await supabase.from("bills").insert([billData]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, bill: data };
  }

  // Local demo fallback: add to in-memory demo bills
  const duplicate = DEMO_BILLS.some(
    (b) => b.category === billData.category && b.billing_month === billData.billing_month && b.billing_year === billData.billing_year
  );
  if (duplicate) {
    return { success: false, error: `A ${billData.category} bill already exists for this billing period.` };
  }

  const newBill: Bill = {
    ...billData,
    id: `b-${billData.category}-${billData.billing_year}-${billData.billing_month}`,
  };
  DEMO_BILLS.unshift(newBill);
  return { success: true, bill: newBill };
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { error } = await supabase.from("bills").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const index = DEMO_BILLS.findIndex((b) => b.id === id);
  if (index !== -1) {
    DEMO_BILLS[index] = { ...DEMO_BILLS[index], ...updates };
    return { success: true };
  }
  return { success: false, error: "Bill not found." };
}

export async function deleteBill(id: string, hasPayments: boolean): Promise<{ success: boolean; error?: string }> {
  if (hasPayments) {
    return { success: false, error: "Cannot delete a bill that already has associated payment history." };
  }

  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const index = DEMO_BILLS.findIndex((b) => b.id === id);
  if (index !== -1) {
    DEMO_BILLS.splice(index, 1);
    return { success: true };
  }
  return { success: false, error: "Bill not found." };
}
