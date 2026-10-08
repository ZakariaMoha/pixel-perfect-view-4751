import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const RfqBatchStatusSchema = z.enum([
  "SENT",
  "AWAITING_REPLIES",
  "PARTIAL",
  "COMPLETE",
  "TIMEOUT",
]);

export const rfqBatchTransitions: TransitionMap<RfqBatchStatus> = {
  SENT: ["AWAITING_REPLIES", "TIMEOUT"],
  AWAITING_REPLIES: ["PARTIAL", "COMPLETE", "TIMEOUT"],
  PARTIAL: ["COMPLETE", "TIMEOUT"],
  COMPLETE: [],
  TIMEOUT: [],
};

export const RfqBatchSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    sourcingRequestId: z.string().min(1),
    primarySupplierId: z.string().nullable().optional(),
    primaryResponseAt: z.string().datetime({ offset: true }).nullable().optional(),
    primaryPriceCny: z.string().nullable().default(null),
    backupSupplierIds: z.array(z.string().min(1)).default([]),
    backupResponses: z
      .array(
        z.object({
          supplierId: z.string().min(1),
          price: z.string().nullable().optional(),
          leadTimeDays: z.number().int().nonnegative().nullable().optional(),
        }),
      )
      .default([]),
    status: RfqBatchStatusSchema.default("SENT"),
    deadline: z.string().datetime({ offset: true }),
    selectedSupplierId: z.string().nullable().optional(),
    selectionReason: z.string().nullable().optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type RfqBatch = z.infer<typeof RfqBatchSchema>;
export type RfqBatchStatus = z.infer<typeof RfqBatchStatusSchema>;

export function canTransitionRfqBatch(from: RfqBatchStatus, to: RfqBatchStatus): boolean {
  return canTransition(from, to, rfqBatchTransitions);
}

export function isRfqBatchReadyForDecision(batch: Pick<RfqBatch, "status" | "primarySupplierId">) {
  return batch.status === "AWAITING_REPLIES" || batch.status === "PARTIAL";
}
