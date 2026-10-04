import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, CheckCircle2, PackageCheck, Plus, Ship, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Stat,
  Table,
  TableSkeleton,
} from "@/components/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  logisticsPartners,
  orders,
  statusMeta,
  type Order,
  type OrderStatus,
  type ShipmentUpdate,
} from "@/lib/demo-data";
import {
  formatTrackingDate,
  latestShipmentUpdate,
  shipmentProgress,
  shipmentStages,
} from "@/lib/shipment-tracking";
import { usePersistentList } from "@/lib/use-persistent-list";

const today = () => new Date().toISOString().slice(0, 10);
const stageOptions: OrderStatus[] = [
  "QUOTED",
  "DEPOSIT_PAID",
  "PRODUCTION",
  "QC",
  "WAREHOUSE",
  "IN_TRANSIT",
  "CUSTOMS",
  "DELIVERED",
];

type ShipmentTrackerProps = { onPartners: () => void };

async function resizePhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.76);
}

export function ShipmentTracker({ onPartners }: ShipmentTrackerProps) {
  const collection = usePersistentList<Order>("orders", orders);
  const partnerCollection = usePersistentList("logistics", logisticsPartners);
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

  const activeOrders = collection.records.filter(
    (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
  );
  const inTransitCount = collection.records.filter(
    (order) => order.status === "IN_TRANSIT" || order.status === "CUSTOMS",
  ).length;
  const deliveredCount = collection.records.filter((order) => order.status === "DELIVERED").length;
  const visibleOrders = useMemo(
    () =>
      collection.records.filter((order) => {
        const isActive = order.status !== "DELIVERED" && order.status !== "CANCELLED";
        const query = `${order.code} ${order.client} ${order.product} ${order.supplier} ${order.carrier ?? ""} ${order.trackingNumber ?? ""}`;
        return (
          (filter === "all" || isActive) &&
          query.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        );
      }),
    [collection.records, filter, search],
  );

  const openUpdate = (order: Order) => {
    setSelectedOrderId(order.id);
    setUpdateStatus(order.status === "CANCELLED" ? "QUOTED" : order.status);
    setUpdateDate(today());
    setCarrier(order.carrier ?? "");
    setTrackingNumber(order.trackingNumber ?? "");
    setNote("");
    setPhotos([]);
    setUpdateOpen(true);
  };

  const choosePhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (photos.length + files.length > 5) {
      toast.error("You can attach up to 5 photos per update.");
      input.value = "";
      return;
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Choose image files for shipment proof.");
      input.value = "";
      return;
    }
    try {
      const resized = await Promise.all(files.map(resizePhoto));
      setPhotos((current) => [...current, ...resized]);
    } catch {
      toast.error("Could not load one of those images. Try a JPG or PNG photo.");
    }
    input.value = "";
  };

  const saveUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const order = collection.records.find((item) => item.id === selectedOrderId);
    if (!order) {
      toast.error("Choose a shipment before saving an update.");
      return;
    }
    const update: ShipmentUpdate = {
      id: crypto.randomUUID(),
      date: updateDate,
      status: updateStatus,
      note: note.trim(),
      photos,
    };
    const latestUpdate = latestShipmentUpdate(order.trackingUpdates);
    collection.update(order.id, {
      ...(latestUpdate && latestUpdate.date > updateDate ? {} : { status: updateStatus }),
      ...(carrier.trim() ? { carrier: carrier.trim() } : {}),
      ...(trackingNumber.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
      trackingUpdates: [...(order.trackingUpdates ?? []), update],
    });
    setUpdateOpen(false);
    toast.success(`${order.code} shipment update saved.`);
  };

  const renderProgress = (order: Order) => {
    const currentLabel = statusMeta[order.status]?.label ?? order.status;
    const progress = shipmentProgress(order.status);
    return (
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs text-fg-subtle">Shipment progress</span>
          <span className="text-right text-xs font-medium text-fg-muted">{currentLabel}</span>
        </div>
        <div
          aria-label={`Shipment stage: ${currentLabel}`}
          className="grid grid-cols-8 gap-1"
          role="img"
        >
          {shipmentStages.map((stage, index) => (
            <span
              key={stage.status}
              title={stage.label}
              className={`h-1.5 min-w-0 rounded-full ${index <= progress ? "bg-accent" : "bg-bg-elev-2"}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderLatestUpdate = (order: Order) => {
    const latest = latestShipmentUpdate(order.trackingUpdates);
    if (!latest) return <p className="text-xs text-fg-subtle">No shipment updates yet.</p>;
    return (
      <div className="min-w-0 border-t border-border pt-3">
        <p className="text-xs text-fg-subtle">Latest update · {formatTrackingDate(latest.date)}</p>
        <p className="mt-1 break-words text-sm text-fg-muted">{latest.note}</p>
        {latest.photos.length ? (
          <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
            {latest.photos.map((photo, index) => (
              <a href={photo} target="_blank" rel="noreferrer" key={`${latest.id}-${index}`}>
                <img
                  alt={`${order.code} shipment proof ${index + 1}`}
                  className="h-14 w-14 rounded-md border border-border object-cover"
                  loading="lazy"
                  src={photo}
                />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Shipment tracking"
        subtitle="Follow every order from production through delivery in Kenya."
        actions={
          <Button
            onClick={() => {
              const firstOrder = activeOrders[0] ?? collection.records[0];
              if (firstOrder) openUpdate(firstOrder);
            }}
            type="button"
          >
            <Plus size={16} /> Add update
          </Button>
        }
      />
      <div className="mb-5 flex gap-2 border-b border-border">
        <span className="inline-flex min-h-11 items-center border-b-2 border-primary px-3 text-sm text-fg">
          Shipments
        </span>
        <button
          className="min-h-11 border-b-2 border-transparent px-3 text-sm text-fg-muted hover:text-fg"
          onClick={onPartners}
          type="button"
        >
          Partners
        </button>
      </div>
      <div className="mb-5 grid min-w-0 gap-3 sm:grid-cols-3">
        <Stat
          label="Active shipments"
          value={String(activeOrders.length)}
          icon={<PackageCheck size={17} />}
        />
        <Stat
          label="In transit / customs"
          value={String(inTransitCount)}
          tone="primary"
          icon={<Ship size={17} />}
        />
        <Stat
          label="Delivered"
          value={String(deliveredCount)}
          tone="success"
          icon={<Truck size={17} />}
        />
      </div>
      <div className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
        <Input
          aria-label="Search shipments"
          placeholder="Search order, client, carrier, or tracking number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Shipment filter"
          className="min-h-11 min-w-0 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
          value={filter}
          onChange={(event) => setFilter(event.target.value as "active" | "all")}
        >
          <option value="active">Active shipments</option>
          <option value="all">All shipments</option>
        </select>
      </div>
      {!collection.hydrated ? (
        <Card className="!p-2">
          <TableSkeleton rows={5} />
        </Card>
      ) : visibleOrders.length === 0 ? (
        <Card className="!p-0">
          <EmptyState
            description="Try another search or include delivered shipments to find the order you need."
            icon={PackageCheck}
            title="No shipments match this view"
            action={
              <Button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                type="button"
                variant="glass"
              >
                Show all shipments
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="hidden min-w-0 md:block">
            <Table
              head={["Order / client", "Stage", "Carrier / tracking", "ETA", "Latest update", ""]}
            >
              {visibleOrders.map((order) => {
                const latest = latestShipmentUpdate(order.trackingUpdates);
                return (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="max-w-56 px-4 py-3">
                      <a
                        className="font-mono text-accent hover:underline"
                        href={`/app/orders/${order.id}`}
                      >
                        {order.code}
                      </a>
                      <p className="mt-1 break-words text-xs text-fg-muted">{order.client}</p>
                    </td>
                    <td className="min-w-40 px-4 py-3">
                      <Badge tone={statusMeta[order.status].tone}>
                        {statusMeta[order.status].label}
                      </Badge>
                      <div className="mt-2">{renderProgress(order)}</div>
                    </td>
                    <td className="max-w-44 px-4 py-3 text-sm">
                      <p className="break-words">{order.carrier ?? "Carrier not assigned"}</p>
                      <p className="mt-1 break-all font-mono text-xs text-fg-muted">
                        {order.trackingNumber ?? "No tracking ref"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.eta}</td>
                    <td className="max-w-56 px-4 py-3 text-xs text-fg-muted">
                      {latest
                        ? `${formatTrackingDate(latest.date)} · ${latest.note}`
                        : "No updates yet"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        aria-label={`Update ${order.code}`}
                        className="px-2"
                        onClick={() => openUpdate(order)}
                        title="Add shipment update"
                        type="button"
                        variant="ghost"
                      >
                        <Plus size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </div>
          <div className="grid min-w-0 gap-3 md:hidden">
            {visibleOrders.map((order) => (
              <Card key={order.id} className="min-w-0 !p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      className="font-mono text-sm text-accent hover:underline"
                      href={`/app/orders/${order.id}`}
                    >
                      {order.code}
                    </a>
                    <p className="mt-1 break-words text-sm text-fg-muted">{order.client}</p>
                  </div>
                  <Badge tone={statusMeta[order.status].tone}>
                    {statusMeta[order.status].label}
                  </Badge>
                </div>
                <p className="mt-3 break-words text-sm font-medium">{order.product}</p>
                <div className="mt-3 grid min-w-0 grid-cols-2 gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="text-fg-subtle">Carrier</p>
                    <p className="mt-1 break-words text-fg-muted">
                      {order.carrier ?? "Not assigned"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-fg-subtle">Tracking reference</p>
                    <p className="mt-1 break-all font-mono text-fg-muted">
                      {order.trackingNumber ?? "Not set"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-fg-subtle">Route</p>
                    <p className="mt-1 break-words text-fg-muted">{order.route}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-fg-subtle">ETA</p>
                    <p className="mt-1 text-fg-muted">{order.eta}</p>
                  </div>
                </div>
                <div className="mt-4">{renderProgress(order)}</div>
                <div className="mt-4">{renderLatestUpdate(order)}</div>
                <div className="mt-3 flex justify-end">
                  <Button onClick={() => openUpdate(order)} type="button" variant="glass">
                    <Plus size={15} /> Add update
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <form onSubmit={saveUpdate}>
            <DialogHeader>
              <DialogTitle>Add shipment update</DialogTitle>
              <DialogDescription>
                This update appears in the operations tracker and the customer portal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <label className="block text-sm font-medium">
                Shipment
                <select
                  className="mt-1.5 min-h-11 w-full min-w-0 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                  required
                  value={selectedOrderId}
                  onChange={(event) => {
                    const order = collection.records.find((item) => item.id === event.target.value);
                    if (order) openUpdate(order);
                  }}
                >
                  {collection.records.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.code} · {order.client}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Stage
                  <select
                    className="mt-1.5 min-h-11 w-full min-w-0 rounded-md border border-border-strong bg-bg-elev-1 px-3 text-sm"
                    value={updateStatus}
                    onChange={(event) => setUpdateStatus(event.target.value as OrderStatus)}
                  >
                    {stageOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusMeta[status].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Update date
                  <Input
                    className="mt-1.5"
                    type="date"
                    value={updateDate}
                    onChange={(event) => setUpdateDate(event.target.value)}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Carrier
                  <Input
                    className="mt-1.5"
                    list="shipment-carriers"
                    placeholder="e.g. Sino-Africa Freight"
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                  />
                  <datalist id="shipment-carriers">
                    {partnerCollection.records.map((partner) => (
                      <option key={partner.id} value={partner.name} />
                    ))}
                  </datalist>
                </label>
                <label className="block text-sm font-medium">
                  Tracking reference
                  <Input
                    className="mt-1.5"
                    placeholder="Container, waybill, or airway bill"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Client-visible update
                <Textarea
                  className="mt-1.5 min-h-24"
                  placeholder="Share a clear progress update for the client"
                  required
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              <div>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-accent">
                  <Camera size={16} /> Add photo proof
                  <input
                    accept="image/*"
                    className="sr-only"
                    multiple
                    onChange={(event) => void choosePhotos(event)}
                    type="file"
                  />
                </label>
                <p className="mt-1 text-xs text-fg-subtle">
                  Up to 5 photos, resized for mobile upload.
                </p>
                {photos.length ? (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {photos.map((photo, index) => (
                      <button
                        aria-label={`Remove photo ${index + 1}`}
                        className="overflow-hidden rounded-md border border-border"
                        key={photo}
                        onClick={() =>
                          setPhotos((current) => current.filter((_, item) => item !== index))
                        }
                        type="button"
                      >
                        <img
                          alt={`Selected proof ${index + 1}`}
                          className="aspect-square w-full object-cover"
                          src={photo}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setUpdateOpen(false)} type="button" variant="glass">
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle2 size={15} /> Save update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
