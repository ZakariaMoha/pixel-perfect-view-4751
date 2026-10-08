/**
 * Intelligence Core — domain models.
 * Zod schemas (strict), inferred types, status enums and transition guards
 * for ProductKnowledge, SupplierScore, LogisticsScore, DraftQuote,
 * MessageQueue and RfqBatch. Money is always a decimal string ("1234.56").
 */
import { z } from "zod";

/** Decimal money string with up to 4 fraction digits. Never a float. */
export const Decimal = z.string().regex(/^-?\d+(\.\d{1,4})?$/, "Expected decimal string");
const Id = z.string().min(1);
const Iso = z.string().datetime();
const Score = z.number().min(0).max(10);

export const ConfidenceTier = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type ConfidenceTier = z.infer<typeof ConfidenceTier>;

/** Map a 0–1 confidence to its tier (HIGH ≥0.95, MEDIUM 0.70–0.94, LOW <0.70). */
export function tierFor(confidence: number): ConfidenceTier {
  if (confidence >= 0.95) return "HIGH";
  if (confidence >= 0.7) return "MEDIUM";
  return "LOW";
}

export const ProductKnowledgeSchema = z
  .object({
    id: Id,
    tenantId: Id,
    category: z.string().min(1),
    subCategory: z.string().nullable(),
    chineseKeywords: z.array(z.string()),
    englishKeywords: z.array(z.string()),
    hsCode: z.string().nullable(),
    avgUnitPriceCny: Decimal.nullable(),
    avgMoq: z.number().int().nullable(),
    avgLeadTimeDays: z.number().int().nullable(),
    avgWeightKg: Decimal.nullable(),
    avgCbmPerPiece: Decimal.nullable(),
    preferredSupplierId: z.string().nullable(),
    orderCount: z.number().int().min(0),
    lastOrderedAt: Iso.nullable(),
    lastKnownPrice: Decimal.nullable(),
    lastPriceUpdatedAt: Iso.nullable(),
    confidenceScore: z.number().min(0).max(1),
    needsReview: z.boolean(),
    createdAt: Iso,
    updatedAt: Iso,
  })
  .strict();
export type ProductKnowledge = z.infer<typeof ProductKnowledgeSchema>;

export const SupplierScoreSchema = z
  .object({
    id: Id,
    supplierId: Id,
    supplierName: z.string(),
    category: z.string(),
    tenantId: Id,
    qualityScore: Score,
    onTimeScore: Score,
    priceScore: Score,
    communicationScore: Score,
    repeatScore: Score,
    overallScore: Score,
    totalOrders: z.number().int(),
    totalRevenueCny: Decimal,
    avgResponseHours: z.number().nullable(),
    qcPassRate: z.number().nullable(),
    onTimeRate: z.number().nullable(),
    updatedAt: Iso,
  })
  .strict();
export type SupplierScore = z.infer<typeof SupplierScoreSchema>;

export const LogisticsMode = z.enum(["SEA_LCL", "SEA_FCL", "AIR"]);
export type LogisticsMode = z.infer<typeof LogisticsMode>;

export const LogisticsScoreSchema = z
  .object({
    id: Id,
    partnerId: Id,
    partnerName: z.string(),
    mode: LogisticsMode,
    ratePerKgUsd: Decimal,
    ratePerCbmUsd: Decimal,
    tenantId: Id,
    reliabilityScore: Score,
    rateScore: Score,
    routeScore: Score,
    clientHistoryScore: Score,
    overallScore: Score,
    totalShipments: z.number().int(),
    onTimeRate: z.number().nullable(),
    avgTransitDays: z.number().nullable(),
    clientsServed: z.array(z.string()),
    routesUsed: z.array(z.string()),
    updatedAt: Iso,
  })
  .strict();
export type LogisticsScore = z.infer<typeof LogisticsScoreSchema>;

/* ---------------- DraftQuote ---------------- */
export const DraftQuoteStatus = z.enum([
  "DRAFT",
  "AGENT_REVIEW",
  "PRELIMINARY_SENT",
  "FINAL_PENDING",
  "APPROVED",
  "SENT",
  "REJECTED",
]);
export type DraftQuoteStatus = z.infer<typeof DraftQuoteStatus>;

const draftTransitions: Record<DraftQuoteStatus, DraftQuoteStatus[]> = {
  DRAFT: ["PRELIMINARY_SENT", "FINAL_PENDING", "APPROVED", "REJECTED"],
  AGENT_REVIEW: ["DRAFT", "REJECTED"],
  PRELIMINARY_SENT: ["FINAL_PENDING", "APPROVED", "REJECTED"],
  FINAL_PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["SENT"],
  SENT: [],
  REJECTED: [],
};

export const DraftQuoteSchema = z
  .object({
    id: Id,
    tenantId: Id,
    sourcingRequestId: Id,
    productKnowledgeId: z.string().nullable(),
    clientName: z.string(),
    clientOrders: z.number().int(),
    productLabel: z.string(),
    quantity: z.number().int().positive(),
    confidenceTier: ConfidenceTier,
    confidenceScore: z.number().min(0).max(1),
    recommendedSupplierId: z.string().nullable(),
    recommendedLogisticsId: z.string().nullable(),
    alternateSuppliers: z.array(z.string()),
    alternateLogistics: z.array(z.string()),
    unitPriceCny: Decimal,
    productCostCny: Decimal,
    productMarkup: Decimal,
    freightCostUsd: Decimal,
    freightMarkup: Decimal,
    serviceFee: Decimal,
    commissionUsd: Decimal,
    totalKes: Decimal,
    depositKes: Decimal,
    totalProfitKes: Decimal,
    marginPct: z.number(),
    leadTimeDays: z.number().int(),
    transitDays: z.number().int(),
    usdToCny: Decimal,
    usdToKes: Decimal,
    cnyToKes: Decimal,
    fxLockedAt: Iso,
    status: DraftQuoteStatus,
    preliminarySentAt: Iso.nullable(),
    finalSentAt: Iso.nullable(),
    approvedBy: z.string().nullable(),
    approvedAt: Iso.nullable(),
    adminNotes: z.string().nullable(),
    rejectionReason: z.string().nullable(),
    createdAt: Iso,
    updatedAt: Iso,
  })
  .strict();
export type DraftQuote = z.infer<typeof DraftQuoteSchema>;

/* ---------------- MessageQueue ---------------- */
export const MessageStatus = z.enum(["QUEUED", "APPROVED", "SENT", "DELIVERED", "FAILED", "CANCELLED"]);
export type MessageStatus = z.infer<typeof MessageStatus>;
export const Channel = z.enum(["WHATSAPP", "WECHAT", "EMAIL"]);
export type Channel = z.infer<typeof Channel>;
export const Priority = z.enum(["LOW", "NORMAL", "HIGH"]);

const messageTransitions: Record<MessageStatus, MessageStatus[]> = {
  QUEUED: ["APPROVED", "CANCELLED"],
  APPROVED: ["SENT", "CANCELLED", "QUEUED"],
  SENT: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["QUEUED", "CANCELLED"],
  CANCELLED: [],
};

export const MessageQueueSchema = z
  .object({
    id: Id,
    tenantId: Id,
    channel: Channel,
    direction: z.enum(["OUTBOUND", "INBOUND"]),
    recipientId: Id,
    recipientName: z.string(),
    recipientType: z.enum(["CLIENT", "SUPPLIER", "AGENT", "LOGISTICS"]),
    content: z.string().min(1),
    contentTranslated: z.string().nullable(),
    attachments: z.array(z.string()),
    relatedEntityType: z.string().nullable(),
    relatedEntityId: z.string().nullable(),
    status: MessageStatus,
    scheduledFor: Iso.nullable(),
    approvedBy: z.string().nullable(),
    approvedAt: Iso.nullable(),
    sentAt: Iso.nullable(),
    deliveredAt: Iso.nullable(),
    priority: Priority,
    attemptCount: z.number().int(),
    lastError: z.string().nullable(),
    createdAt: Iso,
    updatedAt: Iso,
  })
  .strict();
export type MessageQueue = z.infer<typeof MessageQueueSchema>;

/* ---------------- RfqBatch ---------------- */
export const RfqStatus = z.enum(["SENT", "PARTIAL", "COMPLETE", "SELECTED", "EXPIRED"]);
export type RfqStatus = z.infer<typeof RfqStatus>;

const rfqTransitions: Record<RfqStatus, RfqStatus[]> = {
  SENT: ["PARTIAL", "COMPLETE", "EXPIRED"],
  PARTIAL: ["COMPLETE", "EXPIRED", "SELECTED"],
  COMPLETE: ["SELECTED"],
  SELECTED: [],
  EXPIRED: [],
};

export const RfqBatchSchema = z
  .object({
    id: Id,
    tenantId: Id,
    sourcingRequestId: Id,
    primarySupplierId: z.string().nullable(),
    primaryResponseAt: Iso.nullable(),
    primaryPriceCny: Decimal.nullable(),
    backupSupplierIds: z.array(z.string()),
    backupResponses: z.array(z.object({ supplierId: z.string(), priceCny: Decimal, leadTimeDays: z.number().int() }).strict()),
    status: RfqStatus,
    deadline: Iso,
    selectedSupplierId: z.string().nullable(),
    selectionReason: z.string().nullable(),
    createdAt: Iso,
    updatedAt: Iso,
  })
  .strict();
export type RfqBatch = z.infer<typeof RfqBatchSchema>;

/** Transition guards. */
export const canTransition = {
  draftQuote: (from: DraftQuoteStatus, to: DraftQuoteStatus) => draftTransitions[from].includes(to),
  message: (from: MessageStatus, to: MessageStatus) => messageTransitions[from].includes(to),
  rfq: (from: RfqStatus, to: RfqStatus) => rfqTransitions[from].includes(to),
};
