import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const section = await prisma.section.findFirst({
    where: { number: 1301 },
    include: { terms: true },
  });

  console.log(JSON.stringify(section, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
