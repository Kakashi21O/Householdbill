import { Bill, Payment, HouseholdSettings } from "@/types";

export const DEMO_HOUSEHOLD: HouseholdSettings = {
  id: "demo-household-sunrise",
  household_name: "Sunrise Residency",
  currency: "INR",
  monthly_rent: 10500.0,
  rent_due_day: 5,
  electricity_due_day: 10,
  billing_start_month: "2025-01-01",
};

// 24 Months Demo Bills: Jan 2025 - Dec 2026
const elecAmounts = [
  // 2025
  4850, 4620, 4950, 5200, 6100, 6850, 7200, 6750, 5900, 5400, 4950, 4700,
  // 2026
  4900, 4750, 5100, 5450, 6300, 7100, 7350, 6900, 6100, 6500, 6070, 5200,
];

export const DEMO_BILLS: Bill[] = [];
export const DEMO_PAYMENTS: Payment[] = [];

let payIdCounter = 1;

for (let yIdx = 0; yIdx < 2; yIdx++) {
  const year = 2025 + yIdx;
  for (let m = 1; m <= 12; m++) {
    const idx = yIdx * 12 + (m - 1);
    const rentBillId = `b-rent-${year}-${m}`;
    const elecBillId = `b-elec-${year}-${m}`;
    const elecAmt = elecAmounts[idx];

    // Rent Bill (10,500)
    DEMO_BILLS.push({
      id: rentBillId,
      household_id: DEMO_HOUSEHOLD.id,
      category: "rent",
      billing_month: m,
      billing_year: year,
      amount: 10500,
      due_date: `${year}-${String(m).padStart(2, "0")}-05`,
    });

    // Electricity Bill
    DEMO_BILLS.push({
      id: elecBillId,
      household_id: DEMO_HOUSEHOLD.id,
      category: "electricity",
      billing_month: m,
      billing_year: year,
      amount: elecAmt,
      due_date: `${year}-${String(m).padStart(2, "0")}-10`,
    });

    // Payments Logic:
    // Future Month Dec 2026 -> Unpaid (no payments)
    if (year === 2026 && m === 12) {
      continue;
    }

    // Nov 2026 -> Current Month: Rent paid (10,500), Electricity partial (3,000)
    if (year === 2026 && m === 11) {
      DEMO_PAYMENTS.push({
        id: `p-${payIdCounter++}`,
        bill_id: rentBillId,
        amount: 10500,
        payment_date: `2026-11-05`,
        payment_method: "UPI",
        notes: "Monthly rent",
      });
      DEMO_PAYMENTS.push({
        id: `p-${payIdCounter++}`,
        bill_id: elecBillId,
        amount: 3000,
        payment_date: `2026-11-10`,
        payment_method: "UPI",
        notes: "Electricity partial payment",
      });
      continue;
    }

    // Oct 2025 -> Electricity partial (3,000)
    if (year === 2025 && m === 10) {
      DEMO_PAYMENTS.push({
        id: `p-${payIdCounter++}`,
        bill_id: rentBillId,
        amount: 10500,
        payment_date: `2025-10-05`,
        payment_method: "UPI",
        notes: "Monthly rent",
      });
      DEMO_PAYMENTS.push({
        id: `p-${payIdCounter++}`,
        bill_id: elecBillId,
        amount: 3000,
        payment_date: `2025-10-10`,
        payment_method: "UPI",
        notes: "Electricity partial",
      });
      continue;
    }

    // All other historical months: Paid in full
    DEMO_PAYMENTS.push({
      id: `p-${payIdCounter++}`,
      bill_id: rentBillId,
      amount: 10500,
      payment_date: `${year}-${String(m).padStart(2, "0")}-05`,
      payment_method: "UPI",
      notes: "Monthly rent",
    });
    DEMO_PAYMENTS.push({
      id: `p-${payIdCounter++}`,
      bill_id: elecBillId,
      amount: elecAmt,
      payment_date: `${year}-${String(m).padStart(2, "0")}-10`,
      payment_method: "UPI",
      notes: "Electricity bill",
    });
  }
}
