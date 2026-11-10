"use client";

import { useActionState } from "react";
import { updateName, updatePassword } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, emptyFormState);

  return (
    <form className="login-form" action={action}>
      <h3 className="form-heading">Name</h3>
      <div className={`login-error${state.error ? " visible" : ""}`} role="alert">
        {state.error}
      </div>
      <div className="form-group">
        <label htmlFor="account-name">Name:</label>
        <input
          type="text"
          id="account-name"
          name="name"
          defaultValue={name}
          maxLength={80}
          required
        />
      </div>
      <button type="submit" className="login-button" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, emptyFormState);
  const notice = state.error || state.message;

  return (
    <form className="login-form" action={action}>
      <h3 className="form-heading">Change password</h3>
      <div
        className={`login-error${notice ? " visible" : ""}${state.message ? " success" : ""}`}
        role="alert"
      >
        {notice}
      </div>
      <div className="form-group">
        <label htmlFor="current-password">Current password:</label>
        <input
          type="password"
          id="current-password"
          name="current"
          autoComplete="current-password"
          maxLength={72}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-password">New password:</label>
        <input
          type="password"
          id="new-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirm-password">Confirm new password:</label>
        <input
          type="password"
          id="confirm-password"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>
      <button type="submit" className="login-button" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
