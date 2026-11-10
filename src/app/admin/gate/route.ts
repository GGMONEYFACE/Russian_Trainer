import { adminGateValid, refreshAdminGate } from "@/lib/admin-gate";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.admin || !(await adminGateValid())) return new Response(null, { status: 401 });
  await refreshAdminGate();
  return new Response(null, { status: 204 });
}
