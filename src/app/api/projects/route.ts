import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            elements: true,
            flows: true,
            threats: true,
          },
        },
        threats: {
          select: {
            severity: true,
            status: true,
          },
        },
      },
    });

    const enriched = projects.map((p) => {
      const highOrCriticalCount = p.threats.filter(
        (t) =>
          (t.severity === "HIGH" || t.severity === "CRITICAL") &&
          t.status !== "MITIGATED" &&
          t.status !== "NOT_APPLICABLE"
      ).length;

      const openThreatsCount = p.threats.filter(
        (t) => t.status === "OPEN"
      ).length;

      const mitigatedCount = p.threats.filter(
        (t) => t.status === "MITIGATED"
      ).length;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        owner: p.owner,
        status: p.status,
        architectureVersion: p.architectureVersion,
        environment: p.environment,
        reviewDate: p.reviewDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        elementCount: p._count.elements,
        flowCount: p._count.flows,
        threatCount: p._count.threats,
        highOrCriticalCount,
        openThreatsCount,
        mitigatedCount,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Failed to list projects:", err);
    return NextResponse.json(
      { error: "Failed to retrieve projects list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = projectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      owner,
      status,
      architectureVersion,
      environment,
      reviewDate,
      inScope,
      outOfScope,
      assumptions,
      openQuestions,
      stakeholders,
    } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner,
        status,
        architectureVersion,
        environment,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        inScope,
        outOfScope,
        assumptions,
        openQuestions,
        stakeholders,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("Failed to create project:", err);
    return NextResponse.json(
      { error: "Failed to create threat modeling project" },
      { status: 500 }
    );
  }
}
