import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, hashPassword } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

function toInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = toInt(id);
  if (!userId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const updates: { role?: UserRole; passwordHash?: string } = {};

  if (body.role) {
    const role = String(body.role) as UserRole;
    if (!(["admin", "editor", "reader"] as UserRole[]).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = role;
  }

  if (body.password) {
    updates.passwordHash = await hashPassword(String(body.password));
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = toInt(id);
  if (!userId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
