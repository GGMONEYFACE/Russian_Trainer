import { redirect } from "next/navigation";
import { startSession } from "@/lib/session";
import { consumeVerification } from "@/lib/store";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const userId = await consumeVerification(token);
  if (!userId) redirect("/login?verify=invalid");
  await startSession(userId, true);
  redirect("/profile");
}
