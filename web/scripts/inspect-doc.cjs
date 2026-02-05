const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const code = process.argv[2] || 'dep13';
  const doc = await prisma.document.findFirst({
    where: { code },
    select: { code: true, title: true, contentHtml: true, updatedAt: true },
  });
  if (!doc) {
    console.error('Not found:', code);
    process.exitCode = 2;
    return;
  }
  const html = doc.contentHtml || '';
  const pCount = (html.match(/<p\b/g) || []).length;
  const imgCount = (html.match(/<img\b/g) || []).length;
  const dataImgCount = (html.match(/data:image/g) || []).length;
  const uploadsImgCount = (html.match(/\/uploads\/assets\//g) || []).length;

  console.log(`${doc.code} updatedAt=${doc.updatedAt.toISOString()} len=${html.length}`);
  console.log(`p=${pCount} img=${imgCount} data:image=${dataImgCount} uploads=${uploadsImgCount}`);
  console.log('--- head ---');
  console.log(html.slice(0, 800));
  console.log('\n--- tail ---');
  console.log(html.slice(Math.max(0, html.length - 800)));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
