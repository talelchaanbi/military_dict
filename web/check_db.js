const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const terms = await prisma.term.findMany({
    where: { sectionId: 16, term: { contains: '#' } },
  });
  console.log(JSON.stringify(terms, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
