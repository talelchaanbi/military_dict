import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await requireApiRole(["reader"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const termId = Number.parseInt(String(body.termId || ""), 10);
  const proposedAbbreviation = String(body.proposedAbbreviation || "").trim();

  if (!Number.isFinite(termId) || !proposedAbbreviation) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const term = await prisma.term.findUnique({ where: { id: termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found" }, { status: 404 });
  }

  const proposal = await prisma.abbreviationProposal.create({
    data: {
      termId,
      proposedAbbreviation,
      createdById: session.userId,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ proposal });
}
