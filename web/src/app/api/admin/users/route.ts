import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireApiRole } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

export async function GET() {
  const session = await requireApiRole(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, username: true, role: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await requireApiRole(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const role = String(body.role || "reader") as UserRole;

  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!(["admin", "editor", "reader"] as UserRole[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, role },
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
