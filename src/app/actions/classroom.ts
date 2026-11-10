"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";
import {
  addClassroomMember,
  assignPractice,
  createClassroom,
  removeClassroomMember,
} from "@/lib/store";

function isId(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

async function instructor() {
  const user = await getCurrentUser();
  if (!user || user.role !== "instructor") return null;
  return user;
}

export async function createClassroomAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await instructor();
  if (!user) return { error: "Only instructors can create classrooms.", message: "" };
  const result = await createClassroom(user.id, String(formData.get("name") ?? ""));
  if (!result.ok) return { error: result.error, message: "" };
  redirect(`/classrooms/${result.id}`);
}

export async function addMemberAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await instructor();
  if (!user) return { error: "Only instructors can add students.", message: "" };
  const classroomId = String(formData.get("classroomId") ?? "");
  if (!isId(classroomId)) return { error: "Classroom not found.", message: "" };
  const result = await addClassroomMember(
    user.id,
    classroomId,
    String(formData.get("email") ?? ""),
  );
  if (!result.ok) return { error: result.error, message: "" };
  revalidatePath(`/classrooms/${classroomId}`);
  return { error: "", message: result.message };
}

export async function assignPracticeAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await instructor();
  if (!user) return { error: "Only instructors can assign practice.", message: "" };
  const classroomId = String(formData.get("classroomId") ?? "");
  if (!isId(classroomId)) return { error: "Classroom not found.", message: "" };
  const result = await assignPractice(
    user.id,
    classroomId,
    String(formData.get("practiceId") ?? ""),
  );
  if (!result.ok) return { error: result.error, message: "" };
  revalidatePath(`/classrooms/${classroomId}`);
  revalidatePath("/profile");
  return { error: "", message: result.message };
}

export async function removeMemberAction(formData: FormData) {
  const user = await instructor();
  if (!user) redirect("/login?next=/classrooms");
  const classroomId = String(formData.get("classroomId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!isId(classroomId) || !isId(userId)) redirect("/classrooms");
  await removeClassroomMember(user.id, classroomId, userId);
  revalidatePath(`/classrooms/${classroomId}`);
}
