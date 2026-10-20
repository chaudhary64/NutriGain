"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AppShell from "@/components/AppShell";
import SplitManager from "@/components/SplitManager";
import { suggestMacroGoals, ACTIVITY_LEVELS, GOALS } from "@/lib/tdee";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Meridian design system — page-local rules only.                    */
/*                                                                    */
/* One account surface, one sticky section rail. Profile details,     */
/* training split, goals, appearance and security are sections of a   */
/* single page rather than two competing destinations.                */
/* ------------------------------------------------------------------ */

const ACCOUNT_CSS = `
/* Anchor jumps inside this page animate; scoped so no other surface
   inherits smooth scrolling from a dashboard. */
html:has(.acc-layout){scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html:has(.acc-layout){scroll-behavior:auto}}
/* Type scale — one step per job, declared once and used everywhere on the
   page. Nothing here is a one-off size: a value either is the hero metric,
   a section heading, the account name, measured data, a control, supporting
   copy, or a mono micro-label. */
.acc-layout{
  --acc-hero:34px;    /* the single largest number on the page */
  --acc-metric:24px;  /* weight readings, goal tiles, suggestions */
  --acc-h2:18px;      /* section headings */
  --acc-name:16px;    /* account name, monogram */
  --acc-data:15px;    /* body-detail values */
  --acc-body:13px;    /* controls, row labels, descriptions */
  --acc-small:12px;   /* notes, hints, units, footnotes */
  --acc-micro:10.5px; /* mono labels and eyebrows */
}
/* Two-pane shell — same rail/column-rule convention as the gym page. */
.acc-layout{display:grid;grid-template-columns:min(216px,100%) minmax(0,1fr);gap:24px;align-items:start}
.acc-rail{position:sticky;top:24px;align-self:start}
.acc-rail-lbl{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.acc-rail-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.acc-rail-link{display:block;font-size:var(--acc-body);font-weight:500;letter-spacing:-.01em;color:var(--t2);text-decoration:none;padding:7px 10px 7px 12px;border-left:2px solid transparent;border-radius:0 6px 6px 0;transition:color .15s,background .15s,border-color .15s}
.acc-rail-link:hover{color:var(--t1);background:var(--sunken)}
.acc-rail-link.on{color:var(--t1);font-weight:500;border-left-color:var(--t1);background:var(--sunken)}
.acc-rail-link:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.acc-body{min-width:0;max-width:860px}
/* Sections — hierarchy from type and spacing, not five borders. */
.acc-sec{padding-bottom:34px;scroll-margin-top:88px}
/* Legacy anchors from the old Settings page, kept so redirected deep links
   still land on the matching section. */
.acc-anchor{display:block;height:0;scroll-margin-top:88px}
.acc-sec+.acc-sec{border-top:1px solid var(--line);padding-top:34px}
.acc-sec:last-child{padding-bottom:8px}
.acc-sec-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
/* A section whose header is its whole body (Appearance) needs no gap under it. */
.acc-sec-h:last-child{margin-bottom:0}
.acc-sec-h h2{font-size:var(--acc-h2);font-weight:600;letter-spacing:-.02em;line-height:1.3;color:var(--t1);margin:0}
.acc-sec-sub{font-size:var(--acc-body);font-weight:400;color:var(--t2);margin:5px 0 0;max-width:56ch;line-height:1.5}
.acc-sec-acts{display:flex;gap:8px;flex-shrink:0}
.acc-btn{border:1px solid var(--line);background:var(--card);color:var(--t1)}
.acc-btn:hover:not(:disabled){background:var(--sunken)}
.acc-btn-danger{border:1px solid var(--red-soft-b);background:var(--card);color:var(--red)}
.acc-btn-danger:hover{background:var(--red-soft)}
.acc-card-b{padding:18px}
/* Profile — identity, then the five body measurements as boxed cells in the
   same divided-cell language as the training week, then weight as one bar.
   The daily target is not repeated here: Daily goals owns that number. */
.acc-dossier{overflow:hidden}
.acc-dossier-id{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;min-width:0;padding:10px 20px;background:var(--card-2);border-bottom:1px solid var(--line)}
.acc-idtext{min-width:0}
.acc-avatar{width:34px;height:34px;border-radius:50%;background:var(--sunken);color:var(--t1);display:flex;align-items:center;justify-content:center;font-size:var(--acc-body);font-weight:600;letter-spacing:-.02em;border:1px solid var(--line);flex-shrink:0}
.acc-name{font-size:var(--acc-name);font-weight:600;letter-spacing:-.02em;color:var(--t1);margin:0;line-height:1.25;overflow-wrap:anywhere}
.acc-email{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:400;letter-spacing:-.01em;color:var(--t3);margin:2px 0 0;overflow-wrap:anywhere}
.acc-dossier-b{display:flex;flex-direction:column;min-width:0}
/* The body editor's action rides the masthead, so the strip below needs no
   header of its own — its five keys already say what it is. */
.acc-idact{margin-left:auto;display:flex;align-items:center;flex-shrink:0}
.acc-eyebrow{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
/* Body details — one cell per measurement, hairline between, key above value:
   each number gets its own box instead of running together in a line. */
.acc-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-bottom:1px solid var(--line)}
.acc-fact{min-width:0;padding:11px 12px 13px;border-left:1px solid var(--line)}
.acc-fact:first-child{border-left:0;padding-left:20px}
.acc-fact:last-child{padding-right:20px}
.acc-k{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);white-space:nowrap}
.acc-fact .acc-k{display:block}
.acc-fact-v{margin:5px 0 0;font-size:var(--acc-data);font-weight:600;letter-spacing:-.02em;color:var(--t1);line-height:1.3;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
/* Weight — a second band of the same cells: the reading, the target it is
   heading for, when it was logged, and the one action, each in its own box. */
.acc-facts-w{border-bottom:1px solid var(--line)}
.acc-fact-wide{grid-column:span 2}
.acc-fact-v small{margin-left:4px;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3)}
.acc-fact-v.quiet{font-weight:500;color:var(--t2)}
.acc-fact-v.none{color:var(--t3);font-weight:500}
.acc-fact-act{display:flex;align-items:center;justify-content:flex-end}
.acc-fact-act .m-btn{padding:4px 10px;font-size:var(--acc-small);gap:6px}
.acc-dossier-fine{margin:0;padding:0 20px 11px;font-size:var(--acc-small);font-weight:400;color:var(--t2);line-height:1.5}
/* TDEE preview inside the body editor — four figures and the maths behind
   them, read-only until the athlete applies them from Daily goals. */
.acc-suggest{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 24px;margin-top:14px;padding:11px 14px;background:var(--sunken);border:1px solid var(--line);border-radius:8px}
.acc-suggest-stat b{display:block;font-size:var(--acc-data);font-weight:600;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-suggest-stat span{display:block;margin-top:1px;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.acc-suggest-note{width:100%;margin:2px 0 0;font-size:var(--acc-small);color:var(--t3);line-height:1.5}
.acc-weight-err{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0;padding:0 20px 11px;font-size:var(--acc-small);font-weight:400;color:var(--red);line-height:1.45}
.acc-weight-err button{border:0;background:none;padding:0;color:var(--red);font:inherit;font-weight:500;text-decoration:underline;cursor:pointer}
/* Body form — two columns on desktop, stacked on phones. */
.acc-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.acc-form-grid .acc-field-wide{grid-column:1/-1}
.acc-dossier-b .acc-card-b{padding:22px}
/* Daily goals — the calorie target is the plate, the three macro targets are
   the split beside it. One bar draws their real energy share (protein ×4,
   carbs ×4, fat ×9) and the line beneath checks the macros against the calorie
   goal, so the four numbers read as one system instead of four equal tiles. */
.acc-goals{display:grid;grid-template-columns:min(224px,100%) minmax(0,1fr);overflow:hidden}
.acc-energy{display:flex;flex-direction:column;justify-content:center;gap:7px;padding:16px 20px 18px;background:var(--card-2);border-right:1px solid var(--line)}
.acc-energy-k{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.acc-energy-v{display:flex;align-items:baseline;gap:7px;margin:0;font-size:var(--acc-hero);font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-energy-v small,.acc-energy-u{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3)}
.acc-energy-in{display:flex;align-items:baseline;gap:7px;border-bottom:1px solid var(--line);padding-bottom:5px;transition:border-color .15s}
.acc-energy-in:focus-within{border-bottom-color:var(--t1)}
.acc-energy-u{white-space:nowrap;flex-shrink:0}
.acc-num{flex:1 1 0;width:auto;min-width:0;border:0;background:transparent;padding:0;font-family:inherit;font-size:var(--acc-hero);font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums;outline:none;-webkit-appearance:none;appearance:textfield}
.acc-num::-webkit-outer-spin-button,.acc-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.acc-macros{display:flex;flex-direction:column;justify-content:center;min-width:0;padding:12px 0}
.acc-macros-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 20px 6px}
.acc-macro{display:grid;grid-template-columns:minmax(0,1fr) auto 40px;align-items:center;gap:12px;padding:7px 20px;border-top:1px solid var(--line)}
.acc-macro-k{display:flex;align-items:center;gap:7px;min-width:0;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t2)}
.acc-macro-k i{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.acc-macro-v{display:flex;align-items:baseline;gap:4px;margin:0;font-size:var(--acc-data);font-weight:600;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-macro-v small{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;color:var(--t3)}
.acc-macro-in{display:flex;align-items:baseline;gap:4px}
.acc-macro-in input{width:64px;border:0;border-bottom:1px solid var(--line);background:transparent;padding:1px 0;text-align:right;font:inherit;font-size:var(--acc-data);font-weight:600;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums;outline:none;transition:border-color .15s}
.acc-macro-in input:focus{border-bottom-color:var(--t1)}
.acc-macro-in span{font-family:var(--font-mono);font-size:var(--acc-micro);color:var(--t3)}
.acc-pct{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.04em;color:var(--t3);text-align:right;font-variant-numeric:tabular-nums}
.acc-share{display:flex;gap:2px;height:6px;margin:11px 20px 0;border-radius:3px;overflow:hidden;background:var(--track)}
.acc-share i{display:block;height:100%;transition:width .2s ease}
.acc-share-note{margin:8px 20px 0;font-size:var(--acc-small);font-weight:400;color:var(--t3);line-height:1.45;font-variant-numeric:tabular-nums}
/* The suggestion is an offer, not a second readout — one quiet line above. */
.acc-tip{display:flex;align-items:center;gap:6px 16px;flex-wrap:wrap;margin:0 0 12px;padding:9px 14px;background:var(--sunken);border:1px solid var(--line);border-radius:8px}
.acc-tip p{margin:0;font-size:var(--acc-small);font-weight:400;color:var(--t3);line-height:1.5}
.acc-tip b{font-weight:500;color:var(--t2);font-variant-numeric:tabular-nums}
.acc-tip .m-btn{padding:5px 11px;font-size:var(--acc-small);margin-left:auto;flex-shrink:0}
.acc-status{font-size:var(--acc-small);font-weight:400;color:var(--t3);margin:10px 0 0}
.acc-status.err{color:var(--red)}
/* Theme segmented control */
.acc-seg{display:inline-flex;gap:2px;background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:3px;flex-shrink:0}
.acc-seg button{border:0;background:transparent;font:inherit;font-size:var(--acc-body);font-weight:500;color:var(--t2);padding:6px 14px;border-radius:6px;cursor:pointer;transition:background .15s,color .15s}
.acc-seg button:hover{color:var(--t1)}
.acc-seg button.on{background:var(--card);color:var(--t1);box-shadow:0 1px 1px rgba(0,0,0,.04)}
.acc-seg button:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* Security — a credential sheet. Three ruled lines you write on, each rule
   verified in the margin beside the field it governs, then the session as a
   ruled footer on the same sheet. No boxes: the rule under a line is the
   field's own edge, and the whole line darkens while you are in it. */
.acc-sheet{overflow:hidden}
.acc-creds{padding:0 22px}
.acc-creds-h{display:flex;align-items:baseline;justify-content:space-between;gap:4px 20px;flex-wrap:wrap;padding:11px 0 10px;border-bottom:1px solid var(--line)}
.acc-creds-h h3{margin:0;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t1)}
.acc-creds-note{margin:0;font-size:var(--acc-small);font-weight:400;color:var(--t3);line-height:1.45;text-align:right;max-width:52ch}
.acc-led{display:grid}
.acc-led-row{display:grid;grid-template-columns:96px minmax(0,1fr) 170px;align-items:center;gap:0 16px;padding:9px 0;border-bottom:1px solid var(--line);transition:border-color .15s}
.acc-led-row:focus-within{border-bottom-color:var(--t1)}
.acc-led-k{font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t2);cursor:pointer;transition:color .15s}
.acc-led-row:focus-within .acc-led-k{color:var(--t1)}
.acc-led-in{position:relative;display:flex;align-items:center;min-width:0}
.acc-led-in input{width:100%;min-width:0;border:0;background:transparent;padding:2px 54px 2px 0;font-family:var(--font-mono);font-size:var(--acc-body);font-weight:500;letter-spacing:.04em;color:var(--t1);outline:none;-webkit-appearance:none}
.acc-led-in input[type="password"]{letter-spacing:.16em}
.acc-led-in input::placeholder{color:var(--faint);font-size:var(--acc-small);letter-spacing:.01em}
.acc-led-show{position:absolute;right:0;top:50%;transform:translateY(-50%);border:0;background:none;padding:6px 2px;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);cursor:pointer;border-radius:3px}
.acc-led-show:hover{color:var(--t1)}
.acc-led-show:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* The margin rule: one annotation per field, its state carried by the dot. */
.acc-led-note{margin:0;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);text-align:right;line-height:1.4}
.acc-led-note.ok{color:var(--green)}
.acc-led-note.bad{color:var(--red)}
.acc-creds-foot{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap;padding:10px 0 12px;min-height:48px}
.acc-creds-foot .acc-err{margin:0;flex:1 1 240px}
.acc-creds-foot .m-btn{margin-left:auto;flex-shrink:0;padding:6px 13px}
.acc-err{margin:10px 0 0;font-size:var(--acc-small);font-weight:400;color:var(--red);line-height:1.45}
/* Session — the sheet's footer rule, not a second card. */
.acc-session{display:flex;align-items:center;gap:6px 16px;flex-wrap:wrap;padding:10px 22px;background:var(--card-2);border-top:1px solid var(--line)}
.acc-session-k{margin:0;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.acc-session-state{display:flex;align-items:center;gap:6px;margin:0;font-family:var(--font-mono);font-size:var(--acc-micro);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t1)}
.acc-session-state i{width:5px;height:5px;border-radius:50%;background:var(--green);flex-shrink:0}
.acc-session-note{margin:0;font-size:var(--acc-small);font-weight:400;color:var(--t3);line-height:1.45;flex:1 1 210px}
.acc-session .m-btn{margin-left:auto;flex-shrink:0}
/* Mobile — the rail becomes a chip row above the body. */
@media (max-width:1024px){
  .acc-layout{grid-template-columns:minmax(0,1fr)}
  .acc-rail{position:static;border-bottom:1px solid var(--line);padding-bottom:16px}
  .acc-rail-list{display:flex;flex-wrap:wrap;gap:8px}
  .acc-rail-link{border:1px solid var(--line);border-left:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--card)}
  .acc-rail-link.on{border-color:var(--t1)}
  .acc-sec{scroll-margin-top:76px}
}
@media (min-width:1025px){
  .acc-layout{column-gap:36px}
  .acc-rail{border-right:1px solid var(--line);padding-right:32px}
}
@media (max-width:900px){
  .acc-creds-note{text-align:left}
  /* Stacked rows keep the margin rule on the label line instead of adding a
     third line under the field — same information, 20px less height. */
  .acc-led-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"lab note" "in in";gap:4px 14px;padding:9px 0}
  .acc-led-k{grid-area:lab}
  .acc-led-in{grid-area:in}
  .acc-led-note{grid-area:note;text-align:right}
  .acc-led-row > span{display:none}
}
@media (max-width:760px){
  .acc-dossier-id,.acc-dossier-fine,.acc-weight-err{padding-left:16px;padding-right:16px}
  /* Two boxes per row; Goal takes the full width rather than leaving a hole. */
  .acc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .acc-fact{padding:10px 12px 12px;border-left:1px solid var(--line)}
  .acc-fact:first-child,.acc-fact:nth-child(odd){border-left:0;padding-left:16px}
  .acc-fact:nth-child(even){padding-right:16px}
  .acc-fact:nth-child(n+3){border-top:1px solid var(--line)}
  .acc-fact:nth-child(5){grid-column:1/-1}
  /* Weight band: the reading owns the full width, target and date share the
     next row, the action closes the band. */
  .acc-facts-w .acc-fact{border-left:1px solid var(--line);padding:10px 12px 12px}
  .acc-facts-w .acc-fact-wide,.acc-facts-w .acc-fact-act{grid-column:1/-1;border-left:0;padding-left:16px;padding-right:16px}
  .acc-facts-w .acc-fact-wide{border-bottom:1px solid var(--line)}
  .acc-facts-w .acc-fact:nth-child(2){border-left:0;padding-left:16px}
  .acc-facts-w .acc-fact-act{border-top:1px solid var(--line);padding-top:8px;padding-bottom:10px}
  .acc-facts-w .acc-fact-act .m-btn{width:100%;justify-content:center}
  .acc-dossier-b .acc-card-b{padding:18px}
  .acc-form-grid{grid-template-columns:1fr}
  .acc-goals{grid-template-columns:minmax(0,1fr)}
  .acc-energy{border-right:0;border-bottom:1px solid var(--line);padding:14px 18px 16px}
  .acc-macros{padding:6px 0 10px}
  .acc-macros-h,.acc-macro{padding-left:18px;padding-right:18px}
  .acc-share,.acc-share-note{margin-left:18px;margin-right:18px}
}
@media (max-width:640px){
  .acc-sec-h{flex-direction:column;align-items:stretch}
  .acc-creds,.acc-session{padding-left:18px;padding-right:18px}
  .acc-creds-foot{padding:8px 0 10px;min-height:44px}
  .acc-creds-foot .m-btn{width:100%;justify-content:center;margin-left:0}
  .acc-session{padding-top:9px;padding-bottom:9px}
  .acc-session .m-btn{margin-left:0}
}
`;

/* The reading line, in viewport px: a section counts as current once its heading
   has crossed it. Near the top rather than mid-viewport, so the first section is
   current when the page opens and the highlight follows the eye down the page.
   It also clears the sticky mobile bar and the rail's own top. */
const READ_LINE = 132;
/* Where a rail jump parks a section heading — the same offset the CSS
   scroll-margin uses, so clicks and redirected deep links land identically. */
const SCROLL_OFFSET = 88;

/* One source of truth for the rail, the scroll-spy, and the section ids. */
const SECTIONS = [
  { id: "acc-profile", label: "Profile" },
  { id: "acc-training", label: "Training split" },
  { id: "acc-goals", label: "Daily goals" },
  { id: "acc-appearance", label: "Appearance" },
  { id: "acc-security", label: "Security" },
];

const ACTIVITY_LABEL = Object.fromEntries(ACTIVITY_LEVELS.map((l) => [l.value, l.label]));
const GOAL_LABEL = Object.fromEntries(GOALS.map((g) => [g.value, g.label]));
const SEX_LABEL = { male: "Male", female: "Female", other: "Other / prefer not to say" };

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  logout: <><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  scale: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>,
  /* Food-source macro glyphs (shared with the meal page meters) */
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  drumstick: <><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.6 13.6 17.2 17.2" /><circle cx="19.4" cy="16.5" r="1.7" /><circle cx="16.5" cy="19.4" r="1.7" /></>,
  wheat: <><path d="M12 22v-7" /><path d="M8 15l4-3 4 3" /><path d="M8 11l4-3 4 3" /><path d="M8 7l4-3 4 3" /></>,
  avocado: <><path d="M12 3c3.2 3.2 6.5 7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10 8.8 6.2 12 3z" /><circle cx="12" cy="14.2" r="2.8" /></>,
};

let toastSeq = 0;

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="mrd mrd-toast" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`mrd-toast-item ${t.tone === "error" ? "err" : ""}`}>
          <span className="mrd-toast-dot"></span>
          <p>{t.message}</p>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="mrd-toast-x">
            <Icon d={ICONS.x} className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AccountPage() {
  const { user, logout, checkAuth } = useAuth();
  const { theme, setTheme } = useTheme();

  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const lockRef = useRef(null);

  /* ------------------------- Body profile ------------------------- */
  const [profileForm, setProfileForm] = useState(null); // null = display mode
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [weightInfo, setWeightInfo] = useState({ entries: [], targetWeight: 75 });
  const [weightTick, setWeightTick] = useState(0);
  const [weightError, setWeightError] = useState("");

  /* --------------------------- Goals ------------------------------ */
  const [goalForm, setGoalForm] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState("");

  /* -------------------------- Password ---------------------------- */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  const pushToast = (message, tone = "success", ttl = 4000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Weight entries + target weight (prefills the profile form and the
  // "current weight" display; refreshed after a profile save).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/weight")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled && data) {
          setWeightInfo({ entries: data.weightEntries || [], targetWeight: data.targetWeight || 75 });
          setWeightError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setWeightError(err?.message || "Network error");
      });
    return () => {
      cancelled = true;
    };
  }, [user, weightTick]);

  // A rail click takes responsibility for the highlight, then shows the section
  // the reader asked for — even on a page too short to scroll a section up to
  // the reading line. The reader's own scrolling hands control back to the spy.
  // The scroll is explicit rather than left to the browser's fragment jump:
  // the hash update and the motion stay in sync, and the target is clamped so
  // the last section still lands as far up as the page can scroll.
  const pickSection = (id) => {
    lockRef.current = id;
    setActiveSection(id);
  };

  const jumpToSection = (event, id) => {
    const el = document.getElementById(id);
    if (!el) return; // let the browser handle a fragment this page does not own
    event.preventDefault();
    pickSection(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The first section sits under the page title, so its jump goes to the very
    // top of the page rather than cutting the title block in half.
    const isFirst = id === SECTIONS[0].id;
    window.scrollTo({
      top: isFirst
        ? 0
        : Math.max(
            0,
            Math.min(
              el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
              document.documentElement.scrollHeight - window.innerHeight
            )
          ),
      behavior: reduceMotion ? "auto" : "smooth",
    });
    history.pushState(null, "", `#${id}`);
  };

  // Section rail scroll-spy: the last section whose heading has crossed the
  // reading line is the one being read, and the end of the page hands the
  // highlight to the final section.
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);

    const onScroll = () => {
      // A rail click owns the highlight until the reader scrolls themselves.
      if (lockRef.current) return;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= READ_LINE) current = id;
      }
      // The end of the page is a position of its own: the last section keeps the
      // highlight even on a page too short to lift it up to the reading line.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) current = ids[ids.length - 1];
      setActiveSection(current);
    };
    const release = () => {
      lockRef.current = null;
    };

    // First pass runs after layout settles — deferred rather than synchronous so
    // it never cascades a render out of the effect body.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", release, { passive: true });
      window.removeEventListener("touchmove", release, { passive: true });
      window.removeEventListener("keydown", release);
    };
  }, []);

  // Deep links that arrive with a hash (the old /dashboard/settings#anchors are
  // redirected here) race hydration, so honour the fragment once mounted.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(raf);
  }, []);

  // Live suggestion from the *saved* body profile. This is the only place the
  // account offers suggested targets; applying it fills the goals editor, and
  // the goals save is the single writer of macroGoals.
  const savedSuggestion = useMemo(() => {
    const p = user?.profile;
    if (!p) return null;
    const entries = weightInfo.entries;
    const latest = entries.length > 0 ? entries[entries.length - 1] : null;
    return suggestMacroGoals({
      sex: p.sex,
      weightKg: latest?.weight,
      heightCm: p.heightCm,
      age: p.age,
      activityLevel: p.activityLevel,
      goal: p.goal,
    });
  }, [user?.profile, weightInfo.entries]);

  // Live suggestion — the exact same pure function the API recomputes.
  // Null while not editing (profileForm is null) or inputs incomplete.
  const profileSuggestion = useMemo(
    () =>
      suggestMacroGoals({
        sex: profileForm?.sex,
        weightKg: parseFloat(profileForm?.currentWeightKg),
        heightCm: parseFloat(profileForm?.heightCm),
        age: parseInt(profileForm?.age, 10),
        activityLevel: profileForm?.activityLevel,
        goal: profileForm?.goal,
      }),
    [profileForm]
  );

  const getLatestEntry = () => {
    const entries = weightInfo.entries;
    return entries.length > 0 ? entries[entries.length - 1] : null;
  };

  if (!user) {
    return null;
  }

  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;
  const latestEntry = getLatestEntry();
  const profile = user.profile || null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NG";

  const profileTiles = [
    { label: "Sex", value: profile?.sex ? SEX_LABEL[profile.sex] : null },
    { label: "Age", value: profile?.age ? `${profile.age} yrs` : null },
    { label: "Height", value: profile?.heightCm ? `${profile.heightCm} cm` : null },
    { label: "Activity", value: profile?.activityLevel ? ACTIVITY_LABEL[profile.activityLevel] : null },
    { label: "Goal", value: profile?.goal ? GOAL_LABEL[profile.goal] : null },
  ];

  const suggestionMatchesGoals =
    savedSuggestion &&
    ["calories", "protein", "carbs", "fats"].every(
      (key) => Number(goals[key]) === Number(savedSuggestion[key])
    );

  /* ---------------- Body profile: edit + TDEE suggestion ---------------- */

  const startEditProfile = () => {
    setProfileForm({
      sex: profile?.sex || "",
      age: profile?.age ?? "",
      heightCm: profile?.heightCm ?? "",
      currentWeightKg: latestEntry ? String(latestEntry.weight) : "",
      targetWeightKg: weightInfo.targetWeight ? String(weightInfo.targetWeight) : "",
      activityLevel: profile?.activityLevel || "",
      goal: profile?.goal || "",
    });
    setProfileMessage("");
  };

  // "Log weight" is the empty state's action, so it opens the same body form
  // with the reading field already in hand rather than making the reader hunt
  // for it in a generic Edit.
  const startEditWeight = () => {
    startEditProfile();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById("prf-weight");
        el?.focus();
        el?.select?.();
      })
    );
  };

  const cancelEditProfile = () => {
    setProfileForm(null);
    setProfileMessage("");
  };

  const setProfileField = (key) => (value) => setProfileForm((prev) => ({ ...prev, [key]: value }));

  const profileReady = Boolean(profileSuggestion) && profileForm?.activityLevel && profileForm?.goal;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const payload = {
        action: "apply",
        sex: profileForm.sex,
        age: parseInt(profileForm.age, 10),
        heightCm: parseFloat(profileForm.heightCm),
        currentWeightKg: profileForm.currentWeightKg ? parseFloat(profileForm.currentWeightKg) : undefined,
        targetWeight: profileForm.targetWeightKg ? parseFloat(profileForm.targetWeightKg) : undefined,
        activityLevel: profileForm.activityLevel,
        goal: profileForm.goal,
        // Sending the current goals keeps the server from applying its
        // suggestion behind the user's back — Daily goals is the only writer.
        macroGoals: goals,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        setProfileForm(null);
        setWeightTick((n) => n + 1); // today's weight entry may have been upserted
        pushToast("Profile saved — your daily goals were left unchanged.");
      } else {
        setProfileMessage(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileMessage("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  /* --------------------------- Daily goals ------------------------------ */

  const goalFields = [
    { field: "calories", label: "Calories", unit: "kcal", icon: "flame", dot: "var(--ac)" },
    { field: "protein", label: "Protein", unit: "g", icon: "drumstick", dot: "var(--pro)" },
    { field: "carbs", label: "Carbs", unit: "g", icon: "wheat", dot: "var(--car)" },
    { field: "fats", label: "Fats", unit: "g", icon: "avocado", dot: "var(--green)" },
  ];
  const macroFields = goalFields.filter((f) => f.field !== "calories");

  /* Goals as they read right now — the saved values, or the draft while
     editing — plus their energy share, which is derived and never stored:
     protein and carbs carry 4 kcal a gram, fat 9. That lets the page check the
     macros against the calorie goal instead of presenting four equal peers. */
  const liveGoals = editingGoals ? { ...goals, ...(goalForm || {}) } : goals;
  const goalValue = (key) => Number(liveGoals?.[key]) || 0;
  const macroEnergy = {
    protein: goalValue("protein") * 4,
    carbs: goalValue("carbs") * 4,
    fats: goalValue("fats") * 9,
  };
  const macroKcal = macroEnergy.protein + macroEnergy.carbs + macroEnergy.fats;
  const sharePercent = (key) => (macroKcal > 0 ? (macroEnergy[key] / macroKcal) * 100 : 0);
  const calorieGoal = goalValue("calories");
  const energyDelta = macroKcal - calorieGoal;
  /* A couple of kcal off is rounding, not a mistake — only call out a real gap. */
  const energyTolerance = Math.max(25, Math.round(calorieGoal * 0.02));
  const energyNote = !macroKcal || !calorieGoal
    ? ""
    : Math.abs(energyDelta) <= energyTolerance
      ? " · in line with your target"
      : ` · ${Math.abs(energyDelta).toLocaleString()} ${energyDelta > 0 ? "over" : "under"} your ${calorieGoal.toLocaleString()} target`;
  const goalsDirty =
    editingGoals &&
    goalFields.some(({ field }) => goalValue(field) !== (Number(goals?.[field]) || 0));

  const handleGoalChange = (field, value) => {
    setGoalForm((prev) => ({ ...(prev || goals), [field]: value }));
  };

  const startEditGoals = () => {
    setGoalForm(goals);
    setGoalsMessage("");
    setEditingGoals(true);
  };

  const cancelEditGoals = () => {
    setGoalForm(null);
    setGoalsMessage("");
    setEditingGoals(false);
  };

  const applySuggestion = () => {
    if (!savedSuggestion) return;
    setGoalForm({
      calories: savedSuggestion.calories,
      protein: savedSuggestion.protein,
      carbs: savedSuggestion.carbs,
      fats: savedSuggestion.fats,
    });
    setGoalsMessage("");
    setEditingGoals(true);
    requestAnimationFrame(() => document.getElementById("goal-calories")?.focus());
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    setGoalsMessage("");
    try {
      const current = goalForm || goals;
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ macroGoals: current }),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        setGoalForm(null);
        setEditingGoals(false);
        pushToast("Daily goals saved — your meal dashboard meters are updated.");
      } else {
        setGoalsMessage(data.error || "Failed to save goals");
      }
    } catch (error) {
      console.error("Error saving macro goals:", error);
      setGoalsMessage("Network error. Please try again.");
    } finally {
      setSavingGoals(false);
    }
  };

  /* --------------------------- Password ------------------------------ */

  const pwLengthOk = pwForm.next.length >= 6;

  /* The two rules the browser can check before the server sees them. Each one
     is annotated in the margin beside the field it governs rather than listed
     under the whole form, so the feedback sits where the typing happens. */
  const pwNoteFor = (key) => {
    if (key === "next") {
      return pwLengthOk
        ? { text: "Long enough", state: "ok" }
        : { text: "6 characters or more", state: "" };
    }
    if (key === "confirm") {
      if (!pwForm.confirm) return { text: "Repeat it exactly", state: "" };
      return pwForm.next === pwForm.confirm
        ? { text: "Fields match", state: "ok" }
        : { text: "Doesn't match yet", state: "bad" };
    }
    return null;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage("");
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage("New passwords don't match.");
      return;
    }
    if (pwForm.next.length < 6 || pwForm.next.length > 128) {
      setPwMessage("New password must be between 6 and 128 characters.");
      return;
    }
    if (pwForm.next === pwForm.current) {
      setPwMessage("New password must be different from your current password.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMessage(data.error || "Couldn't change your password. Try again.");
        return;
      }
      setPwForm({ current: "", next: "", confirm: "" });
      pushToast("Password changed. Other devices have been signed out.");
    } catch {
      setPwMessage("Couldn't change your password. Check your connection and retry.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <style>{ACCOUNT_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — same title block as the rest of the app */}
          <div className="m-in" style={{ marginBottom: 28 }}>
            <p className="g-eyebrow" style={{ margin: "0 0 8px" }}>Account · Profile &amp; settings</p>
            <h1 className="m-h1" style={{ margin: 0 }}>Account</h1>
            <div className="m-sub">Your identity, training split, goals, and security in one place.</div>
          </div>

          <div className="acc-layout">
            {/* Section rail — the page's own map, sticky while you read. */}
            <nav className="acc-rail" aria-label="Account sections">
              <p className="acc-rail-lbl">On this page</p>
              <ul className="acc-rail-list">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => jumpToSection(e, s.id)}
                      className={"acc-rail-link" + (activeSection === s.id ? " on" : "")}
                      aria-current={activeSection === s.id ? "true" : undefined}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="acc-body">
              {/* Profile */}
              <section id="acc-profile" className="acc-sec" aria-labelledby="acc-profile-h">
                <span id="stg-account" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-profile-h">Profile</h2>
                    <p className="acc-sec-sub">The measurements your daily targets are calculated from.</p>
                  </div>
                </div>

                <div className="m-card acc-dossier">
                  {/* Identity masthead — who the sheet belongs to. The calorie
                      target lives in Daily goals, not here. */}
                  <div className="acc-dossier-id">
                    <div className="acc-avatar" aria-hidden="true">{initials}</div>
                    <div className="acc-idtext">
                      <p className="acc-name">{user.name}</p>
                      <p className="acc-email">{user.email}</p>
                    </div>
                    <div className="acc-idact">
                      {profileForm ? (
                        <span className="m-chip">Editing</span>
                      ) : (
                        <button
                          onClick={startEditProfile}
                          className="m-btn m-btn-ghost"
                          style={{ padding: "5px 10px", fontSize: "var(--acc-small)", gap: 6 }}
                        >
                          <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                          Edit body details
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="acc-dossier-b">
                    {profileForm ? (
                      <div className="acc-card-b">
                        <>
                          <div className="acc-form-grid">
                            <div>
                              <label htmlFor="prf-sex" className="m-lbl">Sex</label>
                              <select id="prf-sex" className="m-field" style={{ width: "100%" }} value={profileForm.sex} onChange={(e) => setProfileField("sex")(e.target.value)}>
                                <option value="">Select…</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other / prefer not to say</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="prf-age" className="m-lbl">Age</label>
                              <input id="prf-age" type="number" inputMode="numeric" min="13" max="100" className="m-field m-num" style={{ width: "100%" }} placeholder="24" value={profileForm.age} onChange={(e) => setProfileField("age")(e.target.value)} />
                            </div>
                            <div>
                              <label htmlFor="prf-height" className="m-lbl">Height (cm)</label>
                              <input id="prf-height" type="number" inputMode="decimal" min="100" max="250" step="0.5" className="m-field m-num" style={{ width: "100%" }} placeholder="175" value={profileForm.heightCm} onChange={(e) => setProfileField("heightCm")(e.target.value)} />
                            </div>
                            <div>
                              <label htmlFor="prf-weight" className="m-lbl">Current weight (kg)</label>
                              <input id="prf-weight" type="number" inputMode="decimal" min="20" max="400" step="0.1" className="m-field m-num" style={{ width: "100%" }} placeholder="72.5" value={profileForm.currentWeightKg} onChange={(e) => setProfileField("currentWeightKg")(e.target.value)} />
                            </div>
                            <div>
                              <label htmlFor="prf-target" className="m-lbl">Target weight (kg) · optional</label>
                              <input id="prf-target" type="number" inputMode="decimal" min="20" max="400" step="0.1" className="m-field m-num" style={{ width: "100%" }} placeholder="78" value={profileForm.targetWeightKg} onChange={(e) => setProfileField("targetWeightKg")(e.target.value)} />
                            </div>
                            <div>
                              <label htmlFor="prf-goal" className="m-lbl">Goal</label>
                              <select id="prf-goal" className="m-field" style={{ width: "100%" }} value={profileForm.goal} onChange={(e) => setProfileField("goal")(e.target.value)}>
                                <option value="">Select…</option>
                                {GOALS.map((goal) => (
                                  <option key={goal.value} value={goal.value}>{goal.label} — {goal.hint}</option>
                                ))}
                              </select>
                            </div>
                            <div className="acc-field-wide">
                              <label htmlFor="prf-activity" className="m-lbl">Activity level</label>
                              <select id="prf-activity" className="m-field" style={{ width: "100%" }} value={profileForm.activityLevel} onChange={(e) => setProfileField("activityLevel")(e.target.value)}>
                                <option value="">Select…</option>
                                {ACTIVITY_LEVELS.map((level) => (
                                  <option key={level.value} value={level.value}>{level.label} — {level.hint}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {profileSuggestion && (
                            <div className="acc-suggest" aria-live="polite">
                              <div className="acc-suggest-stat"><b>{profileSuggestion.calories.toLocaleString()}</b><span>kcal / day</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.protein} g</b><span>protein</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.carbs} g</b><span>carbs</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.fats} g</b><span>fats</span></div>
                              <p className="acc-suggest-note">
                                Suggested from Mifflin-St Jeor (BMR {profileSuggestion.bmr.toLocaleString()} kcal · TDEE{" "}
                                {profileSuggestion.tdee.toLocaleString()} kcal). Saving your body profile keeps your current
                                goals; apply this suggestion from Daily goals.
                              </p>
                            </div>
                          )}

                          {profileMessage && (
                            <p style={{ marginTop: 12, fontSize: "var(--acc-small)", fontWeight: 500, color: "var(--red)" }}>{profileMessage}</p>
                          )}

                          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
                            <button onClick={cancelEditProfile} disabled={savingProfile} className="m-btn m-btn-ghost">
                              Cancel
                            </button>
                            <button onClick={handleSaveProfile} disabled={savingProfile || !profileReady} className="m-btn m-btn-primary" title={!profileReady ? "Fill in all fields (weight included) to save" : undefined}>
                              <Icon d={ICONS.check} className="w-4 h-4" />
                              {savingProfile ? "Saving…" : "Save profile"}
                            </button>
                          </div>
                          {!profileReady && (
                            <p className="m-crumb" style={{ marginTop: 10 }}>
                              Complete every field — including current weight — to save. Weight also seeds today&apos;s
                              entry on the Progress weight chart.
                            </p>
                          )}
                        </>
                      </div>
                    ) : (
                      <>
                        {/* Five boxes, one per measurement — the training week's
                            cell language, so each value can be scanned alone. */}
                        <div className="acc-facts">
                          {profileTiles.map((tile) => (
                            <div key={tile.label} className="acc-fact">
                              <span className="acc-k">{tile.label}</span>
                              <p className={"acc-fact-v" + (tile.value ? "" : " none")}>
                                {tile.value || "Not set"}
                              </p>
                            </div>
                          ))}
                        </div>                        {/* Weight, in the same cells: reading, target, the
                            date it was logged, and the one action. */}
                        <div className="acc-facts acc-facts-w">
                          <div className="acc-fact acc-fact-wide">
                            <span className="acc-k">Weight</span>
                            <p className={"acc-fact-v" + (latestEntry ? "" : " none")}>
                              {latestEntry ? latestEntry.weight : "—"}
                              <small>kg</small>
                            </p>
                          </div>
                          <div className="acc-fact">
                            <span className="acc-k">Target</span>
                            <p className="acc-fact-v quiet">{weightInfo.targetWeight}<small>kg</small></p>
                          </div>
                          <div className="acc-fact">
                            <span className="acc-k">Logged</span>
                            <p className="acc-fact-v quiet">
                              {latestEntry
                                ? new Date(latestEntry.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })
                                : weightError
                                ? "Unavailable"
                                : "Never"}
                            </p>
                          </div>
                          <div className="acc-fact acc-fact-act">
                            <button
                              type="button"
                              onClick={startEditWeight}
                              className="m-btn m-btn-ghost"
                            >
                              <Icon d={ICONS.scale} className="w-3.5 h-3.5" />
                              Log weight
                            </button>
                          </div>
                        </div>

                        {weightError ? (
                          <p className="acc-weight-err" role="alert">
                            Weight data unavailable — {weightError}.{" "}
                            <button type="button" onClick={() => setWeightTick((n) => n + 1)}>Try again</button>
                          </p>
                        ) : !latestEntry ? (
                          <p className="acc-dossier-fine">
                            Saving your body profile also records today&apos;s weight. Log it now to start the chart.
                          </p>
                        ) : null}

                        {!profile && (
                          <p className="acc-dossier-fine">
                            You skipped setup — add your body details to unlock TDEE-based goal suggestions.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Training split — the manager renders its own section heading
                  ("acc-training-h"), so this wrapper only supplies the anchor
                  and the shared section rhythm. */}
              <section id="acc-training" className="acc-sec" aria-labelledby="acc-training-h">
                <SplitManager pushToast={pushToast} />
              </section>

              {/* Daily goals */}
              <section id="acc-goals" className="acc-sec" aria-labelledby="acc-goals-h">
                <span id="stg-goals" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-goals-h">Daily goals</h2>
                    <p className="acc-sec-sub">The targets every meter measures against — on Today, Meal, and Progress.</p>
                  </div>
                  <div className="acc-sec-acts">
                    {editingGoals ? (
                      <>
                        <button type="button" onClick={cancelEditGoals} disabled={savingGoals} className="m-btn acc-btn">
                          Cancel
                        </button>
                        <button type="button" onClick={handleSaveGoals} disabled={savingGoals} className="m-btn m-btn-primary">
                          <Icon d={ICONS.check} className="w-4 h-4" />
                          {savingGoals ? "Saving…" : "Save goals"}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={startEditGoals} className="m-btn acc-btn">
                        <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {savedSuggestion && !suggestionMatchesGoals && !editingGoals && (
                  <div className="acc-tip">
                    <p>
                      From your body profile: <b>{savedSuggestion.calories.toLocaleString()} kcal</b>,{" "}
                      <b>{savedSuggestion.protein} g</b> protein, <b>{savedSuggestion.carbs} g</b> carbs,{" "}
                      <b>{savedSuggestion.fats} g</b> fat
                    </p>
                    <button type="button" onClick={applySuggestion} className="m-btn acc-btn">
                      Review
                    </button>
                  </div>
                )}

                <div className="m-card acc-goals">
                  <div className="acc-energy">
                    {editingGoals ? (
                      <label htmlFor="goal-calories" className="acc-energy-k">Calorie goal</label>
                    ) : (
                      <span className="acc-energy-k">Calorie goal</span>
                    )}
                    {editingGoals ? (
                      <div className="acc-energy-in">
                        <input
                          id="goal-calories"
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          value={(goalForm || goals).calories ?? ""}
                          onChange={(e) => handleGoalChange("calories", e.target.value)}
                          className="acc-num"
                        />
                        <span className="acc-energy-u">kcal / day</span>
                      </div>
                    ) : (
                      <p className="acc-energy-v">
                        {Number(goals.calories).toLocaleString()}
                        <small>kcal / day</small>
                      </p>
                    )}
                  </div>

                  <div className="acc-macros">
                    <div className="acc-macros-h">
                      <span className="acc-eyebrow">Macro goals</span>
                      <span className="acc-eyebrow">Share</span>
                    </div>
                    {macroFields.map((item) => (
                      <div key={item.field} className="acc-macro">
                        <span className="acc-macro-k">
                          <i style={{ background: item.dot }} aria-hidden="true" />
                          {item.label}
                        </span>
                        {editingGoals ? (
                          <div className="acc-macro-in">
                            <input
                              id={`goal-${item.field}`}
                              type="number"
                              min="1"
                              max="10000"
                              step="1"
                              value={(goalForm || goals)[item.field] ?? ""}
                              onChange={(e) => handleGoalChange(item.field, e.target.value)}
                              aria-label={`${item.label} in grams`}
                            />
                            <span>g</span>
                          </div>
                        ) : (
                          <p className="acc-macro-v">
                            {Number(goals[item.field]).toLocaleString()}
                            <small>g</small>
                          </p>
                        )}
                        <span className="acc-pct">{Math.round(sharePercent(item.field))}%</span>
                      </div>
                    ))}

                    {macroKcal > 0 ? (
                      <>
                        <div className="acc-share" aria-hidden="true">
                          {macroFields.map((item) => (
                            <i
                              key={item.field}
                              style={{ width: `${sharePercent(item.field)}%`, background: item.dot }}
                            />
                          ))}
                        </div>
                        <p className="acc-share-note">
                          {macroKcal.toLocaleString()} kcal from macros{energyNote}
                        </p>
                      </>
                    ) : (
                      <p className="acc-share-note">No macro targets set.</p>
                    )}
                  </div>
                </div>

                {goalsMessage ? (
                  <p className="acc-status err" role="alert">{goalsMessage}</p>
                ) : editingGoals && goalsDirty ? (
                  <p className="acc-status">Unsaved changes — save to update every meter.</p>
                ) : null}
              </section>

              {/* Appearance */}
              <section id="acc-appearance" className="acc-sec" aria-labelledby="acc-appearance-h">
                <span id="stg-appearance" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-appearance-h">Appearance</h2>
                    <p className="acc-sec-sub">Light or dark, on every device you sign in on.</p>
                  </div>
                  <div className="acc-sec-acts">
                    <div className="acc-seg" role="radiogroup" aria-label="Color theme">
                      <button type="button" role="radio" aria-checked={theme === "light"} className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>
                        Light
                      </button>
                      <button type="button" role="radio" aria-checked={theme === "dark"} className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security */}
              <section id="acc-security" className="acc-sec" aria-labelledby="acc-security-h">
                <span id="stg-password" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-security-h">Security</h2>
                    <p className="acc-sec-sub">Password and session for this account.</p>
                  </div>
                </div>

                <div className="m-card acc-sheet">
                  <div className="acc-creds">
                    <div className="acc-creds-h">
                      <h3>Password</h3>
                      <p className="acc-creds-note">
                        Changing it signs out every other device you&apos;re signed in on.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordChange}>
                      <div className="acc-led">
                        {[
                          { key: "current", label: "Current", name: "Current password", autoComplete: "current-password", placeholder: "Enter your current password" },
                          { key: "next", label: "New", name: "New password", autoComplete: "new-password", placeholder: "Choose a new password" },
                          { key: "confirm", label: "Repeat", name: "Confirm new password", autoComplete: "new-password", placeholder: "Repeat the new password" },
                        ].map(({ key, label, name, autoComplete, placeholder }) => {
                          const note = pwNoteFor(key);
                          return (
                            <div key={key} className="acc-led-row">
                              <label htmlFor={`pw-${key}`} className="acc-led-k">{label}</label>
                              <div className="acc-led-in">
                                <input
                                  id={`pw-${key}`}
                                  type={pwShow[key] ? "text" : "password"}
                                  autoComplete={autoComplete}
                                  placeholder={placeholder}
                                  value={pwForm[key]}
                                  onChange={(e) => {
                                    setPwForm((prev) => ({ ...prev, [key]: e.target.value }));
                                    if (pwMessage) setPwMessage("");
                                  }}
                                  aria-label={name}
                                  aria-describedby={note ? `pw-note-${key}` : undefined}
                                  required
                                  minLength={key === "current" ? undefined : 6}
                                  maxLength={128}
                                />
                                <button
                                  type="button"
                                  onClick={() => setPwShow((prev) => ({ ...prev, [key]: !prev[key] }))}
                                  aria-label={pwShow[key] ? `Hide ${name.toLowerCase()}` : `Show ${name.toLowerCase()}`}
                                  aria-pressed={pwShow[key]}
                                  className="acc-led-show"
                                >
                                  {pwShow[key] ? "Hide" : "Show"}
                                </button>
                              </div>
                              {note ? (
                                <p id={`pw-note-${key}`} className={"acc-led-note" + (note.state ? ` ${note.state}` : "")}>
                                  {note.text}
                                </p>
                              ) : (
                                <span aria-hidden="true" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="acc-creds-foot">
                        {pwMessage && <p className="acc-err" role="alert">{pwMessage}</p>}
                        <button type="submit" disabled={savingPw} className="m-btn m-btn-primary">
                          {savingPw ? "Updating…" : "Update password"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <span id="stg-session" className="acc-anchor" aria-hidden="true" />
                  <div className="acc-session">
                    <p className="acc-session-k">This browser</p>
                    <p className="acc-session-state"><i aria-hidden="true" /> Signed in</p>
                    <p className="acc-session-note">
                      Signing out ends this browser&apos;s session. Your logs stay on your account.
                    </p>
                    <button id="account-logout-btn" type="button" onClick={logout} className="m-btn acc-btn-danger">
                      <Icon d={ICONS.logout} />
                      Sign out
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
