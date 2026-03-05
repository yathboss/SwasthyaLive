import { getDb, serverTimestamp } from "./firebaseAdmin.js";

const ROOT = "staff_learning";

export async function markSopCompleted(params: {
  phcId: string;
  roleOrUser: string;
  sopId: string;
}) {
  const { phcId, roleOrUser, sopId } = params;

  const ref = getDb().collection(ROOT).doc(phcId).collection("completions").doc(roleOrUser);

  // Append completion item in a simple array (MVP-safe).
  // In production, you may prefer one doc per completion to avoid array growth.
  const snap = await ref.get();
  const existing = snap.exists ? (snap.data() as any) : { roleOrUser, items: [] };

  const items = Array.isArray(existing.items) ? existing.items : [];
  items.push({ sopId, completedAt: serverTimestamp() });

  await ref.set({ roleOrUser, items }, { merge: true });

  return { roleOrUser, itemsCount: items.length };
}
