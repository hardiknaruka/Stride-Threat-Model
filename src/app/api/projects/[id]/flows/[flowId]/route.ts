import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { flowUpdateSchema } from "@/lib/validations/flow";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; flowId: string }> }
) {
  try {
    const { id, flowId } = await params;
    const body = await req.json();
    const parsed = flowUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.dataFlow.update({
      where: { id: flowId, projectId: id },
      data: parsed.data,
      include: {
        sourceElement: true,
        targetElement: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update flow:", err);
    return NextResponse.json(
      { error: "Failed to update data flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; flowId: string }> }
) {
  try {
    const { id, flowId } = await params;
    await prisma.dataFlow.delete({
      where: { id: flowId, projectId: id },
    });

    return NextResponse.json({ success: true, message: "Data flow deleted" });
  } catch (err) {
    console.error("Failed to delete flow:", err);
    return NextResponse.json(
      { error: "Failed to delete data flow" },
      { status: 500 }
    );
  }
}
