import { z } from "zod";

export const elementSchema = z.object({
  name: z
    .string()
    .min(2, "Component name must be at least 2 characters")
    .max(100),
  type: z.enum(["EXTERNAL_ENTITY", "PROCESS", "DATA_STORE", "TRUST_BOUNDARY"]),
  description: z.string().optional().nullable(),
  technology: z.string().optional().nullable(),
  trustZone: z.string().optional().nullable(),
  posX: z.number().default(100),
  posY: z.number().default(100),
});

export const elementUpdateSchema = elementSchema.partial();

export type ElementInput = z.infer<typeof elementSchema>;
export type ElementUpdateInput = z.infer<typeof elementUpdateSchema>;
