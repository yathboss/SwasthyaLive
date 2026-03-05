// Optional helper if you want to copy built files somewhere.
// Not required for MVP. Kept minimal.
import { mkdirSync, cpSync } from "node:fs";
mkdirSync("dist", { recursive: true });
cpSync("firestore.rules", "dist/firestore.rules", { force: true });
