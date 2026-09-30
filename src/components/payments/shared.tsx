import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/kit";
import { cn } from "@/lib/utils";
import { usePersistentList } from "@/lib/use-persistent-list";
import {
  payments as seedPayments,
  recurringTemplates,
  type Payment,
  type PaymentStatus,
  type Direction,
} from "@/lib/payments-data";

export function usePayments() {
  return usePersistentList<Payment>("payments", seedPayments);
}

export function useRecurring() {
  return usePersistentList("recurring", recurringTemplates);
}

export function statusLabel(status: PaymentStatus, direction: Direction) {
  if (status === "PENDING") return "Pending";
  if (status === "FAILED") return "Failed";
  return direction === "IN" ? "Received" : "Sent";
}

export function StatusPill({ status, direction }: { status: PaymentStatus; direction: Direction }) {
  const tone = status === "PENDING" ? "warning" : status === "FAILED" ? "danger" : "success";
  return <Badge tone={tone}>{statusLabel(status, direction)}</Badge>;
}

export function DirBadge({ direction }: { direction: Direction }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-[11px] font-bold",
        direction === "IN"
          ? "border-success/30 bg-success/15 text-success"
          : "border-primary/30 bg-primary/15 text-primary",
      )}
    >
      {direction === "IN" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
      {direction}
    </span>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{children}</p>
  );
}

const sections = [
  { to: "/app/payments", label: "All payments", exact: true },
  { to: "/app/payments/ledger", label: "Supplier ledger" },
  { to: "/app/payments/commissions", label: "Agent commissions" },
  { to: "/app/payments/recurring", label: "Recurring" },
] as const;

export function PaymentsSubnav() {
  return (
    <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {sections.map((s) => (
        <Link
          key={s.to}
          to={s.to}
          activeOptions={{ exact: "exact" in s ? s.exact : false }}
          activeProps={{ className: "bg-primary/15 text-foreground border-primary/30" }}
          inactiveProps={{ className: "text-muted-foreground border-transparent hover:bg-secondary" }}
          className="inline-flex min-h-11 shrink-0 items-center rounded-md border px-3.5 text-sm font-medium"
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export const fieldClass =
  "min-h-11 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm text-foreground outline-none focus:border-accent";
