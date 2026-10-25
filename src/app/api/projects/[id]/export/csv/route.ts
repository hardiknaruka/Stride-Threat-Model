import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function escapeCSV(val: string | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        threats: {
          orderBy: [{ severity: "asc" }, { threatId: "asc" }],
          include: {
            linkedElements: {
              include: { element: { select: { name: true } } },
            },
            linkedFlows: {
              include: { flow: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const headers = [
      "Threat ID",
      "Title",
      "STRIDE Categories",
      "Severity / Priority",
      "Likelihood",
      "Impact",
      "Is Overridden",
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

    const rows = project.threats.map((t) => {
      let strideList = "";
      try {
        const parsed = JSON.parse(t.strideCategories);
        strideList = Array.isArray(parsed) ? parsed.join("; ") : t.strideCategories;
      } catch {
        strideList = t.strideCategories;
      }

      const elementsList = t.linkedElements
        .map((le) => le.element.name)
        .join("; ");
      const flowsList = t.linkedFlows.map((lf) => lf.flow.name).join("; ");

      return [
        escapeCSV(t.threatId),
        escapeCSV(t.title),
        escapeCSV(strideList),
        escapeCSV(t.severity),
        escapeCSV(t.likelihood),
        escapeCSV(t.impact),
        escapeCSV(t.isOverridden ? "YES" : "NO"),
        escapeCSV(t.severityRationale || ""),
        escapeCSV(t.status),
        escapeCSV(t.notApplicableRationale || ""),
        escapeCSV(t.owner || ""),
        escapeCSV(t.dueDate ? t.dueDate.toISOString().split("T")[0] : ""),
        escapeCSV(t.scenario),
        escapeCSV(t.preconditions || ""),
        escapeCSV(t.confidentialityImpact || ""),
        escapeCSV(t.integrityImpact || ""),
        escapeCSV(t.availabilityImpact || ""),
        escapeCSV(t.privacyImpact || ""),
        escapeCSV(t.businessImpact || ""),
        escapeCSV(t.existingControls || ""),
        escapeCSV(t.controlsStatus),
        escapeCSV(t.mitigation || ""),
        escapeCSV(elementsList),
        escapeCSV(flowsList),
        escapeCSV(t.createdAt.toISOString()),
        escapeCSV(t.updatedAt.toISOString()),
      ].join(",");
    });

    // Prepend UTF-8 Byte Order Mark (BOM) for Excel compatibility
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    const safeFilename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Threat_Register.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Failed to export threats CSV:", err);
    return NextResponse.json(
      { error: "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}
