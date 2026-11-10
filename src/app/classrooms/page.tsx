import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateClassroomForm } from "@/components/ClassroomForms";
import { getCurrentUser } from "@/lib/session";
import { classroomsFor } from "@/lib/store";

export const metadata = {
  title: "Classrooms · Russian Trainer",
};

async function ClassroomsBody() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/classrooms");
  if (user.role !== "instructor") redirect("/profile");
  const classrooms = await classroomsFor(user.id);

  return (
    <div className="shell">
      <header className="page-hero">
        <h1>Classrooms</h1>
        <p>Create a class, add students by the email they registered with, and assign practice.</p>
      </header>
      <CreateClassroomForm />
      {classrooms.length === 0 ? (
        <p className="muted">No classrooms yet.</p>
      ) : (
        <div className="path-list classroom-list">
          {classrooms.map((classroom) => (
            <article className="path-item path-item--active" key={classroom.id}>
              <h3>
                <Link href={`/classrooms/${classroom.id}`}>{classroom.name}</Link>
              </h3>
              <p>
                {classroom.students} {classroom.students === 1 ? "student" : "students"} ·{" "}
                {classroom.assignments} assigned
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClassroomsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell">
          <header className="page-hero">
            <h1>Classrooms</h1>
          </header>
        </div>
      }
    >
      <ClassroomsBody />
    </Suspense>
  );
}
