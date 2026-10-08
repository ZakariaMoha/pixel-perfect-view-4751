import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const logisticsScoreTransitions = {
  ACTIVE: ["REVIEW_REQUIRED", "ARCHIVED"],
  REVIEW_REQUIRED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
} as const satisfies TransitionMap<"ACTIVE" | "REVIEW_REQUIRED" | "ARCHIVED">;

export type LogisticsScoreStatus = keyof typeof logisticsScoreTransitions;

export const LogisticsScoreSchema = z
  .object({
    id: z.string().min(1),
    partnerId: z.string().min(1),
    tenantId: z.string().min(1),
    reliabilityScore: z.number().min(0).max(10).default(0),
    rateScore: z.number().min(0).max(10).default(0),
    routeScore: z.number().min(0).max(10).default(0),
    clientHistoryScore: z.number().min(0).max(10).default(0),
    overallScore: z.number().min(0).max(10).default(0),
    totalShipments: z.number().int().nonnegative().default(0),
    onTimeRate: z.number().min(0).max(1).nullable().default(null),
    avgTransitDays: z.number().nonnegative().nullable().default(null),
    clientsServed: z.array(z.string().min(1)).default([]),
    routesUsed: z.array(z.string().min(1)).default([]),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type LogisticsScore = z.infer<typeof LogisticsScoreSchema>;

export function canTransitionLogisticsScore(
  from: LogisticsScoreStatus,
  to: LogisticsScoreStatus,
): boolean {
  return canTransition(from, to, logisticsScoreTransitions);
}

export function isLogisticsPartnerCompetitive(score: Pick<LogisticsScore, "overallScore">) {
  return score.overallScore >= 7;
}
