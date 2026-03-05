import { NextResponse } from "next/server";
import { createTeleOPDBooking } from "@/role3/src/teleopdService";

export async function POST(req: Request) {
  const { phcId, category, slot } = await req.json();
  if (!phcId || !category || !slot) {
    return NextResponse.json({ error: "phcId, category, slot required" }, { status: 400 });
  }
  const created = await createTeleOPDBooking({ phcId, category, slot });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
