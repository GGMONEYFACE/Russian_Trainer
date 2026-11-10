"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";
import { addSuggestion } from "@/lib/store";

export async function submitSuggestion(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const result = await addSuggestion({
    userId: user?.id ?? null,
    name: user?.name ?? String(formData.get("name") ?? ""),
    email: user?.email ?? "",
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return { error: result.error, message: "" };
  revalidatePath("/admin");
  return { error: "", message: "Thanks, your suggestion was sent." };
}
