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
  const updates: {
    role?: UserRole;
    passwordHash?: string;
    isActive?: boolean;
    deletedAt?: Date | null;
    username?: string;
  } = {};

  // Restore soft-deleted user
  if (body.restore === true) {
    updates.deletedAt = null;
    updates.isActive = true;
  }

  if (body.role !== undefined) {
    const role = String(body.role) as UserRole;
    if (!(["admin", "editor", "reader"] as UserRole[]).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = role;
  }

  if (body.isActive !== undefined) {
    updates.isActive = Boolean(body.isActive);
  }

  if (body.username !== undefined) {
    const newUsername = String(body.username).trim();
    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json({ error: "اسم المستخدم قصير جداً" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
    }
    updates.username = newUsername;
  }

  if (body.password) {
    updates.passwordHash = await hashPassword(String(body.password));
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, username: true, role: true, isActive: true, deletedAt: true, lastActiveAt: true, createdAt: true },
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

  // Soft delete: set deletedAt timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json({ ok: true });
}
