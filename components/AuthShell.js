"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

gsap.registerPlugin(useGSAP);

/* ------------------------------------------------------------------ */
/* Pieces shared by both auth pages — one definition each, so /login   */
/* and /register cannot drift apart again.                             */
/* ------------------------------------------------------------------ */

function LogoMark() {
  return (
    <span className="auth-mark" aria-hidden="true">
      {/* The real mark — the app icon, not a stand-in glyph. */}
      <img src="/android-chrome-192x192.png" alt="" width="192" height="192" draggable={false} />
    </span>
  );
}

function ThemeGlyph({ dark }) {
  return dark ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" width="19" height="19" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" width="19" height="19" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

/** Password reveal control. `aria-pressed` keeps it honest for screen readers. */
export function EyeToggler({ shown, onToggle, controls }) {
  return (
    <button
      type="button"
      className="auth-eye"
      onClick={onToggle}
      aria-pressed={shown}
      aria-controls={controls}
      aria-label={shown ? "Hide password" : "Show password"}
      title={shown ? "Hide password" : "Show password"}
    >
      {shown ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3l18 18" />
          <path d="M10.6 10.7a2 2 0 002.8 2.8" />
          <path d="M9.9 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-3 4.3M6.3 6.9A12.4 12.4 0 003 12c0 2.5 4 7 9 7a9.4 9.4 0 004.2-1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      )}
    </button>
  );
}

/** Server-side failure surface — rate limits, bad credentials, offline. */
export function AuthAlert({ children }) {
  return (
    <div className="auth-err" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/** The CTA: tracked-caps label on the left, arrow (or spinner) on the right. */
export function AuthSubmit({ loading, label, loadingLabel }) {
  return (
    <button type="submit" className="auth-btn" disabled={loading}>
      <span>{loading ? loadingLabel : label}</span>
      {loading ? (
        <span className="auth-spin" aria-hidden="true" />
      ) : (
        <svg className="auth-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Shell — photo cover + hairline ledger, one per page.                */
/* ------------------------------------------------------------------ */

export default function AuthShell({ photo, photoPosition = "50% 38%", next = "", children }) {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const root = useRef(null);

  // Already signed in: skip the form entirely. `next` wins so a bounced
  // deep link still lands where the athlete was headed.
  useEffect(() => {
    if (loading || !user) return;
    const fallback = user.isAdmin ? "/admin" : user.onboardedAt ? "/dashboard" : "/onboarding";
    router.replace(next || fallback);
  }, [user, loading, next, router]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(".auth-bimg", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.1 })
        .fromTo(".auth-bwash", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
        .fromTo(".auth-bcap", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.15)
        .fromTo(".auth-card", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, 0.3);
    },
    { scope: root, dependencies: [] }
  );

  return (
    <div className="auth" ref={root}>
      <aside className="auth-brand" aria-hidden="true">
        <img
          className="auth-bimg"
          src={photo}
          alt=""
          style={{ objectPosition: photoPosition }}
          draggable={false}
        />
        <div className="auth-bwash" />
        <div className="auth-brand-in">
          <div className="auth-lock">
            <LogoMark />
            <span className="auth-name">NutriGain</span>
          </div>
          <div className="auth-bcap">
            <p className="auth-bkicker">Training &amp; nutrition — one ledger</p>
            <h2 className="auth-btitle">
              Track your macros.
              <br />
              Dominate your goals.
            </h2>
            <div className="auth-bsign">
              <i />
              <span>Built for athletes</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-pane">
        <span className="auth-seam" aria-hidden="true" />

        <div className="auth-pane-in">
          <div className="auth-card">{children}</div>
        </div>

        <p className="auth-colophon">Macros · Lifts · Weight</p>
      </main>

      <button
        type="button"
        onClick={toggleTheme}
        className="auth-theme"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        <ThemeGlyph dark={theme === "dark"} />
      </button>
    </div>
  );
}
