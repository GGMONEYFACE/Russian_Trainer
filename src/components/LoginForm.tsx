"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(login, emptyFormState);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error && passwordRef.current) passwordRef.current.value = "";
  }, [state.error]);

  return (
    <div className="login-container">
      <form className="login-form" action={action}>
        <div className={`login-error${state.error ? " visible" : ""}`} role="alert">
          {state.error}
        </div>
        <input type="hidden" name="next" value={nextPath} />

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
            ref={passwordRef}
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            maxLength={72}
            required
          />
        </div>

        <div className="form-group checkbox">
          <input type="checkbox" id="remember" name="remember" value="yes" defaultChecked />
          <label htmlFor="remember">Remember me for 7 days</label>
        </div>

        <button type="submit" className="login-button" disabled={pending}>
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="login-links">
        <Link href={nextPath === "/profile" ? "/register" : `/register?next=${encodeURIComponent(nextPath)}`}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
