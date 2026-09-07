"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          try {
            const result = await signIn("credentials", {
              email: data.get("email"),
              password: data.get("password"),
              redirect: false,
            });

            if (result?.error) {
              setMessage(
                "Unable to sign in. Check your details or try again later.",
              );
            } else {
              router.push("/admin/projects");
              router.refresh();
            }
          } catch {
            setMessage("Unable to sign in. Please try again later.");
          }
        });
      }}
    >
      <label className="field-label">
        Email
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>

      <div className="field-label">
        <label htmlFor="admin-password">Password</label>
        <div className="password-control">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            maxLength={72}
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12c2.2-3.5 5.3-5.25 9-5.25S18.8 8.5 21 12c-2.2 3.5-5.3 5.25-9 5.25S5.2 15.5 3 12Z" />
              <circle cx="12" cy="12" r="2.25" />
              {showPassword && <path d="M4.5 4.5 19.5 19.5" />}
            </svg>
          </button>
        </div>
      </div>

      {message && (
        <p role="alert" className="error">
          {message}
        </p>
      )}

      <button className="btn primary full" disabled={pending}>
        {pending ? "Signing in…" : "Enter Studio →"}
      </button>
    </form>
  );
}
