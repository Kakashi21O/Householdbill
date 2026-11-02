import { createClient } from "@/lib/supabase/client";
import { Bill, Payment, HouseholdSettings } from "@/types";
import { DashboardData } from "./dashboard.types";
import { computeBillPayments } from "./dashboard.calculations";
import { DEMO_HOUSEHOLD, DEMO_BILLS, DEMO_PAYMENTS } from "./demo-data";

export async function fetchDashboardData(): Promise<DashboardData> {
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
      const { data: dbBills } = await supabase.from("bills").select("*").order("due_date", { ascending: true });
      const { data: dbPayments } = await supabase.from("payments").select("id, bill_id, amount, payment_date, payment_method, notes, created_at, updated_at").order("payment_date", { ascending: false });

      if (dbBills && dbBills.length > 0) {
        household = dbHousehold;
        bills = dbBills;
        payments = dbPayments || [];
      }
    } catch {
      // Supabase offline or error
    }
  }

  // Use demo data if database is empty or unconfigured
  if (bills.length === 0) {
    household = DEMO_HOUSEHOLD;
    bills = DEMO_BILLS;
    payments = DEMO_PAYMENTS;
  }

  const calculatedBills = computeBillPayments(bills, payments);

  // Current month's bills
  const currentMonthBills = calculatedBills.filter(
    (b) => b.billing_month === currentMonth && b.billing_year === currentYear
  );

  const totalMonthlyBills = currentMonthBills.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalPaid = currentMonthBills.reduce((acc, b) => acc + b.total_paid, 0);
  const totalOutstanding = currentMonthBills.reduce((acc, b) => acc + b.outstanding, 0);

  const currentRentBill = currentMonthBills.find((b) => b.category === "rent") || null;
  const currentElectricityBill = currentMonthBills.find((b) => b.category === "electricity") || null;

  // Upcoming / outstanding dues
  const upcomingBills = calculatedBills.filter((b) => b.outstanding > 0);
  const upcomingDueTotal = upcomingBills.reduce((acc, b) => acc + b.outstanding, 0);
  const nearestDueDate = upcomingBills.length > 0 ? upcomingBills[0].due_date : null;

  // Recent payments
  const billCategoryMap = bills.reduce<Record<string, string>>((acc, b) => {
    acc[b.id] = b.category;
    return acc;
  }, {});

  const recentPayments = payments.slice(0, 5).map((p) => ({
    ...p,
    bill_category: billCategoryMap[p.bill_id] || "general",
  }));

  // Historical 6-month chart data
  const monthMap = new Map<string, { billed: number; paid: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthMap.set(key, { billed: 0, paid: 0 });
  }

  calculatedBills.forEach((b) => {
    const d = new Date(b.billing_year, b.billing_month - 1, 1);
    const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    if (monthMap.has(key)) {
      const entry = monthMap.get(key)!;
      entry.billed += Number(b.amount);
      entry.paid += b.total_paid;
    }
  });

  const monthlyChartData = Array.from(monthMap.entries()).map(([monthYear, val]) => ({
    monthYear,
    billed: val.billed,
    paid: val.paid,
  }));

  return {
    household,
    totalMonthlyBills,
    totalPaid,
    totalOutstanding,
    upcomingDueTotal,
    nearestDueDate,
    currentRentBill,
    currentElectricityBill,
    upcomingBills: upcomingBills.slice(0, 5),
    recentPayments,
    monthlyChartData,
  };
}
