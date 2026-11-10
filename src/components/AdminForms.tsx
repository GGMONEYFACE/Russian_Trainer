"use client";

import { useActionState } from "react";
import {
  adminClearQuestionAction,
  adminRenameAction,
  adminRoleAction,
  adminDismissSuggestionAction,
  adminScoreAction,
} from "@/app/actions/admin";
import { emptyFormState } from "@/lib/form-state";

function Notice({ error, message }: { error: string; message: string }) {
  if (error) return <p className="form-alert">{error}</p>;
  if (message) return <p className="form-success">{message}</p>;
  return null;
}

export function PersonForm({
  userId,
  name,
  role,
}: {
  userId: string;
  name: string;
  role: "student" | "instructor";
}) {
  const [nameState, nameAction, namePending] = useActionState(adminRenameAction, emptyFormState);
  const [roleState, roleAction, rolePending] = useActionState(adminRoleAction, emptyFormState);

  return (
    <div className="admin-card">
      <form className="admin-form" action={nameAction}>
        <input type="hidden" name="userId" value={userId} />
        <label className="field">
          <span>Name</span>
          <input name="name" defaultValue={name} maxLength={80} required />
        </label>
        <button type="submit" className="btn btn--primary btn--small" disabled={namePending}>
          {namePending ? "Saving…" : "Save name"}
        </button>
        <Notice error={nameState.error} message={nameState.message} />
      </form>
      <form className="admin-form" action={roleAction}>
        <input type="hidden" name="userId" value={userId} />
        <label className="field">
          <span>Role</span>
          <select name="role" defaultValue={role}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>
        <button type="submit" className="btn btn--ghost-dark btn--small" disabled={rolePending}>
          {rolePending ? "Saving…" : "Save role"}
        </button>
        <Notice error={roleState.error} message={roleState.message} />
      </form>
    </div>
  );
}

export function ScoreForm({
  assignmentId,
  userId,
  correct,
  total,
  done,
}: {
  assignmentId: string;
  userId: string;
  correct: number;
  total: number;
  done: boolean;
}) {
  const [state, action, pending] = useActionState(adminScoreAction, emptyFormState);

  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="userId" value={userId} />
      <label className="field">
        <span>Correct</span>
        <input name="correct" type="number" min={0} max={500} defaultValue={correct} required />
      </label>
      <label className="field">
        <span>Total</span>
        <input name="total" type="number" min={1} max={500} defaultValue={total || 1} required />
      </label>
      <label className="admin-check">
        <input type="checkbox" name="done" value="yes" defaultChecked={done} />
        <span>Done</span>
      </label>
      <button type="submit" className="btn btn--primary btn--small" disabled={pending}>
        {pending ? "Saving…" : "Save result"}
      </button>
      <Notice error={state.error} message={state.message} />
    </form>
  );
}

export function ClearQuestionForm({ userId, questionKey }: { userId: string; questionKey: string }) {
  const [state, action, pending] = useActionState(adminClearQuestionAction, emptyFormState);

  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="questionKey" value={questionKey} />
      <button type="submit" className="btn btn--ghost-dark btn--small" disabled={pending}>
        {pending ? "Removing…" : "Remove attempts"}
      </button>
      <Notice error={state.error} message={state.message} />
    </form>
  );
}

export function DismissSuggestionForm({ suggestionId }: { suggestionId: string }) {
  const [state, action, pending] = useActionState(adminDismissSuggestionAction, emptyFormState);

  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <button type="submit" className="btn btn--ghost-dark btn--small" disabled={pending}>
        {pending ? "Removing…" : "Remove"}
      </button>
      <Notice error={state.error} message={state.message} />
    </form>
  );
}
