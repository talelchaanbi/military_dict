import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const sectionNumber = Number.parseInt(number, 10);
  if (!Number.isFinite(sectionNumber)) {
    return NextResponse.json({ error: "Invalid section number" }, { status: 400 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = clampInt(url.searchParams.get("page"), 1, 1, 10_000);
  const pageSize = clampInt(url.searchParams.get("pageSize"), 25, 1, 200);

  const section = await prisma.section.findUnique({
    where: { number: sectionNumber },
    select: { id: true, number: true, title: true, type: true },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  if (section.type !== "terms") {
    return NextResponse.json(
      { error: "This section does not contain terms" },
      { status: 400 }
    );
  }

  const where = {
    sectionId: section.id,
    ...(q
      ? {
          OR: [
            { term: { contains: q } },
            { description: { contains: q } },
            { abbreviation: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, terms] = await Promise.all([
    prisma.term.count({ where }),
    prisma.term.findMany({
      where,
      orderBy: [{ id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        itemNumber: true,
        term: true,
        description: true,
        abbreviation: true,
        imageUrl: true,
      },
    }),
  ]);

  return NextResponse.json({ section, q, page, pageSize, total, terms });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const session = await requireApiRole(["editor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { number } = await params;
  const sectionNumber = Number.parseInt(number, 10);
  if (!Number.isFinite(sectionNumber)) {
    return NextResponse.json({ error: "Invalid section number" }, { status: 400 });
  }

  const body = await req.json();
  const term = String(body.term || "").trim();
  const description = body.description ? String(body.description) : null;
  const abbreviation = body.abbreviation ? String(body.abbreviation) : null;
  const itemNumber = body.itemNumber ? String(body.itemNumber) : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;

  if (!term) {
    return NextResponse.json({ error: "Missing term" }, { status: 400 });
  }

  const section = await prisma.section.findUnique({
    where: { number: sectionNumber },
    select: { id: true, type: true },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  if (section.type !== "terms") {
    return NextResponse.json(
      { error: "This section does not contain terms" },
      { status: 400 }
    );
  }

  const created = await prisma.term.create({
    data: {
      sectionId: section.id,
      term,
      description,
      abbreviation,
      itemNumber,
      imageUrl,
    },
    select: {
      id: true,
      itemNumber: true,
      term: true,
      description: true,
      abbreviation: true,
      imageUrl: true,
    },
  });

  return NextResponse.json({ term: created });
}
