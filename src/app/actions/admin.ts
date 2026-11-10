"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";
import {
  adminClearQuestion,
  adminDeleteSuggestion,
  adminRename,
  adminSetRole,
  adminSetScore,
  type Role,
} from "@/lib/store";

function isId(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

async function admin() {
  const user = await getCurrentUser();
  if (!user?.admin) return null;
  return user;
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/profile");
  revalidatePath("/classrooms");
}

export async function adminRenameAction(_state: FormState, formData: FormData): Promise<FormState> {
  if (!(await admin())) return { error: "That page is not available.", message: "" };
  const userId = String(formData.get("userId") ?? "");
  if (!isId(userId)) return { error: "Account not found.", message: "" };
  const result = await adminRename(userId, String(formData.get("name") ?? ""));
  if (!result.ok) return { error: result.error, message: "" };
  refresh();
  return { error: "", message: "Name saved." };
}

export async function adminRoleAction(_state: FormState, formData: FormData): Promise<FormState> {
  if (!(await admin())) return { error: "That page is not available.", message: "" };
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!isId(userId)) return { error: "Account not found.", message: "" };
  if (role !== "student" && role !== "instructor") {
    return { error: "Choose student or instructor.", message: "" };
  }
  const result = await adminSetRole(userId, role as Role);
  if (!result.ok) return { error: result.error, message: "" };
  refresh();
  return { error: "", message: "Role saved." };
}

export async function adminScoreAction(_state: FormState, formData: FormData): Promise<FormState> {
  if (!(await admin())) return { error: "That page is not available.", message: "" };
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!isId(assignmentId) || !isId(userId)) return { error: "Result not found.", message: "" };
  const result = await adminSetScore(
    assignmentId,
    userId,
    Number(formData.get("correct")),
    Number(formData.get("total")),
    formData.get("done") === "yes",
  );
  if (!result.ok) return { error: result.error, message: "" };
  refresh();
  return { error: "", message: result.message };
}

export async function adminClearQuestionAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await admin())) return { error: "That page is not available.", message: "" };
  const userId = String(formData.get("userId") ?? "");
  if (!isId(userId)) return { error: "Account not found.", message: "" };
  const result = await adminClearQuestion(userId, String(formData.get("questionKey") ?? ""));
  if (!result.ok) return { error: result.error, message: "" };
  refresh();
  return { error: "", message: "Removed those attempts." };
}

export async function adminDismissSuggestionAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await admin())) return { error: "That page is not available.", message: "" };
  const suggestionId = String(formData.get("suggestionId") ?? "");
  if (!isId(suggestionId)) return { error: "Suggestion not found.", message: "" };
  const result = await adminDeleteSuggestion(suggestionId);
  if (!result.ok) return { error: result.error, message: "" };
  refresh();
  return { error: "", message: "Suggestion removed." };
}
