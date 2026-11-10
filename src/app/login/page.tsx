import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { safeNext } from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Sign in · Russian Trainer",
};

async function LoginGate({ nextPath, notice }: { nextPath: string; notice: string }) {
  const user = await getCurrentUser();
  if (user) redirect(nextPath);
  return <LoginForm nextPath={nextPath} notice={notice} />;
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verify?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNext(params.next);
  const notice = params.verify === "invalid" ? "That confirmation link is invalid or expired." : "";
  return <LoginGate nextPath={nextPath} notice={notice} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verify?: string }>;
}) {
  return (
    <div className="auth-page">
      <h2>Sign in</h2>
      <p>Sign in with the email and password for your account.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
