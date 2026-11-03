import { createClient } from "@/lib/supabase/client";
import { Bill, Payment, HouseholdSettings } from "@/types";
import { BillWithPayment } from "../dashboard/dashboard.types";
import { computeBillPayments } from "../dashboard/dashboard.calculations";
import { DEMO_HOUSEHOLD, DEMO_BILLS, DEMO_PAYMENTS } from "../dashboard/demo-data";

export interface PaymentSummaryData {
  household: HouseholdSettings | null;
  bills: BillWithPayment[];
  payments: (Payment & { bill_title?: string; bill_category?: string; billing_period?: string })[];
  totalPaymentsThisMonth: number;
  totalCollectedThisMonth: number;
  fullyPaidBillsCount: number;
  partiallyPaidBillsCount: number;
  unpaidBillsCount: number;
  totalOutstandingBalance: number;
}

export async function fetchPaymentData(): Promise<PaymentSummaryData> {
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
      const { data: dbPayments } = await supabase.from("payments").select("id, bill_id, amount, payment_date, payment_method, transaction_id, notes, created_at, updated_at").order("payment_date", { ascending: false });

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

  const billMap = calculatedBills.reduce<Record<string, BillWithPayment>>((acc, b) => {
    acc[b.id] = b;
    return acc;
  }, {});

  const enrichedPayments = payments.map((p) => {
    const b = billMap[p.bill_id];
    return {
      ...p,
      bill_title: b?.title || "Household Bill",
      bill_category: b?.category || "general",
      billing_period: b ? `${String(b.billing_month).padStart(2, "0")}/${b.billing_year}` : "-",
    };
  });

  // Payments made in current month
  const thisMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const thisMonthPayments = payments.filter((p) => (p.payment_date || "").startsWith(thisMonthPrefix));

  const totalPaymentsThisMonth = thisMonthPayments.length;
  const totalCollectedThisMonth = thisMonthPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  const fullyPaidBillsCount = calculatedBills.filter((b) => b.status === "paid").length;
  const partiallyPaidBillsCount = calculatedBills.filter((b) => b.status === "partial").length;
  const unpaidBillsCount = calculatedBills.filter((b) => b.status === "unpaid" || b.status === "overdue").length;
  const totalOutstandingBalance = calculatedBills.reduce((acc, b) => acc + b.outstanding, 0);

  return {
    household,
    bills: calculatedBills,
    payments: enrichedPayments,
    totalPaymentsThisMonth,
    totalCollectedThisMonth,
    fullyPaidBillsCount,
    partiallyPaidBillsCount,
    unpaidBillsCount,
    totalOutstandingBalance,
  };
}

export async function recordPayment(paymentData: Omit<Payment, "id">): Promise<{ success: boolean; error?: string }> {
  if (paymentData.amount <= 0) {
    return { success: false, error: "Payment amount must be greater than zero." };
  }

  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { error } = await supabase.from("payments").insert([paymentData]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Demo fallback
  const newPayment: Payment = {
    ...paymentData,
    id: `p-${Date.now()}`,
  };
  DEMO_PAYMENTS.unshift(newPayment);
  return { success: true };
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { error } = await supabase.from("payments").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const index = DEMO_PAYMENTS.findIndex((p) => p.id === id);
  if (index !== -1) {
    DEMO_PAYMENTS[index] = { ...DEMO_PAYMENTS[index], ...updates };
    return { success: true };
  }
  return { success: false, error: "Payment record not found." };
}

export async function deletePayment(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const index = DEMO_PAYMENTS.findIndex((p) => p.id === id);
  if (index !== -1) {
    DEMO_PAYMENTS.splice(index, 1);
    return { success: true };
  }
  return { success: false, error: "Payment record not found." };
}
