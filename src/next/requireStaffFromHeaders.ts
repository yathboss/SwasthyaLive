import { getAuth } from "../firebaseAdmin";

/**
 * Next.js Route Handler helper: verifies STAFF via Bearer token or allowlisted email.
 * - Authorization: Bearer <Firebase ID token>
 * - OR x-staff-email: <allowlisted email> (demo fallback)
 */
function allowlisted(email?: string): boolean {
  const list = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (!email) return false;
  return list.includes(email.toLowerCase());
}

export async function requireStaffFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

  if (!token) {
    const email = headers.get("x-staff-email") ?? undefined;
    if (allowlisted(email)) return { uid: "demo-allowlist", email, role: "staff" as const };
    throw new Error("STAFF auth required (missing Bearer token).");
  }

  const decoded = await getAuth().verifyIdToken(token);
  const role = (decoded as any).role;
  const staff = (decoded as any).staff;

  if (role === "staff" || staff === true || allowlisted(decoded.email)) {
    return { uid: decoded.uid, email: decoded.email, role: "staff" as const };
  }

  throw new Error("Forbidden: user is not STAFF.");
}
