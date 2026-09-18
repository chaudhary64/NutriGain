"use client";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself
 * (app/error.js can't, because it renders *inside* that layout). Must render
 * its own <html>/<body> and load its own fonts.
 */

const GE_CSS = `
.ge{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fafaf9;color:#1a1a1e;font-family:system-ui,sans-serif;padding:24px;text-align:center}
.ge-box{max-width:420px;display:grid;gap:12px;justify-items:center}
.ge-title{font-size:20px;font-weight:700;letter-spacing:-.01em}
.ge-sub{font-size:14px;line-height:1.6;color:#5f5f68}
.ge-btn{font-weight:600;font-size:13px;border-radius:8px;padding:11px 18px;cursor:pointer;border:1px solid transparent;transition:.15s;background:#4f46e5;color:#fff}
.ge-btn:hover{background:#4338ca}
`;

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <style>{GE_CSS}</style>
        <div className="ge">
          <div className="ge-box">
            <span style={{ fontSize: 40 }} aria-hidden="true">⚠️</span>
            <h1 className="ge-title">Something broke unexpectedly.</h1>
            <p className="ge-sub">
              NutriGain hit an error it couldn&apos;t recover from. A reload
              usually resolves it — your logged data is safe.
            </p>
            <button onClick={() => reset()} className="ge-btn">
              Reload NutriGain
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
