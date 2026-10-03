import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/kit";
import { ShipmentTracker } from "@/components/ShipmentTracker";
import { logisticsPartners } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/logistics")({
  component: LogisticsPage,
});

function LogisticsPage() {
  const [showPartners, setShowPartners] = useState(false);
  const collection = usePersistentList("logistics", logisticsPartners);
  if (!showPartners) {
    return <ShipmentTracker onPartners={() => setShowPartners(true)} />;
  }

  return (
    <>
      <div className="mb-3">
        <Button onClick={() => setShowPartners(false)} type="button" variant="glass">
          Back to shipments
        </Button>
      </div>
      <CrudPage
        title="Logistics partners"
        subtitle="Freight routes, rates, and reliability"
        records={collection.records}
        onCreate={collection.create}
        onUpdate={collection.update}
        onDelete={collection.remove}
        fields={[
          { key: "name", label: "Partner name", required: true },
          { key: "type", label: "Service type", required: true },
          { key: "ratePerKg", label: "Rate per kg (USD)", type: "number", required: true },
          { key: "ratePerCbm", label: "Rate per CBM (USD)", type: "number", required: true },
          { key: "reliability", label: "Reliability (%)", type: "number", required: true },
          { key: "shipments", label: "Shipments", type: "number", required: true },
        ]}
        columns={[
          { key: "name", label: "Partner" },
          { key: "type", label: "Service" },
          { key: "ratePerKg", label: "USD / kg", mono: true },
          { key: "ratePerCbm", label: "USD / CBM", mono: true },
          { key: "reliability", label: "Reliability", mono: true },
          { key: "shipments", label: "Shipments", mono: true },
        ]}
      />
    </>
  );
}
