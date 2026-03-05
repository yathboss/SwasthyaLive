import { NextResponse } from "next/server";
import { seedPHC001 } from "@/role3/src/seedData";

export async function POST() {
  const out = await seedPHC001();
  return NextResponse.json({ ok: true, phcId: out.phcId, readinessScore: out.readinessScore, predictedWaitMins: out.predictedWaitMins });
}
