"use client";

import { useEffect } from "react";

/**
 * Route-segment error boundary. Catches runtime errors anywhere below the
 * root layout and renders a branded recovery screen. Must be a client
 * component; `reset()` re-renders the segment.
 */

const ER_CSS = `
.er{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--ac:#4f46e5;--ach:#4338ca;--on-ac:#fff;--red:#dc2626;--red-soft:#fef2f2;--red-soft-b:#fecaca;--sunken:#f1f1ee;--paper:#fafaf9;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--paper);color:var(--t1);font-family:var(--font-inter),system-ui,sans-serif;padding:24px}
html[data-theme="dark"] .er{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--ac:#818cf8;--ach:#a5b4fc;--on-ac:#111113;--red:#f87171;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--sunken:#26262b;--paper:#111113}
.er-box{max-width:460px;text-align:center;display:grid;gap:14px;justify-items:center}
.er-eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t2)}
.er-badge{width:44px;height:44px;border-radius:50%;border:1px solid var(--red-soft-b);background:var(--red-soft);color:var(--red);display:inline-flex;align-items:center;justify-content:center}
.er-display{font-family:var(--font-playfair),Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.er-sub{font-size:14px;line-height:1.6;color:var(--t2);max-width:380px;overflow-wrap:anywhere}
.er-digest{font-size:11px;color:var(--t2);background:var(--sunken);border-radius:6px;padding:4px 10px;font-family:ui-monospace,monospace}
.er-actions{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;justify-content:center}
.er-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13px;border-radius:8px;padding:11px 18px;cursor:pointer;border:1px solid transparent;transition:.15s;text-decoration:none}
.er-btn-primary{background:var(--ac);color:var(--on-ac)}
.er-btn-primary:hover{background:var(--ach)}
.er-btn-ghost{border-color:var(--line);color:var(--t1);background:transparent}
.er-btn-ghost:hover{background:var(--sunken)}
`;

export default function Error({ error, reset }) {
  useEffect(() => {
    // Surfaced in the server logs / browser console for diagnosis.
    console.error(error);
  }, [error]);

  return (
    <>
      <style>{ER_CSS}</style>
      <div className="er">
        <div className="er-box">
          <span className="er-badge" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </span>
          <span className="er-eyebrow">Something went wrong</span>
          <h1 className="er-display">That didn&apos;t go as planned.</h1>
          <p className="er-sub">
            An unexpected error interrupted this page. Trying again usually
            fixes it — your logged data is unaffected.
          </p>
          {error?.digest && <code className="er-digest">ref: {error.digest}</code>}
          <div className="er-actions">
            <button onClick={() => reset()} className="er-btn er-btn-primary">
              Try again
            </button>
            <a href="/dashboard" className="er-btn er-btn-ghost">
              Back to dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
