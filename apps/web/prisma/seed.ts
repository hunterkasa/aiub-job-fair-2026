import { ensureDatabaseSeeded } from "../src/lib/services/seedService";
import prisma from "../src/lib/db/prisma";

async function main() {
  console.log("Starting AIUB Job Fair 2026 database seed...");
  await ensureDatabaseSeeded();
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
