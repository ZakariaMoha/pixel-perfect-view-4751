import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/kit";
import { PaymentsSubnav } from "@/components/payments/shared";

export const Route = createFileRoute("/app/payments/ledger")({
  head: () => ({ meta: [{ title: "Supplier ledger — TradeHub" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="Supplier ledger" subtitle="Payments" />
      <PaymentsSubnav />
      <Card>This screen is not finished yet.</Card>
    </div>
  );
}
