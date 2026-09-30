"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const LogoMark = () => (
  <div className="auth-mark" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  </div>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const root = useRef(null);

  // Entrance sequence: photo fades/scales in → brand copy rises → form rises.
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".auth-bimg", { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.9 })
      .fromTo(".auth-bshade", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      .fromTo(
        ".auth-brand-top, .auth-btitle, .auth-bsign",
 { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        "-=0.45"
      )
      .fromTo(".auth-card", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.45");
  }, { scope: root, dependencies: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);

      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
      }
      // If successful, the register function will redirect via window.location.href
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="auth" ref={root}>
      <div className="auth-split">
        {/* Form pane — follows the user's theme */}
        <main className="auth-pane">
          <button
            onClick={toggleTheme}
            className="auth-toggle"
            role="switch"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-checked={theme === "dark"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <div className="auth-card">
            <div className="auth-brandrow">
              <LogoMark />
              <span className="auth-name">NutriGain</span>
            </div>

            <h1 className="auth-h1">Create your account</h1>
            <p className="auth-sub">Set your targets once — then log meals and training in seconds.</p>

            {error && (
              <div className="auth-err" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="17" height="17" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div>
                <label htmlFor="name" className="auth-lbl">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="auth-in"
                  placeholder="Alex Carter"
                />
              </div>

              <div>
                <label htmlFor="email" className="auth-lbl">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="auth-in"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="auth-lbl">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-in"
                  placeholder="At least 6 characters"
                  aria-describedby="pw-hint"
                />
                <p id="pw-hint" className="auth-hint">Use at least 6 characters.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="auth-lbl">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-in"
                  placeholder="Repeat your password"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="auth-foot">
              Already have an account?{" "}
              <Link href="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </main>

        {/* Brand pane — athlete imagery, constant dark world in both themes */}
        <aside className="auth-brand" aria-hidden="true">
          <img
            className="auth-bimg"
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1600&auto=format&fit=crop"
            alt=""
            draggable={false}
          />
          <div className="auth-bshade" />
          <div className="auth-brand-in">
            <div className="auth-brand-top">
              <LogoMark />
              <span className="auth-name">NutriGain</span>
            </div>

            <h2 className="auth-btitle">Track your macros. Dominate your goals.</h2>
            <div className="auth-bsign">
              <i />
              <span>Built for athletes</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
