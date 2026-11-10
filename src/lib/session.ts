import { cookies } from "next/headers";
import { deleteSessionToken, openSession, userForToken } from "@/lib/store";

const COOKIE = "rt_session";

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return userForToken(token);
}

export async function startSession(userId: string, remember: boolean) {
  const { token, expiresAt } = await openSession(userId, remember);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { expires: new Date(expiresAt) } : {}),
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await deleteSessionToken(token);
  jar.delete(COOKIE);
}
