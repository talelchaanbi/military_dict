import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function toInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(
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

  // Ensure term exists and user has access via role.
  const existing = await prisma.term.findUnique({
    where: { id: termId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Term not found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "terms");
  await fs.mkdir(uploadsDir, { recursive: true });

  const token = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const filename = `term-${termId}-${token}.${ext}`;
  const outPath = path.join(uploadsDir, filename);

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outPath, bytes);

  const url = `/uploads/terms/${filename}`;
  return NextResponse.json({ url });
}
