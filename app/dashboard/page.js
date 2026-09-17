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
@media(min-width:768px){.hub-grid{grid-template-columns:7fr 5fr}}
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
/* Wide Progress banner — flex row: copy column capped at its natural
   width, photo fills ALL remaining space with its fade anchored at the
   copy boundary. No fixed-percentage slabs, no dead void, no seam. */
.hub-wide{display:flex;align-items:stretch;position:relative;margin-top:24px;min-height:200px;border-radius:16px;overflow:hidden;background:#111113;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease}
.hub-wide:hover{border-color:var(--ac)}
.hub-wide:focus-visible{outline:2px solid var(--ac);outline-offset:3px}
.hub-wide-body{position:relative;z-index:2;flex:0 1 520px;display:flex;flex-direction:column;justify-content:space-between;gap:18px;padding:26px 28px}
.hub-wide-img{position:relative;flex:1 1 auto;min-width:0;overflow:hidden}
.hub-wide-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%;filter:grayscale(30%) contrast(1.06) brightness(.62) saturate(.9);transform-origin:100% 50%;transition:transform .7s ease}
.hub-wide-img::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,#111113 0%,rgba(17,17,19,.6) 14%,rgba(17,17,19,0) 42%)}
.hub-wide:hover .hub-wide-img img{transform:scale(1.05)}
.hub-wide-feats{display:flex;flex-wrap:wrap;gap:8px}
.hub-wide-feat{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c9c9d2;border:1px solid rgba(240,240,242,.22);border-radius:999px;padding:4px 10px}
.hub-wide .hub-p{max-width:400px}
.hub-wide:hover .hub-bar{transform:scaleX(1)}
.hub-wide:hover .hub-arrow{transform:translateX(4px);background:var(--ach)}
@media(max-width:767px){
  .hub-wide{flex-direction:column}
  .hub-wide-img{height:150px;flex:none;order:-1}
  .hub-wide-img::before{background:linear-gradient(180deg,rgba(17,17,19,0) 40%,#111113 100%)}
  .hub-wide-body{flex:none;max-width:100%;gap:16px;padding:22px}
}
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

      <main className="hub ng-container pt-8 pb-14">
        {/* Header — fully theme-aware: Meridian ink on paper (light), light ink on charcoal (dark) */}
        <header className="hub-head">
          <p className="hub-kicker">Dashboard</p>
          <h1 className="hub-h1">Choose your grind.</h1>
          <p className="hub-sub">Three surfaces, one athlete — pick where today starts.</p>
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

        {/* Progress banner — designed wide card: copy left, image panel right.
            Sits OUTSIDE the 2-col grid as a full-width sibling. */}
          <Link href="/dashboard/stats" className="hub-wide">
            <div className="hub-wide-body">
              <div>
                <div className="hub-bar" />
                <div className="hub-wide-feats" style={{ marginBottom: 12 }}>
                  <span className="hub-wide-feat">Macro trends</span>
                  <span className="hub-wide-feat">Training volume</span>
                  <span className="hub-wide-feat">Weight trend</span>
                  <span className="hub-wide-feat">Streaks</span>
                </div>
                <h2 className="hub-h2">Progress</h2>
                <p className="hub-p">Weekly averages against your goals — how you&apos;re actually doing, not just what you logged.</p>
              </div>
              <div className="hub-row" style={{ justifyContent: "flex-end" }}>
                <span className="hub-arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </div>
            </div>
            <div className="hub-wide-img" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1200"
                alt=""
                draggable={false}
                loading="lazy"
              />
            </div>
          </Link>

      </main>
    </AppShell>
  );
}
