// sync.mjs — Importe les candidatures du bot JSON → PostgreSQL
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const JSON_PATH = resolve(__dirname, "../../job-hunter/data/applications_log/applications.json");

if (!existsSync(JSON_PATH)) {
  console.error("Fichier introuvable :", JSON_PATH);
  process.exit(1);
}

const entries = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
console.log(`📂 ${entries.length} candidatures trouvées dans le JSON`);

let inserted = 0, skipped = 0;

for (const entry of entries) {
  if (!entry.url) { skipped++; continue; }
  await prisma.application.upsert({
    where: { url: entry.url },
    update: {},
    create: {
      platform: entry.platform ?? "linkedin",
      title:    entry.title ?? "",
      company:  entry.company ?? "",
      location: entry.location ?? null,
      url:      entry.url,
      status:   entry.status ?? "applied",
      dateApplied: entry.date_applied ? new Date(entry.date_applied) : new Date(),
    },
  });
  inserted++;
}

console.log(`✅ ${inserted} candidatures synchronisées (${skipped} ignorées)`);
await prisma.$disconnect();
