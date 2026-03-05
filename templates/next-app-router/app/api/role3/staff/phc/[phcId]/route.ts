import { NextResponse } from "next/server";
import { upsertPHCStatus } from "@/role3/src/phcService";
import { requireStaffFromHeaders } from "@/role3/src/next/requireStaffFromHeaders";

export async function POST(req: Request, ctx: { params: { phcId: string } }) {
  try {
    await requireStaffFromHeaders(req.headers);
    const phcId = ctx.params.phcId;
    const payload = await req.json();
    const updated = await upsertPHCStatus(phcId, payload);
    return NextResponse.json(updated);
  } catch (e: any) {
    const msg = e?.message ?? "Server error";
    const status = msg.includes("Forbidden") ? 403 : msg.includes("STAFF auth") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
