import { z } from "zod";

export const flowSchema = z.object({
  name: z.string().min(2, "Flow name must be at least 2 characters").max(100),
  sourceElementId: z.string().min(1, "Source component is required"),
  targetElementId: z.string().min(1, "Target component is required"),
  protocol: z
    .string()
    .min(1, "Protocol / Channel is required")
    .default("HTTPS/REST"),
  dataCategory: z.string().optional().nullable(),
  authContext: z.string().optional().nullable(),
  crossesTrustBoundary: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export const flowUpdateSchema = flowSchema.partial();

export type FlowInput = z.infer<typeof flowSchema>;
export type FlowUpdateInput = z.infer<typeof flowUpdateSchema>;
