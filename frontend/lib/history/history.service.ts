import { createClient } from "@/lib/supabase/client";
import { Bill, Payment, HouseholdSettings } from "@/types";
import { BillWithPayment } from "../dashboard/dashboard.types";
import { computeBillPayments } from "../dashboard/dashboard.calculations";
import { DEMO_HOUSEHOLD, DEMO_BILLS, DEMO_PAYMENTS } from "../dashboard/demo-data";

export interface EnrichedPayment extends Payment {
  bill_title?: string;
  bill_category?: string;
  billing_month?: number;
  billing_year?: number;
}

export interface HistoryData {
  household: HouseholdSettings | null;
  bills: BillWithPayment[];
  payments: EnrichedPayment[];
  availableYears: number[];
}

export async function fetchHistoryData(): Promise<HistoryData> {
  const supabase = createClient();
  let household: HouseholdSettings | null = null;
  let bills: Bill[] = [];
  let payments: Payment[] = [];

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  if (isConfigured) {
    try {
      const { data: dbHousehold } = await supabase.from("household_settings").select("*").limit(1).maybeSingle();
      const { data: dbBills } = await supabase.from("bills").select("*").order("billing_year", { ascending: false }).order("billing_month", { ascending: false });
      const { data: dbPayments } = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
      if (dbBills && dbBills.length > 0) {
        household = dbHousehold;
        bills = dbBills;
        payments = dbPayments || [];
      }
    } catch {}
  }

  if (bills.length === 0) {
    household = DEMO_HOUSEHOLD;
    bills = [...DEMO_BILLS];
    payments = [...DEMO_PAYMENTS];
  }

  const calculatedBills = computeBillPayments(bills, payments);
  const billMap = new Map<string, BillWithPayment>(calculatedBills.map((b) => [b.id, b]));

  const enrichedPayments: EnrichedPayment[] = payments.map((p) => {
    const b = billMap.get(p.bill_id);
    return {
      ...p,
      bill_title: b?.title || "Household Bill",
      bill_category: b?.category || "general",
      billing_month: b?.billing_month,
      billing_year: b?.billing_year,
    };
  });

  const availableYears = Array.from(new Set(calculatedBills.map((b) => b.billing_year))).sort((a, b) => b - a);

  return { household, bills: calculatedBills, payments: enrichedPayments, availableYears };
}
