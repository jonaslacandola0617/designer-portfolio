"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
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
            if (result?.error)
              setMessage(
                "Unable to sign in. Check your details or try again later.",
              );
            else {
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
      <label className="field-label">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={72}
        />
      </label>
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
