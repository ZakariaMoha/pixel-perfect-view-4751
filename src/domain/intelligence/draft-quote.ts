import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const DraftQuoteStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT",
  "REJECTED",
]);

export const draftQuoteTransitions: TransitionMap<DraftQuoteStatus> = {
  DRAFT: ["PENDING_APPROVAL", "REJECTED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: ["SENT"],
  SENT: [],
  REJECTED: ["DRAFT"],
};

export const DraftQuoteSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    sourcingRequestId: z.string().min(1),
    productKnowledgeId: z.string().nullable().optional(),
    confidenceTier: z.enum(["HIGH", "MEDIUM", "LOW"]),
    confidenceScore: z.number().min(0).max(1),
    recommendedSupplierId: z.string().nullable().optional(),
    recommendedLogisticsId: z.string().nullable().optional(),
    alternateSuppliers: z
      .array(z.object({ supplierId: z.string(), score: z.number() }))
      .default([]),
    alternateLogistics: z.array(z.object({ partnerId: z.string(), score: z.number() })).default([]),
    productCostCny: z.string().default("0"),
    productMarkup: z.string().default("0"),
    freightCostUsd: z.string().default("0"),
    freightMarkup: z.string().default("0"),
    serviceFee: z.string().default("0"),
    totalKes: z.string().default("0"),
    totalProfitKes: z.string().default("0"),
    marginPct: z.number().min(0).max(100).default(0),
    usdToCny: z.string().default("0"),
    usdToKes: z.string().default("0"),
    cnyToKes: z.string().default("0"),
    fxLockedAt: z.string().datetime({ offset: true }).nullable().optional(),
    status: DraftQuoteStatusSchema.default("DRAFT"),
    preliminarySentAt: z.string().datetime({ offset: true }).nullable().optional(),
    finalSentAt: z.string().datetime({ offset: true }).nullable().optional(),
    approvedBy: z.string().nullable().optional(),
    approvedAt: z.string().datetime({ offset: true }).nullable().optional(),
    adminNotes: z.string().nullable().optional(),
    rejectionReason: z.string().nullable().optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type DraftQuote = z.infer<typeof DraftQuoteSchema>;
export type DraftQuoteStatus = z.infer<typeof DraftQuoteStatusSchema>;

export function canTransitionDraftQuote(from: DraftQuoteStatus, to: DraftQuoteStatus): boolean {
  return canTransition(from, to, draftQuoteTransitions);
}
