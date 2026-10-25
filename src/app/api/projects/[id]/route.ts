import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { projectUpdateSchema } from "@/lib/validations/project";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        elements: {
          orderBy: { name: "asc" },
          include: {
            threatLinks: {
              select: { threatId: true },
            },
          },
        },
        flows: {
          orderBy: { name: "asc" },
          include: {
            sourceElement: { select: { id: true, name: true, type: true } },
            targetElement: { select: { id: true, name: true, type: true } },
            threatLinks: {
              select: { threatId: true },
            },
          },
        },
        threats: {
          orderBy: [{ severity: "asc" }, { threatId: "asc" }],
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
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error("Failed to fetch project:", err);
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.reviewDate !== undefined) {
      data.reviewDate = parsed.data.reviewDate
        ? new Date(parsed.data.reviewDate)
        : null;
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update project:", err);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Explicitly delete child relations for MongoDB safety
    const threats = await prisma.threat.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const threatIds = threats.map((t) => t.id);

    if (threatIds.length > 0) {
      await prisma.threatElementLink.deleteMany({
        where: { threatId: { in: threatIds } },
      });
      await prisma.threatFlowLink.deleteMany({
        where: { threatId: { in: threatIds } },
      });
    }

    await prisma.threat.deleteMany({ where: { projectId: id } });
    await prisma.dataFlow.deleteMany({ where: { projectId: id } });
    await prisma.architectureElement.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Project "${project.name}" deleted successfully`,
    });
  } catch (err) {
    console.error("Failed to delete project:", err);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
