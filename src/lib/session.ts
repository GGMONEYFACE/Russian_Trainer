import { clearAdminGate } from "@/lib/admin-gate";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { PublicUser } from "@/lib/store";

export async function getCurrentUser(): Promise<(PublicUser & { admin: boolean }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const id = data?.claims.sub;
  if (error || !id) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role === "instructor" ? "instructor" : "student",
    admin: isAdminEmail(profile.email),
  };
}

export async function endSession() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearAdminGate();
}
