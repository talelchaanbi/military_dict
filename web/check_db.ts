import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const termCount = await prisma.term.count()
  const sectionCount = await prisma.section.count()
  console.log(`Terms in DB: ${termCount}`)
  console.log(`Sections in DB: ${sectionCount}`)
}

main().finally(() => prisma.$disconnect())
