import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { flowSchema } from "@/lib/validations/flow";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flows = await prisma.dataFlow.findMany({
      where: { projectId: id },
      orderBy: { name: "asc" },
      include: {
        sourceElement: true,
        targetElement: true,
        threatLinks: { select: { threatId: true } },
      },
    });

    return NextResponse.json(flows);
  } catch (err) {
    console.error("Failed to list flows:", err);
    return NextResponse.json(
      { error: "Failed to list data flows" },
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
    const parsed = flowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const flow = await prisma.dataFlow.create({
      data: {
        projectId: id,
        name: parsed.data.name,
        sourceElementId: parsed.data.sourceElementId,
        targetElementId: parsed.data.targetElementId,
        protocol: parsed.data.protocol,
        dataCategory: parsed.data.dataCategory,
        authContext: parsed.data.authContext,
        crossesTrustBoundary: parsed.data.crossesTrustBoundary,
        notes: parsed.data.notes,
      },
      include: {
        sourceElement: true,
        targetElement: true,
      },
    });

    return NextResponse.json(flow, { status: 201 });
  } catch (err) {
    console.error("Failed to create flow:", err);
    return NextResponse.json(
      { error: "Failed to create data flow" },
      { status: 500 }
    );
  }
}
