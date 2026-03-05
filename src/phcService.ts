import { getDb, serverTimestamp } from "./firebaseAdmin.js";
import type { PHCStatusDoc } from "./types.js";
import { computeReadiness } from "./scoring.js";

const PHC_STATUS_COL = "phc_status";

export async function getPHCStatus(phcId: string): Promise<PHCStatusDoc | null> {
  const snap = await getDb().collection(PHC_STATUS_COL).doc(phcId).get();
  if (!snap.exists) return null;
  const data = snap.data() as any;
  return { ...(data as PHCStatusDoc), phcId };
}

export async function upsertPHCStatus(phcId: string, partial: Partial<PHCStatusDoc>): Promise<PHCStatusDoc> {
  const ref = getDb().collection(PHC_STATUS_COL).doc(phcId);
  const existing = await ref.get();
  const base = (existing.exists ? (existing.data() as any) : {}) as Partial<PHCStatusDoc>;

  // Merge operational fields only
  const merged = {
    doctorStatus: partial.doctorStatus ?? base.doctorStatus ?? "Available",
    queueCount: partial.queueCount ?? base.queueCount ?? 0,
    nowServing: partial.nowServing ?? base.nowServing ?? "T-00",
    avgConsultMins: partial.avgConsultMins ?? base.avgConsultMins ?? 6,
    alerts: partial.alerts ?? base.alerts ?? [],
    medicines: partial.medicines ?? base.medicines ?? {},
  };

  const breakdown = computeReadiness({
    doctorStatus: merged.doctorStatus,
    queueCount: merged.queueCount,
    avgConsultMins: merged.avgConsultMins,
    alerts: merged.alerts,
    medicines: merged.medicines,
  });

  const docToWrite = {
    ...merged,
    readinessScore: breakdown.readinessScore,
    predictedWaitMins: breakdown.predictedWaitMins,
    updatedAt: serverTimestamp(),
  };

  await ref.set(docToWrite, { merge: true });

  const outSnap = await ref.get();
  const out = outSnap.data() as any;
  return { ...(out as PHCStatusDoc), phcId };
}
