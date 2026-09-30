import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { invoices } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const collection = usePersistentList("invoices", invoices);
  return <CrudPage title="Invoices" subtitle="Client billing and payment status" records={collection.records} onCreate={collection.create} onUpdate={collection.update} onDelete={collection.remove} fields={[
    { key: "number", label: "Invoice number", required: true }, { key: "client", label: "Client", required: true },
    { key: "amountUsd", label: "Amount (USD)", type: "number", required: true },
    { key: "type", label: "Type", type: "select", options: ["Deposit", "Final"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Paid", "Overdue"], required: true },
    { key: "date", label: "Invoice date", required: true },
  ]} columns={[
    { key: "number", label: "Invoice", mono: true }, { key: "client", label: "Client" }, { key: "amountUsd", label: "Amount USD", mono: true },
    { key: "type", label: "Type" }, { key: "status", label: "Status" }, { key: "date", label: "Date" },
  ]} />;
}
