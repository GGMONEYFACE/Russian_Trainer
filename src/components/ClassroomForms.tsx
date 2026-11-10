"use client";

import { useActionState } from "react";
import { addMemberAction, assignPracticeAction, createClassroomAction } from "@/app/actions/classroom";
import { emptyFormState } from "@/lib/form-state";

function Notice({ error, message }: { error: string; message: string }) {
  if (error) return <p className="form-alert">{error}</p>;
  if (message) return <p className="form-success">{message}</p>;
  return null;
}

export function CreateClassroomForm() {
  const [state, action, pending] = useActionState(createClassroomAction, emptyFormState);

  return (
    <form className="stack-form" action={action}>
      <label className="field">
        <span>Classroom name</span>
        <input name="name" maxLength={80} required />
      </label>
      <Notice error={state.error} message={state.message} />
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Creating…" : "Create classroom"}
      </button>
    </form>
  );
}

export function AddMemberForm({ classroomId }: { classroomId: string }) {
  const [state, action, pending] = useActionState(addMemberAction, emptyFormState);

  return (
    <form className="stack-form" action={action}>
      <input type="hidden" name="classroomId" value={classroomId} />
      <label className="field">
        <span>Student email</span>
        <input type="email" name="email" maxLength={254} required />
      </label>
      <Notice error={state.error} message={state.message} />
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Adding…" : "Add student"}
      </button>
    </form>
  );
}

export function AssignPracticeForm({
  classroomId,
  options,
}: {
  classroomId: string;
  options: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(assignPracticeAction, emptyFormState);

  return (
    <form className="stack-form" action={action}>
      <input type="hidden" name="classroomId" value={classroomId} />
      <label className="field">
        <span>Practice</span>
        <select name="practiceId" defaultValue={options[0]?.id ?? ""} required>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))}
        </select>
      </label>
      <Notice error={state.error} message={state.message} />
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Assigning…" : "Assign practice"}
      </button>
    </form>
  );
}
