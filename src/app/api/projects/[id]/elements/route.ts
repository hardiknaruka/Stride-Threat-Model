import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { elementSchema } from "@/lib/validations/element";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const elements = await prisma.architectureElement.findMany({
      where: { projectId: id },
      orderBy: { name: "asc" },
      include: {
        threatLinks: {
          select: { threatId: true },
        },
      },
    });

    return NextResponse.json(elements);
  } catch (err) {
    console.error("Failed to list elements:", err);
    return NextResponse.json(
      { error: "Failed to list architecture elements" },
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
    const parsed = elementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const element = await prisma.architectureElement.create({
      data: {
        projectId: id,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description,
        technology: parsed.data.technology,
        trustZone: parsed.data.trustZone,
        posX: parsed.data.posX,
        posY: parsed.data.posY,
      },
    });

    return NextResponse.json(element, { status: 201 });
  } catch (err) {
    console.error("Failed to create element:", err);
    return NextResponse.json(
      { error: "Failed to create architecture element" },
      { status: 500 }
    );
  }
}
