import { PrismaClient, SectionType } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const DATA_FILE = path.join(__dirname, "dep13_data.json");

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error("Data file not found:", DATA_FILE);
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, "utf-8");
  const data = JSON.parse(rawData);

  console.log(`Seeding data for ${data.length} sub-sections of Dep 13...`);

  // We will use 1300 + section number as the unique section number in DB
  const BASE_SECTION_ID = 1300;

  for (const sectionData of data) {
    const { section, terms } = sectionData;
    const dbSectionNumber = BASE_SECTION_ID + section.number;
    
    console.log(`Processing Section ${section.number} -> DB Section ${dbSectionNumber}: ${section.title}`);

    // Create or Update Section
    const createdSection = await prisma.section.upsert({
      where: {
        number: dbSectionNumber
      },
      update: {
        title: section.title,
        type: SectionType.terms, // Ensure it is set to hold terms
      },
      create: {
        number: dbSectionNumber,
        title: section.title,
        type: SectionType.terms,
      },
    });

    console.log(`  Section ID: ${createdSection.id}. inserting ${terms.length} terms...`);

    // Delete existing terms for this section to avoid duplicates
    await prisma.term.deleteMany({
      where: { sectionId: createdSection.id },
    });

    for (const term of terms) {
      if (!term.term && !term.imageUrl) continue;

      await prisma.term.create({
        data: {
          sectionId: createdSection.id,
          term: term.term || "بدون عنوان",
          description: term.definition || "", // Map definition to description
          imageUrl: term.imageUrl,
        },
      });
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
