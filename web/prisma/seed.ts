import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

async function restoreFromSql() {
  const sqlPath = path.join(__dirname, "seed_data.sql");
  if (!fs.existsSync(sqlPath)) {
    console.log("No seed_data.sql found. Skipping SQL restore.");
    return;
  }

  console.log("Restoring base data from seed_data.sql...");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set.");
    return;
  }

  try {
    const url = new URL(databaseUrl.replace("mysql://", "http://"));
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || "3306";
    const database = url.pathname.substring(1);

    const command = `mysql -u "${user}" -p"${password}" -h "${host}" -P "${port}" "${database}" < "${sqlPath}"`;
    await execPromise(command);
    console.log("✅ Base data restored successfully.");
  } catch (error) {
    console.error("❌ Failed to restore SQL data:", error);
    console.error("You may need to run: mysql -u USER -p DATABASE < prisma/seed_data.sql");
  }
}

async function seedDep13() {
  console.log("Seeding DEP 13 data...");
  try {
    // Run the existing seed_dep13.ts script
    const scriptPath = path.join(__dirname, "seed_dep13.ts");
    await execPromise(`npx tsx "${scriptPath}"`);
    console.log("✅ DEP 13 seeded successfully.");
  } catch (error) {
    console.error("❌ Failed to seed DEP 13:", error);
  }
}

async function seedSubtitles() {
  console.log("Seeding Subtitles/Structure using HTML files...");
  try {
    const scriptPath = path.join(__dirname, "seed_subtitles.ts");
    if (fs.existsSync(scriptPath)) {
        await execPromise(`npx tsx "${scriptPath}"`);
        console.log("✅ Subtitles seeded successfully.");
    } else {
        console.warn("⚠️ seed_subtitles.ts not found. Skipping subtitle seeding.");
    }
  } catch(error) {
      console.error("❌ Failed to seed Subtitles:", error);
  }
}

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { username } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: "admin" },
    });
    console.log(`✅ Admin user '${username}' updated.`);
  } else {
    await prisma.user.create({
      data: { username, passwordHash, role: "admin" },
    });
    console.log(`✅ Admin user '${username}' created.`);
  }
}

async function main() {
  // 1. Check if database is empty (missing base sections)
  // We check for Section 1 which is standard in the dump
  let section1 = null;
  try {
    section1 = await prisma.section.findFirst({ where: { number: 1 } });
  } catch (error: any) {
    // P2021: The table does not exist in the current database.
    if (error.code === 'P2021') {
      console.log("⚠️ Tables do not exist. Attempting full restoration...");
    } else {
      throw error;
    }
  }
  
  if (!section1) {
    console.log("⚠️ Database appears incomplete. Attempting full restoration...");
    await restoreFromSql();
  } else {
    console.log("ℹ️ Base sections found. Skipping SQL restore.");
  }

  // 2. Always run DEP 13 seeder (it handles its own idempotency/updates)
  await seedDep13();

  // 3. Seed Subtitles (Structure from HTML)
  await seedSubtitles();

  // 4. Ensure Admin user exists
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
