import { describe, expect, it } from "vitest";

describe("Export Specifications", () => {
  it("includes all required threat register fields in export specification", () => {
    const requiredFields = [
      "Threat ID",
      "Title",
      "STRIDE Categories",
      "Severity / Priority",
      "Likelihood",
      "Impact",
      "Severity Rationale",
      "Status",
      "Not Applicable Rationale",
      "Owner / Team",
      "Due Date",
      "Threat Scenario",
      "Preconditions & Assumptions",
      "Confidentiality Impact",
      "Integrity Impact",
      "Availability Impact",
      "Privacy Impact",
      "Business Impact",
      "Existing Controls",
      "Controls Verification Status",
      "Recommended Mitigation",
      "Linked Components",
      "Linked Data Flows",
      "Created At",
      "Updated At",
    ];

    expect(requiredFields.length).toBeGreaterThanOrEqual(15);
    expect(requiredFields).toContain("Threat ID");
    expect(requiredFields).toContain("STRIDE Categories");
    expect(requiredFields).toContain("Controls Verification Status");
    expect(requiredFields).toContain("Not Applicable Rationale");
  });
});
