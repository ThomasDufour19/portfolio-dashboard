/**
 * scripts/sync-applications.ts
 * Importe les candidatures du fichier JSON du bot → PostgreSQL
 *
 * Usage : npx ts-node scripts/sync-applications.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const JSON_PATH = path.resolve(
  __dirname,
  "../../job-hunter/data/applications_log/applications.json"
);

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error("Fichier applications.json introuvable :", JSON_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const entries: any[] = JSON.parse(raw);

  console.log(`📂 ${entries.length} candidatures trouvées dans le JSON`);

  let inserted = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.url) {
      skipped++;
      continue;
    }

    await prisma.application.upsert({
      where: { url: entry.url },
      update: {},
      create: {
        platform: entry.platform ?? "linkedin",
        title: entry.title ?? "",
        company: entry.company ?? "",
        location: entry.location ?? null,
        url: entry.url,
        status: entry.status ?? "applied",
        dateApplied: entry.date_applied
          ? new Date(entry.date_applied)
          : new Date(),
      },
    });
    inserted++;
  }

  console.log(`✅ ${inserted} candidatures synchronisées (${skipped} ignorées)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
