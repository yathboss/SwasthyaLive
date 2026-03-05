import type { Request } from "express";
import { getAuth } from "./firebaseAdmin.js";

export interface StaffPrincipal {
  uid: string;
  email?: string;
  role: "staff";
}

function allowlisted(email?: string): boolean {
  const list = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (!email) return false;
  return list.includes(email.toLowerCase());
}

export async function requireStaff(req: Request): Promise<StaffPrincipal> {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

  if (!token) {
    // Demo fallback: allow if x-staff-email header is allowlisted
    const email = req.header("x-staff-email") ?? undefined;
    if (allowlisted(email)) return { uid: "demo-allowlist", email, role: "staff" };
    throw new Error("STAFF auth required (missing Bearer token).");
  }

  const decoded = await getAuth().verifyIdToken(token);
  const role = (decoded as any).role;
  const staff = (decoded as any).staff;

  if (role === "staff" || staff === true || allowlisted(decoded.email)) {
    return { uid: decoded.uid, email: decoded.email, role: "staff" };
  }

  throw new Error("Forbidden: user is not STAFF.");
}
