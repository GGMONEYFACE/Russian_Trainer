"use client";

import { useActionState } from "react";
import { submitSuggestion } from "@/app/actions/suggestions";
import { emptyFormState } from "@/lib/form-state";

function Notice({ error, message }: { error: string; message: string }) {
  if (error) return <p className="form-alert">{error}</p>;
  if (message) return <p className="form-success">{message}</p>;
  return null;
}

export function SuggestionForm({ signedInName }: { signedInName: string }) {
  const [state, action, pending] = useActionState(submitSuggestion, emptyFormState);

  return (
    <form className="stack-form suggestion-form" action={action}>
      <Notice error={state.error} message={state.message} />
      {signedInName ? (
        <p className="muted">Sending as {signedInName}.</p>
      ) : (
        <label className="field">
          <span>Name</span>
          <input name="name" maxLength={80} autoComplete="name" />
        </label>
      )}
      <label className="field">
        <span>Suggestion</span>
        <textarea name="body" required minLength={8} maxLength={2000} rows={6} />
      </label>
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}
