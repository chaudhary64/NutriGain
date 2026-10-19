"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { AuthAlert, AuthSubmit, EyeToggler } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { readSafeNext, validateLogin } from "@/lib/authForm";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // The route guard bounces deep links here with ?next=. Read it once, guarded
  // for SSR: the value only feeds navigation, never markup, so a client/server
  // difference cannot cause a hydration mismatch.
  const [next] = useState(() =>
    typeof window === "undefined" ? "" : readSafeNext(window.location.search)
  );

  const errors = validateLogin({ email, password });
  // Quiet while typing, loud once a field has been left or submit was pressed.
  const shown = (field) => (touched[field] || submitAttempted ? errors[field] : "");

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setBanner("");

    const firstInvalid = ["email", "password"].find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password, next || undefined);
      if (!result.success) {
        setBanner(result.error || "Couldn’t sign you in. Try again.");
        setLoading(false);
      }
    } catch {
      setBanner("Couldn’t reach the server. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      photo="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
      photoPosition="50% 44%"
      next={next}
    >
      <h1 className="auth-h1">Welcome back</h1>
      <p className="auth-sub">Sign in to log today’s meals and training.</p>

      {banner && <AuthAlert>{banner}</AuthAlert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className={`auth-field${shown("email") ? " is-err" : ""}`}>
          <label className="auth-lbl" htmlFor="email">
            Email
          </label>
          <div className="auth-wrap">
            <input
              id="email"
              className="auth-in"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              required
              aria-invalid={shown("email") ? "true" : undefined}
              aria-describedby={shown("email") ? "email-err" : undefined}
            />
          </div>
          {shown("email") && (
            <p className="auth-fmsg" id="email-err">
              {shown("email")}
            </p>
          )}
        </div>

        <div className={`auth-field${shown("password") ? " is-err" : ""}`}>
          <label className="auth-lbl" htmlFor="password">
            Password
          </label>
          <div className="auth-wrap">
            <input
              id="password"
              className="auth-in has-eye"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              aria-invalid={shown("password") ? "true" : undefined}
              aria-describedby={shown("password") ? "password-err" : undefined}
            />
            <EyeToggler
              shown={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              controls="password"
            />
          </div>
          {shown("password") && (
            <p className="auth-fmsg" id="password-err">
              {shown("password")}
            </p>
          )}
        </div>

        <AuthSubmit loading={loading} label="Sign in" loadingLabel="Signing in…" />
      </form>

      <p className="auth-alt">
        New to NutriGain?
        <Link href="/register" className="auth-link">
          Create an account →
        </Link>
      </p>
    </AuthShell>
  );
}
