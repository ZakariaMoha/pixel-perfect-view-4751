import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/kit";
import { DirBadge, PaymentsSubnav, StatusPill, usePayments } from "@/components/payments/shared";
import { money, paymentUsd } from "@/lib/payments-data";

export const Route = createFileRoute("/app/payments/")({
  head: () => ({ meta: [{ title: "Payments — TradeHub" }] }),
  component: PaymentsList,
});

function PaymentsList() {
  const { records } = usePayments();
  return (
    <div>
      <PageHeader title="Payments" subtitle="Money in from clients, money out to China" />
      <PaymentsSubnav />
      <div className="space-y-3">
        {records.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <DirBadge direction={p.direction} />
              <div>
                <p className="font-mono text-sm font-semibold">{p.code}</p>
                <p className="text-sm text-muted-foreground">{p.counterparty} · {p.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold">{money(p.amount, p.currency)}</p>
              <p className="font-mono text-xs text-accent">${paymentUsd(p).toFixed(0)}</p>
            </div>
            <StatusPill status={p.status} direction={p.direction} />
          </Card>
        ))}
      </div>
      <Link to="/app" className="sr-only">Back</Link>
    </div>
  );
}
