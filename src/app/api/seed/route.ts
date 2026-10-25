import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { seedCommerceProject } from "@/lib/seed-data";

export async function POST() {
  try {
    const project = await seedCommerceProject(prisma);
    return NextResponse.json({
      success: true,
      message: "Successfully seeded fictional demo project",
      project,
    });
  } catch (err) {
    console.error("Failed to seed database:", err);
    return NextResponse.json(
      { error: "Failed to seed demo project" },
      { status: 500 }
    );
  }
}
