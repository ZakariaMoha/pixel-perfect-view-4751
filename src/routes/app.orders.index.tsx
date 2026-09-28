import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Cell, PageHeader, Row, Table } from "@/components/kit";
import { orders, statusMeta, usd } from "@/lib/demo-data";

export const Route = createFileRoute("/app/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — TradeHub" },
      { name: "description", content: "Every China to Kenya order with status, value, margin and ETA." },
      { property: "og:title", content: "Orders — TradeHub" },
      { property: "og:description", content: "Track order status, value, margin and ETA." },
    ],
  }),
  component: OrdersList,
});

function OrdersList() {
  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders · ${usd(orders.reduce((s, o) => s + o.valueUsd, 0))} in flight`}
        actions={<Button>New order</Button>}
      />
      <Table head={["Code", "Client", "Product", "Status", "Value", "Margin", "ETA"]}>
        {orders.map((o) => (
          <Row key={o.id}>
            <Cell>
              <Link to="/app/orders/$id" params={{ id: o.id }} className="font-mono text-sm text-accent hover:text-accent-hover">
                {o.code}
              </Link>
            </Cell>
            <Cell className="font-medium">{o.client}</Cell>
            <Cell className="text-muted-foreground">{o.product}</Cell>
            <Cell>
              <Badge tone={statusMeta[o.status].tone}>{statusMeta[o.status].label}</Badge>
            </Cell>
            <Cell className="font-mono">{usd(o.valueUsd)}</Cell>
            <Cell className="font-mono text-success">
              {((o.profitUsd / o.valueUsd) * 100).toFixed(1)}%
            </Cell>
            <Cell className="text-subtle">{o.eta}</Cell>
          </Row>
        ))}
      </Table>
    </>
  );
}
