import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { suppliers } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/suppliers")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const collection = usePersistentList("suppliers", suppliers);
  return (
    <CrudPage
      title="Suppliers"
      subtitle="Factory performance and sourcing categories"
      records={collection.records}
      loading={!collection.hydrated}
      onCreate={collection.create}
      onUpdate={collection.update}
      onDelete={collection.remove}
      fields={[
        { key: "name", label: "Supplier name", required: true },
        { key: "category", label: "Category", required: true },
        { key: "passRate", label: "QC pass rate (%)", type: "number", required: true },
        { key: "onTime", label: "On-time rate (%)", type: "number", required: true },
        { key: "orders", label: "Orders", type: "number", required: true },
        {
          key: "priceTrend",
          label: "Price trend",
          type: "select",
          options: ["stable", "rising", "falling"],
          required: true,
        },
      ]}
      columns={[
        { key: "name", label: "Supplier" },
        { key: "category", label: "Category" },
        { key: "passRate", label: "QC pass", mono: true },
        { key: "onTime", label: "On-time", mono: true },
        { key: "orders", label: "Orders", mono: true },
        { key: "priceTrend", label: "Price trend" },
      ]}
    />
  );
}
