
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function cleanText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Map to track parents within a single section execution to reuse them
const parentsMap = new Map<string, any>();

async function getSectionId(num: number) {
    const s = await prisma.section.findUnique({ where: { number: num } });
    return s?.id;
}

async function migrateSection(sectionNumber: number) {
  // Find file
  // We assume the script is run from 'web' via 'npx tsx prisma/seed_subtitles.ts'
  // So __dirname is web/prisma.
  const possiblePaths = [
    path.join(__dirname, "../../dep", `${sectionNumber}.html`),
    path.join(__dirname, "../../qafFilesManager/Department/Details", `${sectionNumber}.html`),
    path.join(__dirname, "../../", `${sectionNumber}.html`), 
  ];

  let htmlPath = "";
  for(const p of possiblePaths) {
    if(fs.existsSync(p)) { htmlPath = p; break; }
  }

  if (!htmlPath) {
    console.log(`Skipping Section ${sectionNumber}: No HTML file found.`);
    return;
  }

  const sectionId = await getSectionId(sectionNumber);
  if(!sectionId) {
      console.log(`Section ${sectionNumber} not found in DB. Skipping.`);
      return;
  }

  console.log(`Processing Section ${sectionNumber} from ${htmlPath}...`);
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Clear existing subtitles for this section to allow re-run
  // First, decouple terms
  await prisma.term.updateMany({
      where: { sectionId },
      data: { subtitleId: null }
  });
  // Then delete subtitles
  await prisma.subtitle.deleteMany({ where: { sectionId } });
  
  const blockRegex = /<div\s+class\s*=\s*["'][^"']*\bterms-table-container\b[^"']*["'][^>]*>[\s\S]*?<div\s+class\s*=\s*["'][^"']*\bdepartment-subtitle\b[^"']*["'][^>]*>([\s\S]*?)<\/div>(?:\s*<span[^>]*>([\s\S]*?)<\/span>)?[\s\S]*?(<table[\s\S]*?<\/table>)/gi;
  
  let match;
  let orderIndex = 0;
  parentsMap.clear();

  while ((match = blockRegex.exec(html)) !== null) {
    const subtitleText = cleanText(match[1] || "");
    const spanText = cleanText(match[2] || "");
    
    const parentTitle = subtitleText || `قسم ${orderIndex + 1}`;
    const childTitle = spanText;

    // 1. Get or Create Parent
    let parent = parentsMap.get(parentTitle);
    if (!parent) {
        parent = await prisma.subtitle.create({
            data: {
                sectionId,
                title: parentTitle,
                order: orderIndex++
            }
        });
        parentsMap.set(parentTitle, parent);
    }

    let targetSubtitleId = parent.id;

    // 2. Create Child if exists
    if (childTitle) {
        const child = await prisma.subtitle.create({
            data: {
                sectionId,
                title: childTitle,
                parentId: parent.id,
                order: orderIndex++
            }
        });
        targetSubtitleId = child.id;
    }

    // 3. Parse Table and Update Terms
    const tableHtml = match[3] || "";
    // Only looking for rows with tds
    const rowMatches = tableHtml.matchAll(/<tr[\s\S]*?>[\s\S]*?<\/tr>/gi);
    
    for (const rMatch of rowMatches) {
        const row = rMatch[0];
        const tdMatch = row.match(/<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
        if (!tdMatch) continue;
        const numberText = cleanText(tdMatch[1] || "");
        if (!numberText) continue;

        // Link Term
        // We assume searching by sectionId + itemNumber is correct.
        await prisma.term.updateMany({
            where: {
                sectionId,
                itemNumber: numberText
            },
            data: {
                subtitleId: targetSubtitleId
            }
        });
    }
  }
}

async function main() {
    for (let i = 1; i <= 13; i++) {
        await migrateSection(i);
    }
    console.log("Migration complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
