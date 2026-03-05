import "dotenv/config";
import { getAuth } from "../src/firebaseAdmin.js";

/**
 * Sets custom claim { role: "staff" } for a given UID.
 * Usage:
 *   npm run set-staff-claim -- <UID>
 */
async function main() {
  const uid = process.argv[2];
  if (!uid) throw new Error("Missing UID argument.");

  await getAuth().setCustomUserClaims(uid, { role: "staff" });
  // eslint-disable-next-line no-console
  console.log("Set role=staff for UID:", uid);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
