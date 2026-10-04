import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { clients } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const collection = usePersistentList("clients", clients);
  return (
    <CrudPage
      title="Clients"
      subtitle="Client accounts and relationship history"
      records={collection.records}
      loading={!collection.hydrated}
      onCreate={collection.create}
      onUpdate={collection.update}
      onDelete={collection.remove}
      fields={[
        { key: "name", label: "Client name", required: true },
        { key: "city", label: "City", required: true },
        { key: "orders", label: "Orders", type: "number", required: true },
        { key: "lifetimeUsd", label: "Lifetime value (USD)", type: "number", required: true },
        { key: "lastOrder", label: "Last order", required: true },
        {
          key: "tier",
          label: "Tier",
          type: "select",
          options: ["Bronze", "Silver", "Gold"],
          required: true,
        },
        {
          key: "risk",
          label: "Risk",
          type: "select",
          options: ["Low", "Medium", "High"],
          required: true,
        },
      ]}
      columns={[
        { key: "name", label: "Client" },
        { key: "city", label: "City" },
        { key: "orders", label: "Orders", mono: true },
        { key: "lifetimeUsd", label: "Lifetime USD", mono: true },
        { key: "lastOrder", label: "Last order" },
        { key: "tier", label: "Tier" },
        { key: "risk", label: "Risk" },
      ]}
    />
  );
}
