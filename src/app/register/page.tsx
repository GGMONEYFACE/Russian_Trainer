import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { safeNext } from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Create an account · Russian Trainer",
};

async function RegisterGate({ nextPath }: { nextPath: string }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "instructor" ? "/classrooms" : nextPath);
  return <RegisterForm nextPath={nextPath} />;
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <RegisterGate nextPath={safeNext(params.next)} />;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="auth-page">
      <h2>Create an account</h2>
      <p>Students practice with this account. Instructors can also open classrooms.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <RegisterContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
