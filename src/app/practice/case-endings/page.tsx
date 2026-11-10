import { Suspense } from "react";
import { CaseEndingPractice } from "@/components/CaseEndingPractice";
import { isCaseKey } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { studentAssignments } from "@/lib/store";
import type { CaseKey } from "@/data/caseEndings";

function CaseFallback() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Case endings</h1>
      </header>
    </div>
  );
}

async function CaseBody({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string; case?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let initialCase: CaseKey = params.case && isCaseKey(params.case) ? params.case : "nominative";
  let lockCase = false;
  let assignmentTitle: string | undefined;

  if (user && params.assignment) {
    const assigned = (await studentAssignments(user.id)).find((item) => item.id === params.assignment);
    if (assigned?.practiceId === "case-endings") {
      assignmentTitle = assigned.title;
    } else if (assigned?.practiceId.startsWith("case-endings:")) {
      const caseKey = assigned.practiceId.slice("case-endings:".length);
      if (isCaseKey(caseKey)) {
        assignmentTitle = assigned.title;
        initialCase = caseKey;
        lockCase = true;
      }
    }
  }

  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Case endings</h1>
        <p>Build your own reference charts for adjective and noun endings by gender.</p>
      </header>
      <CaseEndingPractice
        key={`${params.assignment ?? "free"}-${initialCase}-${lockCase ? "locked" : "open"}`}
        initialCase={initialCase}
        lockCase={lockCase}
        signedIn={Boolean(user)}
        assignmentTitle={assignmentTitle}
      />
    </div>
  );
}

export default function CaseEndingsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string; case?: string }>;
}) {
  return (
    <Suspense fallback={<CaseFallback />}>
      <CaseBody searchParams={searchParams} />
    </Suspense>
  );
}
