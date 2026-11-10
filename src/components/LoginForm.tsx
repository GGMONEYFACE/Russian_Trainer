"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form-state";

export function LoginForm({ nextPath, notice = "" }: { nextPath: string; notice?: string }) {
  const [state, action, pending] = useActionState(login, emptyFormState);
  const passwordRef = useRef<HTMLInputElement>(null);
  const text = state.error || state.message || notice;
  const success = Boolean(state.message) && !state.error;
  const needsConfirmation = state.error === "Confirm your email before signing in.";

  useEffect(() => {
    if (state.error === "Invalid email or password." && passwordRef.current) passwordRef.current.value = "";
  }, [state.error]);

  return (
    <div className="login-container">
      <form className="login-form" action={action}>
        <div className={`login-error${text ? " visible" : ""}${success ? " success" : ""}`} role="alert">
          {text}
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

        <button type="submit" name="intent" value="login" className="login-button" disabled={pending}>
          {pending ? "Signing in…" : "Sign In"}
        </button>
        {needsConfirmation ? (
          <button type="submit" name="intent" value="resend" className="login-button secondary" disabled={pending}>
            Resend confirmation email
          </button>
        ) : null}
      </form>
      <p className="login-links">
        <Link href={nextPath === "/profile" ? "/register" : `/register?next=${encodeURIComponent(nextPath)}`}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
