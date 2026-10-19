"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { AuthAlert, AuthSubmit, EyeToggler } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { STRENGTH_LABELS, passwordStrength, validateRegister } from "@/lib/authForm";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const errors = validateRegister({ name, email, password, confirmPassword });
  const shown = (field) => (touched[field] || submitAttempted ? errors[field] : "");
  const strength = passwordStrength(password);
  const passwordHelp = [
    "password-min",
    password ? "password-strength" : null,
    shown("password") ? "password-err" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setBanner("");

    const order = ["name", "email", "password", "confirmPassword"];
    const firstInvalid = order.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password);
      if (!result.success) {
        setBanner(result.error || "Couldn’t create your account. Try again.");
        setLoading(false);
      }
      // On success the auth context sends the new athlete to onboarding.
    } catch {
      setBanner("Couldn’t reach the server. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      photo="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1600&auto=format&fit=crop"
      photoPosition="50% 32%"
    >
      <p className="auth-eyebrow">
        <i aria-hidden="true" />
        New account
      </p>
      <h1 className="auth-h1">Create your account</h1>
      <p className="auth-sub">Set your targets once — then log meals and training in seconds.</p>

      {banner && <AuthAlert>{banner}</AuthAlert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className={`auth-field${shown("name") ? " is-err" : ""}`}>
          <label className="auth-lbl" htmlFor="name">
            Name
          </label>
          <div className="auth-wrap">
            <input
              id="name"
              className="auth-in"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => markTouched("name")}
              autoComplete="name"
              placeholder="Alex Carter"
              required
              aria-invalid={shown("name") ? "true" : undefined}
              aria-describedby={shown("name") ? "name-err" : undefined}
            />
          </div>
          {shown("name") && (
            <p className="auth-fmsg" id="name-err">
              {shown("name")}
            </p>
          )}
        </div>

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
          <div className="auth-lblrow">
            <label className="auth-lbl" htmlFor="password">
              Password
            </label>
            <span className="auth-lbl-hint" id="password-min">
              6+ characters
            </span>
          </div>
          <div className="auth-wrap">
            <input
              id="password"
              className="auth-in has-eye"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              autoComplete="new-password"
              placeholder="Choose a password"
              required
              aria-invalid={shown("password") ? "true" : undefined}
              aria-describedby={passwordHelp}
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
          {password && (
            <div className="auth-strength">
              <div className="auth-strength-bars" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <i key={step} className={strength >= step ? "on" : ""} />
                ))}
              </div>
              <p className="auth-strength-txt" id="password-strength" role="status">
                <span>Strength</span>
                <b>{STRENGTH_LABELS[strength]}</b>
              </p>
            </div>
          )}
        </div>

        <div className={`auth-field${shown("confirmPassword") ? " is-err" : ""}`}>
          <label className="auth-lbl" htmlFor="confirmPassword">
            Confirm password
          </label>
          <div className="auth-wrap">
            <input
              id="confirmPassword"
              className="auth-in has-eye"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              aria-invalid={shown("confirmPassword") ? "true" : undefined}
              aria-describedby={shown("confirmPassword") ? "confirmPassword-err" : undefined}
            />
            <EyeToggler
              shown={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              controls="confirmPassword"
            />
          </div>
          {shown("confirmPassword") && (
            <p className="auth-fmsg" id="confirmPassword-err">
              {shown("confirmPassword")}
            </p>
          )}
        </div>

        <AuthSubmit loading={loading} label="Create account" loadingLabel="Creating account…" />
      </form>

      <p className="auth-alt">
        Already have an account?
        <Link href="/login" className="auth-link">
          Sign in →
        </Link>
      </p>
    </AuthShell>
  );
}
