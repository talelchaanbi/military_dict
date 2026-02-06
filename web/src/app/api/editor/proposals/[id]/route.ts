import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

function toInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(["editor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const proposalId = toInt(id);
  if (!proposalId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const action = String(body.action || "").toLowerCase();
  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const proposal = await prisma.abbreviationProposal.findUnique({
    where: { id: proposalId },
    select: { id: true, termId: true, proposedAbbreviation: true, status: true },
  });
  if (!proposal || proposal.status !== "pending") {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const updates: { status: "approved" | "rejected"; reviewedById: number } = {
    status: action === "approve" ? "approved" : "rejected",
    reviewedById: session.userId,
  };

  await prisma.abbreviationProposal.update({
    where: { id: proposalId },
    data: updates,
  });

  if (action === "approve") {
    await prisma.term.update({
      where: { id: proposal.termId },
      data: { abbreviation: proposal.proposedAbbreviation },
    });
  }

  return NextResponse.json({ ok: true });
}
