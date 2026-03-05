import { NextResponse } from "next/server";
import { getPHCStatus } from "@/role3/src/phcService";

export async function GET(_req: Request, ctx: { params: { phcId: string } }) {
  const phcId = ctx.params.phcId;
  const doc = await getPHCStatus(phcId);
  if (!doc) return NextResponse.json({ error: "PHC not found" }, { status: 404 });
  return NextResponse.json(doc);
}
