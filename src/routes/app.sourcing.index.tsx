import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/kit";
import { sourcingRequests, type SourcingRequest } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/sourcing/")({
  head: () => ({
    meta: [
      { title: "Sourcing — TradeHub" },
      {
        name: "description",
        content: "Client inquiries, RFQs to China agents and scored quotes in one pipeline.",
      },
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
  const collection = usePersistentList("sourcing-requests", sourcingRequests);

  return (
    <CrudPage<SourcingRequest>
      title="Sourcing"
      subtitle="Inquiry → RFQ → scored quotes → client quotation"
      records={collection.records}
      loading={!collection.hydrated}
      onCreate={collection.create}
      onUpdate={collection.update}
      onDelete={collection.remove}
      fields={[
        { key: "code", label: "Request code", required: true },
        { key: "client", label: "Client", required: true },
        { key: "product", label: "Product", required: true },
        { key: "category", label: "Category", required: true },
        { key: "qty", label: "Quantity", type: "number", required: true },
        {
          key: "stage",
          label: "Stage",
          type: "select",
          options: ["New inquiry", "RFQ sent", "Quotes in", "Quoted to client"],
          required: true,
        },
        { key: "quotes", label: "Quote count", type: "number", required: true },
        { key: "targetPriceUsd", label: "Target unit price (USD)", type: "number", required: true },
        { key: "deadline", label: "Deadline", required: true },
        { key: "createdAt", label: "Created date", required: true },
      ]}
      columns={[
        {
          key: "code",
          label: "Code",
          mono: true,
          render: (request) => (
            <Link
              to="/app/sourcing/$id"
              params={{ id: request.id }}
              className="text-accent hover:text-accent-hover"
            >
              {request.code}
            </Link>
          ),
        },
        { key: "client", label: "Client" },
        { key: "product", label: "Product" },
        { key: "qty", label: "Qty", mono: true, render: (request) => request.qty.toLocaleString() },
        {
          key: "stage",
          label: "Stage",
          render: (request) => (
            <Badge tone={stageTone[request.stage] ?? "muted"}>{request.stage}</Badge>
          ),
        },
        { key: "quotes", label: "Quotes", mono: true },
        {
          key: "targetPriceUsd",
          label: "Target",
          mono: true,
          render: (request) => `$${request.targetPriceUsd.toFixed(2)}`,
        },
        { key: "deadline", label: "Deadline" },
      ]}
    />
  );
}
