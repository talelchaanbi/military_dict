import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "Bootstrap already completed" }, { status: 400 });
  }

  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, role: "admin" },
    select: { id: true, role: true },
  });

  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ ok: true });
}
