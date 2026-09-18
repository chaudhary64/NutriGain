import Link from "next/link";

/**
 * Branded 404. Server component — no client JS needed; the root layout's
 * inline theme script has already set data-theme before paint, so the
 * dark-mode variables below just work.
 */

const NF_CSS = `
.nf{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--ac:#4f46e5;--ach:#4338ca;--on-ac:#fff;--sunken:#f1f1ee;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--paper,#fafaf9);color:var(--t1);font-family:var(--font-inter),system-ui,sans-serif;padding:24px}
html[data-theme="dark"] .nf{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--ac:#818cf8;--ach:#a5b4fc;--on-ac:#111113;--sunken:#26262b;--paper:#111113}
.nf-box{max-width:460px;text-align:center;display:grid;gap:14px;justify-items:center}
.nf-eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t2)}
.nf-code{font-family:var(--font-playfair),Georgia,serif;font-size:96px;font-weight:700;letter-spacing:-.02em;line-height:1;background:linear-gradient(135deg,var(--ac),var(--ach));-webkit-background-clip:text;background-clip:text;color:transparent}
.nf-display{font-family:var(--font-playfair),Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.nf-sub{font-size:14px;line-height:1.6;color:var(--t2);max-width:360px}
.nf-actions{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;justify-content:center}
.nf-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13px;border-radius:8px;padding:11px 18px;cursor:pointer;border:1px solid transparent;transition:.15s;text-decoration:none}
.nf-btn-primary{background:var(--ac);color:var(--on-ac)}
.nf-btn-primary:hover{background:var(--ach)}
.nf-btn-ghost{border-color:var(--line);color:var(--t1);background:transparent}
.nf-btn-ghost:hover{background:var(--sunken)}
.nf-mark{margin-bottom:6px}
`;

const NfIcon = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="nf-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#6366f1" />
        <stop offset="1" stopColor="#a5b4fc" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="#121216" />
    <path d="M20 46V18h5.4l13.6 19.4V18H44v28h-5.4L25 26.6V46z" fill="#fff" />
    <path d="M18 47 46 17" stroke="url(#nf-grad)" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function NotFound() {
  return (
    <>
      <style>{NF_CSS}</style>
      <div className="nf">
        <div className="nf-box">
          <span className="nf-mark"><NfIcon /></span>
          <span className="nf-eyebrow">404 · Page not found</span>
          <div className="nf-code" aria-hidden="true">404</div>
          <h1 className="nf-display">This page went off the plan.</h1>
          <p className="nf-sub">
            The link may be broken, or the page may have been moved. Your data is
            safe — head back and keep tracking.
          </p>
          <div className="nf-actions">
            <Link href="/dashboard" className="nf-btn nf-btn-primary">
              Back to dashboard
            </Link>
            <Link href="/" className="nf-btn nf-btn-ghost">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
