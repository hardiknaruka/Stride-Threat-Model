import { describe, expect, it } from "vitest";
import {
  calculateSeverity,
  RISK_MATRIX,
  validateSeverityOverride,
} from "../risk-scoring";
import { Impact, Likelihood } from "../types";

describe("Risk Scoring Engine", () => {
  it("derives correct Low severity for Low x Low, Low x Medium, Medium x Low", () => {
    expect(calculateSeverity("LOW", "LOW")).toBe("LOW");
    expect(calculateSeverity("LOW", "MEDIUM")).toBe("LOW");
    expect(calculateSeverity("MEDIUM", "LOW")).toBe("LOW");
  });

  it("derives correct Medium severity for Medium x Medium, High x Low, Low x High", () => {
    expect(calculateSeverity("MEDIUM", "MEDIUM")).toBe("MEDIUM");
    expect(calculateSeverity("HIGH", "LOW")).toBe("MEDIUM");
    expect(calculateSeverity("LOW", "HIGH")).toBe("MEDIUM");
  });

  it("derives correct High severity for High x Medium, Medium x High", () => {
    expect(calculateSeverity("HIGH", "MEDIUM")).toBe("HIGH");
    expect(calculateSeverity("MEDIUM", "HIGH")).toBe("HIGH");
  });

  it("derives Critical severity for High Likelihood and High Impact", () => {
    expect(calculateSeverity("HIGH", "HIGH")).toBe("CRITICAL");
  });

  it("covers all 9 combinations in the 3x3 matrix without gaps", () => {
    const likelihoods: Likelihood[] = ["LOW", "MEDIUM", "HIGH"];
    const impacts: Impact[] = ["LOW", "MEDIUM", "HIGH"];

    for (const l of likelihoods) {
      for (const i of impacts) {
        const severity = calculateSeverity(l, i);
        expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(severity);
        expect(severity).toBe(RISK_MATRIX[l][i]);
      }
    }
  });

  it("validates severity overrides correctly", () => {
    // Non-overridden is always valid without rationale
    expect(validateSeverityOverride(false, "")).toEqual({ valid: true });
    expect(validateSeverityOverride(false, null)).toEqual({ valid: true });

    // Overridden without rationale fails
    expect(validateSeverityOverride(true, "")).toEqual({
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    });

    // Overridden with too short rationale fails
    expect(validateSeverityOverride(true, "Short")).toEqual({
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    });

    // Overridden with adequate rationale passes
    expect(
      validateSeverityOverride(
        true,
        "Compensatory WAF rate limiting and external ingress firewall mitigate blast radius."
      )
    ).toEqual({ valid: true });
  });
});
