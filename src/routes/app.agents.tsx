import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { agents } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/agents")({
  component: AgentsPage,
});

function AgentsPage() {
  const collection = usePersistentList("agents", agents);
  return (
    <CrudPage
      title="Agents"
      subtitle="China-based sourcing partners"
      records={collection.records}
      loading={!collection.hydrated}
      onCreate={collection.create}
      onUpdate={collection.update}
      onDelete={collection.remove}
      fields={[
        { key: "name", label: "Agent name", required: true },
        { key: "city", label: "City", required: true },
        { key: "rating", label: "Rating", type: "number", required: true },
        { key: "winRate", label: "Win rate (%)", type: "number", required: true },
        {
          key: "avgResponseHrs",
          label: "Average response (hours)",
          type: "number",
          required: true,
        },
        { key: "quotes", label: "Quotes", type: "number", required: true },
        { key: "active", label: "Active requests", type: "number", required: true },
      ]}
      columns={[
        { key: "name", label: "Agent" },
        { key: "city", label: "City" },
        { key: "rating", label: "Rating", mono: true },
        { key: "winRate", label: "Win rate", mono: true },
        { key: "avgResponseHrs", label: "Response hrs", mono: true },
        { key: "quotes", label: "Quotes", mono: true },
        { key: "active", label: "Active", mono: true },
      ]}
    />
  );
}
