import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let username = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    username = String(body.username || "").trim();
    password = String(body.password || "");
  } else {
    const form = await req.formData();
    username = String(form.get("username") || "").trim();
    password = String(form.get("password") || "");
  }

  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, passwordHash: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession({ userId: user.id, role: user.role });

  return NextResponse.json({ ok: true });
}
