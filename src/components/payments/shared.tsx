import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Payment } from "@/lib/demo-data";

export function PaymentStatusPill({ status }: { status: Payment["status"] }) {
  const tone = {
    received: "bg-success/15 text-success",
    sent: "bg-info/15 text-info",
    pending: "bg-warning/15 text-warning",
    failed: "bg-danger/15 text-danger",
    refunded: "bg-accent/15 text-accent",
  }[status];
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wider",
        tone,
      )}
    >
      {status}
    </span>
  );
}

export function PaymentAmount({ payment, className }: { payment: Payment; className?: string }) {
  const prefix = payment.currency === "KES" ? "KSh " : payment.currency === "CNY" ? "¥" : "$";
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        payment.direction === "IN" ? "text-success" : "text-primary",
        className,
      )}
    >
      {prefix}
      {payment.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm text-fg">{children}</dd>
    </div>
  );
}
