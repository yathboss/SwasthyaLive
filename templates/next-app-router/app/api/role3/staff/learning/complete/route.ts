import { NextResponse } from "next/server";
import { markSopCompleted } from "@/role3/src/learningService";
import { requireStaffFromHeaders } from "@/role3/src/next/requireStaffFromHeaders";

export async function POST(req: Request) {
  try {
    await requireStaffFromHeaders(req.headers);
    const { phcId, roleOrUser, sopId } = await req.json();
    if (!phcId || !roleOrUser || !sopId) {
      return NextResponse.json({ error: "phcId, roleOrUser, sopId required" }, { status: 400 });
    }
    const out = await markSopCompleted({ phcId, roleOrUser, sopId });
    return NextResponse.json(out);
  } catch (e: any) {
    const msg = e?.message ?? "Server error";
    const status = msg.includes("Forbidden") ? 403 : msg.includes("STAFF auth") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
