import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { threatUpdateSchema } from "@/lib/validations/threat";
import { calculateSeverity } from "@/lib/risk-scoring";
import { Impact, Likelihood } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; threatId: string }> }
) {
  try {
    const { id, threatId } = await params;
    const threat = await prisma.threat.findFirst({
      where: { id: threatId, projectId: id },
      include: {
        linkedElements: {
          include: {
            element: { select: { id: true, name: true, type: true } },
          },
        },
        linkedFlows: {
          include: {
            flow: { select: { id: true, name: true, protocol: true } },
          },
        },
      },
    });

    if (!threat) {
      return NextResponse.json({ error: "Threat not found" }, { status: 404 });
    }

    return NextResponse.json(threat);
  } catch (err) {
    console.error("Failed to fetch threat:", err);
    return NextResponse.json(
      { error: "Failed to fetch threat details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; threatId: string }> }
) {
  try {
    const { id, threatId } = await params;
    const body = await req.json();
    const parsed = threatUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.threat.findFirst({
      where: { id: threatId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Threat not found" }, { status: 404 });
    }

    // Determine likelihood & impact to recompute severity if needed
    const likelihood = (data.likelihood ?? existing.likelihood) as Likelihood;
    const impact = (data.impact ?? existing.impact) as Impact;
    const isOverridden = data.isOverridden ?? existing.isOverridden;

    let severity = existing.severity;
    if (isOverridden) {
      severity = data.severity ?? existing.severity;
    } else {
      severity = calculateSeverity(likelihood, impact);
    }

    await prisma.threat.update({
      where: { id: threatId },
      data: {
        title: data.title ?? existing.title,
        threatId: data.threatId ?? existing.threatId,
        scenario: data.scenario ?? existing.scenario,
        strideCategories: data.strideCategories
          ? JSON.stringify(data.strideCategories)
          : existing.strideCategories,
        preconditions:
          data.preconditions !== undefined
            ? data.preconditions
            : existing.preconditions,
        confidentialityImpact:
          data.confidentialityImpact !== undefined
            ? data.confidentialityImpact
            : existing.confidentialityImpact,
        integrityImpact:
          data.integrityImpact !== undefined
            ? data.integrityImpact
            : existing.integrityImpact,
        availabilityImpact:
          data.availabilityImpact !== undefined
            ? data.availabilityImpact
            : existing.availabilityImpact,
        privacyImpact:
          data.privacyImpact !== undefined
            ? data.privacyImpact
            : existing.privacyImpact,
        businessImpact:
          data.businessImpact !== undefined
            ? data.businessImpact
            : existing.businessImpact,
        likelihood,
        impact,
        severity,
        severityRationale: isOverridden
          ? (data.severityRationale ?? existing.severityRationale)
          : null,
        isOverridden,
        existingControls:
          data.existingControls !== undefined
            ? data.existingControls
            : existing.existingControls,
        controlsStatus: data.controlsStatus ?? existing.controlsStatus,
        mitigation:
          data.mitigation !== undefined
            ? data.mitigation
            : existing.mitigation,
        owner: data.owner !== undefined ? data.owner : existing.owner,
        dueDate:
          data.dueDate !== undefined
            ? data.dueDate
              ? new Date(data.dueDate)
              : null
            : existing.dueDate,
        status: data.status ?? existing.status,
        notApplicableRationale:
          (data.status ?? existing.status) === "NOT_APPLICABLE"
            ? (data.notApplicableRationale ?? existing.notApplicableRationale)
            : null,
      },
    });

    // Update linked elements if provided
    if (data.linkedElementIds !== undefined) {
      await prisma.threatElementLink.deleteMany({
        where: { threatId },
      });
      if (data.linkedElementIds.length > 0) {
        await prisma.threatElementLink.createMany({
          data: data.linkedElementIds.map((elementId) => ({
            threatId,
            elementId,
          })),
        });
      }
    }

    // Update linked flows if provided
    if (data.linkedFlowIds !== undefined) {
      await prisma.threatFlowLink.deleteMany({
        where: { threatId },
      });
      if (data.linkedFlowIds.length > 0) {
        await prisma.threatFlowLink.createMany({
          data: data.linkedFlowIds.map((flowId) => ({
            threatId,
            flowId,
          })),
        });
      }
    }

    const updated = await prisma.threat.findUnique({
      where: { id: threatId },
      include: {
        linkedElements: {
          include: {
            element: { select: { id: true, name: true, type: true } },
          },
        },
        linkedFlows: {
          include: {
            flow: { select: { id: true, name: true, protocol: true } },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update threat:", err);
    return NextResponse.json(
      { error: "Failed to update threat record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; threatId: string }> }
) {
  try {
    const { id, threatId } = await params;
    await prisma.threat.delete({
      where: { id: threatId, projectId: id },
    });

    return NextResponse.json({ success: true, message: "Threat deleted" });
  } catch (err) {
    console.error("Failed to delete threat:", err);
    return NextResponse.json(
      { error: "Failed to delete threat" },
      { status: 500 }
    );
  }
}
