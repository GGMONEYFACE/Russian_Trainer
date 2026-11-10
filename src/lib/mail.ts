import { headers } from "next/headers";

export function emailVerificationEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function appOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function verificationLink(origin: string, token: string) {
  return `${origin}/verify?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    return { ok: false as const, error: "Email verification is not configured." };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Confirm your Russian Trainer account",
      text: `Confirm your account by opening this link:\n\n${link}\n\nThis link expires in 24 hours. If you did not create an account, you can ignore this email.`,
    }),
  });
  if (!response.ok) return { ok: false as const, error: "Could not send the confirmation email." };
  return { ok: true as const };
}
