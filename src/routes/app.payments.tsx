import { createFileRoute, Outlet } from "@tanstack/react-router";

const paymentViews = [
  ["Register", "/app/payments"],
  ["Supplier ledger", "/app/payments/ledger"],
  ["Commissions", "/app/payments/commissions"],
  ["Recurring", "/app/payments/recurring"],
] as const;

export const Route = createFileRoute("/app/payments")({ component: PaymentsLayout });

function PaymentsLayout() {
  return (
    <div>
      <nav
        aria-label="Payment views"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
      >
        {paymentViews.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-3 text-sm text-fg-muted hover:border-accent/50 hover:text-fg"
          >
            {label}
          </a>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
