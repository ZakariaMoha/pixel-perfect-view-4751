import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/kit";
import { FX, kes, orders, statusMeta, usd, type OrderStatus } from "@/lib/demo-data";
import {
  formatTrackingDate,
  latestShipmentUpdateForStatus,
  shipmentProgress,
  shipmentStages,
} from "@/lib/shipment-tracking";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/orders/$id")({
  notFoundComponent: () => <p className="text-muted-foreground">That order does not exist.</p>,
  component: OrderDetail,
});

const stageProgression: OrderStatus[] = [
  "QUOTED",
  "DEPOSIT_PAID",
  "PRODUCTION",
  "QC",
  "WAREHOUSE",
  "IN_TRANSIT",
  "CUSTOMS",
  "DELIVERED",
];

function OrderDetail() {
  const { id } = Route.useParams();
  const collection = usePersistentList("orders", orders);
  const o = collection.records.find((order) => order.id === id);
  if (!o) return <p className="text-muted-foreground">That order does not exist.</p>;
  const stageIndex = stageProgression.indexOf(o.status);
  const trackingIndex = shipmentProgress(o.status);
  const inspectionUpdate = latestShipmentUpdateForStatus(o.trackingUpdates, "QC");
  const canAdvance = stageIndex >= 0 && stageIndex < stageProgression.length - 1;

  return (
    <>
      <Link
        to="/app/orders"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} /> All orders
      </Link>
      <PageHeader
        title={o.code}
        subtitle={`${o.client} · ${o.route}`}
        actions={
          <>
            <Badge tone={statusMeta[o.status].tone}>{statusMeta[o.status].label}</Badge>
            <Link
              to="/app/inbox"
              className="inline-flex items-center justify-center gap-2 rounded-md glass px-4 py-2.5 text-sm font-semibold text-foreground hover:border-border-strong"
            >
              Message client
            </Link>
            <Button
              disabled={!canAdvance}
              onClick={() => {
                const nextStage = stageProgression[stageIndex + 1];
                if (!nextStage) return;
                collection.update(o.id, {
                  status: nextStage,
                  trackingUpdates: [
                    ...(o.trackingUpdates ?? []),
                    {
                      id: crypto.randomUUID(),
                      date: new Date().toISOString().slice(0, 10),
                      status: nextStage,
                      note: `Order status updated to ${statusMeta[nextStage].label}.`,
                      photos: [],
                    },
                  ],
                });
              }}
            >
              {canAdvance ? "Advance stage" : "Order complete"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle>Order summary</SectionTitle>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Product", o.product],
                ["Category", o.category],
                ["Agent", o.agent],
                ["Supplier", o.supplier],
                ["Created", o.createdAt],
                ["ETA", o.eta],
                ["Carrier", o.carrier ?? "Not assigned"],
                ["Tracking reference", o.trackingNumber ?? "Not set"],
                ["Weight", `${o.weightKg.toLocaleString()} kg`],
                ["Volume", `${o.cbm} CBM`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] uppercase tracking-[0.08em] text-subtle">{k}</dt>
                  <dd className="mt-1 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <SectionTitle>Shipment timeline</SectionTitle>
            <ol className="relative space-y-5 pl-6">
              <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
              {shipmentStages.map((stage, index) => {
                const stageUpdate = latestShipmentUpdateForStatus(o.trackingUpdates, stage.status);
                const milestoneDone = index <= trackingIndex;
                return (
                  <li key={stage.status} className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 ${milestoneDone ? "text-success" : "text-subtle"}`}
                    >
                      {milestoneDone ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{stage.label}</p>
                      {stageUpdate ? (
                        <span className="font-mono text-xs text-subtle">
                          {formatTrackingDate(stageUpdate.date)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 break-words text-sm text-muted-foreground">
                      {stageUpdate?.note ??
                        (index === trackingIndex
                          ? "Current stage. Add a Logistics update for the client."
                          : "No update recorded yet.")}
                    </p>
                    {stageUpdate?.photos.length ? (
                      <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
                        {stageUpdate.photos.map((photo: string, photoIndex: number) => (
                          <a
                            href={photo}
                            key={`${stageUpdate.id}-${photoIndex}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <img
                              alt={`${o.code} shipment proof ${photoIndex + 1}`}
                              className="h-16 w-16 rounded-md border border-border object-cover"
                              loading="lazy"
                              src={photo}
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Financials</SectionTitle>
            <div className="space-y-3 text-sm">
              {[
                ["Order value", usd(o.valueUsd)],
                ["In KES (locked)", kes(o.valueUsd)],
                ["Net profit", usd(o.profitUsd)],
                ["Margin", `${((o.profitUsd / o.valueUsd) * 100).toFixed(1)}%`],
                ["Freight commission", usd(Math.round(o.valueUsd * 0.04))],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-border pb-2.5 last:border-0"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-subtle">
              FX locked at CNY {(1 / FX.cnyToUsd).toFixed(2)}/USD · KES {FX.usdToKes}/USD
            </p>
          </Card>

          <Card>
            <SectionTitle>Inspection</SectionTitle>
            {inspectionUpdate ? (
              <>
                <Badge tone="success">
                  Inspection update · {formatTrackingDate(inspectionUpdate.date)}
                </Badge>
                <p className="mt-3 break-words text-sm text-muted-foreground">
                  {inspectionUpdate.note}
                </p>
                {inspectionUpdate.photos.length ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {inspectionUpdate.photos.map((photo: string, index: number) => (
                      <a
                        href={photo}
                        key={`${inspectionUpdate.id}-${index}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <img
                          alt={`${o.code} inspection proof ${index + 1}`}
                          className="aspect-square w-full rounded-md border border-border object-cover"
                          loading="lazy"
                          src={photo}
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  No inspection update has been recorded for this order.
                </p>
                <Link
                  className="mt-3 inline-flex min-h-11 items-center text-sm text-accent"
                  to="/app/logistics"
                >
                  Add inspection update
                </Link>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
