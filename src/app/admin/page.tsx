import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClearQuestionForm, PersonForm, ScoreForm } from "@/components/AdminForms";
import { getCurrentUser } from "@/lib/session";
import { adminMisses, adminPeople, adminScores } from "@/lib/store";

export const metadata = {
  title: "Admin · Russian Trainer",
  robots: { index: false, follow: false },
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function AdminBody() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.admin) redirect("/profile");
  const [people, scores, misses] = await Promise.all([adminPeople(), adminScores(), adminMisses()]);

  return (
    <div className="shell profile-page">
      <header className="page-hero">
        <h1>Admin</h1>
        <p>Edit names, roles, assignment scores, and repeated misses. This page is only available to your account.</p>
      </header>

      <section className="profile-section">
        <h2 className="section__title">People</h2>
        <div className="miss-list">
          {people.map((person) => (
            <article className="miss-card" key={person.id}>
              <div className="miss-card__top">
                <strong>{person.name}</strong>
                <span className="muted">{person.role === "instructor" ? "Instructor" : "Student"}</span>
              </div>
              <p className="muted">{person.email}</p>
              <PersonForm userId={person.id} name={person.name} role={person.role} />
            </article>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section__title">Results</h2>
        {scores.length === 0 ? (
          <p className="muted">No assigned practice yet.</p>
        ) : (
          <div className="miss-list">
            {scores.map((score) => (
              <article className="miss-card" key={`${score.assignmentId}-${score.userId}`}>
                <div className="miss-card__top">
                  <strong>{score.name}</strong>
                  <span className={score.completedAt ? "review-correct" : "muted"}>
                    {score.completedAt ? `Done · ${formatWhen(score.completedAt)}` : "Not yet"}
                  </span>
                </div>
                <p>{score.title}</p>
                <p className="muted">
                  {score.classroomName} · {score.email}
                </p>
                <ScoreForm
                  assignmentId={score.assignmentId}
                  userId={score.userId}
                  correct={score.correct}
                  total={score.total}
                  done={Boolean(score.completedAt)}
                />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2 className="section__title">Repeated misses</h2>
        {misses.length === 0 ? (
          <p className="muted">Nobody has a question wrong at least twice and more often than right.</p>
        ) : (
          <div className="miss-list">
            {misses.map((miss) => (
              <article className="miss-card" key={`${miss.userId}-${miss.questionKey}`}>
                <div className="miss-card__top">
                  <strong>{miss.prompt}</strong>
                  <span className="review-wrong">
                    Missed {miss.misses} · Right {miss.hits}
                  </span>
                </div>
                <p className="muted">
                  {miss.name} · {miss.email}
                </p>
                <p>{miss.detail}</p>
                <p>Last wrong answer: {miss.lastGiven}</p>
                <p>Expected: {miss.expected}</p>
                <ClearQuestionForm userId={miss.userId} questionKey={miss.questionKey} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <header className="page-hero">
            <h1>Admin</h1>
          </header>
        </div>
      }
    >
      <AdminBody />
    </Suspense>
  );
}
