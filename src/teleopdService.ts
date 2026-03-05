import { getDb, serverTimestamp } from "./firebaseAdmin.js";
import type { TeleOPDBookingDoc, TeleOPDCategory, TeleOPDStatus } from "./types.js";

const COL = "teleopd_bookings";

export async function createTeleOPDBooking(input: {
  phcId: string;
  category: TeleOPDCategory;
  slot: string; // ISO
  status?: TeleOPDStatus;
}): Promise<{ id: string; doc: TeleOPDBookingDoc }> {
  const ref = getDb().collection(COL).doc();
  const doc: TeleOPDBookingDoc = {
    phcId: input.phcId,
    category: input.category,
    slot: input.slot,
    status: input.status ?? "requested",
    createdAt: serverTimestamp(),
  } as any;

  await ref.set(doc);
  return { id: ref.id, doc };
}
