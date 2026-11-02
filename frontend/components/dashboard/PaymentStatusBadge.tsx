import { Badge } from "@/components/ui/badge";
import { BillStatus } from "@/lib/dashboard/dashboard.types";

export function PaymentStatusBadge({ status }: { status?: BillStatus }) {
  if (status === "paid") return <Badge variant="paid">Paid</Badge>;
  if (status === "partial") return <Badge variant="partial">Partially Paid</Badge>;
  if (status === "overdue") return <Badge variant="unpaid">Overdue</Badge>;
  return <Badge variant="default">Unpaid</Badge>;
}
