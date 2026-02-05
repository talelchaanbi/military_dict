import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sections = await prisma.section.findMany({
    select: { number: true, title: true, type: true },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({ sections });
}
