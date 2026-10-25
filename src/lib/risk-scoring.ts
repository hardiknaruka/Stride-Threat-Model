import { Impact, Likelihood, Severity } from "./types";

/**
 * Standard Qualitative STRIDE Risk Matrix
 *
 * | Likelihood \ Impact | LOW    | MEDIUM | HIGH     |
 * |---------------------|--------|--------|----------|
 * | HIGH                | MEDIUM | HIGH   | CRITICAL |
 * | MEDIUM              | LOW    | MEDIUM | HIGH     |
 * | LOW                 | LOW    | LOW    | MEDIUM   |
 */
export const RISK_MATRIX: Record<Likelihood, Record<Impact, Severity>> = {
  LOW: {
    LOW: "LOW",
    MEDIUM: "LOW",
    HIGH: "MEDIUM",
  },
  MEDIUM: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
  },
  HIGH: {
    LOW: "MEDIUM",
    MEDIUM: "HIGH",
    HIGH: "CRITICAL",
  },
};

export const SEVERITY_SCORES: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const SEVERITY_COLORS: Record<
  Severity,
  {
    text: string;
    bg: string;
    border: string;
    badge: string;
  }
> = {
  LOW: {
    text: "text-blue-400",
    bg: "bg-blue-950/40",
    border: "border-blue-800/60",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  MEDIUM: {
    text: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/60",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  HIGH: {
    text: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-800/60",
    badge: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  },
  CRITICAL: {
    text: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/60",
    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold",
  },
};

/**
 * Calculates default qualitative severity based on Likelihood and Impact.
 */
export function calculateSeverity(likelihood: Likelihood, impact: Impact): Severity {
  return RISK_MATRIX[likelihood]?.[impact] || "MEDIUM";
}

/**
 * Validates whether an override is acceptable.
 * Overriding requires a documented rationale explaining why the standard matrix was adjusted.
 */
export function validateSeverityOverride(
  isOverridden: boolean,
  rationale?: string | null
): { valid: boolean; error?: string } {
  if (!isOverridden) {
    return { valid: true };
  }
  if (!rationale || rationale.trim().length < 8) {
    return {
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    };
  }
  return { valid: true };
}

/**
 * Human-readable documentation of the risk model for UI and audit reports.
 */
export const RISK_MODEL_DOCUMENTATION = {
  name: "Qualitative 3x3 Likelihood-Impact Matrix",
  summary:
    "A transparent, qualitative risk scoring method mapping assessed Likelihood (Low, Medium, High) against Impact (Low, Medium, High) to derive a 4-tier Severity rating (Low, Medium, High, Critical).",
  guidelines: [
    "Low x Low, Low x Medium, Medium x Low -> Low Priority",
    "Medium x Medium, Low x High, High x Low -> Medium Priority",
    "High x Medium, Medium x High -> High Priority",
    "High x High -> Critical Priority",
    "Overrides: Authorized Security Leads can calibrate severity when compensatory controls or architectural blast radiuses warrant an exception, provided a written rationale is recorded.",
  ],
  disclaimer:
    "Qualitative scoring is an operational prioritization heuristic and is not a formal actuarial or quantitative measurement.",
};
