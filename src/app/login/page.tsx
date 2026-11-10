import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { safeNext } from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Sign in · Russian Trainer",
};

async function LoginGate({ nextPath }: { nextPath: string }) {
  const user = await getCurrentUser();
  if (user) redirect(nextPath);
  return <LoginForm nextPath={nextPath} />;
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNext(params.next);
  return <LoginGate nextPath={nextPath} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
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
