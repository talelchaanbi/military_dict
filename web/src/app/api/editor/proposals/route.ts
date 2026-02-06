import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function GET() {
  const session = await requireApiRole(["editor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const proposals = await prisma.abbreviationProposal.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      proposedAbbreviation: true,
      createdAt: true,
      term: { select: { id: true, term: true, abbreviation: true } },
      createdBy: { select: { id: true, username: true } },
    },
  });
  return NextResponse.json({ proposals });
}
