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
  const termId = toInt(id);
  if (!termId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const data = {
    term: body.term ? String(body.term) : undefined,
    description: body.description !== undefined ? String(body.description) : undefined,
    abbreviation: body.abbreviation !== undefined ? String(body.abbreviation) : undefined,
    itemNumber: body.itemNumber !== undefined ? String(body.itemNumber) : undefined,
  } as const;

  const term = await prisma.term.update({
    where: { id: termId },
    data,
    select: { id: true, term: true, abbreviation: true, itemNumber: true, description: true },
  });

  return NextResponse.json({ term });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(["editor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const termId = toInt(id);
  if (!termId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.term.delete({ where: { id: termId } });
  return NextResponse.json({ ok: true });
}
