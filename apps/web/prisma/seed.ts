import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type StageSeed = {
  id: number;
  name: string;
  level: number;
  target_function: string;
  description: string;
};

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const file = join(__dirname, "../src/data/stages.json");
  const raw = await readFile(file, "utf8");
  const stages = JSON.parse(raw) as StageSeed[];

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      create: {
        id: stage.id,
        name: stage.name,
        level: stage.level,
        targetFunction: stage.target_function,
        description: stage.description
      },
      update: {
        name: stage.name,
        level: stage.level,
        targetFunction: stage.target_function,
        description: stage.description
      }
    });
  }

  console.log(`Seeded ${stages.length} stages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

