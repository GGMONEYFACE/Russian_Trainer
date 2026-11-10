"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function RegisterForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(register, emptyFormState);
  const [instructor, setInstructor] = useState(false);
  const loginHref = nextPath === "/profile" ? "/login" : `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="login-container">
      <form className="login-form" action={action}>
        <div className={`login-error${state.error ? " visible" : ""}`} role="alert">
          {state.error}
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

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="instructor"
            name="instructor"
            value="yes"
            checked={instructor}
            onChange={(event) => setInstructor(event.target.checked)}
          />
          <label htmlFor="instructor">I am an instructor</label>
        </div>

        {instructor ? (
          <div className="form-group">
            <label htmlFor="code">Instructor code:</label>
            <input
              type="text"
              id="code"
              name="code"
              autoComplete="off"
              maxLength={80}
              required
            />
          </div>
        ) : null}

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
