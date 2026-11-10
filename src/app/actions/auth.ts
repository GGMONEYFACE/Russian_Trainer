"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { safeNext } from "@/lib/paths";
import { endSession, getCurrentUser, startSession } from "@/lib/session";
import {
  authenticate,
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
  const user = await authenticate(email, password);
  if (!user) return { error: "Invalid email or password.", message: "" };
  await startSession(user.id, remember);
  redirect(nextPath);
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "Passwords do not match.", message: "" };

  const result = await registerAccount({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password,
  });
  if (!result.ok) return { error: result.error, message: "" };

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
