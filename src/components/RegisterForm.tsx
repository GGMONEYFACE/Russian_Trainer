"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function RegisterForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(register, emptyFormState);
  const loginHref = nextPath === "/profile" ? "/login" : `/login?next=${encodeURIComponent(nextPath)}`;
  const text = state.error || state.message;
  const success = Boolean(state.message) && !state.error;

  return (
    <div className="login-container">
      <form className="login-form" action={action}>
        <div className={`login-error${text ? " visible" : ""}${success ? " success" : ""}`} role="alert">
          {text}
        </div>
        <input type="hidden" name="next" value={nextPath} />

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" autoComplete="name" maxLength={80} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm password:</label>
          <input
            type="password"
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="login-links">
        <Link href={loginHref}>Already have an account? Sign in</Link>
      </p>
    </div>
  );
}
