const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    where: { code: { in: ['dep12', 'dep13'] } },
    select: { code: true, contentHtml: true, updatedAt: true },
  });

  for (const d of docs) {
    const html = d.contentHtml || '';
    console.log(
      `${d.code} len=${html.length} updatedAt=${d.updatedAt.toISOString()} data:image=${html.includes(
        'data:image'
      )} uploads=${html.includes('/uploads/assets/')}`
    );
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
