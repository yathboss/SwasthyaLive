import "dotenv/config";
import express from "express";
import cors from "cors";

import { getPHCStatus, upsertPHCStatus } from "../phcService.js";
import { seedPHC001 } from "../seedData.js";
import { requireStaff } from "../auth.js";
import { createTeleOPDBooking } from "../teleopdService.js";
import { markSopCompleted } from "../learningService.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * PUBLIC: read PHC status (read-only)
 */
app.get("/api/role3/public/phc/:phcId", async (req, res) => {
  try {
    const phcId = req.params.phcId;
    const doc = await getPHCStatus(phcId);
    if (!doc) return res.status(404).json({ error: "PHC not found" });
    return res.json(doc);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
});

/**
 * STAFF: update PHC status (operational signals only)
 */
app.post("/api/role3/staff/phc/:phcId", async (req, res) => {
  try {
    await requireStaff(req);
    const phcId = req.params.phcId;
    const payload = req.body ?? {};
    const updated = await upsertPHCStatus(phcId, payload);
    return res.json(updated);
  } catch (e: any) {
    const msg = e?.message ?? "Server error";
    const status = msg.includes("Forbidden") ? 403 : msg.includes("STAFF auth") ? 401 : 500;
    return res.status(status).json({ error: msg });
  }
});

/**
 * PUBLIC: create Tele-OPD booking (no PII)
 * In production, you may require auth/app-check.
 */
app.post("/api/role3/public/teleopd", async (req, res) => {
  try {
    const { phcId, category, slot } = req.body ?? {};
    if (!phcId || !category || !slot) return res.status(400).json({ error: "phcId, category, slot required" });

    const created = await createTeleOPDBooking({ phcId, category, slot });
    return res.status(201).json({ id: created.id });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
});

/**
 * STAFF: mark SOP completion
 */
app.post("/api/role3/staff/learning/complete", async (req, res) => {
  try {
    await requireStaff(req);
    const { phcId, roleOrUser, sopId } = req.body ?? {};
    if (!phcId || !roleOrUser || !sopId) return res.status(400).json({ error: "phcId, roleOrUser, sopId required" });

    const out = await markSopCompleted({ phcId, roleOrUser, sopId });
    return res.json(out);
  } catch (e: any) {
    const msg = e?.message ?? "Server error";
    const status = msg.includes("Forbidden") ? 403 : msg.includes("STAFF auth") ? 401 : 500;
    return res.status(status).json({ error: msg });
  }
});

/**
 * DEMO: Seed initializer (staff recommended, but MVP allows open to avoid demo failure)
 * You can lock this down later.
 */
app.post("/api/role3/seed", async (_req, res) => {
  try {
    const out = await seedPHC001();
    return res.json({ ok: true, phcId: out.phcId, readinessScore: out.readinessScore, predictedWaitMins: out.predictedWaitMins });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Role-3 Express API listening on http://localhost:${port}`);
});
