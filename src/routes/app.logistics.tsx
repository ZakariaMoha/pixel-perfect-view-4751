import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { logisticsPartners } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/logistics")({
  component: LogisticsPage,
});

function LogisticsPage() {
  const collection = usePersistentList("logistics", logisticsPartners);
    const [view, setView] = useState<"shipments" | "partners">("shipments");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"active" | "all">("active");
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [updateStatus, setUpdateStatus] = useState<OrderStatus>("PRODUCTION");
    const [updateDate, setUpdateDate] = useState(today());
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [note, setNote] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);

    const orderCollection = usePersistentList<Order>("orders", orders);
    const partnerCollection = usePersistentList("logistics", logisticsPartners);
    const activeOrders = orderCollection.records.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
    );
    const inTransitCount = orderCollection.records.filter(
      (order) => order.status === "IN_TRANSIT" || order.status === "CUSTOMS",
    ).length;
    const deliveredCount = orderCollection.records.filter(
      (order) => order.status === "DELIVERED",
    ).length;
    const visibleOrders = useMemo(
      () =>
        orderCollection.records.filter((order) => {
          const isActive = order.status !== "DELIVERED" && order.status !== "CANCELLED";
          const query = `${order.code} ${order.client} ${order.product} ${order.supplier} ${order.carrier ?? ""} ${order.trackingNumber ?? ""}`;
          return (
            (filter === "all" || isActive) &&
            query.toLocaleLowerCase().includes(search.toLocaleLowerCase())
          );
        }),
      [filter, orderCollection.records, search],
    );

    // Additional code for handling updates, rendering stages, etc.

    if (view === "partners") {
      return (
        <>
          <PageHeader title="Partners" subtitle="Freight rates and carrier reliability" />
          <div className="mb-5 flex gap-2 border-b border-border">
            <button
              aria-pressed={view === "shipments"}
              className="min-h-11 border-b-2 border-transparent px-3 text-sm text-fg-muted"
              onClick={() => setView("shipments")}
              type="button"
            >
              Shipments
            </button>
            <button
              aria-pressed={view === "partners"}
              className="min-h-11 border-b-2 border-primary px-3 text-sm text-fg"
              onClick={() => setView("partners")}
              type="button"
            >
              Partners
            </button>
          </div>
          <CrudPage
            title="Logistics partners"
            subtitle="Freight routes, rates, and reliability"
            records={partnerCollection.records}
            onCreate={partnerCollection.create}
            onUpdate={partnerCollection.update}
            onDelete={partnerCollection.remove}
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

    return (
      <>
        <PageHeader
          title="Shipment tracking"
          subtitle="Follow every order from production through delivery in Kenya."
          actions={
            <Button
              onClick={() => {
                const firstOrder = activeOrders[0] ?? orderCollection.records[0];
                if (firstOrder) openUpdate(firstOrder);
              }}
              type="button"
            >
              <Plus size={16} /> Add update
            </Button>
          }
        />
        {/* Additional code for rendering shipments */}
      </>
    );
}
