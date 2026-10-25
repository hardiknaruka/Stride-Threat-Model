import { z } from "zod";

export const baseThreatSchema = z.object({
  threatId: z.string().optional(),
  title: z
    .string()
    .min(3, "Threat title must be at least 3 characters")
    .max(150),
  scenario: z
    .string()
    .min(10, "Please provide a detailed description of the threat scenario"),
  strideCategories: z
    .array(
      z.enum([
        "SPOOFING",
        "TAMPERING",
        "REPUDIATION",
        "INFORMATION_DISCLOSURE",
        "DENIAL_OF_SERVICE",
        "ELEVATION_OF_PRIVILEGE",
      ])
    )
    .min(1, "Select at least one applicable STRIDE category"),
  preconditions: z.string().optional().nullable(),
  confidentialityImpact: z.string().optional().nullable(),
  integrityImpact: z.string().optional().nullable(),
  availabilityImpact: z.string().optional().nullable(),
  privacyImpact: z.string().optional().nullable(),
  businessImpact: z.string().optional().nullable(),
  likelihood: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  severityRationale: z.string().optional().nullable(),
  isOverridden: z.boolean().default(false),
  existingControls: z.string().optional().nullable(),
  controlsStatus: z.enum(["VERIFIED", "ASSUMED", "NONE"]).default("ASSUMED"),
  mitigation: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z
    .enum(["OPEN", "ACCEPTED", "MITIGATED", "DEFERRED", "NOT_APPLICABLE"])
    .default("OPEN"),
  notApplicableRationale: z.string().optional().nullable(),
  linkedElementIds: z.array(z.string()).default([]),
  linkedFlowIds: z.array(z.string()).default([]),
});

export const threatSchema = baseThreatSchema
  .refine(
    (data) => {
      if (data.isOverridden && (!data.severityRationale || data.severityRationale.trim().length < 8)) {
        return false;
      }
      return true;
    },
    {
      message:
        "A documented rationale (at least 8 characters) is required when overriding the risk severity",
      path: ["severityRationale"],
    }
  )
  .refine(
    (data) => {
      if (
        data.status === "NOT_APPLICABLE" &&
        (!data.notApplicableRationale || data.notApplicableRationale.trim().length < 6)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Please provide a rationale explaining why this threat is marked Not Applicable",
      path: ["notApplicableRationale"],
    }
  );

export const threatUpdateSchema = baseThreatSchema.partial();

export type ThreatInput = z.infer<typeof threatSchema>;
export type ThreatUpdateInput = z.infer<typeof threatUpdateSchema>;
