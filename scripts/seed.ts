import "dotenv/config";
import { seedPHC001 } from "../src/seedData.js";

async function main() {
  const out = await seedPHC001();
  // eslint-disable-next-line no-console
  console.log("Seeded:", { phcId: out.phcId, readinessScore: out.readinessScore, predictedWaitMins: out.predictedWaitMins });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
