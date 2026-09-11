"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

/* ============ Meridian Hub — theme tokens (mirror of the dashboard systems) ============ */
const HUB_CSS = `
.hub *{box-sizing:border-box}
.hub{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--on-ac:#fff;--paper:#fafaf9;color:var(--t1);font-family:inherit}
html[data-theme="dark"] .hub{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--on-ac:#111113;--paper:#111113}
.hub-head{text-align:center;margin-bottom:32px}
.hub-kicker{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ac);margin:0 0 10px}
.hub-h1{font-size:36px;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin:0;line-height:1.1}
.hub-sub{font-size:14px;font-weight:500;color:var(--t2);margin:10px 0 0}
@media(min-width:768px){.hub-h1{font-size:48px}}
.hub-grid{display:grid;grid-template-columns:1fr;gap:24px}
@media(min-width:768px){.hub-grid{grid-template-columns:1fr 1fr}}
/* Cards: constant-dark photographic mounts (like the auth brand pane) —
   guaranteed text legibility in both themes, chrome adapts around them */
.hub-card{position:relative;display:block;height:384px;border-radius:16px;overflow:hidden;background:#111113;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease}
.hub-card:hover{border-color:var(--ac)}
.hub-card:focus-visible{outline:2px solid var(--ac);outline-offset:3px}
.hub-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(30%) contrast(1.06) brightness(.6) saturate(.9);transition:transform .7s ease}
.hub-card:hover img{transform:scale(1.06)}
.hub-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,17,19,.12) 0%,rgba(17,17,19,.38) 45%,rgba(17,17,19,.92) 100%)}
.hub-body{position:absolute;left:0;right:0;bottom:0;padding:24px}
.hub-bar{width:64px;height:3px;border-radius:2px;background:var(--ac);margin-bottom:14px;transform-origin:left;transform:scaleX(.625);transition:transform .45s ease}
.hub-card:hover .hub-bar{transform:scaleX(1)}
.hub-row{display:flex;align-items:flex-end;justify-content:space-between;gap:14px}
.hub-h2{font-size:24px;font-weight:800;letter-spacing:-.02em;color:#f0f0f2;margin:0 0 6px}
.hub-p{font-size:13px;font-weight:500;color:#c9c9d2;margin:0;max-width:280px;line-height:1.5}
.hub-arrow{width:42px;height:42px;border-radius:999px;background:var(--ac);color:var(--on-ac);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s ease,transform .45s ease}
.hub-card:hover .hub-arrow{transform:translateX(4px);background:var(--ach)}
@media(prefers-reduced-motion:reduce){.hub *{transition:none!important;animation:none!important}}
`;

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function DashboardPage() {
  return (
    <AppShell>
      <style>{HUB_CSS}</style>

      <main className="hub max-w-[1440px] mx-auto px-7 pt-8 pb-14">
        {/* Header — fully theme-aware: Meridian ink on paper (light), light ink on charcoal (dark) */}
        <header className="hub-head">
          <p className="hub-kicker">Dashboard</p>
          <h1 className="hub-h1">Choose your grind.</h1>
          <p className="hub-sub">Two logs, one athlete — pick where today starts.</p>
        </header>

        <div className="hub-grid">
          {/* Nutrition card — real link: keyboard reachable, ctrl/middle-click opens in new tab */}
          <Link href="/dashboard/meal" className="hub-card">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
              alt=""
              draggable={false}
              loading="lazy"
            />
            <div className="hub-scrim" />
            <div className="hub-body">
              <div className="hub-bar" />
              <div className="hub-row">
                <div>
                  <h2 className="hub-h2">Nutrition log</h2>
                  <p className="hub-p">Track macros, calories, and daily meals to fuel your body perfectly.</p>
                </div>
                <span className="hub-arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </div>
            </div>
          </Link>

          {/* Workout card — distinct photo (no longer duplicating the login pane) */}
          <Link href="/dashboard/gym" className="hub-card">
            <img
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800"
              alt=""
              draggable={false}
              loading="lazy"
            />
            <div className="hub-scrim" />
            <div className="hub-body">
              <div className="hub-bar" />
              <div className="hub-row">
                <div>
                  <h2 className="hub-h2">Workout log</h2>
                  <p className="hub-p">Record exercises, sets, reps, and track your strength progress.</p>
                </div>
                <span className="hub-arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
