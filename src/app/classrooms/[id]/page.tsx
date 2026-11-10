import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { removeMemberAction } from "@/app/actions/classroom";
import { AddMemberForm, AssignPracticeForm } from "@/components/ClassroomForms";
import { practiceOptions } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { classroomForInstructor } from "@/lib/store";

export const metadata = {
  title: "Classroom · Russian Trainer",
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function ClassroomBody({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/classrooms");
  if (user.role !== "instructor") redirect("/profile");
  const { id } = await params;
  const classroom = await classroomForInstructor(user.id, id);
  if (!classroom) {
    return (
      <div className="shell">
        <header className="page-hero">
          <h1>Classroom not found</h1>
          <p>
            <Link href="/classrooms">Back to classrooms</Link>
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="page-hero">
        <p className="section__eyebrow">
          <Link href="/classrooms">Classrooms</Link>
        </p>
        <h1>{classroom.name}</h1>
        <p>Add students, assign a practice, and see when each person finishes.</p>
      </header>

      <section className="profile-section">
        <h2 className="section__title">Students</h2>
        <AddMemberForm classroomId={classroom.id} />
        {classroom.members.length === 0 ? (
          <p className="muted">Nobody is in this classroom yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="adj-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col"> </th>
                </tr>
              </thead>
              <tbody>
                {classroom.members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <form action={removeMemberAction}>
                        <input type="hidden" name="classroomId" value={classroom.id} />
                        <input type="hidden" name="userId" value={member.id} />
                        <button type="submit" className="btn btn--ghost-dark btn--small">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2 className="section__title">Assigned practice</h2>
        <AssignPracticeForm classroomId={classroom.id} options={practiceOptions()} />
        {classroom.assignments.length === 0 ? (
          <p className="muted">Nothing assigned yet.</p>
        ) : (
          classroom.assignments.map((assignment) => (
            <article className="miss-card" key={assignment.id}>
              <h3>{assignment.title}</h3>
              {assignment.rows.length === 0 ? (
                <p className="muted">Add students to see their progress.</p>
              ) : (
                <div className="table-wrap">
                  <table className="adj-table">
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignment.rows.map((row) => (
                        <tr key={row.userId}>
                          <td>
                            {row.name}
                            <div className="muted">{row.email}</div>
                          </td>
                          <td className={row.completedAt ? "review-correct" : "muted"}>
                            {row.completedAt
                              ? `Done · ${row.correct}/${row.total} · ${formatWhen(row.completedAt)}`
                              : "Not yet"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <header className="page-hero">
            <h1>Classroom</h1>
          </header>
        </div>
      }
    >
      <ClassroomBody params={params} />
    </Suspense>
  );
}
