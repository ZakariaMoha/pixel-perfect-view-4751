import { z } from "zod";

export const VisionDimensionsSchema = z
  .object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    unit: z.enum(["mm", "cm", "m", "in"]).default("cm"),
  })
  .strict();

export const VisionResultSchema = z
  .object({
    category: z.string().min(1),
    subCategory: z.string().optional(),
    material: z.string().optional(),
    colors: z.array(z.string().min(1)).default([]),
    chineseKeywords: z.array(z.string().min(1)).default([]),
    englishKeywords: z.array(z.string().min(1)).default([]),
    hsCode: z.string().optional(),
    estimatedDimensions: VisionDimensionsSchema.optional(),
    estimatedWeightKg: z.number().nonnegative().optional(),
    confidence: z.number().min(0).max(1).default(0.8),
  })
  .strict();

export type VisionDimensions = z.infer<typeof VisionDimensionsSchema>;
export type VisionResult = z.infer<typeof VisionResultSchema>;
