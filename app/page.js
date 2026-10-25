import Link from "next/link";
import AppShell from "@/components/AppShell";
import AppFooter from "@/components/AppFooter";
import HomeMotion from "@/components/HomeMotion";
import NavIcon from "@/components/NavIcon";
import Logo from "@/components/Logo";

const DESCRIPTION =
  "NutriGain counts meals against your macro targets and records every set as weight x reps, so calories, protein and training live in one daily log.";

/* No production domain is committed. Set NEXT_PUBLIC_SITE_URL when the app
   is deployed; the fallback keeps local metadata resolvable. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NutriGain | Meals, macros and lifts in one log",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "NutriGain | Meals, macros and lifts in one log",
    description: DESCRIPTION,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NutriGain dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriGain | Meals, macros and lifts in one log",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

/* ------------------------------------------------------------------ */
/* Landing page.                                                      */
/*                                                                    */
/* A conventional product page, because that is what it has to do:    */
/* show the app, say what it does, price it, answer objections, let   */
/* someone start. The product UI is rendered as markup rather than a  */
/* screenshot, so it matches the real dashboard in either theme and   */
/* stays sharp at every density. The one thing kept from the earlier  */
/* concept is the honesty: the sample day is labelled, there are no   */
/* invented customers, and the plan is genuinely free.                */
/* ------------------------------------------------------------------ */

const PAGE_CSS = `
.lp{
  /* The Meridian token set is inherited from the wrapper's .mrd class; these
     aliases only rename it for the rules below, so the page and the dashboard
     can never drift apart on colour. */
  --bg:var(--paper);
  --surface:var(--card);
  --surface-2:var(--card-2);
  --ink:var(--t1);
  --ink-2:var(--t2);
  /* Meridian's --t3 is 3.1:1 on paper, which works for the dashboard's mono
     micro-labels but not for 13px captions, so the landing derives a third
     step from the same ink and paper instead. */
  --ink-3:color-mix(in srgb, var(--t1) 62%, var(--paper));
  --line-2:var(--faint);
  --accent:var(--ac);
  --accent-ink:var(--on-ac);
  --accent-soft:var(--sunken);
  --accent-line:var(--line);
  --shadow-1:0 1px 2px rgba(0,0,0,.04);
  --shadow-2:0 1px 2px rgba(0,0,0,.05),0 26px 60px -30px rgba(0,0,0,.35);
  background:var(--bg);
  color:var(--ink);
  font-family:var(--font-geist-sans),system-ui,sans-serif;
}

/* The fixed marketing bar reads its own --shell-* tokens, which the app
   defines on .app-shell. Rebinding them here is what makes the chrome
   share the page's ground, ink and accent instead of the app's. */
.lp .app-shell{
  --shell-bg:var(--bg);
  --shell-chrome:color-mix(in srgb, var(--bg) 88%, transparent);
  --shell-sunken:var(--surface-2);
  --shell-raised:var(--surface);
  --shell-line:var(--line);
  --shell-ink:var(--ink);
  --shell-ink-2:var(--ink-2);
  --shell-muted:var(--ink-3);
  --shell-accent:var(--accent);
  --shell-on-accent:var(--accent-ink);
  --shell-on-ink:var(--surface);
}
.lp ::selection{background:var(--accent);color:var(--accent-ink)}
.lp main a,.lp footer a{text-decoration:none;color:inherit}
.lp :is(a,button,summary):focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}

/* Type ------------------------------------------------------------------ */
.lp h1,.lp h2,.lp h3{
  font-family:var(--font-geist-sans),system-ui,sans-serif;
  font-weight:600;letter-spacing:-.04em;margin:0;text-wrap:balance;
}
.lp h1{font-size:clamp(2.8rem,5.6vw,4.6rem);line-height:1.02}
.lp h2{font-size:clamp(1.85rem,3.2vw,2.75rem);line-height:1.06}
.lp h3{font-size:clamp(1.3rem,1.9vw,1.75rem);line-height:1.15;letter-spacing:-.03em}
.lp p{margin:0}
.lp .lede{font-size:clamp(1rem,1.35vw,1.2rem);line-height:1.6;color:var(--ink-2);max-width:52ch;text-wrap:pretty}

/* Buttons --------------------------------------------------------------- */
.lp .btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  height:46px;padding:0 20px;border-radius:6px;border:1px solid transparent;
  background:var(--accent);color:var(--accent-ink);
  font-size:13.5px;font-weight:500;letter-spacing:-.01em;cursor:pointer;
  box-shadow:var(--shadow-1);
  transition:background .15s ease,transform .15s ease,color .15s ease;
}
.lp .btn:hover{background:var(--ach);transform:translateY(-1px)}
.lp .btn:active{transform:none}
.lp .btn svg{width:16px;height:16px}
.lp .btn-ghost{
  background:var(--surface);color:var(--ink);border-color:var(--line);
  box-shadow:none;
}
.lp .btn-ghost:hover{background:var(--sunken);border-color:var(--line);transform:translateY(-1px)}

/* Page rhythm ----------------------------------------------------------- */
.lp #features,.lp #how,.lp #pricing,.lp #faq{scroll-margin-top:84px}
.lp .hero{position:relative;overflow:clip;padding:clamp(48px,7vw,92px) 0 0}
.lp .hero-in{position:relative;z-index:1;text-align:center;display:grid;justify-items:center;gap:0}
.lp .hero h1{max-width:19ch}
.lp .hero .lede{margin-top:22px;text-align:center}
.lp .hero-actions{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;margin-top:34px}
.lp .hero-meta{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 22px;margin-top:22px;font-size:13px;color:var(--ink-3)}
.lp .hero-meta span{display:inline-flex;align-items:center;gap:7px}
.lp .hero-meta span::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--line-2)}
.lp .hero-meta span:first-child::before{background:var(--accent)}

/* Product frame --------------------------------------------------------- */
.lp .stage{position:relative;margin:clamp(40px,5vw,64px) auto 0;max-width:1120px}
.lp .window{
  background:var(--surface);border:1px solid var(--line);border-radius:12px;
  box-shadow:var(--shadow-2);overflow:hidden;
}
.lp .window-bar{
  display:flex;align-items:center;gap:12px;
  height:40px;padding:0 16px;border-bottom:1px solid var(--line);background:var(--surface-2);
}
.lp .window-url{
  flex:1;min-width:0;
  font-family:var(--font-geist-mono),monospace;font-size:10.5px;letter-spacing:.02em;color:var(--ink-3);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.lp .window-tag{
  flex:none;font-size:10.5px;font-weight:500;color:var(--ink-2);
  background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:3px 8px;
}

/* Dashboard mockup ------------------------------------------------------ */
.lp .ui{display:grid;grid-template-columns:190px minmax(0,1fr) 250px;min-height:440px;text-align:left}
.lp .ui-rail{border-right:1px solid var(--line);padding:18px 14px;background:var(--surface-2);display:grid;align-content:start;gap:4px}
.lp .ui-logo{
  display:block;width:30px;height:30px;margin:2px 8px 16px;border-radius:6px;
}
.lp .ui-rail-row{display:flex;align-items:center;gap:9px;padding:7px 8px;border-radius:8px;font-size:12.5px;color:var(--ink-2)}
.lp .ui-rail-row svg{width:15px;height:15px;color:var(--ink-3)}
.lp .ui-rail-row.on{background:var(--accent-soft);color:var(--ink);font-weight:600}
.lp .ui-rail-row.on svg{color:var(--accent)}
.lp .ui-main{padding:20px 22px;min-width:0;display:grid;gap:16px;align-content:start}
.lp .ui-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
.lp .ui-kick{display:block;font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);margin-bottom:5px}
.lp .ui-title{font-family:var(--font-geist-sans),system-ui,sans-serif;font-size:22px;font-weight:600;letter-spacing:-.035em;line-height:1}
.lp .ui-chip{
  display:inline-flex;align-items:center;gap:6px;flex:none;
  font-size:11px;font-weight:500;color:var(--ink);
  background:var(--accent-soft);border:1px solid var(--line);
  border-radius:6px;padding:4px 8px;
}
.lp .ui-chip::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--accent)}
.lp .ui-budget{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(0,1fr));gap:0;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.lp .ui-cell{padding:12px 14px;min-width:0;border-left:1px solid var(--line)}
.lp .ui-cell:first-child{border-left:0}
.lp .ui-k{display:block;font-family:var(--font-geist-mono),monospace;font-size:9.5px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)}
.lp .ui-figure{display:flex;align-items:baseline;gap:5px;margin-top:7px;font-size:26px;font-weight:600;letter-spacing:-.045em;line-height:1;font-variant-numeric:tabular-nums}
.lp .ui-figure.mid{font-size:19px}
.lp .ui-figure u{text-decoration:none;font-family:var(--font-geist-mono),monospace;font-size:9.5px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3)}
.lp .ui-track{height:4px;border-radius:999px;background:var(--line);overflow:hidden;margin-top:9px}
.lp .ui-track i{display:block;height:100%;border-radius:999px;background:var(--ink)}
.lp .ui-note{margin-top:7px;font-size:10.5px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.lp .ui-slots{border:1px solid var(--line);border-radius:12px;overflow:hidden}
.lp .ui-slot{display:grid;grid-template-columns:78px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 14px;border-top:1px solid var(--line);font-size:12.5px}
.lp .ui-slot:first-child{border-top:0}
.lp .ui-slot-on{background:var(--surface-2)}
.lp .ui-slot-k{font-family:var(--font-geist-mono),monospace;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.lp .ui-slot-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lp .ui-slot-name b{font-weight:500}
.lp .ui-slot-name small{display:block;font-size:10.5px;color:var(--ink-3);margin-top:2px}
.lp .ui-slot-kcal{font-variant-numeric:tabular-nums;font-weight:500;white-space:nowrap}
.lp .ui-slot-kcal u{text-decoration:none;font-family:var(--font-geist-mono),monospace;font-size:9.5px;color:var(--ink-3);margin-left:3px}
.lp .ui-slot-kcal.empty{color:var(--ink-3)}
.lp .ui-side{border-left:1px solid var(--line);padding:20px 18px;display:grid;align-content:start;gap:12px;background:var(--surface-2)}
.lp .ui-split{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:15px;font-weight:600;letter-spacing:-.01em}
.lp .ui-set{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--ink-2);padding-top:9px;border-top:1px solid var(--line)}
.lp .ui-set b{font-family:var(--font-geist-mono),monospace;font-size:10.5px;color:var(--ink);white-space:nowrap}
.lp .ui-pr{font-family:var(--font-geist-mono),monospace;font-size:9px;letter-spacing:.05em;color:var(--ink-2);background:var(--accent-soft);border:1px solid var(--line);border-radius:4px;padding:1px 5px}
.lp .ui-spark{margin-top:2px;padding-top:12px;border-top:1px solid var(--line)}
.lp .ui-spark svg{display:block;width:100%;height:56px}
.lp .ui-spark-k{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--ink-2)}
.lp .ui-spark-k b{font-family:var(--font-geist-mono),monospace;font-size:11px;color:var(--ink)}
.lp .ui-spark-note{font-size:10.5px;color:var(--ink-3);margin-top:3px}

/* Sections -------------------------------------------------------------- */
.lp .sec{padding:clamp(64px,9vw,120px) 0 0}
.lp .sec-head{max-width:56ch;display:grid;gap:16px}
.lp .feature{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,5vw,72px);align-items:center;padding:clamp(40px,5vw,64px) 0}
.lp .feature + .feature{border-top:1px solid var(--line)}
.lp .feature-copy{display:grid;gap:16px;align-content:center}
.lp .feature-copy p{font-size:16px;line-height:1.65;color:var(--ink-2);max-width:46ch}
.lp .feature-list{display:grid;gap:10px;margin:4px 0 0;padding:0;list-style:none}
.lp .feature-list li{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.55;color:var(--ink-2)}
.lp .feature-list svg{flex:none;width:16px;height:16px;margin-top:2px;color:var(--accent)}
.lp .feature.flip .feature-media{order:-1}
.lp .feature-media{min-width:0}

/* Feature cards --------------------------------------------------------- */
.lp .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.lp .card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line);background:var(--surface-2)}
.lp .card-h b{font-size:12.5px;font-weight:600}
.lp .card-h span{font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.lp .card-b{padding:16px}
.lp .meal{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 16px;border-top:1px solid var(--line);font-size:13px}
.lp .meal:first-child{border-top:0}
.lp .meal-k{font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.lp .meal-name b{font-weight:500}
.lp .meal-name small{display:block;margin-top:3px;font-size:11px;color:var(--ink-3)}
.lp .meal-kcal{font-variant-numeric:tabular-nums;font-weight:500;white-space:nowrap}
.lp .meal-kcal u{text-decoration:none;font-family:var(--font-geist-mono),monospace;font-size:9.5px;color:var(--ink-3);margin-left:3px}
.lp .meal-kcal.empty{color:var(--ink-3)}
.lp .meal-add{font-size:12px;font-weight:500;color:var(--accent);white-space:nowrap}
.lp .bands{display:grid;gap:14px}
.lp .band-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:12.5px}
.lp .band-top b{font-weight:600}
.lp .band-top span{font-family:var(--font-geist-mono),monospace;font-size:10.5px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.lp .band-track{height:7px;margin-top:8px;border-radius:999px;background:var(--line);overflow:hidden}
.lp .band-track i{display:block;height:100%;border-radius:999px;background:var(--ink)}
.lp .band-track i.accent{background:var(--accent)}
.lp .band-total{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:2px}
.lp .band-total b{font-family:var(--font-geist-sans),system-ui,sans-serif;font-size:40px;font-weight:600;letter-spacing:-.045em;line-height:.9;font-variant-numeric:tabular-nums}
.lp .band-total b u{text-decoration:none;font-family:var(--font-geist-mono),monospace;font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);margin-left:6px}
.lp .band-total span{font-size:11.5px;color:var(--ink-3);text-align:right;line-height:1.4;max-width:16ch}
.lp .set{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:12px 16px;border-top:1px solid var(--line);font-size:13px}
.lp .set:first-child{border-top:0}
.lp .set b{font-family:var(--font-geist-mono),monospace;font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}
.lp .set em{font-style:normal;font-family:var(--font-geist-mono),monospace;font-size:10px;color:var(--ink-3);white-space:nowrap}
.lp .set-foot{display:flex;gap:18px;flex-wrap:wrap;padding:12px 16px;border-top:1px solid var(--line);background:var(--surface-2);font-size:12px;color:var(--ink-2)}
.lp .set-foot b{font-family:var(--font-geist-mono),monospace;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums}

/* Read-back record ------------------------------------------------------ */
/* Two measured artifacts instead of a grid of icon cards: the training
   heatmap and the PR trend are the page's only unrepeatable claims, so they
   are shown rather than asserted. Both sit on the paper with one rule between
   them, and both are labelled as sample data. */
.lp .record{margin-top:clamp(32px,4vw,48px);padding-top:clamp(32px,4vw,48px);border-top:1px solid var(--line)}
.lp .record-head{display:grid;gap:14px;max-width:56ch}
.lp .record h2{font-size:clamp(1.5rem,2.4vw,2rem)}
.lp .record-grid{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);align-items:start;
  margin-top:clamp(24px,3vw,34px);border-top:1px solid var(--line-2);
}
.lp .record-panel{margin:0;padding:22px 0 0;min-width:0}
.lp .record-panel + .record-panel{padding-left:clamp(20px,3vw,36px);border-left:1px solid var(--line)}
.lp .record-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.lp .record-h b{font-size:13px;font-weight:600;letter-spacing:-.01em}
.lp .record-h span{
  font-family:var(--font-geist-mono),monospace;font-size:9.5px;font-weight:500;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);white-space:nowrap;
}
.lp .record-panel figcaption{margin-top:12px;font-size:12px;line-height:1.5;color:var(--ink-3)}
.lp .record-panel figcaption b{color:var(--ink);font-weight:500;font-variant-numeric:tabular-nums}

/* Heatmap — twenty-four weeks across, seven days down. The cells are
   sessions; the shading is how many sets that day carried. */
.lp .heat{display:grid;grid-template-columns:repeat(24,minmax(0,1fr));gap:3px;margin-top:14px}
.lp .heat i,.lp .heat-legend i{display:block;border-radius:2px;background:var(--line)}
.lp .heat i{aspect-ratio:1}
.lp .heat-legend{display:flex;align-items:center;gap:4px;margin-top:10px;
  font-family:var(--font-geist-mono),monospace;font-size:9.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-3)}
.lp .heat-legend i{width:9px;height:9px;flex:none}
.lp .heat-legend span:first-child{margin-right:3px}
.lp .heat-legend span:last-child{margin-left:3px}
.lp .heat i[data-l="1"],.lp .heat-legend i[data-l="1"]{background:color-mix(in srgb, var(--ink) 30%, var(--paper))}
.lp .heat i[data-l="2"],.lp .heat-legend i[data-l="2"]{background:color-mix(in srgb, var(--ink) 50%, var(--paper))}
.lp .heat i[data-l="3"],.lp .heat-legend i[data-l="3"]{background:color-mix(in srgb, var(--ink) 72%, var(--paper))}
.lp .heat i[data-l="4"],.lp .heat-legend i[data-l="4"]{background:var(--ink)}

/* PR trend — one lift's best set per month, drawn from the same values the
   caption names so the picture cannot drift from the claim. */
.lp .trend{display:block;width:100%;height:auto;margin-top:12px}
.lp .trend line{stroke:var(--line);stroke-width:1}
.lp .trend path{fill:none;stroke:var(--ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.lp .trend circle{fill:var(--paper);stroke:var(--ink);stroke-width:2}
.lp .trend circle.pr-dot{fill:var(--ink)}
.lp .trend-foot{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:8px;
  font-family:var(--font-geist-mono),monospace;font-size:9.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-3)}
.lp .trend-foot b{font-family:var(--font-geist-sans),system-ui,sans-serif;font-size:13.5px;letter-spacing:-.01em;
  text-transform:none;color:var(--ink);font-variant-numeric:tabular-nums}

/* The three claims the artifacts do not already cover, as a ruled list
   rather than another row of cards. */
.lp .record-facts{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,3vw,34px);
  margin:clamp(22px,3vw,30px) 0 0;padding-top:20px;border-top:1px solid var(--line);
}
.lp .record-facts dt{font-size:13px;font-weight:600;letter-spacing:-.01em}
.lp .record-facts dd{margin:6px 0 0;font-size:13px;line-height:1.55;color:var(--ink-2);max-width:34ch}

/* How it works ---------------------------------------------------------- */
.lp .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:36px;counter-reset:step}
.lp .step{position:relative;padding:22px;border:1px solid var(--line);border-radius:12px;background:var(--surface);display:grid;gap:10px;align-content:start}
.lp .step::before{
  counter-increment:step;content:"0" counter(step);
  font-family:var(--font-geist-mono),monospace;font-size:11px;letter-spacing:.08em;color:var(--accent);
}
.lp .step h3{font-size:17px;letter-spacing:-.015em;font-family:var(--font-geist-sans),sans-serif;font-weight:600}
.lp .step p{font-size:13.5px;line-height:1.6;color:var(--ink-2)}

/* Pricing --------------------------------------------------------------- */
.lp .plan{
  margin-top:36px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);
  border:1px solid var(--line);border-radius:12px;background:var(--surface);
  overflow:hidden;
}
.lp .plan-main{padding:clamp(24px,3vw,36px);border-right:1px solid var(--line);display:grid;gap:14px;align-content:start}
.lp .plan-badge{display:inline-flex;align-items:center;gap:7px;justify-self:start;font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:4px 8px}
.lp .plan-price{display:flex;align-items:flex-end;gap:10px}
.lp .plan-price b{font-family:var(--font-geist-sans),system-ui,sans-serif;font-size:clamp(2.8rem,4.6vw,3.6rem);font-weight:600;letter-spacing:-.05em;line-height:.9}
.lp .plan-price span{font-size:13px;color:var(--ink-3);padding-bottom:6px}
.lp .plan-main p{font-size:14px;line-height:1.6;color:var(--ink-2);max-width:34ch}
.lp .plan-main .btn{margin-top:6px;justify-self:start}
.lp .plan-list{padding:clamp(24px,3vw,36px);display:grid;gap:12px;align-content:start;background:var(--surface-2)}
.lp .plan-list h4{margin:0;font-family:var(--font-geist-mono),monospace;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);font-weight:500}
.lp .plan-list ul{margin:0;padding:0;list-style:none;display:grid;gap:11px}
.lp .plan-list li{display:flex;gap:10px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.lp .plan-list svg{flex:none;width:16px;height:16px;margin-top:1px;color:var(--accent)}
.lp .plan-note{margin-top:8px;font-size:12px;line-height:1.55;color:var(--ink-3)}
.lp .plan-link{display:inline-flex;align-items:center;gap:6px;min-height:30px;font-size:12.5px;font-weight:500;color:var(--ink-2);transition:color .15s,gap .2s}
.lp .plan-link:hover{color:var(--link);gap:9px}

/* FAQ ------------------------------------------------------------------- */
/* A ruled index, not a card of drawers. The rows sit straight on the page's
   paper, the ledger numbers let someone refer to "the third one", and the
   answers open underneath without a panel to lift them off the page. The
   left column carries what the questions cannot: where to ask. */
.lp .faq-grid{display:grid;grid-template-columns:minmax(0,4.4fr) minmax(0,7.6fr);gap:clamp(32px,5vw,88px);align-items:start}
.lp .faq-intro{position:sticky;top:96px;display:grid;gap:14px;align-content:start}
.lp .faq-intro h2{max-width:12ch}
.lp .faq-lede{font-size:15px;line-height:1.65;color:var(--ink-2);max-width:32ch}
.lp .faq-meta{margin-top:clamp(22px,3vw,36px);padding-top:18px;border-top:1px solid var(--line);display:grid;gap:10px;justify-items:start}
.lp .faq-meta-label{font-family:var(--font-geist-mono),monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.lp .faq-meta p{font-size:13px;line-height:1.6;color:var(--ink-2);max-width:30ch}
.lp .faq-ask{display:inline-flex;align-items:center;gap:7px;min-height:32px;font-size:13px;font-weight:500;color:var(--ink);border-bottom:1px solid var(--line-2);transition:color .15s,border-color .15s,gap .2s}
.lp .faq-ask:hover{color:var(--link);border-color:currentColor;gap:10px}

.lp .faq-list{border-top:1px solid var(--line-2)}
.lp .faq-item{border-bottom:1px solid var(--line)}
.lp .faq-item summary{
  display:grid;grid-template-columns:30px minmax(0,1fr) 22px;align-items:start;gap:14px;
  padding:19px 0;cursor:pointer;list-style:none;transition:padding .2s ease;
}
.lp .faq-item summary::-webkit-details-marker{display:none}
.lp .faq-n{padding-top:5px;font-family:var(--font-geist-mono),monospace;font-size:11px;
  letter-spacing:.06em;font-variant-numeric:tabular-nums;color:var(--ink-3);transition:color .15s}
.lp .faq-q{font-size:17px;font-weight:500;letter-spacing:-.016em;line-height:1.45;color:var(--ink);text-wrap:pretty}
.lp .faq-toggle{justify-self:end;padding-top:3px;font-family:var(--font-geist-mono),monospace;font-size:17px;line-height:1;
  color:var(--ink-2);transition:transform .24s cubic-bezier(.22,1,.36,1),color .15s}
.lp .faq-item summary:hover .faq-n{color:var(--ink-2)}
.lp .faq-item summary:hover .faq-toggle{color:var(--ink)}
.lp .faq-item[open] summary{padding-bottom:8px}
.lp .faq-item[open] .faq-n{color:var(--accent)}
.lp .faq-item[open] .faq-toggle{transform:rotate(45deg);color:var(--accent)}
.lp .faq-a{padding:0 48px 22px 44px;animation:faq-in .24s cubic-bezier(.22,1,.36,1)}
.lp .faq-a p{font-size:14.5px;line-height:1.7;color:var(--ink-2);max-width:62ch}
@keyframes faq-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

/* Closing CTA ----------------------------------------------------------- */
.lp .close{margin-top:clamp(64px,8vw,112px)}
.lp .close-in{
  position:relative;overflow:hidden;
  border-radius:12px;background:var(--accent);color:var(--accent-ink);
  padding:clamp(32px,5vw,60px);
  display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center;
}
.lp .close h2{color:inherit;max-width:18ch}
.lp .close p{margin-top:14px;font-size:15px;line-height:1.6;max-width:44ch;color:inherit;opacity:.9}
.lp .close .btn{background:var(--accent-ink);color:var(--accent);box-shadow:none}
.lp .close .btn:hover{background:var(--accent-ink);transform:translateY(-1px);opacity:.92}
.lp .close .btn-ghost{background:transparent;border-color:currentColor;color:inherit;box-shadow:none}
.lp .close-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}

@media(max-width:1080px){
  .lp .ui{grid-template-columns:170px minmax(0,1fr)}
  .lp .ui-side{display:none}
}
@media(max-width:900px){
  .lp .record-grid{grid-template-columns:minmax(0,1fr)}
  .lp .record-panel + .record-panel{margin-top:24px;padding:24px 0 0;border-left:0;border-top:1px solid var(--line)}
  .lp .steps{grid-template-columns:minmax(0,1fr)}
  .lp .faq-grid{grid-template-columns:minmax(0,1fr);gap:28px}
  .lp .faq-intro{position:static;gap:12px}
  .lp .faq-intro h2{max-width:20ch}
  .lp .faq-lede{max-width:46ch}
  .lp .faq-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin-top:4px;padding-top:14px}
  .lp .faq-meta p{max-width:38ch}
  .lp .feature{grid-template-columns:minmax(0,1fr);gap:28px}
  .lp .feature.flip .feature-media{order:0}
  .lp .plan{grid-template-columns:minmax(0,1fr)}
  .lp .plan-main{border-right:0;border-bottom:1px solid var(--line)}
  .lp .close-in{grid-template-columns:minmax(0,1fr)}
  .lp .ui{grid-template-columns:minmax(0,1fr);min-height:0}
  .lp .ui-rail{display:none}
}
/* Footer ---------------------------------------------------------------- */
.lp .ft{margin-top:clamp(64px,8vw,104px);border-top:1px solid var(--line);padding-top:clamp(40px,5vw,56px);padding-bottom:28px}
.lp .ft-grid{display:grid;grid-template-columns:minmax(0,1.7fr) repeat(3,minmax(0,.75fr));gap:32px}
.lp .ft-brand{display:grid;gap:14px;align-content:start;max-width:40ch}
.lp .ft-lockup{display:inline-flex;align-items:center;gap:9px;font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}
.lp .ft-mark{display:block;width:26px;height:26px;border-radius:7px}
.lp .ft-brand p{font-size:13px;line-height:1.65;color:var(--ink-3)}
.lp .ft h3{margin:0 0 13px;font-family:var(--font-geist-mono),monospace;font-size:10px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3)}
.lp .ft ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.lp .ft li{font-size:13.5px;color:var(--ink-2)}
.lp .ft li a{display:inline-flex;align-items:center;min-height:28px;transition:color .15s}
.lp .ft li a:hover{color:var(--link)}
.lp .ft-muted{font-size:12.5px;color:var(--ink-3)}
.lp .ft-base{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:clamp(32px,4vw,44px);padding-top:18px;border-top:1px solid var(--line);font-size:12px;color:var(--ink-3)}
.lp .ft-base span:last-child{margin-left:auto}
@media(max-width:900px){
  .lp .ft-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .lp .ft-brand{grid-column:1/-1;max-width:52ch}
}
@media(max-width:520px){
  .lp .ft-grid{grid-template-columns:minmax(0,1fr)}
  .lp .ft-base span:last-child{margin-left:0}
}

@media(max-width:700px){
  .lp .hero{padding-top:40px}
  .lp h1{font-size:clamp(2.2rem,9.2vw,2.95rem);line-height:1.05;max-width:17ch}
  .lp .hero .lede{font-size:15px;line-height:1.6;max-width:40ch}
  .lp .window-bar{height:38px}
  .lp .ui-main{padding:16px;gap:12px}
  .lp .ui-budget{grid-template-columns:repeat(2,minmax(0,1fr))}
  .lp .ui-cell{border-left:0;border-top:1px solid var(--line);padding:10px 12px}
  .lp .ui-cell:first-child{grid-column:1/-1;border-top:0}
  .lp .ui-cell:nth-child(2),.lp .ui-cell:nth-child(4){border-left:1px solid var(--line)}
  .lp .ui-figure{font-size:22px}
  .lp .ui-figure.mid{font-size:17px}
  .lp .ui-slot{grid-template-columns:64px minmax(0,1fr) auto;font-size:12px}
  .lp .record-facts{grid-template-columns:minmax(0,1fr);gap:16px}
  .lp .hero-actions .btn{width:100%}
  .lp .hero-actions{gap:10px}
  .lp .faq-item summary{grid-template-columns:22px minmax(0,1fr) 20px;gap:10px;padding:16px 0}
  .lp .faq-q{font-size:15px}
  .lp .faq-a{padding:0 10px 18px 32px}
  .lp .faq-a p{font-size:13.5px}
}
@media(prefers-reduced-motion:reduce){
  .lp *{transition:none!important;animation:none!important}
  .lp .btn:hover{transform:none}
}
`;

const MACROS = [
  { name: "Protein", left: 50, logged: 110, target: 160, pct: 69 },
  { name: "Carbs", left: 100, logged: 160, target: 260, pct: 62 },
  { name: "Fat", left: 44, logged: 36, target: 80, pct: 45 },
];

const SLOTS = [
  { key: "07:20 breakfast", name: "Oats, whey, banana", note: "Breakfast · 3 entries", kcal: "620", open: false },
  { key: "13:05 lunch", name: "Paneer, rice, dal", note: "Lunch · 4 entries", kcal: "780", open: false },
  { key: "18:40 dinner", name: "Dinner", note: "No entries yet", kcal: null, open: true },
];

const SETS = [
  { lift: "Bench press", set: "80 kg × 5", pr: true },
  { lift: "Barbell row", set: "60 kg × 8", pr: false },
  { lift: "Overhead press", set: "40 kg × 8", pr: false },
];

/* Twenty-four weeks of training as the heatmap reads it: one string per week,
   seven days each, "0" for no session and 1–4 for the sets that day carried.
   Authored rather than generated so the picture is the same on the server and
   in the browser. The count is fixed because it sets the cell size: twenty-four
   columns fill the panel the way a heatmap is meant to read, where twelve left
   each cell the size of a tile. */
const HEAT_WEEKS = [
  "0302100",
  "0203400",
  "0003201",
  "1202000",
  "0303100",
  "0214000",
  "0021300",
  "1303020",
  "0203100",
  "0312000",
  "0202410",
  "0030200",
  "1303020",
  "0212400",
  "0302301",
  "0021320",
  "2303010",
  "0204200",
  "1030320",
  "0302300",
  "0203100",
  "0312400",
  "0203010",
  "0302300",
];

/* The grid fills left to right, so the weeks are transposed into day rows. */
const HEAT_CELLS = Array.from({ length: 7 }, (_, day) =>
  HEAT_WEEKS.map((week) => week[day] || "0")
).flat();

const HEAT_DAYS = HEAT_CELLS.filter((level) => level !== "0").length;

/* One lift's best set per month, six months running. The chart is drawn from
   these numbers and so is its caption, so the two cannot disagree. */
const PR_TREND = [
  { month: "May", kg: 70, reps: 5 },
  { month: "Jun", kg: 72.5, reps: 5 },
  { month: "Jul", kg: 75, reps: 4 },
  { month: "Aug", kg: 75, reps: 5 },
  { month: "Sep", kg: 80, reps: 4 },
  { month: "Oct", kg: 82.5, reps: 3 },
];

const PR_MIN = 65;
const PR_MAX = 85;
/* A wide, flat plot: the trend column starts life 726px across, and a 320-wide
   viewBox scaled to that would make six points 290px tall. */
const PR_POINTS = PR_TREND.map((entry, i) => [
  8 + (i * (552 - 8)) / (PR_TREND.length - 1),
  112 - ((entry.kg - PR_MIN) / (PR_MAX - PR_MIN)) * (112 - 16),
]);
const PR_PATH = PR_POINTS.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const PR_LAST = PR_TREND[PR_TREND.length - 1];

/* What the two artifacts do not already show, said in one line each. */
const RECORD_FACTS = [
  { title: "Weight trend", copy: "One weigh-in a day, charted across the month you are actually in." },
  { title: "Streaks", copy: "Consecutive days with a meal logged, so a good week is visible." },
  { title: "Split planner", copy: "A weekly rotation that names the muscles due today." },
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. There is one plan, it costs nothing, and there is no card field anywhere in the app. The source is public, so you can also run it yourself against your own MongoDB database.",
  },
  {
    q: "Do I need a calorie target to start?",
    a: "No. Onboarding can estimate one from your age, height, weight and activity level, and you can set your own numbers instead. Targets are editable at any time and every past day is kept as it was logged.",
  },
  {
    q: "Can I use it only for lifting?",
    a: "Meals and training are separate surfaces. Log a session and skip the food, or log food and ignore the gym — the day still adds up. Most people end up using both because they live on the same page.",
  },
  {
    q: "Where does my data live?",
    a: "In your account's records in MongoDB, behind a signed session cookie. Nothing is sold, there is no ad tracking, and no third-party analytics script runs on the app.",
  },
  {
    q: "Does it work on a phone?",
    a: "The whole app is responsive. Logging a meal or a set is two taps on a phone, and the dashboard keeps its single-column layout down to a 320px screen.",
  },
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 10.5 8 14.5 16 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The dashboard, drawn rather than screenshotted. Numbers are a sample day
   and the frame says so, so nothing here reads as a real user's record. */
function DashboardMock() {
  return (
    <div className="stage" data-reveal>
      <div
        className="window"
        role="group"
        aria-label="The NutriGain dashboard for a sample day: calories and macros left, three meal slots, the day's sets and a weight trend."
      >
        <div className="window-bar">
          <span className="window-url">nutrigain.app/dashboard</span>
          <span className="window-tag">Sample day</span>
        </div>

        <div className="ui">
          <div className="ui-rail" aria-hidden="true">
            <Logo size={30} className="ui-logo" />
            {[
              ["feed", "Today"],
              ["meal", "Meal"],
              ["gym", "Gym"],
              ["progress", "Progress"],
              ["profile", "Account"],
            ].map(([icon, label], i) => (
              <span key={label} className={"ui-rail-row" + (i === 0 ? " on" : "")}>
                <NavIcon name={icon} className="" />
                {label}
              </span>
            ))}
          </div>

          <div className="ui-main">
            <div className="ui-head">
              <div>
                <span className="ui-kick">Tuesday, 21 October</span>
                <span className="ui-title">Today</span>
              </div>
              <span className="ui-chip">On target</span>
            </div>

            <div className="ui-budget">
              <div className="ui-cell">
                <span className="ui-k">Left today</span>
                <span className="ui-figure">
                  1,000 <u>kcal</u>
                </span>
                <div className="ui-track"><i style={{ width: "58%" }} /></div>
                <span className="ui-note">1,400 of 2,400 logged</span>
              </div>
              {MACROS.map((m) => (
                <div className="ui-cell" key={m.name}>
                  <span className="ui-k">{m.name}</span>
                  <span className="ui-figure mid">
                    {m.left} <u>g left</u>
                  </span>
                  <div className="ui-track"><i style={{ width: m.pct + "%" }} /></div>
                </div>
              ))}
            </div>

            <div className="ui-slots">
              {SLOTS.map((s) => (
                <div className={"ui-slot" + (s.open ? " ui-slot-on" : "")} key={s.key}>
                  <span className="ui-slot-k">{s.key.split(" ")[0]}</span>
                  <span className="ui-slot-name">
                    <b>{s.name}</b>
                    <small>{s.note}</small>
                  </span>
                  <span className={"ui-slot-kcal" + (s.open ? " empty" : "")}>
                    {s.open ? "Log" : <>{s.kcal} <u>kcal</u></>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-side">
            <span className="ui-k">Today&apos;s session</span>
            <div className="ui-split">
              <span>Push</span>
              <span className="ui-pr">4 sets</span>
            </div>
            <div className="ui-set">
              <span>Bench press</span>
              <b>80 kg × 5</b>
            </div>
            <div className="ui-set">
              <span>Barbell row</span>
              <b>60 kg × 8</b>
            </div>
            <div className="ui-set">
              <span>Overhead press</span>
              <b>40 kg × 8</b>
            </div>
            <div className="ui-spark">
              <span className="ui-spark-k">
                <span>Body weight</span>
                <b>78.4 kg</b>
              </span>
              <svg viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M0 40 L25 37 L50 41 L75 30 L100 33 L125 24 L150 27 L175 18 L200 20"
                  fill="none"
                  stroke="var(--t1)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <p className="ui-spark-note">Last 30 days · 9 weigh-ins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="lp mrd">
      <style>{PAGE_CSS}</style>
      <AppShell variant="marketing">
        <main id="main" className="shell" tabIndex={-1}>
          {/* ---------------- HERO ---------------- */}
          <section className="hero" aria-labelledby="title">
            <div className="ng-container hero-in">
              <h1 id="title">
                Know what’s left.{" "}
                <br />
                Not what you spent.
              </h1>
              <p className="lede">
                NutriGain counts meals against your macro targets and saves every set as
                weight × reps. Calories, protein and training land on one page, so the next
                meal is a decision instead of arithmetic.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="btn">
                  Get started free
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M4 10h11m0 0-4.2-4.2M15 10l-4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href="/#how" className="btn btn-ghost">
                  See how it works
                </Link>
              </div>
              <div className="hero-meta">
                <span>Free, one plan</span>
                <span>No credit card</span>
                <span>Open source</span>
              </div>

              <DashboardMock />
            </div>
          </section>

          {/* ---------------- FEATURES ---------------- */}
          <section id="features" className="sec" aria-labelledby="features-title">
            <div className="ng-container">
              <div className="sec-head" data-reveal>
                <h2 id="features-title">The whole day, and the numbers that matter in it.</h2>
                <p className="lede">
                  Three surfaces do the daily work: meals, macros and sets. Everything else
                  in the app exists to read them over time.
                </p>
              </div>

              <article className="feature" aria-labelledby="f1">
                <div className="feature-copy" data-reveal>
                  <h3 id="f1">Meals that do their own arithmetic</h3>
                  <p>
                    Breakfast, lunch and dinner each keep their own entries and their own
                    total. Add a food and the day&apos;s calories and macros update in the
                    same keystroke — no spreadsheet, no second app.
                  </p>
                  <ul className="feature-list">
                    <li><Check />Search the food list or save your own entries</li>
                    <li><Check />Per-slot totals, so a heavy lunch is obvious</li>
                    <li><Check />An empty slot stays visible and says it is empty</li>
                  </ul>
                </div>
                <div className="feature-media" data-reveal data-delay="80">
                  <div className="card">
                    <div className="card-h">
                      <b>Today&apos;s meals</b>
                      <span>2 of 3 logged</span>
                    </div>
                    {SLOTS.map((s) => (
                      <div className="meal" key={"m" + s.key}>
                        <span className="meal-k">{s.key.split(" ")[0]}</span>
                        <span className="meal-name">
                          <b>{s.name}</b>
                          <small>{s.note}</small>
                        </span>
                        {s.open ? (
                          <span className="meal-add">Add food</span>
                        ) : (
                          <span className="meal-kcal">{s.kcal} <u>kcal</u></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="feature flip" aria-labelledby="f2">
                <div className="feature-copy" data-reveal>
                  <h3 id="f2">A budget, not a scoreboard</h3>
                  <p>
                    The dashboard leads with what is left: calories first, then protein,
                    carbs and fat. Targets are set once and every meal subtracts from them,
                    so you are never adding up the day in your head.
                  </p>
                  <ul className="feature-list">
                    <li><Check />Remaining macros, not totals you have to invert</li>
                    <li><Check />Targets editable at any time, history kept intact</li>
                    <li><Check />An honest over-target state instead of a hidden one</li>
                  </ul>
                </div>
                <div className="feature-media" data-reveal data-delay="80">
                  <div className="card">
                    <div className="card-h">
                      <b>Nutrition</b>
                      <span>Per day</span>
                    </div>
                    <div className="card-b bands">
                      <div className="band-total">
                        <b>1,000<u>kcal left</u></b>
                        <span>42% of a 2,400 target</span>
                      </div>
                      {MACROS.map((m) => (
                        <div key={"b" + m.name}>
                          <div className="band-top">
                            <b>{m.name}</b>
                            <span>{m.logged} / {m.target} g</span>
                          </div>
                          <div className="band-track"><i style={{ width: m.pct + "%" }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <article className="feature" aria-labelledby="f3">
                <div className="feature-copy" data-reveal>
                  <h3 id="f3">Every set as weight × reps</h3>
                  <p>
                    Log 80 kg × 5 and the app does the rest: weekly volume, a personal best
                    when you beat one, and the split you are due to train. A set is a
                    measurement, not a checkmark.
                  </p>
                  <ul className="feature-list">
                    <li><Check />Per-set logging for every lift in the session</li>
                    <li><Check />PRs recorded the moment they happen</li>
                    <li><Check />A weekly rotation that names today&apos;s muscles</li>
                  </ul>
                </div>
                <div className="feature-media" data-reveal data-delay="80">
                  <div className="card">
                    <div className="card-h">
                      <b>Push · Tuesday</b>
                      <span>4 working sets</span>
                    </div>
                    {SETS.map((s) => (
                      <div className="set" key={"s" + s.lift}>
                        <span>{s.lift}</span>
                        <b>{s.set}</b>
                        <em>{s.pr ? "PR" : "—"}</em>
                      </div>
                    ))}
                    <div className="set-foot">
                      <span>Volume this week <b>12,840 kg</b></span>
                      <span>Sets <b>46</b></span>
                    </div>
                  </div>
                </div>
              </article>

              <div className="record" data-reveal>
                <div className="record-head">
                  <h2>What six months of logging looks like.</h2>
                  <p className="lede">
                    The heatmap and the PR trend are the two things a calorie counter cannot
                    show you. Both are drawn from entries the log already holds — there is no
                    weekly review to fill in.
                  </p>
                </div>

                <div className="record-grid">
                  <figure className="record-panel">
                    <div className="record-h">
                      <b>Training heatmap</b>
                      <span>Last 24 weeks</span>
                    </div>
                    <div className="heat" aria-hidden="true">
                      {HEAT_CELLS.map((level, i) => (
                        <i key={i} data-l={level} />
                      ))}
                    </div>
                    <div className="heat-legend" aria-hidden="true">
                      <span>Less</span>
                      {["0", "1", "2", "3", "4"].map((level) => (
                        <i key={level} data-l={level} />
                      ))}
                      <span>More</span>
                    </div>
                    <figcaption>
                      <b>{HEAT_DAYS}</b> training days in twenty-four weeks, shaded by the sets
                      each one carried. Sample data.
                    </figcaption>
                  </figure>

                  <figure className="record-panel">
                    <div className="record-h">
                      <b>Bench press · top set</b>
                      <span>Six months</span>
                    </div>
                    <svg
                      className="trend"
                      viewBox="0 0 560 128"
                      role="img"
                      aria-label="Best bench press set each month, rising from 70 kilograms in May to 82.5 kilograms in October."
                    >
                      {[16, 64, 112].map((y) => (
                        <line key={y} x1="8" x2="552" y1={y} y2={y} />
                      ))}
                      <path d={PR_PATH} />
                      {PR_POINTS.map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x.toFixed(1)}
                          cy={y.toFixed(1)}
                          r={i === PR_POINTS.length - 1 ? 3.5 : 2.5}
                          className={i === PR_POINTS.length - 1 ? "pr-dot" : undefined}
                        />
                      ))}
                    </svg>
                    <div className="trend-foot">
                      <span>May</span>
                      <b>
                        {PR_LAST.kg} kg × {PR_LAST.reps}
                      </b>
                      <span>Oct</span>
                    </div>
                    <figcaption>
                      Personal best set on 18 October, from the month you are in. Sample data.
                    </figcaption>
                  </figure>
                </div>

                <dl className="record-facts">
                  {RECORD_FACTS.map((fact) => (
                    <div key={fact.title}>
                      <dt>{fact.title}</dt>
                      <dd>{fact.copy}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* ---------------- HOW IT WORKS ---------------- */}
          <section id="how" className="sec" aria-labelledby="how-title">
            <div className="ng-container">
              <div className="sec-head" data-reveal>
                <h2 id="how-title">Set up once, then log the day.</h2>
                <p className="lede">
                  No import, no spreadsheet to migrate, no ten-step wizard. Three screens
                  and you are tracking.
                </p>
              </div>
              <div className="steps">
                <div className="step" data-reveal>
                  <h3>Set your targets</h3>
                  <p>
                    Enter age, height, weight and activity, and the app estimates a daily
                    intake with Mifflin-St Jeor. Adjust any number before you save it.
                  </p>
                </div>
                <div className="step" data-reveal data-delay="80">
                  <h3>Log meals and sets</h3>
                  <p>
                    Add food to a slot, add a set to a lift. Both take the same two taps,
                    and both update the one screen you check during the day.
                  </p>
                </div>
                <div className="step" data-reveal data-delay="160">
                  <h3>Read the trend</h3>
                  <p>
                    Weight, streaks, PRs and a training calendar build themselves from what
                    you logged. Nothing needs a weekly report.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- PRICING ---------------- */}
          <section id="pricing" className="sec" aria-labelledby="pricing-title">
            <div className="ng-container">
              <div className="sec-head" data-reveal>
                <h2 id="pricing-title">One plan. No tiers to compare.</h2>
              </div>

              <div className="plan" data-reveal>
                <div className="plan-main">
                  <span className="plan-badge">Everything included</span>
                  <div className="plan-price">
                    <b>$0</b>
                    <span>forever, no card</span>
                  </div>
                  <p>
                    Tracking your own food and training should not be a subscription. Use
                    the hosted app, or run the same code against your own database.
                  </p>
                  <Link href="/register" className="btn">
                    Get started free
                  </Link>
                </div>
                <div className="plan-list">
                  <h4>What you get</h4>
                  <ul>
                    <li><Check />Unlimited meal entries and gym sessions</li>
                    <li><Check />Macro targets, weight tracking, streaks and PRs</li>
                    <li><Check />Progress charts and the training heatmap</li>
                    <li><Check />Light and dark themes</li>
                    <li><Check />Self-hosting: your MongoDB, your data</li>
                  </ul>
                  <p className="plan-note">Running it yourself?</p>
                  <a className="plan-link" href="https://github.com/chaudhary64/NutriGain" rel="noreferrer">
                    Source and setup steps on GitHub
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- FAQ ---------------- */}
          <section id="faq" className="sec" aria-labelledby="faq-title">
            <div className="ng-container">
              <div className="faq-grid">
                <div className="faq-intro" data-reveal>
                  <h2 id="faq-title">Questions, answered plainly.</h2>
                  <p className="faq-lede">
                    The five things people ask before logging a first meal. No trial
                    terms buried in a footnote.
                  </p>
                  <div className="faq-meta">
                    <span className="faq-meta-label">Still stuck</span>
                    <p>
                      Open an issue and say what you were trying to log — meals,
                      macros, a lift that did not save.
                    </p>
                    <a
                      className="faq-ask"
                      href="https://github.com/chaudhary64/NutriGain/issues"
                      rel="noreferrer"
                    >
                      Ask on GitHub
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>

                <div className="faq-list" data-reveal data-delay="80">
                  {FAQ.map((item, i) => (
                    <details key={item.q} className="faq-item" open={i === 0}>
                      <summary>
                        <span className="faq-n" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="faq-q">{item.q}</span>
                        <span className="faq-toggle" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <div className="faq-a">
                        <p>{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- CLOSING CTA ---------------- */}
          <section className="close" aria-labelledby="close-title">
            <div className="ng-container">
              <div className="close-in" data-reveal>
                <div>
                  <h2 id="close-title">Start with today.</h2>
                  <p>
                    Create an account, set your targets once, and log the first meal.
                    Tomorrow the page already knows what is left.
                  </p>
                </div>
                <div className="close-actions">
                  <Link href="/register" className="btn">
                    Get started free
                  </Link>
                  <Link href="/login" className="btn btn-ghost">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <AppFooter />
        <HomeMotion />
      </AppShell>
    </div>
  );
}
