const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const codes = ['dep12', 'dep13'];
  const docs = await prisma.document.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true, title: true },
  });

  for (const d of docs) {
    const count = await prisma.documentAsset.count({ where: { documentId: d.id } });
    const logos = await prisma.documentAsset.count({
      where: { documentId: d.id, asset: { isLogo: true } },
    });
    console.log(`${d.code} assets=${count} logos=${logos}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
