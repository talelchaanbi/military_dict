import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let payload: any = {};

  try {
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }

    // Input validation
    const result = loginSchema.safeParse(payload);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }
    const { username, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, passwordHash: true, role: true },
    });

    // Timing attack mitigation: ensure consistent response time roughly
    // though network latency dominates, preventing username enumeration helps.
    if (!user) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        console.warn(`[Security] Failed login attempt for non-existent user: ${username}`);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      console.warn(`[Security] Failed login attempt for user: ${username}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({ userId: user.id, role: user.role });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
