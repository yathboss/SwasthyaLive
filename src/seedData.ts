import { upsertPHCStatus } from "./phcService.js";

export async function seedPHC001() {
  const phcId = "PHC_001";
  const doc = await upsertPHCStatus(phcId, {
    phcId,
    doctorStatus: "Available",
    queueCount: 12,
    nowServing: "T-07",
    avgConsultMins: 6,
    alerts: [
      { message: "Lab closed till 2 PM", severity: "warning", until: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() }
    ],
    medicines: {
      "Paracetamol": "Available",
      "ORS": "Low",
      "Amoxicillin": "Available",
      "Cetirizine": "Available",
      "Iron Folic Acid": "Available",
      "Zinc": "Low"
    }
  } as any);

  return doc;
}
