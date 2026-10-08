import { z } from "zod";

import { canTransition, type TransitionMap } from "./transitions";

export const MessageChannelSchema = z.enum(["WHATSAPP", "WECHAT"]);
export const MessageDirectionSchema = z.enum(["INBOUND", "OUTBOUND"]);
export const MessageQueueStatusSchema = z.enum([
  "QUEUED",
  "APPROVED",
  "SENT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);
export const MessagePrioritySchema = z.enum(["LOW", "NORMAL", "HIGH"]);

export const messageQueueTransitions: TransitionMap<MessageQueueStatus> = {
  QUEUED: ["APPROVED", "CANCELLED"],
  APPROVED: ["SENT", "CANCELLED"],
  SENT: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["QUEUED"],
  CANCELLED: [],
};

export const MessageQueueSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    channel: MessageChannelSchema,
    direction: MessageDirectionSchema,
    recipientId: z.string().min(1),
    recipientType: z.enum(["CLIENT", "SUPPLIER", "AGENT"]),
    content: z.string().min(1),
    contentTranslated: z.string().nullable().optional(),
    attachments: z.array(z.string().url()).default([]),
    relatedEntityType: z.string().nullable().optional(),
    relatedEntityId: z.string().nullable().optional(),
    status: MessageQueueStatusSchema.default("QUEUED"),
    scheduledFor: z.string().datetime({ offset: true }).nullable().optional(),
    approvedBy: z.string().nullable().optional(),
    approvedAt: z.string().datetime({ offset: true }).nullable().optional(),
    sentAt: z.string().datetime({ offset: true }).nullable().optional(),
    deliveredAt: z.string().datetime({ offset: true }).nullable().optional(),
    priority: MessagePrioritySchema.default("NORMAL"),
    attemptCount: z.number().int().nonnegative().default(0),
    lastError: z.string().nullable().optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type MessageQueue = z.infer<typeof MessageQueueSchema>;
export type MessageQueueStatus = z.infer<typeof MessageQueueStatusSchema>;
export type MessagePriority = z.infer<typeof MessagePrioritySchema>;

export function canTransitionMessageQueue(
  from: MessageQueueStatus,
  to: MessageQueueStatus,
): boolean {
  return canTransition(from, to, messageQueueTransitions);
}

export function canApproveMessage(status: MessageQueueStatus) {
  return status === "QUEUED";
}

export function canSendMessage(status: MessageQueueStatus) {
  return status === "APPROVED" || status === "QUEUED";
}
