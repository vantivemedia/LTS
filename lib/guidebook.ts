import { createHmac, timingSafeEqual } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";

// The guidebook lives in /private (not /public) so it can only be reached through the
// unlock flow — a direct URL to the file doesn't exist. Drop the PDF here to switch the
// /nextrep page from "coming soon" to live.
export const GUIDEBOOK_PATH = path.join(process.cwd(), "private", "lts-guidebook.pdf");
export const GUIDEBOOK_FILENAME = "The-Next-Rep-Player-Guide-2026.pdf";

export function guidebookExists() {
  return existsSync(GUIDEBOOK_PATH);
}

export function readGuidebook() {
  return readFileSync(GUIDEBOOK_PATH);
}

// Stateless signed token handed back after the form is submitted. It proves the visitor
// unlocked the guide (so the download / email endpoints can't be hit directly) and pins
// the email address the guide may be sent to.
const TOKEN_TTL_MS = 60 * 60 * 1000;

function secret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "lts-guidebook-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(email: string, parentName: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, p: parentName, x: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: unknown): { email: string; parentName: string } | null {
  if (typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { e, p, x } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof e !== "string" || typeof x !== "number" || x < Date.now()) return null;
    return { email: e, parentName: typeof p === "string" ? p : "" };
  } catch {
    return null;
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Attribution comes from the browser, so only keep known string fields, length-capped.
export function sanitizeAttribution(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (input && typeof input === "object") {
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "referrer"]) {
      const v = (input as Record<string, unknown>)[k];
      if (typeof v === "string" && v) out[k] = v.slice(0, 80);
    }
  }
  return out;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
