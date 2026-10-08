import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const productKnowledgeTransitions = {
  ACTIVE: ["REVIEW_REQUIRED", "ARCHIVED"],
  REVIEW_REQUIRED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
} as const satisfies TransitionMap<"ACTIVE" | "REVIEW_REQUIRED" | "ARCHIVED">;

export type ProductKnowledgeStatus = keyof typeof productKnowledgeTransitions;

export const ProductKnowledgeSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    category: z.string().min(1),
    subCategory: z.string().nullable().optional(),
    chineseKeywords: z.array(z.string().min(1)).default([]),
    englishKeywords: z.array(z.string().min(1)).default([]),
    hsCode: z.string().nullable().optional(),
    avgUnitPriceCny: z.string().nullable().default(null),
    avgMoq: z.number().int().nonnegative().nullable().default(null),
    avgLeadTimeDays: z.number().int().nonnegative().nullable().default(null),
    avgWeightKg: z.string().nullable().default(null),
    avgCbmPerPiece: z.string().nullable().default(null),
    preferredSupplierId: z.string().nullable().optional(),
    orderCount: z.number().int().nonnegative().default(0),
    lastOrderedAt: z.string().datetime({ offset: true }).nullable().optional(),
    lastKnownPrice: z.string().nullable().default(null),
    lastPriceUpdatedAt: z.string().datetime({ offset: true }).nullable().optional(),
    confidenceScore: z.number().min(0).max(1).default(0),
    needsReview: z.boolean().default(false),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type ProductKnowledge = z.infer<typeof ProductKnowledgeSchema>;

export function canTransitionProductKnowledge(
  from: ProductKnowledgeStatus,
  to: ProductKnowledgeStatus,
): boolean {
  return canTransition(from, to, productKnowledgeTransitions);
}

export function createProductKnowledge(
  input: Omit<ProductKnowledge, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): ProductKnowledge {
  const timestamp = new Date().toISOString();

  return ProductKnowledgeSchema.parse({
    ...input,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  });
}

export function productNeedsReview(
  product: Pick<ProductKnowledge, "confidenceScore" | "needsReview">,
) {
  return product.needsReview || product.confidenceScore < 0.7;
}
