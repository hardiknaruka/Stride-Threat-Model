import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { threatSchema } from "@/lib/validations/threat";
import { calculateSeverity } from "@/lib/risk-scoring";
import { Impact, Likelihood } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const stride = searchParams.get("stride");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const owner = searchParams.get("owner");
    const search = searchParams.get("search");
    const elementId = searchParams.get("elementId");
    const flowId = searchParams.get("flowId");
    const sortBy = searchParams.get("sortBy") || "severity"; // severity, id, updated, due
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build Prisma where filter
    const where: Record<string, unknown> = {
      projectId: id,
    };

    if (severity) {
      where.severity = severity;
    }
    if (status) {
      where.status = status;
    }
    if (owner) {
      where.owner = { contains: owner };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { scenario: { contains: search } },
        { threatId: { contains: search } },
        { mitigation: { contains: search } },
      ];
    }
    if (elementId) {
      where.linkedElements = {
        some: { elementId },
      };
    }
    if (flowId) {
      where.linkedFlows = {
        some: { flowId },
      };
    }

    const threats = await prisma.threat.findMany({
      where,
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
      orderBy:
        sortBy === "id"
          ? { threatId: sortOrder }
          : sortBy === "updated"
          ? { updatedAt: sortOrder }
          : sortBy === "due"
          ? { dueDate: sortOrder }
          : [{ severity: sortOrder }, { threatId: "asc" }],
    });

    // Client/Server filter for STRIDE categories stored as JSON array string
    let result = threats;
    if (stride) {
      result = threats.filter((t) => {
        try {
          const cats = JSON.parse(t.strideCategories);
          return Array.isArray(cats) && cats.includes(stride);
        } catch {
          return false;
        }
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to list threats:", err);
    return NextResponse.json(
      { error: "Failed to list threats" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = threatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate auto severity if not manually overridden
    let severity = data.severity;
    if (!data.isOverridden) {
      severity = calculateSeverity(
        data.likelihood as Likelihood,
        data.impact as Impact
      );
    }

    // Auto-generate threat identifier if not specified
    let threatId = data.threatId;
    if (!threatId || threatId.trim() === "") {
      const count = await prisma.threat.count({ where: { projectId: id } });
      threatId = `THR-${String(count + 1).padStart(3, "0")}`;
    }

    const threat = await prisma.$transaction(async (tx) => {
      const created = await tx.threat.create({
        data: {
          projectId: id,
          threatId,
          title: data.title,
          scenario: data.scenario,
          strideCategories: JSON.stringify(data.strideCategories),
          preconditions: data.preconditions,
          confidentialityImpact: data.confidentialityImpact,
          integrityImpact: data.integrityImpact,
          availabilityImpact: data.availabilityImpact,
          privacyImpact: data.privacyImpact,
          businessImpact: data.businessImpact,
          likelihood: data.likelihood,
          impact: data.impact,
          severity,
          severityRationale: data.isOverridden ? data.severityRationale : null,
          isOverridden: data.isOverridden,
          existingControls: data.existingControls,
          controlsStatus: data.controlsStatus,
          mitigation: data.mitigation,
          owner: data.owner,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          status: data.status,
          notApplicableRationale:
            data.status === "NOT_APPLICABLE"
              ? data.notApplicableRationale
              : null,
        },
      });

      if (data.linkedElementIds && data.linkedElementIds.length > 0) {
        await tx.threatElementLink.createMany({
          data: data.linkedElementIds.map((elementId) => ({
            threatId: created.id,
            elementId,
          })),
        });
      }

      if (data.linkedFlowIds && data.linkedFlowIds.length > 0) {
        await tx.threatFlowLink.createMany({
          data: data.linkedFlowIds.map((flowId) => ({
            threatId: created.id,
            flowId,
          })),
        });
      }

      return tx.threat.findUnique({
        where: { id: created.id },
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
    });

    return NextResponse.json(threat, { status: 201 });
  } catch (err) {
    console.error("Failed to create threat:", err);
    return NextResponse.json(
      { error: "Failed to create threat record" },
      { status: 500 }
    );
  }
}
