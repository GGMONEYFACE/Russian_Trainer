import { Suspense } from "react";
import Link from "next/link";
import { GenitivePractice } from "@/components/GenitivePractice";
import { genitivePracticeItems } from "@/data/genitiveQuantities";
import { getCurrentUser } from "@/lib/session";
import { studentAssignments } from "@/lib/store";

function GenitiveFallback() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Genitive case endings</h1>
      </header>
    </div>
  );
}

async function GenitiveBody({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let assignmentTitle: string | undefined;

  if (user && params.assignment) {
    const assigned = (await studentAssignments(user.id)).find(
      (item) => item.id === params.assignment,
    );
    if (assigned?.practiceId === "genitive-case") {
      assignmentTitle = assigned.title;
    }
  }

  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Genitive case endings</h1>
        <p>
          Quantity words pick the case: <strong>1</strong> stays nominative,{" "}
          <strong>2–4</strong> takes genitive singular on the noun, and{" "}
          <strong>5+ / много / нет</strong> take genitive plural. Type the full
          fixed phrase each time.
        </p>
        <p>
          Need the ending charts first?{" "}
          <Link href="/reference#genitive-quantities">See the Resources breakdown</Link>.
        </p>
      </header>
      <GenitivePractice
        key={params.assignment ?? "free"}
        items={genitivePracticeItems}
        signedIn={Boolean(user)}
        assignmentTitle={assignmentTitle}
      />
    </div>
  );
}

export default function GenitivePracticePage({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string }>;
}) {
  return (
    <Suspense fallback={<GenitiveFallback />}>
      <GenitiveBody searchParams={searchParams} />
    </Suspense>
  );
}
