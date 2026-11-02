export type UserRole = "admin" | "visitor";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface HouseholdSettings {
  id: string;
  household_name: string;
  currency: string;
  monthly_rent: number;
  rent_due_day: number;
  electricity_due_day: number;
  billing_start_month: string;
}

export interface Bill {
  id: string;
  household_id: string;
  category: "rent" | "electricity" | "other";
  billing_month: number;
  billing_year: number;
  amount: number;
  due_date: string;
}

export interface Payment {
  id: string;
  bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
}
