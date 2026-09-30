import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/kit";
import { usePersistentList } from "@/lib/use-persistent-list";
import { orders, statusMeta, usd, type Order } from "@/lib/demo-data";

export const Route = createFileRoute("/app/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — TradeHub" },
      {
        name: "description",
        content: "Every China to Kenya order with status, value, margin and ETA.",
      },
      { property: "og:title", content: "Orders — TradeHub" },
      { property: "og:description", content: "Track order status, value, margin and ETA." },
    ],
  }),
  component: OrdersList,
});

function OrdersList() {
  const collection = usePersistentList("orders", orders);

  return (
    <CrudPage<Order>
      title="Orders"
      subtitle={`${usd(collection.records.reduce((sum, order) => sum + order.valueUsd, 0))} total order value`}
      records={collection.records}
      onCreate={collection.create}
      onUpdate={collection.update}
      onDelete={collection.remove}
      fields={[
        { key: "code", label: "Order code", required: true },
        { key: "client", label: "Client", required: true },
        { key: "product", label: "Product", required: true },
        { key: "category", label: "Category", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: Object.keys(statusMeta),
          required: true,
        },
        { key: "valueUsd", label: "Order value (USD)", type: "number", required: true },
        { key: "profitUsd", label: "Profit (USD)", type: "number", required: true },
        { key: "agent", label: "Agent", required: true },
        { key: "supplier", label: "Supplier", required: true },
        { key: "eta", label: "ETA", required: true },
        { key: "createdAt", label: "Created date", required: true },
        { key: "route", label: "Route", required: true },
        { key: "weightKg", label: "Weight (kg)", type: "number", required: true },
        { key: "cbm", label: "Volume (CBM)", type: "number", required: true },
      ]}
      columns={[
        {
          key: "code",
          label: "Code",
          mono: true,
          render: (order) => (
            <Link
              to="/app/orders/$id"
              params={{ id: order.id }}
              className="text-accent hover:text-accent-hover"
            >
              {order.code}
            </Link>
          ),
        },
        { key: "client", label: "Client" },
        { key: "product", label: "Product" },
        {
          key: "status",
          label: "Status",
          render: (order) => (
            <Badge tone={statusMeta[order.status].tone}>{statusMeta[order.status].label}</Badge>
          ),
        },
        { key: "valueUsd", label: "Value", mono: true, render: (order) => usd(order.valueUsd) },
        {
          key: "profitUsd",
          label: "Margin",
          mono: true,
          render: (order) =>
            `${((order.profitUsd / Math.max(order.valueUsd, 1)) * 100).toFixed(1)}%`,
        },
        { key: "eta", label: "ETA" },
      ]}
    />
  );
}
