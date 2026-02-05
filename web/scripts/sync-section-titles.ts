import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "cheerio";
import { PrismaClient } from "@prisma/client";

function assertTruthy<T>(value: T, message: string): NonNullable<T> {
  if (!value) throw new Error(message);
  return value as NonNullable<T>;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

type DepartmentTitle = { number: number; title: string };

function readTitlesFromOriginalIndex(indexHtmlPath: string): DepartmentTitle[] {
  const html = fs.readFileSync(indexHtmlPath, "utf8");
  const $ = load(html);

  const results: DepartmentTitle[] = [];
  $(".department-item[data-dept]").each((_, el) => {
    const rawDept = $(el).attr("data-dept");
    const number = rawDept ? Number.parseInt(String(rawDept), 10) : NaN;
    if (!Number.isFinite(number)) return;

    const title = normalizeText($(el).find(".dept-title").first().text());
    if (!title) return;

    results.push({ number, title });
  });

  results.sort((a, b) => a.number - b.number);
  return results;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.join(__dirname, "..", "..");

  assertTruthy(process.env.DATABASE_URL, "DATABASE_URL is required in web/.env");

  const indexHtmlPath = path.join(repoRoot, "qafFilesManager", "index.html");
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`Original index not found: ${indexHtmlPath}`);
  }

  const titles = readTitlesFromOriginalIndex(indexHtmlPath);
  if (titles.length === 0) {
    throw new Error(
      `No department titles found in original index: ${indexHtmlPath} (expected .department-item[data-dept])`
    );
  }

  const prisma = new PrismaClient();

  let updated = 0;
  for (const t of titles) {
    const existing = await prisma.section.findUnique({
      where: { number: t.number },
      select: { title: true },
    });

    if (!existing) {
      console.warn(`Section ${t.number} not found in DB; skipping`);
      continue;
    }

    const current = normalizeText(existing.title || "");
    if (current === t.title) continue;

    await prisma.section.update({
      where: { number: t.number },
      data: { title: t.title },
    });

    updated++;
    console.log(`Updated section ${t.number}: ${current} -> ${t.title}`);
  }

  await prisma.$disconnect();
  console.log(`Done. Updated ${updated}/${titles.length} section titles.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
