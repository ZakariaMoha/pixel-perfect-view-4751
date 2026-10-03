import type { OrderStatus, ShipmentUpdate } from "@/lib/demo-data";

export const shipmentStages: Array<{ status: OrderStatus; label: string }> = [
  { status: "QUOTED", label: "Order confirmed" },
  { status: "DEPOSIT_PAID", label: "Deposit received" },
  { status: "PRODUCTION", label: "Production" },
  { status: "QC", label: "Inspection" },
  { status: "WAREHOUSE", label: "China warehouse" },
  { status: "IN_TRANSIT", label: "International transit" },
  { status: "CUSTOMS", label: "Customs clearance" },
  { status: "DELIVERED", label: "Delivered in Kenya" },
];

export function shipmentProgress(status: OrderStatus) {
  return shipmentStages.findIndex((stage) => stage.status === status);
}

export function formatTrackingDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

export function latestShipmentUpdate(updates: readonly ShipmentUpdate[] = []) {
  return [...updates].sort((left, right) => right.date.localeCompare(left.date))[0];
}

export function latestShipmentUpdateForStatus(
  updates: readonly ShipmentUpdate[] = [],
  status: ShipmentUpdate["status"],
) {
  return [...updates]
    .filter((update) => update.status === status)
    .sort((left, right) => right.date.localeCompare(left.date))[0];
}
