import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Cell, PageHeader, Row, Table } from "@/components/kit";
import { sourcingRequests } from "@/lib/demo-data";

export const Route = createFileRoute("/app/sourcing/")({
  head: () => ({
    meta: [
      { title: "Sourcing — TradeHub" },
      { name: "description", content: "Client inquiries, RFQs to China agents and scored quotes in one pipeline." },
      { property: "og:title", content: "Sourcing — TradeHub" },
      { property: "og:description", content: "Inquiry to RFQ to scored agent quotes." },
    ],
  }),
  component: SourcingList,
});

const stageTone: Record<string, string> = {
  "New inquiry": "info",
  "RFQ sent": "warning",
  "Quotes in": "accent",
  "Quoted to client": "success",
};

function SourcingList() {
  return (
    <>
      <PageHeader
        title="Sourcing"
        subtitle="Inquiry → RFQ → scored quotes → client quotation"
        actions={<Button>New sourcing request</Button>}
      />
      <Table head={["Code", "Client", "Product", "Qty", "Stage", "Quotes", "Target", "Deadline"]}>
        {sourcingRequests.map((r) => (
          <Row key={r.id}>
            <Cell>
              <Link to="/app/sourcing/$id" params={{ id: r.id }} className="font-mono text-sm text-accent hover:text-accent-hover">
                {r.code}
              </Link>
            </Cell>
            <Cell className="font-medium">{r.client}</Cell>
            <Cell className="text-muted-foreground">{r.product}</Cell>
            <Cell className="font-mono">{r.qty.toLocaleString()}</Cell>
            <Cell>
              <Badge tone={stageTone[r.stage] ?? "muted"}>{r.stage}</Badge>
            </Cell>
            <Cell className="font-mono">{r.quotes}</Cell>
            <Cell className="font-mono">${r.targetPriceUsd.toFixed(2)}</Cell>
            <Cell className="text-subtle">{r.deadline}</Cell>
          </Row>
        ))}
      </Table>
    </>
  );
}
