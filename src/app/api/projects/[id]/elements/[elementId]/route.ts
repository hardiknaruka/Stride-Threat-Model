import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { elementUpdateSchema } from "@/lib/validations/element";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; elementId: string }> }
) {
  try {
    const { id, elementId } = await params;
    const body = await req.json();
    const parsed = elementUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.architectureElement.update({
      where: { id: elementId, projectId: id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update element:", err);
    return NextResponse.json(
      { error: "Failed to update element" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; elementId: string }> }
) {
  try {
    const { id, elementId } = await params;
    await prisma.architectureElement.delete({
      where: { id: elementId, projectId: id },
    });

    return NextResponse.json({ success: true, message: "Element deleted" });
  } catch (err) {
    console.error("Failed to delete element:", err);
    return NextResponse.json(
      { error: "Failed to delete element" },
      { status: 500 }
    );
  }
}
