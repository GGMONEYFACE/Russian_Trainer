import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "rt_admin";
const HALF_HOUR_MS = 30 * 60 * 1000;

function gateKey() {
  const secret = process.env.TRAINER_DB_SECRET ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!secret || !password) return "";
  return `${secret}:${password}`;
}

function sign(expiry: string) {
  return createHmac("sha256", gateKey()).update(`admin:${expiry}`).digest("hex");
}

export function adminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function adminPasswordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || input.length < 1 || input.length > 200) return false;
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function adminGateTokenValid(value: string, now = Date.now()) {
  if (!gateKey()) return false;
  const splitAt = value.lastIndexOf(".");
  if (splitAt <= 0) return false;
  const expiry = value.slice(0, splitAt);
  const mac = value.slice(splitAt + 1);
  if (!/^\d+$/.test(expiry)) return false;
  const expected = sign(expiry);
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  const expiresAt = Number(expiry);
  return expiresAt > now && expiresAt <= now + HALF_HOUR_MS + 60_000;
}

export async function adminGateValid() {
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  return adminGateTokenValid(value);
}

export async function refreshAdminGate() {
  const expiry = String(Date.now() + HALF_HOUR_MS);
  const jar = await cookies();
  jar.set(COOKIE, `${expiry}.${sign(expiry)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    expires: new Date(Number(expiry)),
  });
}

export async function clearAdminGate() {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: "/admin" });
}
