import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type Group = {
  id: string;
  title: string;
  parentTitle?: string;
  subTitle?: string;
  itemNumbers: string[];
};

function loadSubtitleGroups(sectionNumber: number): Group[] {
  const htmlPath = path.join(
    process.cwd(),
    "..",
    "qafFilesManager",
    "Department",
    "Details",
    `${sectionNumber}.html`
  );

  if (!fs.existsSync(htmlPath)) return [];

  const html = fs.readFileSync(htmlPath, "utf-8");
  const groups: Group[] = [];

  const blockRegex = /<div\s+class\s*=\s*["'][^"']*\bterms-table-container\b[^"']*["'][^>]*>[\s\S]*?<div\s+class\s*=\s*["'][^"']*\bdepartment-subtitle\b[^"']*["'][^>]*>([\s\S]*?)<\/div>(?:\s*<span[^>]*>([\s\S]*?)<\/span>)?[\s\S]*?(<table[\s\S]*?<\/table>)/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = blockRegex.exec(html)) !== null) {
    const subtitle = cleanText(match[1] || "");
    const span = cleanText(match[2] || "");
    const parentTitle = subtitle || `قسم ${index + 1}`;
    const subTitle = span || undefined;
    const title = subTitle ? subTitle : parentTitle;

    const tableHtml = match[3] || "";
    const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const itemNumbers = new Set<string>();

    rows.forEach((row) => {
      const tdMatch = row.match(/<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
      if (!tdMatch) return;
      const numberText = cleanText(tdMatch[1] || "");
      if (numberText) itemNumbers.add(numberText);
    });

    if (itemNumbers.size > 0) {
      index += 1;
      groups.push({
        id: `subtitle-${sectionNumber}-${index}`,
        title,
        parentTitle,
        subTitle,
        itemNumbers: Array.from(itemNumbers),
      });
    }
  }

  return groups;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const sectionNumber = Number.parseInt(number, 10);
  if (!Number.isFinite(sectionNumber)) {
    return NextResponse.json({ error: "Invalid section number" }, { status: 400 });
  }

  const section = await prisma.section.findUnique({
    where: { number: sectionNumber },
    select: { id: true, number: true, type: true },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  if (section.type !== "terms") {
    return NextResponse.json({ error: "This section does not contain terms" }, { status: 400 });
  }

  const groups = loadSubtitleGroups(section.number);
  return NextResponse.json({ groups });
}
