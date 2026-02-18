
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

const MANUAL_DATA_FILE = path.join(__dirname, "subtitles_data.json");

async function migrateSection(sectionNumber: number) {
  console.log(`Checking Section ${sectionNumber}...`);
  const sectionId = await getSectionId(sectionNumber);
  if (!sectionId) {
      console.log(`Section ${sectionNumber} not found in DB. Skipping.`);
      return;
  }

  // Check if we have manual data for this section
  let manualData = null;
  console.log(`Looking for manual data in: ${MANUAL_DATA_FILE}`);
  if (fs.existsSync(MANUAL_DATA_FILE)) {
      const allData = JSON.parse(fs.readFileSync(MANUAL_DATA_FILE, "utf-8"));
      manualData = allData[String(sectionNumber)];
      console.log(`Manual data for ${sectionNumber}: ${manualData ? 'Found' : 'Not Found'}`);
  } else {
      console.log(`Manual data file NOT FOUND at ${MANUAL_DATA_FILE}`);
  }

  // Use Manual Data if available (and valid)
  if (manualData && Array.isArray(manualData) && manualData.length > 0) {
      console.log(`Seeding Subtitles for Section ${sectionNumber} from JSON data...`);

      // Clear existing linkages and subtitles
      await prisma.term.updateMany({ where: { sectionId }, data: { subtitleId: null } });
      await prisma.subtitle.deleteMany({ where: { sectionId } });

      for (const parentSub of manualData) {
          const parent = await prisma.subtitle.create({
              data: {
                  sectionId,
                  title: parentSub.title,
                  order: parentSub.order
              }
          });

          // Link terms to parent
          if (parentSub.terms && parentSub.terms.length > 0) {
              await prisma.term.updateMany({
                  where: {
                      sectionId,
                      itemNumber: { in: parentSub.terms }
                  },
                  data: { subtitleId: parent.id }
              });
          }

          if (parentSub.children) {
              for (const childSub of parentSub.children) {
                  const child = await prisma.subtitle.create({
                      data: {
                          sectionId,
                          title: childSub.title,
                          parentId: parent.id,
                          order: childSub.order
                      }
                  });

                  // Link terms to child
                  if (childSub.terms && childSub.terms.length > 0) {
                      await prisma.term.updateMany({
                          where: {
                              sectionId,
                              itemNumber: { in: childSub.terms }
                          },
                          data: { subtitleId: child.id }
                      });
                  }
              }
          }
      }
      return;
  }
}

async function main() {
    // Only Sections 1-11 have subtitles managed this way
    for (let i = 1; i <= 11; i++) {
        await migrateSection(i);
    }
    console.log("Migration complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
