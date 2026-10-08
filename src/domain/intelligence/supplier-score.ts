import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const supplierScoreTransitions = {
  ACTIVE: ["REVIEW_REQUIRED", "ARCHIVED"],
  REVIEW_REQUIRED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
} as const satisfies TransitionMap<"ACTIVE" | "REVIEW_REQUIRED" | "ARCHIVED">;

export type SupplierScoreStatus = keyof typeof supplierScoreTransitions;

export const SupplierScoreSchema = z
  .object({
    id: z.string().min(1),
    supplierId: z.string().min(1),
    tenantId: z.string().min(1),
    qualityScore: z.number().min(0).max(10).default(0),
    onTimeScore: z.number().min(0).max(10).default(0),
    priceScore: z.number().min(0).max(10).default(0),
    communicationScore: z.number().min(0).max(10).default(0),
    repeatScore: z.number().min(0).max(10).default(0),
    overallScore: z.number().min(0).max(10).default(0),
    totalOrders: z.number().int().nonnegative().default(0),
    totalRevenueCny: z.string().default("0"),
    avgResponseHours: z.number().nonnegative().nullable().default(null),
    qcPassRate: z.number().min(0).max(1).nullable().default(null),
    onTimeRate: z.number().min(0).max(1).nullable().default(null),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type SupplierScore = z.infer<typeof SupplierScoreSchema>;

export function canTransitionSupplierScore(
  from: SupplierScoreStatus,
  to: SupplierScoreStatus,
): boolean {
  return canTransition(from, to, supplierScoreTransitions);
}

export function calculateSupplierOverallScore(
  score: Pick<
    SupplierScore,
    "qualityScore" | "onTimeScore" | "priceScore" | "communicationScore" | "repeatScore"
  >,
): number {
  const total =
    score.qualityScore +
    score.onTimeScore +
    score.priceScore +
    score.communicationScore +
    score.repeatScore;

  return Number((total / 5).toFixed(2));
}
