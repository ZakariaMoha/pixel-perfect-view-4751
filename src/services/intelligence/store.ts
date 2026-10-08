/**
 * Intelligence Core — in-memory tenant-scoped store (MVP stand-in for the database).
 * Holds knowledge, scores, draft quotes, RFQ batches, queue and audit log,
 * with a subscribe API for live UI updates. Swap for Lovable Cloud tables later.
 */
import type {
  DraftQuote,
  LogisticsScore,
  MessageQueue,
  ProductKnowledge,
  RfqBatch,
  SupplierScore,
} from "@/domain/intelligence/schemas";

export const TENANT = "tenant_tradehub";

export type AuditEntry = { id: string; at: string; actor: string; action: string; entity: string; entityId: string };
export type AdminNotification = { id: string; at: string; text: string; entityId: string };

type State = {
  knowledge: ProductKnowledge[];
  suppliers: SupplierScore[];
  logistics: LogisticsScore[];
  quotes: DraftQuote[];
  rfqs: RfqBatch[];
  queue: MessageQueue[];
  audit: AuditEntry[];
  notifications: AdminNotification[];
};

/* Deterministic clock during seeding so server and browser render the same data. */
const SEED_BASE = Date.parse("2026-10-08T08:00:00Z");
let seedTick = 0;
let seeding = true;
export function now(): string {
  if (seeding) return new Date(SEED_BASE + seedTick++ * 60_000).toISOString();
  return new Date().toISOString();
}
export function endSeeding() {
  seeding = false;
}

const counters: Record<string, number> = {};
export function nextId(prefix: string): string {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}_${String(counters[prefix]).padStart(4, "0")}`;
}

const t0 = "2026-09-01T00:00:00.000Z";
function pk(p: Partial<ProductKnowledge> & Pick<ProductKnowledge, "id" | "category">): ProductKnowledge {
  return {
    tenantId: TENANT,
    subCategory: null,
    chineseKeywords: [],
    englishKeywords: [],
    hsCode: null,
    avgUnitPriceCny: null,
    avgMoq: null,
    avgLeadTimeDays: null,
    avgWeightKg: null,
    avgCbmPerPiece: null,
    preferredSupplierId: null,
    orderCount: 0,
    lastOrderedAt: null,
    lastKnownPrice: null,
    lastPriceUpdatedAt: null,
    confidenceScore: 0.9,
    needsReview: false,
    createdAt: t0,
    updatedAt: t0,
    ...p,
  };
}

function sup(
  supplierId: string,
  supplierName: string,
  category: string,
  passRate: number,
  onTime: number,
  orders: number,
  price: number,
  comm: number,
  revenue: string,
): SupplierScore {
  const repeat = Math.min(10, orders / 3);
  const overall = +(passRate / 10 * 0.3 + onTime / 10 * 0.25 + price * 0.2 + comm * 0.1 + repeat * 0.15).toFixed(2);
  return {
    id: `ss_${supplierId}`,
    supplierId,
    supplierName,
    category,
    tenantId: TENANT,
    qualityScore: passRate / 10,
    onTimeScore: onTime / 10,
    priceScore: price,
    communicationScore: comm,
    repeatScore: +repeat.toFixed(1),
    overallScore: overall,
    totalOrders: orders,
    totalRevenueCny: revenue,
    avgResponseHours: 11 - comm,
    qcPassRate: passRate / 100,
    onTimeRate: onTime / 100,
    updatedAt: t0,
  };
}

function lg(
  partnerId: string,
  partnerName: string,
  mode: LogisticsScore["mode"],
  perKg: string,
  perCbm: string,
  reliability: number,
  shipments: number,
  transit: number,
  clients: string[],
): LogisticsScore {
  const rel = reliability / 10;
  const rate = mode === "AIR" ? 4 : mode === "SEA_FCL" ? 9 : 7.5;
  const route = Math.min(10, shipments / 6);
  const hist = Math.min(10, clients.length * 2.5);
  return {
    id: `ls_${partnerId}`,
    partnerId,
    partnerName,
    mode,
    ratePerKgUsd: perKg,
    ratePerCbmUsd: perCbm,
    tenantId: TENANT,
    reliabilityScore: rel,
    rateScore: rate,
    routeScore: +route.toFixed(1),
    clientHistoryScore: hist,
    overallScore: +(rel * 0.35 + rate * 0.3 + route * 0.15 + hist * 0.2).toFixed(2),
    totalShipments: shipments,
    onTimeRate: reliability / 100,
    avgTransitDays: transit,
    clientsServed: clients,
    routesUsed: ["Guangzhou → Mombasa", "Shenzhen → Nairobi"],
    updatedAt: t0,
  };
}

export const state: State = {
  knowledge: [
    pk({ id: "pk_0001", category: "Electronics", subCategory: "Bluetooth Speaker", chineseKeywords: ["蓝牙音箱", "便携"], englishKeywords: ["bluetooth", "speaker", "portable", "wireless"], hsCode: "8518.22", avgUnitPriceCny: "68.00", avgMoq: 300, avgLeadTimeDays: 15, avgWeightKg: "0.650", avgCbmPerPiece: "0.0030", preferredSupplierId: "sup_1", orderCount: 14, lastOrderedAt: "2026-09-20T00:00:00.000Z", lastKnownPrice: "68.00", lastPriceUpdatedAt: "2026-09-20T00:00:00.000Z", confidenceScore: 0.97 }),
    pk({ id: "pk_0002", category: "Electronics", subCategory: "Splicing Kit", chineseKeywords: ["接线端子", "快速接头"], englishKeywords: ["splicing", "connector", "wire", "kit"], hsCode: "8536.90", avgUnitPriceCny: "16.50", avgMoq: 500, avgLeadTimeDays: 15, avgWeightKg: "0.180", avgCbmPerPiece: "0.0008", preferredSupplierId: "sup_5", orderCount: 12, lastOrderedAt: "2026-09-28T00:00:00.000Z", lastKnownPrice: "16.50", lastPriceUpdatedAt: "2026-09-28T00:00:00.000Z", confidenceScore: 0.98 }),
    pk({ id: "pk_0003", category: "Bags", subCategory: "Backpack", chineseKeywords: ["双肩包", "书包"], englishKeywords: ["backpack", "school", "bag", "nylon"], hsCode: "4202.92", avgUnitPriceCny: "32.00", avgMoq: 200, avgLeadTimeDays: 18, avgWeightKg: "0.550", avgCbmPerPiece: "0.0060", preferredSupplierId: "sup_6", orderCount: 6, lastOrderedAt: "2026-07-02T00:00:00.000Z", lastKnownPrice: "31.00", lastPriceUpdatedAt: "2026-07-02T00:00:00.000Z", confidenceScore: 0.88 }),
    pk({ id: "pk_0004", category: "Hardware", subCategory: "Door Hinge", chineseKeywords: ["合页", "不锈钢"], englishKeywords: ["hinge", "door", "stainless", "steel"], hsCode: "8302.10", avgUnitPriceCny: "4.20", avgMoq: 2000, avgLeadTimeDays: 12, avgWeightKg: "0.120", avgCbmPerPiece: "0.0002", preferredSupplierId: "sup_7", orderCount: 9, lastOrderedAt: "2026-09-10T00:00:00.000Z", lastKnownPrice: "4.20", lastPriceUpdatedAt: "2026-08-01T00:00:00.000Z", confidenceScore: 0.95 }),
    pk({ id: "pk_0005", category: "Home & Kitchen", subCategory: "Blender", chineseKeywords: ["搅拌机", "料理机"], englishKeywords: ["blender", "kitchen", "mixer"], hsCode: "8509.40", avgUnitPriceCny: "95.00", avgMoq: 100, avgLeadTimeDays: 20, avgWeightKg: "2.400", avgCbmPerPiece: "0.0180", preferredSupplierId: "sup_2", orderCount: 5, lastOrderedAt: "2026-06-15T00:00:00.000Z", lastKnownPrice: "92.00", lastPriceUpdatedAt: "2026-06-15T00:00:00.000Z", confidenceScore: 0.85 }),
    pk({ id: "pk_0006", category: "Beauty", subCategory: "Hair Extensions", chineseKeywords: ["假发", "接发"], englishKeywords: ["hair", "extension", "wig", "human"], hsCode: "6704.20", avgUnitPriceCny: "120.00", avgMoq: 50, avgLeadTimeDays: 10, avgWeightKg: "0.150", avgCbmPerPiece: "0.0010", preferredSupplierId: "sup_4", orderCount: 11, lastOrderedAt: "2026-09-25T00:00:00.000Z", lastKnownPrice: "120.00", lastPriceUpdatedAt: "2026-09-25T00:00:00.000Z", confidenceScore: 0.96 }),
  ],
  suppliers: [
    sup("sup_1", "Shenzhen AudioTech", "Electronics", 98, 95, 31, 8.0, 9.0, "412000.00"),
    sup("sup_2", "Guangdong KitchenPro", "Home & Kitchen", 94, 89, 22, 7.5, 8.0, "268000.00"),
    sup("sup_3", "Hebei AutoLine", "Auto Parts", 91, 84, 18, 8.5, 7.0, "190500.00"),
    sup("sup_4", "Xuchang HairCo", "Beauty", 97, 92, 15, 7.0, 8.5, "176000.00"),
    sup("sup_5", "GZ Electrical Co.", "Electronics", 95, 90, 12, 9.0, 8.0, "98000.00"),
    sup("sup_6", "Baigou BagWorks", "Bags", 92, 88, 9, 8.5, 7.5, "64000.00"),
    sup("sup_7", "Yongkang Hardware", "Hardware", 93, 91, 14, 9.0, 7.0, "71000.00"),
    sup("sup_8", "Ningbo Volt Electronics", "Electronics", 89, 86, 4, 9.5, 6.5, "22000.00"),
  ],
  logistics: [
    lg("lp_1", "Sino-Africa Freight", "SEA_LCL", "3.10", "148.00", 94, 63, 35, ["Amani Electronics", "Nairobi Home Depot"]),
    lg("lp_2", "Eagle Air Cargo", "AIR", "7.40", "0.00", 97, 41, 7, ["Westlands Beauty Supply"]),
    lg("lp_3", "Mombasa Line Logistics", "SEA_FCL", "2.20", "112.00", 89, 28, 32, ["Coast Hardware Ltd"]),
  ],
  quotes: [],
  rfqs: [],
  queue: [],
  audit: [],
  notifications: [],
};

/* ---------- subscriptions ---------- */
const listeners = new Set<() => void>();
let version = 0;
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function getVersion() {
  return version;
}
/** Notify subscribers after a mutation. */
export function commit() {
  version++;
  listeners.forEach((l) => l());
}

/** Append an audit entry (every mutation is logged). */
export function audit(actor: string, action: string, entity: string, entityId: string) {
  state.audit.unshift({ id: nextId("al"), at: now(), actor, action, entity, entityId });
}

export function forTenant<T extends { tenantId: string }>(rows: T[], tenantId: string): T[] {
  return rows.filter((r) => r.tenantId === tenantId);
}
