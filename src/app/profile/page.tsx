import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NameForm, PasswordForm } from "@/components/ProfileForms";
import { practicePath } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { missedQuestions, studentAssignments } from "@/lib/store";

export const metadata = {
  title: "Profile · Russian Trainer",
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function ProfileBody() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  const [misses, assigned] = await Promise.all([
    missedQuestions(user.id),
    studentAssignments(user.id),
  ]);

  return (
    <div className="shell profile-page">
      <header className="page-hero">
        <h1>{user.name}</h1>
        <p>
          {user.email} · {user.role === "instructor" ? "Instructor" : "Student"}
        </p>
      </header>

      {user.role === "instructor" ? (
        <p className="profile-actions">
          <Link href="/classrooms" className="btn btn--primary">
            Manage classrooms
          </Link>
        </p>
      ) : null}

      <section className="profile-section">
        <h2 className="section__title">Questions you miss</h2>
        <p className="section__lede">
          These are questions you have gotten wrong at least twice, and wrong more often than right.
        </p>
        {misses.length === 0 ? (
          <p className="muted">None yet. Keep practicing, and repeated misses will stay listed here.</p>
        ) : (
          <div className="miss-list">
            {misses.map((miss) => (
              <article className="miss-card" key={miss.questionKey}>
                <div className="miss-card__top">
                  <strong>{miss.prompt}</strong>
                  <span className="review-wrong">
                    Missed {miss.misses} · Right {miss.hits}
                  </span>
                </div>
                <p className="muted">{miss.detail}</p>
                <p>Last wrong answer: {miss.lastGiven}</p>
                <p>Expected: {miss.expected}</p>
                <Link href={practicePath(miss.practiceId)} className="btn btn--ghost-dark btn--small">
                  Practice this
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2 className="section__title">Assigned practice</h2>
        {assigned.length === 0 ? (
          <p className="muted">No practice assigned yet.</p>
        ) : (
          <div className="miss-list">
            {assigned.map((item) => (
              <article className="miss-card" key={item.id}>
                <div className="miss-card__top">
                  <strong>{item.title}</strong>
                  <span className={item.completedAt ? "review-correct" : "muted"}>
                    {item.completedAt
                      ? `Done · ${item.correct}/${item.total} · ${formatWhen(item.completedAt)}`
                      : "Not yet"}
                  </span>
                </div>
                <p className="muted">{item.classroomName}</p>
                <Link href={practicePath(item.practiceId, item.id)} className="btn btn--primary btn--small">
                  {item.completedAt ? "Practice again" : "Start practice"}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="auth-page auth-page--section">
        <h2>Your account</h2>
        <div className="login-container">
          <NameForm name={user.name} />
        </div>
        <div className="login-container account-block">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <header className="page-hero">
            <h1>Profile</h1>
          </header>
        </div>
      }
    >
      <ProfileBody />
    </Suspense>
  );
}
