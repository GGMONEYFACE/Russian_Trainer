"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { safeNext } from "@/lib/paths";
import { endSession, getCurrentUser } from "@/lib/session";
import { cleanEmail, cleanName, emailLooksValid, promoteToInstructor, renameUser } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = cleanEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createClient();

  if (String(formData.get("intent") ?? "") === "resend") {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return { error: "Could not send the confirmation email.", message: "" };
    return { error: "", message: "Confirmation email sent. The link expires in 24 hours." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("confirm")) {
      return { error: "Confirm your email before signing in.", message: "" };
    }
    return { error: "Invalid email or password.", message: "" };
  }
  redirect(nextPath);
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "Passwords do not match.", message: "" };
  const name = cleanName(String(formData.get("name") ?? ""));
  const email = cleanEmail(String(formData.get("email") ?? ""));
  if (!name) return { error: "Enter your name.", message: "" };
  if (!emailLooksValid(email)) return { error: "Enter a valid email.", message: "" };
  if (password.length < 8 || password.length > 72) {
    return { error: "Password must be 8 to 72 characters.", message: "" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error || data.user?.identities?.length === 0) {
    const message = error?.message.toLowerCase() ?? "";
    if (message.includes("already") || data.user?.identities?.length === 0) {
      return { error: "An account with that email already exists.", message: "" };
    }
    return { error: "Could not create the account.", message: "" };
  }
  if (!data.session) {
    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error) {
      if (signedIn.error.message.toLowerCase().includes("confirm")) {
        return { error: "", message: "Check your email and open the confirmation link." };
      }
      return { error: "Could not create the account.", message: "" };
    }
  }
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function becomeInstructor(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again.", message: "" };
  const result = await promoteToInstructor(String(formData.get("code") ?? ""));
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
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) return { error: "Passwords do not match.", message: "" };
  if (next.length < 8 || next.length > 72) {
    return { error: "Password must be 8 to 72 characters.", message: "" };
  }
  const supabase = await createClient();
  const { error: currentError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (currentError) return { error: "Current password is incorrect.", message: "" };
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: "Could not update the password.", message: "" };
  return { error: "", message: "Password updated." };
}
