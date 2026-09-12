"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AppShell from "@/components/AppShell";
import AppFooter from "@/components/AppFooter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Home — Whisper marketing system. Same tokens as the app shell       */
/* (--shell-*), same container (.ng-container), Playfair display       */
/* headings against tracked-caps micro-labels.                         */
/* ------------------------------------------------------------------ */

const HOME_CSS = `
.home{color:var(--shell-ink)}
.home .wm-display{font-family:var(--font-playfair),Georgia,serif;font-weight:700;letter-spacing:-.02em;line-height:1.05}
.home .wm-kicker{font-size:10px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--shell-muted)}
.home .wm-hairline{height:1px;background:var(--shell-line)}
.home .wm-card{background:var(--shell-raised);border:1px solid var(--shell-line);border-radius:14px}
.home .wm-chip{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--shell-line);border-radius:999px;padding:6px 14px;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--shell-ink-2);background:var(--shell-chrome)}
.home .wm-dot{width:6px;height:6px;border-radius:50%;background:var(--shell-accent)}
.home .wm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;border-radius:10px;padding:15px 28px;transition:.18s;cursor:pointer}
.home .wm-btn-primary{background:var(--shell-accent);color:var(--shell-on-accent)}
.home .wm-btn-primary:hover{opacity:.9}
.home .wm-btn-ghost{border:1px solid var(--shell-line);color:var(--shell-ink);background:transparent}
.home .wm-btn-ghost:hover{background:var(--shell-sunken)}
.home .wm-stat b{display:block;font-family:var(--font-playfair),Georgia,serif;font-size:30px;font-weight:700;letter-spacing:-.02em;color:var(--shell-ink);line-height:1}
.home .wm-stat span{display:block;font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--shell-muted);margin-top:8px}
.home .wm-check{width:22px;height:22px;border-radius:50%;border:1px solid var(--shell-line);background:var(--shell-accent-soft);color:var(--shell-accent);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.home .wm-check svg{width:11px;height:11px;stroke:currentColor;stroke-width:2.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
/* Mock windows */
.home .wm-mock{position:relative;overflow:hidden}
.home .wm-mock-bar{display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid var(--shell-line)}
.home .wm-mock-dot{width:8px;height:8px;border-radius:50%;background:var(--shell-line)}
.home .wm-hm{display:grid;grid-template-rows:repeat(7,1fr);grid-auto-flow:column;gap:3px}
.home .wm-hm i{width:100%;aspect-ratio:1;border-radius:3px;background:var(--shell-sunken)}
.home .wm-hm i.l1{background:var(--shell-accent-soft)}
.home .wm-hm i.l2{background:#a5b4fc}
.home .wm-hm i.l3{background:#818cf8}
.home .wm-hm i.l4{background:#4f46e5}
html[data-theme="dark"] .home .wm-hm i.l1{background:#232347}
html[data-theme="dark"] .home .wm-hm i.l2{background:#3730a3}
html[data-theme="dark"] .home .wm-hm i.l3{background:#4f46e5}
html[data-theme="dark"] .home .wm-hm i.l4{background:#a5b4fc}
.home .wm-meter{height:8px;border-radius:999px;background:var(--shell-sunken);overflow:hidden}
.home .wm-meter i{display:block;height:100%;border-radius:999px}
.home .wm-ink{background:var(--shell-ink);color:var(--shell-bg)}
.home .wm-ink .wm-kicker{color:var(--shell-bg);opacity:.62}
/* Ink panel is theme-inverted: pin secondary text to the panel color, not
   theme-muted tokens (those flip the wrong way and fail contrast). */
.home .wm-ink p:not(.wm-kicker){color:var(--shell-bg);opacity:.78}
/* Anchor targets clear the fixed 56px bar when jumped to from the footer menu. */
#features,#gym,#nutrition{scroll-margin-top:80px}
@keyframes home-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.home *{animation:none!important;transition:none!important}}
`;

const CHECK = (
  <span className="wm-check" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
  </span>
);

const HM_CELLS = (() => {
  // Deterministic pseudo-random heatmap so SSR and client agree.
  const levels = [];
  let seed = 7;
  for (let i = 0; i < 91; i++) {
    seed = (seed * 16807) % 2147483647;
    const r = seed / 2147483647;
    levels.push(r > 0.82 ? 4 : r > 0.62 ? 3 : r > 0.42 ? 2 : r > 0.25 ? 1 : 0);
  }
  return levels;
})();

const FEATURES = [
  {
    kicker: "01 · Macros",
    title: "Track every gram",
    desc: "Calories, protein, carbs, and fats — metered live against daily targets with preview math before you log.",
  },
  {
    kicker: "02 · Meals",
    title: "A database that knows",
    desc: "Verified meals with per-serving macro math. Search, pick a quantity, log — seconds, not spreadsheets.",
  },
  {
    kicker: "03 · Lifting",
    title: "PRs on record",
    desc: "Working sets per exercise, personal-best tracking with history, and a weekly muscle-group plan.",
  },
  {
    kicker: "04 · Momentum",
    title: "Consistency, visualized",
    desc: "A GitHub-style activity heatmap and body-weight trend turn showing up into something you can see.",
  },
];

export default function Home() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // No-JS safety: reveal everything first, then animate. Content is
      // visible in the SSR HTML and by default in CSS; GSAP hides + animates
      // only when it actually runs, so a JS failure never leaves a blank page.
      gsap.set(".hero-kicker, .hero-line, .hero-sub, .hero-cta, .hero-stats, .scroll-reveal, .scroll-stagger-item", { clearProps: "all" });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-kicker", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(".hero-line", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, "-=0.4")
        .fromTo(".hero-sub", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.7")
        .fromTo(".hero-cta", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.7")
        .fromTo(".hero-stats", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6");

      gsap.utils.toArray(".scroll-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

      gsap.utils.toArray(".scroll-stagger-container").forEach((container) => {
        gsap.fromTo(
          container.querySelectorAll(".scroll-stagger-item"),
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: container, start: "top 85%", once: true },
          }
        );
      });

      // Cursor spotlight, desktop only
      if (window.innerWidth > 768) {
        const glow = document.querySelector(".glow-bg");
        if (glow) {
          const xTo = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" });
          const yTo = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" });
          const move = (e) => { xTo(e.clientX); yTo(e.clientY); };
          window.addEventListener("mousemove", move);
          return () => window.removeEventListener("mousemove", move);
        }
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="home">
      <style>{HOME_CSS}</style>
      <AppShell variant="marketing">
        <div className="relative">
          {/* Cursor spotlight */}
          <div
            className="glow-bg fixed top-0 left-0 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"
            style={{ background: "color-mix(in srgb, var(--shell-accent) 9%, transparent)" }}
            aria-hidden="true"
          />

          {/* ============ HERO ============ */}
          <section className="ng-container relative z-10 pt-20 pb-24 md:pt-28 md:pb-32">
            <div className="max-w-4xl">
              <p className="hero-kicker wm-kicker flex items-center gap-3 mb-7">
                <span className="wm-dot" aria-hidden="true" />
                Nutrition &amp; Gym Tracker
              </p>

              <h1 className="wm-display text-[13vw] sm:text-6xl md:text-7xl lg:text-[96px] mb-8" style={{ textWrap: "balance" }}>
                <span className="hero-line block">Track your macros.</span>
                <span className="hero-line block" style={{ color: "var(--shell-muted)" }}>
                  Dominate
                </span>
                <span className="hero-line block">
                  your goals<span style={{ color: "var(--shell-accent)" }}>.</span>
                </span>
              </h1>

              <p className="hero-sub text-base md:text-lg leading-relaxed max-w-xl mb-10" style={{ color: "var(--shell-ink-2)" }}>
                NutriGain is a quiet, precise hub for athletes who take nutrition and lifting
                seriously — meals, macros, PRs, and consistency in one hairline-clean ledger.
              </p>

              <div className="hero-cta flex flex-wrap gap-3 mb-16">
                <Link href="/register" className="wm-btn wm-btn-primary">Get started free</Link>
                <Link href="/login" className="wm-btn wm-btn-ghost">Login</Link>
              </div>

              <div className="hero-stats grid grid-cols-3 gap-6 max-w-md border-t pt-8" style={{ borderColor: "var(--shell-line)" }}>
                {[
                  ["04", "Ledgers kept"],
                  ["365d", "Heatmap depth"],
                  ["1 bash", "To log a meal"],
                ].map(([n, l]) => (
                  <div key={l} className="wm-stat">
                    <b>{n}</b>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ============ FEATURES ============ */}
          <section id="features" className="ng-container relative z-10 pb-24 md:pb-32 scroll-stagger-container">
            <div className="scroll-reveal flex items-baseline justify-between gap-6 mb-10">
              <h2 className="wm-display text-3xl md:text-4xl">The foundation</h2>
              <span className="wm-kicker hidden sm:block">Four ledgers · one athlete</span>
            </div>
            <div className="wm-hairline mb-10" aria-hidden="true" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f) => (
                <article key={f.kicker} className="scroll-stagger-item wm-card p-7 transition-transform hover:-translate-y-1">
                  <p className="wm-kicker mb-5" style={{ color: "var(--shell-accent)" }}>{f.kicker}</p>
                  <h3 className="wm-display text-xl mb-3">{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--shell-ink-2)" }}>{f.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ============ GYM ============ */}
          <section id="gym" className="ng-container relative z-10 py-24 md:py-32 border-t" style={{ borderColor: "var(--shell-line)" }}>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="scroll-reveal order-2 lg:order-1">
                <div className="wm-card wm-mock">
                  <div className="wm-mock-bar" aria-hidden="true">
                    <span className="wm-mock-dot" /><span className="wm-mock-dot" /><span className="wm-mock-dot" />
                    <span className="wm-kicker ml-3" style={{ fontSize: 9 }}>Consistency · this year</span>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-end justify-between mb-2">
                      <div><b className="wm-display text-3xl">128</b><p className="wm-kicker mt-1" style={{ fontSize: 9 }}>Day streak</p></div>
                      <div className="text-right"><b className="wm-display text-3xl">412k</b><p className="wm-kicker mt-1" style={{ fontSize: 9 }}>Kg lifted</p></div>
                    </div>
                    <p className="wm-kicker mb-6" style={{ fontSize: 9, opacity: 0.7 }} aria-hidden="true">Illustrative data</p>
                    <div className="wm-hm" role="img" aria-label="Illustrative activity heatmap">
                      {HM_CELLS.map((l, i) => <i key={i} className={l ? `l${l}` : ""} />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="scroll-reveal order-1 lg:order-2">
                <p className="wm-kicker mb-5" style={{ color: "var(--shell-accent)" }}>02 · Gym tracking</p>
                <h2 className="wm-display text-4xl md:text-5xl mb-6">Consistency you can see<span style={{ color: "var(--shell-accent)" }}>.</span></h2>
                <p className="text-base leading-relaxed mb-8" style={{ color: "var(--shell-ink-2)" }}>
                  Every session feeds a year-round activity map. PRs raise the level, streaks build
                  the habit, and the plan tells you exactly which muscles report for duty today.
                </p>
                <ul className="space-y-4">
                  {["Personal records per exercise, with progression", "Weekly muscle-group schedule, auto-planned", "Body-weight trend against your target"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                      {CHECK} {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ============ DIET ============ */}
          <section id="nutrition" className="ng-container relative z-10 py-24 md:py-32 border-t" style={{ borderColor: "var(--shell-line)" }}>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="scroll-reveal">
                <p className="wm-kicker mb-5" style={{ color: "var(--shell-accent)" }}>01 · Nutrition</p>
                <h2 className="wm-display text-4xl md:text-5xl mb-6">Dieting with data<span style={{ color: "var(--shell-accent)" }}>.</span></h2>
                <p className="text-base leading-relaxed mb-8" style={{ color: "var(--shell-ink-2)" }}>
                  Set daily targets once, then watch live meters count you down as you log.
                  A planned protein day vs paneer day — whichever way you split the week,
                  the math is already done.
                </p>
                <ul className="space-y-4">
                  {["Live macro meters with before-you-log preview", "Custom weekly protein plans", "Instant meal search from your own database"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                      {CHECK} {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="scroll-reveal">
                <div className="wm-card wm-mock" role="img" aria-label="Illustrative example of the daily macro tracker: protein, carbs, and fats metered against goals">
                  <div className="wm-mock-bar" aria-hidden="true">
                    <span className="wm-mock-dot" /><span className="wm-mock-dot" /><span className="wm-mock-dot" />
                    <span className="wm-kicker ml-3" style={{ fontSize: 9 }}>Today · 1,462 / 1,900 kcal</span>
                  </div>
                  <div className="p-6 md:p-8 space-y-6" aria-hidden="true">
                    {[
                      { name: "Protein", val: "118 / 120 g", pct: 85, color: "var(--shell-accent)" },
                      { name: "Carbs", val: "96 / 170 g", pct: 48, color: "#818cf8" },
                      { name: "Fats", val: "34 / 60 g", pct: 32, color: "#b45309" },
                    ].map((m) => (
                      <div key={m.name}>
                        <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] mb-2">
                          <span>{m.name}</span>
                          <span style={{ color: "var(--shell-muted)" }}>{m.val}</span>
                        </div>
                        <div className="wm-meter"><i style={{ width: `${m.pct}%`, background: m.color }} /></div>
                      </div>
                    ))}
                    <div className="wm-hairline" aria-hidden="true" />
                    <div className="flex justify-between items-center">
                      <span className="wm-kicker" style={{ fontSize: 9 }}>Remaining</span>
                      <span className="text-sm font-extrabold">438 kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CTA ============ */}
          <section className="relative z-10 my-10">
            <div className="ng-container">
              <div className="wm-ink scroll-reveal rounded-2xl px-8 py-16 md:px-16 md:py-24 text-center">
                <p className="wm-kicker mb-6">No spreadsheets · no guessing</p>
                <h2 className="wm-display text-4xl md:text-6xl mb-6">Stop guessing. Start gaining.</h2>
                <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-10">
                  Create an account, set your targets, and log your first meal in under a minute.
                </p>
                <Link
                  href="/register"
                  className="wm-btn inline-flex"
                  style={{ background: "var(--shell-bg)", color: "var(--shell-ink)" }}
                >
                  Create your account
                </Link>
              </div>
            </div>
          </section>

          {/* ============ FOOTER ============ */}
          <AppFooter />
        </div>
      </AppShell>
    </div>
  );
}
