import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(120, "Project name cannot exceed 120 characters"),
  description: z
    .string()
    .min(5, "Please provide a descriptive purpose for the threat modeling study"),
  owner: z
    .string()
    .min(2, "Project owner / lead name is required")
    .max(80),
  status: z
    .enum(["Planning", "In Assessment", "Under Review", "Approved", "Archived"])
    .default("In Assessment"),
  architectureVersion: z
    .string()
    .default("1.0.0")
    .transform((val) => val || "1.0.0"),
  environment: z
    .enum(["Production", "Staging", "Development", "Multi-Region Cloud"])
    .default("Production"),
  reviewDate: z.string().optional().nullable(),
  inScope: z.string().optional().nullable(),
  outOfScope: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
  openQuestions: z.string().optional().nullable(),
  stakeholders: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
