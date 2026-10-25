import { describe, expect, it } from "vitest";
import { projectCreateSchema } from "../validations/project";
import { elementSchema } from "../validations/element";
import { flowSchema } from "../validations/flow";
import { threatSchema } from "../validations/threat";

describe("Input & API Boundary Validations", () => {
  describe("Project Schema", () => {
    it("validates valid project input", () => {
      const res = projectCreateSchema.safeParse({
        name: "Cloud Checkout System",
        description: "Payment and checkout threat modeling assessment",
        owner: "Jane Doe (AppSec Lead)",
        environment: "Production",
        architectureVersion: "2.1.0",
      });
      expect(res.success).toBe(true);
    });

    it("rejects project with too short name or description", () => {
      const res = projectCreateSchema.safeParse({
        name: "A",
        description: "No",
        owner: "J",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Architecture Element Schema", () => {
    it("validates valid component", () => {
      const res = elementSchema.safeParse({
        name: "Order Service",
        type: "PROCESS",
        technology: "Node.js / Express",
        trustZone: "Private VPC",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid element type", () => {
      const res = elementSchema.safeParse({
        name: "Bad Element",
        type: "NON_EXISTENT_TYPE",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Data Flow Schema", () => {
    it("validates valid data flow", () => {
      const res = flowSchema.safeParse({
        name: "Order Placement REST Call",
        sourceElementId: "elem-1",
        targetElementId: "elem-2",
        protocol: "HTTPS/REST",
        crossesTrustBoundary: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects missing source or target", () => {
      const res = flowSchema.safeParse({
        name: "Incomplete Flow",
        sourceElementId: "",
        targetElementId: "elem-2",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("STRIDE Threat Schema", () => {
    it("validates standard threat without override", () => {
      const res = threatSchema.safeParse({
        title: "JWT Token Forgery via Weak Secret Key",
        scenario: "Attacker discovers hardcoded HMAC secret and signs arbitrary identity claims.",
        strideCategories: ["SPOOFING", "ELEVATION_OF_PRIVILEGE"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        severity: "HIGH",
        isOverridden: false,
        status: "OPEN",
      });
      expect(res.success).toBe(true);
    });

    it("requires at least one STRIDE category", () => {
      const res = threatSchema.safeParse({
        title: "Missing category threat",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: [],
        likelihood: "LOW",
        impact: "LOW",
        severity: "LOW",
      });
      expect(res.success).toBe(false);
    });

    it("requires severityRationale when isOverridden is true", () => {
      const res = threatSchema.safeParse({
        title: "Overridden Threat without justification",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: ["TAMPERING"],
        likelihood: "HIGH",
        impact: "HIGH",
        severity: "LOW",
        isOverridden: true,
        severityRationale: "", // empty rationale should fail
      });
      expect(res.success).toBe(false);
    });

    it("requires notApplicableRationale when status is NOT_APPLICABLE", () => {
      const res = threatSchema.safeParse({
        title: "Non-applicable Threat without reason",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: ["REPUDIATION"],
        status: "NOT_APPLICABLE",
        notApplicableRationale: "",
      });
      expect(res.success).toBe(false);
    });
  });
});
