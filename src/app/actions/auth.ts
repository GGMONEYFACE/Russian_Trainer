"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { appOrigin, emailVerificationEnabled, sendVerificationEmail, verificationLink } from "@/lib/mail";
import { safeNext } from "@/lib/paths";
import { endSession, getCurrentUser, startSession } from "@/lib/session";
import {
  authenticate,
  deleteUnverifiedAccount,
  issueVerification,
  promoteToInstructor,
  registerAccount,
  renameUser,
  replacePassword,
} from "@/lib/store";

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "yes";
  const nextPath = safeNext(String(formData.get("next") ?? ""));
  const result = await authenticate(email, password);
  if (result.status === "invalid") return { error: "Invalid email or password.", message: "" };
  if (result.status === "unverified") {
    if (String(formData.get("intent") ?? "") !== "resend") {
      return { error: "Confirm your email before signing in.", message: "" };
    }
    const issued = await issueVerification(result.userId);
    if (!issued.ok) return { error: issued.error, message: "" };
    const sent = await sendVerificationEmail(
      issued.email,
      verificationLink(await appOrigin(), issued.token),
    );
    if (!sent.ok) return { error: sent.error, message: "" };
    return { error: "", message: "Confirmation email sent. The link expires in 24 hours." };
  }
  await startSession(result.user.id, remember);
  redirect(nextPath);
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "Passwords do not match.", message: "" };

  const verify = emailVerificationEnabled();
  const result = await registerAccount({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password,
    verify,
  });
  if (!result.ok) return { error: result.error, message: "" };
  if (result.verifyToken) {
    const sent = await sendVerificationEmail(
      result.user.email,
      verificationLink(await appOrigin(), result.verifyToken),
    );
    if (!sent.ok) {
      await deleteUnverifiedAccount(result.user.id);
      return { error: "Could not send the confirmation email. Try again in a minute.", message: "" };
    }
    return {
      error: "",
      message: "Check your email and open the confirmation link. It expires in 24 hours.",
    };
  }

  await startSession(result.user.id, true);
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function becomeInstructor(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again.", message: "" };
  const result = await promoteToInstructor(user.id, String(formData.get("code") ?? ""));
  if (!result.ok) return { error: result.error, message: "" };
  redirect("/classrooms");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

export async function updateName(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again.", message: "" };
  const result = await renameUser(user.id, String(formData.get("name") ?? ""));
  if (!result.ok) return { error: result.error, message: "" };
  redirect("/profile");
}

export async function updatePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again.", message: "" };
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) return { error: "Passwords do not match.", message: "" };
  const result = await replacePassword(user.id, String(formData.get("current") ?? ""), next);
  if (!result.ok) return { error: result.error, message: "" };
  return { error: "", message: "Password updated." };
}
