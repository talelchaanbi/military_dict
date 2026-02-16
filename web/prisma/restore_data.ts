import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(__dirname, "seed_data.sql");

  if (!fs.existsSync(sqlPath)) {
    console.log("No seed_data.sql file found. Skipping SQL import.");
    return;
  }

  console.log("Found seed_data.sql. Attempting to import...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables.");
    return;
  }

  // Parse DATABASE_URL to get credentials (rudimentary parsing)
  // Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
  try {
    const url = new URL(databaseUrl.replace("mysql://", "http://")); // use http just to parse with URL
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || "3306";
    const database = url.pathname.substring(1); // remove leading /

    // Construct mysql command
    // WARNING: Putting password in command line is not secure in shared environments, 
    // but for local dev scripts it's often the simplest way without interactive prompt.
    // Ensure mysql client is installed.
    const command = `mysql -u "${user}" -p"${password}" -h "${host}" -P "${port}" "${database}" < "${sqlPath}"`;
    
    console.log(`Executing import for database: ${database} on ${host}...`);
    
    await execPromise(command);
    console.log("Successfully imported seed_data.sql");
    
  } catch (error) {
    console.error("Failed to parse DATABASE_URL or execute mysql command.", error);
    console.log("Please try importing manually: mysql -u USER -p DATABASE < prisma/seed_data.sql");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
