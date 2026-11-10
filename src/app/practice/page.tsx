import { Suspense } from "react";
import { PracticeDrill } from "@/components/PracticeDrill";
import level1 from "@/data/level1.json";
import { isLevel1Set } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { studentAssignments } from "@/lib/store";
import type { Level1Data } from "@/lib/types";

const data = level1 as Level1Data;

function PracticeFallback() {
  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Gender agreement</h1>
      </header>
    </div>
  );
}

async function PracticeBody({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string; set?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let initialSetId = params.set && isLevel1Set(params.set) ? params.set : "all";
  let lockSet = false;
  let assignmentTitle: string | undefined;

  if (user && params.assignment) {
    const assigned = (await studentAssignments(user.id)).find((item) => item.id === params.assignment);
    if (assigned?.practiceId === "level1") {
      assignmentTitle = assigned.title;
      initialSetId = "all";
      lockSet = true;
    } else if (assigned?.practiceId.startsWith("level1:")) {
      assignmentTitle = assigned.title;
      initialSetId = assigned.practiceId.slice("level1:".length);
      lockSet = true;
    }
  }

  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Practice · Gender agreement</h1>
        <p>
          Fill in the adjective ending by default. You can switch one question
          to multiple choice, or identify the noun&apos;s gender. Feedback shows
          the full classroom phrase.
        </p>
        {assignmentTitle ? <p>Assigned: {assignmentTitle}</p> : null}
      </header>
      <PracticeDrill
        key={`${params.assignment ?? "free"}-${initialSetId}`}
        items={data.practice}
        setOptions={data.sets.map((set) => ({ id: set.id, title: set.title }))}
        genderLabels={data.genderLabels}
        initialSetId={initialSetId}
        lockSet={lockSet}
        signedIn={Boolean(user)}
      />
    </div>
  );
}

export default function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string; set?: string }>;
}) {
  return (
    <Suspense fallback={<PracticeFallback />}>
      <PracticeBody searchParams={searchParams} />
    </Suspense>
  );
}
