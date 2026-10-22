"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import { expandMuscleGroups } from "@/lib/muscle-groups";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as app/dashboard/meal.        */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.gym{color:var(--t1)}
.gym{background:var(--paper)}
/* Theme-aware chart + heatmap chrome (overrides SVG presentation attrs) */
.gym .recharts-cartesian-grid line{stroke:var(--track)!important}
.gym .recharts-dot{fill:var(--card)!important}
.gym .recharts-line-curve{stroke:var(--ac)}
.gym .recharts-cartesian-axis-tick text{fill:var(--t3)}
.gym .m-btn-ghost{border:1px solid var(--line);color:var(--t1);background:var(--card)}
.gym .m-btn-ghost:hover{background:var(--sunken)}
.gym .m-sep{height:1px;background:var(--line)}
.gym-toast{position:fixed;bottom:24px;right:24px;z-index:var(--pop-z-toast, 80);display:flex;flex-direction:column;gap:10px;width:calc(100% - 48px);max-width:380px}
.gym-toast-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:var(--ng-r-md,12px);border:1px solid var(--line);background:color-mix(in srgb, var(--card) 88%, transparent);-webkit-backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));box-shadow:var(--ng-shadow-2,0 2px 2px rgba(0,0,0,.04),0 8px 16px -4px rgba(0,0,0,.08))}
.gym-toast-item.err{background:color-mix(in srgb, var(--red-soft) 88%, transparent);border-color:var(--red-soft-b)}
.gym-toast-item p{font-size:13px;color:var(--t1);flex:1;line-height:1.45}
.gym-toast-item.err p{color:var(--red)}
.gym-toast-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex-shrink:0}
.gym-toast-item.err .gym-toast-dot{background:var(--red)}
.gym-toast-x{flex-shrink:0;position:relative;color:var(--t3);background:none;border:0;cursor:pointer;padding:4px;border-radius:6px}
.gym-toast-x::after{content:"";position:absolute;inset:-6px}
.gym-toast-x:hover{color:var(--t1);background:var(--sunken)}
.gym .rt-cell{display:flex;flex-direction:column;gap:2px;padding:8px 12px;border-radius:var(--ng-r-sm,6px);font-size:13px;border:1px solid transparent}
.gym .rt-cell:hover{background:var(--paper)}
/* Status — Whisper-styled segmented switcher: all options visible, active
   filled in ink. Full-width row on mobile, quiet right-aligned on desktop. */
.gym .status-seg{display:inline-flex;border:1px solid var(--line);border-radius:var(--ng-r-sm,6px);background:var(--card);padding:3px;gap:2px}
.gym .status-seg button{appearance:none;border:0;background:transparent;font-family:var(--font-mono);color:var(--t3);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;padding:8px 12px;border-radius:var(--ng-r-sm,6px);cursor:pointer;transition:.15s;white-space:nowrap}
.gym .status-seg button:hover{color:var(--t1);background:var(--sunken)}
.gym .status-seg button[aria-pressed="true"]{background:var(--t1);color:var(--card)}
@media (max-width:640px){.gym .status-wrap{width:100%}.gym .status-seg{display:flex;width:100%}.gym .status-seg button{flex:1;padding:11px 4px;text-align:center}}
.gym .m-card{min-width:0}
`;

/* Gym-page chrome, loaded after Meridian: the inline dataset-failure notice
   (matching the stats page) and the session/record layout below. */
const GYM_CSS = `
.gym .st-notice{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid var(--red-soft-b);background:var(--red-soft);border-radius:var(--ng-r-sm,6px);font-size:12px;font-weight:400;color:var(--red);margin-bottom:12px}
.gym .st-notice button{flex-shrink:0;background:var(--red);color:#fff;border:0;border-radius:var(--ng-r-sm,6px);font-size:12px;font-weight:500;padding:5px 10px;cursor:pointer}
.gym .st-notice button:hover{filter:brightness(1.08)}
/* ==========================================================================
   Session — training first. The board is the page; the plan follows.
   Masthead over a full-width session ledger, one exercise open at a time.
   ========================================================================== */
.gym .gy-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px 40px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--t1)}
.gym .gy-head-main{min-width:0}
.gym .gy-kicker{font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.gym .gy-title{margin:0;font-size:clamp(28px,3.4vw,38px);font-weight:600;letter-spacing:-.035em;line-height:1.05;color:var(--t1)}
.gym .gy-dek{margin:10px 0 0;font-size:13px;color:var(--t2);font-variant-numeric:tabular-nums}
.gym .gy-head-tools{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:14px;align-self:stretch}
.gym .gy-split-link{font-size:12px;font-weight:500;color:var(--t2);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:1px;white-space:nowrap}
.gym .gy-split-link:hover{color:var(--t1);border-color:var(--t1)}
.gym .gy-split-link:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.gym .gy-daynav{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:var(--ng-r-sm,6px);background:var(--card);padding:3px}
.gym .gy-daynav > button{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;background:none;color:var(--t2);border-radius:var(--ng-r-sm,6px);cursor:pointer}
.gym .gy-daynav > button:hover:not(:disabled){background:var(--sunken);color:var(--t1)}
.gym .gy-daynav > button:disabled{opacity:.35;cursor:default}
.gym .gy-daynav > button:focus-visible{outline:2px solid var(--t1);outline-offset:1px}
.gym .gy-daynav-date{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.04em;color:var(--t1);padding:0 10px;min-width:76px;text-align:center;white-space:nowrap}
.gym .gy-daynav .gy-today{width:auto;padding:0 9px;font:inherit;font-size:11px;font-weight:600;color:var(--link)}
.gym .gy-session{margin-top:26px}
.gym .gy-session-h{display:flex;align-items:flex-end;justify-content:space-between;gap:14px 28px;flex-wrap:wrap;padding-bottom:14px}
.gym .gy-session-meta{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.gym .gy-label{font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin:0}
.gym .gy-progress{font-size:12.5px;color:var(--t2);font-variant-numeric:tabular-nums}
.gym .gy-progress b{color:var(--t1);font-weight:600}
.gym .gy-board{border-top:1px solid var(--t1)}
.gym .gy-group-h{display:flex;align-items:center;gap:12px;padding:22px 0 8px}
.gym .gy-group-name{display:inline-flex;align-items:baseline;gap:12px;font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t1)}
.gym .gy-group-name .gy-no{font-size:10px;color:var(--t3)}
.gym .gy-group-count{font-family:var(--font-mono);font-size:10px;color:var(--t3);font-variant-numeric:tabular-nums}
.gym .gy-rule{flex:1;height:1px;background:var(--line)}
.gym .gy-rows{list-style:none;margin:0;padding:0}
.gym .gy-row{border-bottom:1px solid var(--line)}
.gym .gy-row.is-open{background:var(--sunken)}
.gym .gy-row-h{display:flex;align-items:center;gap:14px;width:100%;padding:14px 6px;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer;transition:background .15s ease}
.gym .gy-row-h:hover{background:var(--sunken)}
.gym .gy-row-h:focus-visible{outline:2px solid var(--t1);outline-offset:-2px}
.gym .gy-no{flex:0 0 30px;font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.06em;color:var(--t3);font-variant-numeric:tabular-nums}
.gym .gy-row-main{flex:1;min-width:0}
.gym .gy-row-name{display:block;font-size:17px;font-weight:600;letter-spacing:-.02em;color:var(--t1);line-height:1.3}
.gym .gy-row-meta{display:block;margin-top:3px;font-size:12px;color:var(--t3);font-variant-numeric:tabular-nums}
.gym .gy-row-state{flex:none;font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);white-space:nowrap}
.gym .gy-row.is-logged .gy-row-state{color:var(--t2)}
.gym .gy-row-state.is-pr{color:var(--t1);border-bottom:1px solid var(--t1)}
.gym .gy-caret{flex:none;display:inline-flex;color:var(--t3);transition:transform .2s ease}
.gym .gy-row.is-open .gy-caret{transform:rotate(180deg);color:var(--t1)}
.gym .gy-panel{padding:14px 18px 16px 44px;border-top:1px solid var(--line);animation:gy-in .22s ease}
@keyframes gy-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
/* Workbench: reference facts in a narrow rail, logging in the main column. */
.gym .gy-workbench{display:grid;grid-template-columns:236px minmax(0,1fr);gap:0 24px;max-width:820px}
.gym .gy-aside{display:flex;flex-direction:column;gap:16px;min-width:0;padding:2px 22px 2px 0;border-right:1px solid var(--line)}
.gym .gy-aside-block{display:flex;flex-direction:column;gap:3px;min-width:0}
.gym .gy-aside .gy-input{width:76px}
.gym .gy-aside .gy-input[type="date"]{width:118px}
.gym .gy-meta-sub{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.04em;color:var(--t3)}
.gym .gy-prlink{margin-top:auto;display:inline-flex;align-items:center;gap:7px;width:fit-content;padding:8px 0 0;border:0;background:none;color:var(--t2);font:inherit;font-size:12.5px;font-weight:500;cursor:pointer}
.gym .gy-prlink:hover{color:var(--t1)}
.gym .gy-prlink:focus-visible{outline:2px solid var(--link);outline-offset:2px;border-radius:2px}
.gym .gy-main{display:flex;flex-direction:column;min-width:0}
.gym .gy-spec-lbl{display:inline-flex;align-items:center;gap:6px}
.gym .gy-spec-val{margin:0;font-size:14px;font-weight:600;letter-spacing:-.01em;line-height:1.5;color:var(--t1);font-variant-numeric:tabular-nums}
.gym .gy-spec-sub{margin-left:8px;font-family:var(--font-mono);font-size:10.5px;font-weight:500;color:var(--t3)}
.gym .gy-edit{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:0;background:none;border-radius:5px;color:var(--t3);cursor:pointer;flex:none}
.gym .gy-edit:hover{color:var(--t1);background:var(--card)}
.gym .gy-edit:focus-visible{outline:2px solid var(--link);outline-offset:1px}
.gym .gy-wu-edit,.gym .gy-pr-edit{display:grid;gap:6px;min-width:0}
.gym .gy-pr-edit{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.gym .gy-wu-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gym .gy-edit-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}
.gym .gy-setblock{max-width:none}
.gym .gy-setblock-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-bottom:8px}
.gym .gy-hint{font-family:var(--font-mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
/* Sets are a small aligned table: set no. / load / reps / computed volume. */
.gym .gy-sets{display:grid}
.gym .gy-setrow{display:grid;grid-template-columns:30px minmax(0,1fr) minmax(0,1fr) 84px 28px;align-items:center;gap:10px;padding:4px 0;min-width:0}
.gym .gy-setrow-head{padding:0 0 7px;border-bottom:1px solid var(--line)}
.gym .gy-setrow-head span{font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3)}
.gym .gy-setrow-head span:nth-child(4){text-align:right}
.gym .gy-setno{font-family:var(--font-mono);font-size:10.5px;color:var(--t3);font-variant-numeric:tabular-nums}
.gym .gy-setrow .gy-input{width:100%}
.gym .gy-setvol{text-align:right;font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.03em;color:var(--faint);font-variant-numeric:tabular-nums;white-space:nowrap}
.gym .gy-setvol.has-value{color:var(--t2)}
.gym .gy-addrow{display:inline-flex;align-items:center;gap:7px;width:fit-content;margin-top:9px;padding:6px 0;border:0;background:none;color:var(--t3);font:inherit;font-size:12.5px;font-weight:500;cursor:pointer}
.gym .gy-addrow:hover{color:var(--t1)}
.gym .gy-addrow:focus-visible{outline:2px solid var(--link);outline-offset:2px;border-radius:2px}
.gym .gy-input{width:84px;min-width:0;height:32px;padding:0 9px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--t1);font:inherit;font-size:13px;font-variant-numeric:tabular-nums}
.gym .gy-input::placeholder{color:var(--faint)}
.gym .gy-input:focus{outline:none;border-color:var(--t1)}
.gym .gy-input:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.gym .gy-input[type="date"]{width:138px;font-size:12px}
.gym .gy-x{flex:none;color:var(--t3);font-size:11px}
.gym .gy-icon-btn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;background:none;border-radius:6px;color:var(--t3);cursor:pointer}
.gym .gy-icon-btn:hover{background:var(--card);color:var(--t1)}
.gym .gy-icon-btn:focus-visible{outline:2px solid var(--link);outline-offset:1px}
.gym .gy-text-btn{display:inline-flex;align-items:center;gap:7px;width:fit-content;padding:6px 0;border:0;background:none;color:var(--t2);font:inherit;font-size:12.5px;font-weight:500;cursor:pointer}
.gym .gy-text-btn:hover{color:var(--t1)}
.gym .gy-text-btn:focus-visible{outline:2px solid var(--link);outline-offset:2px;border-radius:2px}
.gym .gy-save-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;border:0;border-radius:var(--ng-r-sm,6px);background:var(--t1);color:var(--card);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.gym .gy-save-btn:hover{opacity:.88}
.gym .gy-save-btn:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.gym .gy-main-foot{display:flex;align-items:center;gap:14px;margin-top:12px}
.gym .gy-main-foot .gy-log-btn{margin-left:auto}
.gym .gy-foot-sum{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);white-space:nowrap}
.gym .gy-log-btn{display:inline-flex;align-items:center;gap:10px;height:36px;padding:0 16px;border:0;border-radius:var(--ng-r-sm,6px);background:var(--t1);color:var(--card);font:inherit;font-size:12.5px;font-weight:600;letter-spacing:-.005em;cursor:pointer;transition:opacity .15s ease}
.gym .gy-log-btn::after{content:"→";font-weight:500}
.gym .gy-log-btn:hover{opacity:.88}
.gym .gy-log-btn:disabled{opacity:.5;cursor:default}
.gym .gy-log-btn:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.gym .gy-prchart{max-width:820px;margin-top:16px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--ng-r-md,12px);background:var(--card)}
.gym .gy-rest{border-top:1px solid var(--t1);border-bottom:1px solid var(--line);padding:44px 0;text-align:center}
.gym .gy-rest-t{margin:0 0 6px;font-size:18px;font-weight:600;letter-spacing:-.02em;color:var(--t1)}
.gym .gy-rest-d{margin:0 auto;max-width:460px;font-size:13px;line-height:1.6;color:var(--t2)}
@media (prefers-reduced-motion:reduce){.gym .gy-panel{animation:none}.gym .gy-caret{transition:none}}
@media (max-width:760px){
  .gym .gy-workbench{grid-template-columns:1fr;gap:14px}
  .gym .gy-aside{flex-direction:row;flex-wrap:wrap;align-items:flex-start;gap:10px 26px;padding:0 0 12px;border-right:0;border-bottom:1px solid var(--line)}
  .gym .gy-aside-block{flex-direction:row;align-items:baseline;gap:8px}
  .gym .gy-prlink{margin-top:0;margin-left:auto;padding-top:0}
  .gym .gy-group-h{padding-top:18px}
}
@media (max-width:640px){
  .gym .gy-head-tools{width:100%;align-items:flex-end;gap:12px}
  .gym .gy-row-name{font-size:16px}
  .gym .gy-row-state{display:none}
}
@media (max-width:600px){
  .gym .gy-panel{padding:14px 10px 16px;border-top:0}
  .gym .gy-title{font-size:27px}
  .gym .gy-setrow{grid-template-columns:26px minmax(0,1fr) minmax(0,1fr) 28px;gap:7px}
  .gym .gy-setrow-head span:nth-child(4),.gym .gy-setvol{display:none}
}
@media (max-width:380px){
  .gym .gy-input{width:72px}
  .gym .gy-setrow{gap:7px}
  .gym .gy-no{flex-basis:24px}
}
`;

const Icon = ({ d, className = "m-ic" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  /* The shell nav's chart glyph — one "trend" app-wide. The old arrow stopped
     its polyline 4 units short of the arrowhead corner. */
  trend: <><path d="M3 3v18h18" /><path d="M6.5 15.5 10 11l3 2.7L18.7 8" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
  /* Exact Feather edit-2 path the profile and settings pages use (the old
     r=2.8 arc was under the 2.828 the 4-unit chord needs). */
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
};

let toastSeq = 0;

const SPLIT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Composite split names (from templates) expand to the granular muscleGroup
// values the exercise library is actually tagged with.
const COMPOSITE_GROUPS = {
  "Upper Body": ["Chest", "Back", "Shoulders", "Bicep", "Tricep", "Forearms"],
  "Lower Body": ["Legs", "Abs"],
  Push: ["Chest", "Shoulders", "Tricep"],
  Pull: ["Back", "Bicep", "Forearms"],
  "Full Body": ["Chest", "Back", "Shoulders", "Bicep", "Tricep", "Forearms", "Legs", "Abs"],
};

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="gym gym-toast" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`gym-toast-item ${t.tone === "error" ? "err" : ""}`}>
          <span className="gym-toast-dot"></span>
          <p>{t.message}</p>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="gym-toast-x">
            <Icon d={ICONS.x} className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* Recharts chrome in Meridian colors */
const AXIS_TICK = { fill: "var(--t3)", fontSize: 12 };
const RT_GRID = "var(--track)";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\(\s+/g, "(") // "Fly( Lower Chest )" → "Fly(Lower Chest)"
    .replace(/\s+\)/g, ")");
};

/* Status is carried by the label, not by a coloured fill: chips stay neutral
   so the ink/hairline chrome holds. */
const STATUS_META = {
  completed: { label: "Completed", chip: { background: "var(--sunken)", color: "var(--t1)" } },
  "partially-completed": { label: "Partial", chip: { background: "var(--sunken)", color: "var(--t2)" } },
  "not-completed": { label: "Pending", chip: { background: "transparent", color: "var(--t3)" } },
};

export default function GymTrackingPage() {
  const { user, checkAuth } = useAuth();

  // Data State
  const [exercises, setExercises] = useState([]);
  const [workoutSchedule, setWorkoutSchedule] = useState([]); // derived: [{day, muscleGroups}]
  const [splitDays, setSplitDays] = useState({}); // raw user schedule: { Monday: [...], ... }
  // Per-day exercise picks from Account → Training split: { Monday: [id, ...] }.
  // A day absent here keeps the muscle-group default.
  const [splitExercises, setSplitExercises] = useState({});

  // Per-dataset failure flags — every initial-load fetch surfaces its own
  // inline notice (with retry) instead of failing silently.
  const [dataErrors, setDataErrors] = useState({});
  const [dataErrorsTick, setDataErrorsTick] = useState(0); // retry lever
  const setDataError = (key, failed) =>
    setDataErrors((prev) => (prev[key] === failed ? prev : { ...prev, [key]: failed }));

  /** Inline "couldn't load X" notice with a retry button, for dataset `key`. */
  const renderStaleNotice = (key, message) =>
    dataErrors[key] ? (
      <div className="st-notice" role="alert">
        <span>{message}</span>
        <button type="button" onClick={() => setDataErrorsTick((t) => t + 1)}>
          Retry
        </button>
      </div>
    ) : null;

  // UI State
  const [loading, setLoading] = useState(true);
  const [todaySession, setTodaySession] = useState(null);
  const [setDrafts, setSetDrafts] = useState({}); // exerciseId -> [{weight, reps}]
  const [historySessions, setHistorySessions] = useState(null); // session for the selected date (source of set editor seeds)
  const [savingExercise, setSavingExercise] = useState(null); // exerciseId being saved
  const [savedExercises, setSavedExercises] = useState({}); // exerciseId -> true (flash)
  const [newPRs, setNewPRs] = useState({}); // exerciseId -> { newPR, previousPR }
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [toasts, setToasts] = useState([]);

  // Day status
  const [todayGymStatus, setTodayGymStatus] = useState("not-completed");

  // Forms
  const [prExerciseId, setPrExerciseId] = useState(null); // exerciseId whose PR chart is open
  const [prSeries, setPrSeries] = useState([]);
  // Session board: one exercise expanded at a time, and none of them on load.
  // null = the board is fully collapsed; a row opens only when picked.
  const [openExerciseId, setOpenExerciseId] = useState(null);

  // Warm-up editor — per-exercise, persisted via PUT /api/exercises/[id]
  const [wuExerciseId, setWuExerciseId] = useState(null);
  const [wuDraft, setWuDraft] = useState([]);
  const [savingWarmUp, setSavingWarmUp] = useState(null); // exerciseId being saved

  // Manual PR editor — weight + optional date (auto-detection only fires on heavier logged sets)
  const [prEditExerciseId, setPrEditExerciseId] = useState(null);
  const [prEditDraft, setPrEditDraft] = useState({ weight: "", date: "" });
  const [savingPrEdit, setSavingPrEdit] = useState(false);

  const pushToast = (message, tone = "success", ttl = 4000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Initial Fetch Setup
  useEffect(() => {
    checkAuth();
  }, []);

  // `loading` starts true, so refreshes run in place instead of toggling it
  // synchronously from the effect below.
  const fetchData = async () => {
    await Promise.all([fetchGymData(), fetchGymHistory(), fetchSession()]);

    setLoading(false);
  };

  const fetchGymHistory = async () => {
    try {
      const res = await fetch(`/api/daily-log?date=${currentDate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.dailyLog) {
        setTodayGymStatus(data.dailyLog.gymStatus || "not-completed");
      }
      setDataError("history", false);
    } catch (error) {
      console.error("Error fetching gym history:", error);
      setDataError("history", true);
    }
  };

  const fetchGymData = async () => {
    try {
      const [exercisesRes, scheduleRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/workout-schedule"),
      ]);

      const exercisesData = await exercisesRes.json();
      const scheduleData = await scheduleRes.json();

      if (Array.isArray(exercisesData) && exercisesData.length > 0) setExercises(exercisesData);

      const rawDays = scheduleData?.days;
      const days = Array.isArray(rawDays) ? Object.fromEntries(rawDays) : rawDays;
      if (days && typeof days === "object") {
        setSplitDays(days);
        setWorkoutSchedule(
          SPLIT_DAYS.map((day) => ({ day, muscleGroups: days[day] || ["Rest Day"] }))
        );
      }

      const picks = scheduleData?.exercises;
      if (picks && typeof picks === "object" && !Array.isArray(picks)) {
        const normalized = {};
        for (const [day, ids] of Object.entries(picks)) {
          if (Array.isArray(ids)) normalized[day] = ids.map(String);
        }
        setSplitExercises(normalized);
      } else {
        setSplitExercises({});
      }
      setDataError("plan", false);
    } catch (error) {
      console.error("Error fetching gym data:", error);
      setDataError("plan", true);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/workout-sessions?date=${currentDate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTodaySession(data.session || null);
      setHistorySessions(data.session || null); // the set editor seeds from this date's session
      setDataError("session", false);
    } catch (error) {
      console.error("Error fetching workout session:", error);
      setDataError("session", true);
    }
  };

  // Fetch on mount/date change and again when the tab regains focus. Declared
  // after the fetchers so every callback the effect calls already exists; the
  // one-tick deferral keeps the fetch chain out of the effect body.
  useEffect(() => {
    if (!user) return undefined;
    const id = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(id);
  }, [user, dataErrorsTick, currentDate]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
        if (user) {
          fetchData();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const handleGymStatusUpdate = async (status) => {
    const prev = todayGymStatus;
    try {
      const res = await fetch("/api/daily-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymStatus: status,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayGymStatus(status);
        pushToast(status === prev ? `Status set to ${STATUS_META[status]?.label}.` : `Marked ${STATUS_META[status]?.label.toLowerCase()}${isToday ? " for today" : ` for ${format(parseISO(currentDate), "d MMM")}`}.`);
      } else {
        pushToast("Couldn't update status. Check your connection and retry.", "error");
      }
    } catch (error) {
      console.error("Error updating gym status:", error);
      pushToast("Couldn't update status. Check your connection and retry.", "error");
    }
  };

  // ---------- Workout sessions (numeric sets) ----------

  const getSetsFor = (exerciseId) => {
    if (setDrafts[exerciseId] !== undefined) return setDrafts[exerciseId];
    const logged = (historySessions?.exercises || []).find(
      (e) => e.exercise === exerciseId || e.exercise?.toString() === exerciseId,
    );
    return logged?.sets?.length ? [...logged.sets] : [{ weight: "", reps: "" }];
  };

  // Warm-up set editing — mirrors the working-set rows, but saves to the
  // per-user exercise profile so it persists across every training day.
  const openWarmUpEdit = (ex) => {
    setWuExerciseId(ex._id);
    setWuDraft(ex.warmUpSets?.length > 0 ? ex.warmUpSets.map((s) => ({ ...s })) : [{ weight: "", reps: "" }]);
  };

  const updateWuSet = (index, field, value) => {
    setWuDraft((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addWuRow = () => setWuDraft((prev) => [...prev, { weight: "", reps: "" }]);

  const removeWuRow = (index) =>
    setWuDraft((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ weight: "", reps: "" }]));

  const handleSaveWarmUp = async () => {
    const sets = wuDraft
      .map((s) => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps, 10) }))
      .filter((s) => Number.isFinite(s.weight) && s.weight >= 0 && Number.isInteger(s.reps) && s.reps >= 0);

    setSavingWarmUp(wuExerciseId);
    try {
      const res = await fetch(`/api/exercises/${wuExerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warmUpSets: sets }),
      });
      const data = await res.json();
      if (res.ok) {
        setExercises((prev) => prev.map((e) => (e._id === wuExerciseId ? { ...e, warmUpSets: data.warmUpSets || [] } : e)));
        setWuExerciseId(null);
        pushToast("Warm-up saved for this exercise.");
      } else {
        pushToast(data.error || "Couldn't save the warm-up. Try again.", "error");
      }
    } catch (error) {
      console.error("Error saving warm-up:", error);
      pushToast("Network error — warm-up wasn't saved. Try again.", "error");
    } finally {
      setSavingWarmUp(null);
    }
  };

  // Manual PR — for weights set before the app or on untracked machines.
  // Safe alongside auto-detection: the logger only promotes strictly heavier sets.
  const openPrEdit = (ex) => {
    setPrEditExerciseId(ex._id);
    setPrEditDraft({
      weight: ex.prWeight != null ? String(ex.prWeight) : "",
      date: ex.lastPRDate || format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleSavePrEdit = async () => {
    const parsed = parseFloat(prEditDraft.weight);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
      pushToast("PR weight must be between 0 and 1000 kg.", "error");
      return;
    }

    setSavingPrEdit(true);
    try {
      const res = await fetch(`/api/exercises/${prEditExerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prWeight: parsed, lastPRDate: prEditDraft.date }),
      });
      const data = await res.json();
      if (res.ok) {
        setExercises((prev) =>
          prev.map((e) =>
            e._id === prEditExerciseId ? { ...e, prWeight: data.prWeight ?? null, lastPR: data.lastPR ?? "", lastPRDate: data.lastPRDate ?? "" } : e,
          ),
        );
        setPrEditExerciseId(null);
        pushToast(`Personal best updated — ${parsed} kg.`);
      } else {
        pushToast(data.error || "Couldn't update the PR. Try again.", "error");
      }
    } catch (error) {
      console.error("Error updating PR:", error);
      pushToast("Network error — PR wasn't updated. Try again.", "error");
    } finally {
      setSavingPrEdit(false);
    }
  };

  const updateSet = (exerciseId, index, field, value) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      const sets = base.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, [exerciseId]: sets };
    });
  };

  // New rows prefill weight from the previous set — between rest timers the
  // next attempt is usually the same load, so the athlete edits (or skips)
  // instead of retyping. Focus follows the new row one frame later, once React
  // has committed it; a state flag here would only re-run an effect to undo it.
  const addSetRow = (exerciseId) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      // The most recent set that actually carries a load wins: an Enter pressed
      // on an untouched row must not blank out the rest of the column.
      const last = [...base].reverse().find((r) => r.weight !== "" && r.weight != null) || base[base.length - 1];
      return { ...prev, [exerciseId]: [...base, { weight: last?.weight || "", reps: "" }] };
    });
    requestAnimationFrame(() => {
      const rows = document.querySelectorAll(`[data-ex-sets="${exerciseId}"] > div`);
      const input = rows[rows.length - 1]?.querySelector("input");
      if (input) input.focus();
    });
  };

  // Enter in a reps field commits the row (same as clicking Add set) instead
  // of submitting nothing — the keyboard path through the logging loop.
  const handleSetRowKeyDown = (e, exerciseId) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addSetRow(exerciseId);
  };

  const removeSetRow = (exerciseId, index) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      const sets = base.filter((_, i) => i !== index);
      return { ...prev, [exerciseId]: sets.length > 0 ? sets : [{ weight: "", reps: "" }] };
    });
  };

  const handleSaveSessionSets = async (exerciseId) => {
    setSavingExercise(exerciseId);
    try {
      const draft = setDrafts[exerciseId] ?? getSetsFor(exerciseId);
      const sets = draft
        .map((s) => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps, 10) }))
        .filter(
          (s) =>
            Number.isFinite(s.weight) && s.weight >= 0 && Number.isInteger(s.reps) && s.reps >= 0,
        );

      if (sets.length === 0) {
        pushToast("Add at least one set with a weight and reps before logging.", "error");
        return;
      }

      const res = await fetch("/api/workout-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: currentDate,
          mode: "replace",
          exercises: [{ exercise: exerciseId, sets }],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTodaySession(data.session || null);
        setHistorySessions(data.session || null);
        setSetDrafts((prev) => {
          const next = { ...prev };
          delete next[exerciseId];
          return next;
        });
        setSavedExercises((prev) => ({ ...prev, [exerciseId]: true }));
        setTimeout(() => setSavedExercises((prev) => ({ ...prev, [exerciseId]: false })), 2500);

        if (data.prs && data.prs.length > 0) {
          const pr = data.prs.find((p) => p.exerciseId === exerciseId);
          if (pr) {
            setNewPRs((prev) => ({ ...prev, [exerciseId]: pr }));
            pushToast(`New personal best — ${pr.newPR} kg${pr.previousPR != null ? ` (was ${pr.previousPR} kg)` : ""}.`);
          }
          // Refresh plan/PR data and the heatmap so the new PR shows everywhere.
          fetchGymData();
          fetchGymHistory();
        } else {
          pushToast(isToday ? "Sets logged for today." : `Sets saved for ${format(parseISO(currentDate), "d MMM")}.`);
        }
      } else {
        pushToast(data.error || "Failed to save sets. Try again.", "error");
      }
    } catch (error) {
      console.error("Error saving sets:", error);
      pushToast("Network error — your sets weren't saved. Try again.", "error");
    } finally {
      setSavingExercise(null);
    }
  };

  const handleOpenPRChart = async (exerciseId) => {
    if (prExerciseId === exerciseId) {
      setPrExerciseId(null);
      return;
    }
    setPrExerciseId(exerciseId);
    try {
      const res = await fetch(`/api/workout-sessions?exerciseId=${exerciseId}&months=6`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPrSeries(data.series || []);
      setDataError("pr", false);
    } catch (error) {
      console.error("Error fetching PR series:", error);
      setPrSeries([]);
      setDataError("pr", true);
    }
  };

  /** "2× 60kg · 50kg" style summary of a numeric sets array. */
  const formatSetsDisplay = (sets) => {
    if (!sets || sets.length === 0) return "";
    const grouped = {};
    for (const s of sets) {
      const key = `${s.weight}kg`;
      grouped[key] = (grouped[key] || 0) + 1;
    }
    return Object.entries(grouped)
      .map(([weight, count]) => (count > 1 ? `${count}× ${weight}` : weight))
      .join(" · ");
  };

  if (loading) {
    return <Loader />;
  }

  // Render Helpers
  const getDayMuscleGroups = (dayName) => {
    const groups = splitDays[dayName];
    return Array.isArray(groups) && groups.length > 0 ? groups : ["Rest Day"];
  };

  const TODAY = format(new Date(), "yyyy-MM-dd");
  const isToday = currentDate === TODAY;
  const selectedDayName = SPLIT_DAYS[(parseISO(currentDate).getDay() + 6) % 7]; // Monday = 0 … Sunday = 6
  // Composite template groups (Push, Lower Body, …) expand into the granular
  // muscle groups the exercise library actually tags; granular names pass through.
  const expandedGroups = expandMuscleGroups(getDayMuscleGroups(selectedDayName));
  const muscleGroups = getDayMuscleGroups(selectedDayName);
  // Date navigation — view and edit any past day (the API accepts any non-future date).
  const shiftDate = (days) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    const nextStr = format(next, "yyyy-MM-dd");
    if (nextStr > TODAY) return; // never navigate into the future
    setCurrentDate(nextStr);
    setSetDrafts({}); // stale drafts from another date would mislead
    setPrExerciseId(null);
    setOpenExerciseId(null);
  };

  const goToday = () => {
    if (currentDate === TODAY) return;
    setCurrentDate(TODAY);
    setSetDrafts({});
    setPrExerciseId(null);
    setOpenExerciseId(null);
  };

  const todaySchedule = workoutSchedule.find((d) => d.day === selectedDayName);

  /* Account → Training split can curate a day's exercises. A stored pick list
     wins over the muscle-group default: it keeps the chosen order and may hold
     movements from outside the day's own groups. */
  const dayPicks = Array.isArray(splitExercises?.[selectedDayName])
    ? splitExercises[selectedDayName]
    : null;
  const pickedIds = dayPicks ? new Set(dayPicks) : null;

  // A rest day stays a rest day unless the athlete deliberately picked
  // exercises for it.
  const isRestDay =
    (!todaySchedule || todaySchedule.muscleGroups.includes("Rest Day")) && !pickedIds;

  // One session board: muscle-group sections, each holding its exercises.
  // Dedupe across groups so a composite split never repeats a movement.
  const sections = (() => {
    if (isRestDay) return [];

    if (pickedIds) {
      const picked = exercises
        .filter((ex) => pickedIds.has(String(ex._id)))
        .sort((a, b) => dayPicks.indexOf(String(a._id)) - dayPicks.indexOf(String(b._id)));
      if (picked.length === 0) return [];

      const pickedGroups = [];
      for (const ex of picked) {
        if (!pickedGroups.includes(ex.muscleGroup)) pickedGroups.push(ex.muscleGroup);
      }
      // The day's own groups lead; picks from other groups follow them.
      const orderedGroups = [
        ...expandedGroups.filter((g) => pickedGroups.includes(g)),
        ...pickedGroups.filter((g) => !expandedGroups.includes(g)),
      ];
      return orderedGroups.map((group) => ({
        group,
        exercises: picked.filter((ex) => ex.muscleGroup === group),
      }));
    }

    const seen = new Set();
    const out = [];
    for (const group of expandMuscleGroups(todaySchedule.muscleGroups)) {
      const memberGroups = COMPOSITE_GROUPS[group] || [group];
      const groupExercises = exercises.filter(
        (ex) => memberGroups.includes(ex.muscleGroup) && !seen.has(ex._id),
      );
      groupExercises.forEach((ex) => seen.add(ex._id));
      if (groupExercises.length > 0) out.push({ group, exercises: groupExercises });
    }
    return out;
  })();

  const flatExercises = sections.flatMap((section) => section.exercises);
  const totalExercises = flatExercises.length;
  // One running number across the whole session, so a row can be called out
  // by its place in the workout rather than by muscle abbreviation.
  const exerciseNo = new Map(flatExercises.map((ex, i) => [ex._id, i + 1]));

  // Saved sets for one exercise — the row summary and the session progress
  // both read from the persisted session, never from unsaved drafts.
  const summarizeSets = (exerciseId) => {
    const logged = (historySessions?.exercises || []).find(
      (e) => e.exercise === exerciseId || e.exercise?.toString() === exerciseId,
    );
    const sets = (logged?.sets || []).filter(
      (s) => Number.isFinite(Number(s.weight)) && Number.isFinite(Number(s.reps)),
    );
    if (sets.length === 0) return null;
    return {
      count: sets.length,
      top: Math.max(...sets.map((s) => Number(s.weight))),
      volume: sets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0),
    };
  };

  const loggedSummaries = flatExercises.map((ex) => summarizeSets(ex._id)).filter(Boolean);
  const loggedCount = loggedSummaries.length;
  const dayVolume = loggedSummaries.reduce((sum, s) => sum + s.volume, 0);
  const isRowOpen = (id) => openExerciseId === id;

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <style>{GYM_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="gym ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Masthead — the session is the page, so the date lives here instead
              of inside a plan card further down. */}
          <header className="gy-head m-in">
            <div className="gy-head-main">
              <p className="gy-kicker">Training · Gym log</p>
              <h1 className="gy-title">
                {muscleGroups.includes("Rest Day")
                  ? "Rest & recovery"
                  : `${muscleGroups.join(" & ")} day`}
              </h1>
              <p className="gy-dek">
                {format(parseISO(currentDate), "EEEE d MMMM")}
                {isRestDay
                  ? " — no lifts scheduled."
                  : ` · ${totalExercises} exercise${totalExercises === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="gy-head-tools">
              <Link href="/dashboard/account#acc-training" className="gy-split-link">
                Change your training split in Account →
              </Link>
              <div className="gy-daynav" role="group" aria-label="Change the session date">
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  aria-label="View the previous day"
                >
                  <span style={{ display: "inline-flex", transform: "rotate(90deg)" }} aria-hidden="true">
                    <Icon d={ICONS.chevron} className="w-3.5 h-3.5" />
                  </span>
                </button>
                <span className="gy-daynav-date m-num">
                  {isToday ? "Today" : format(parseISO(currentDate), "EEE d MMM")}
                </span>
                <button
                  type="button"
                  onClick={() => shiftDate(1)}
                  aria-label="View the next day"
                  disabled={isToday}
                >
                  <span style={{ display: "inline-flex", transform: "rotate(-90deg)" }} aria-hidden="true">
                    <Icon d={ICONS.chevron} className="w-3.5 h-3.5" />
                  </span>
                </button>
                {!isToday && (
                  <button type="button" className="gy-today" onClick={goToday}>
                    Today
                  </button>
                )}
              </div>
            </div>
          </header>

          {renderStaleNotice("plan", "Couldn't load today's plan or exercises.")}

          {/* Session — one exercise open at a time, the rest a scannable board. */}
          <section className="gy-session m-in" aria-labelledby="gy-session-lbl">
            <div className="gy-session-h">
              <div className="gy-session-meta">
                <span className="gy-label" id="gy-session-lbl">
                  Session
                </span>
                {isRestDay ? (
                  <span className="gy-progress">No lifts scheduled</span>
                ) : (
                  <span className="gy-progress">
                    <b>{loggedCount}</b> of {totalExercises} logged
                    {dayVolume > 0 && ` · ${dayVolume.toLocaleString()} kg`}
                  </span>
                )}
              </div>
              <div className="status-wrap">
                <span className="gy-label" id="gy-status-lbl">
                  Day status
                </span>
                <div className="status-seg" role="group" aria-labelledby="gy-status-lbl">
                  {Object.entries(STATUS_META).map(([val, meta]) => (
                    <button
                      key={val}
                      onClick={() => handleGymStatusUpdate(val)}
                      aria-pressed={todayGymStatus === val}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isRestDay ? (
              <div className="gy-rest">
                <p className="gy-rest-t">Recovery is part of the plan.</p>
                <p className="gy-rest-d">
                  Micro-tears build muscle, but rest repairs them. Fuel up today — tomorrow&apos;s
                  session is where the plan resumes.
                </p>
              </div>
            ) : totalExercises === 0 ? (
              <div className="gy-rest">
                <p className="gy-rest-t">No exercises for {muscleGroups.join(" & ")}</p>
                <p className="gy-rest-d">
                  This split day has no movements tagged yet. Pick another split template to fill it.
                </p>
              </div>
            ) : (
              <div className="gy-board">
                {sections.map((section) => (
                  <div className="gy-group" key={section.group}>
                    <div className="gy-group-h">
                      <span className="gy-group-name">{section.group}</span>
                      <span className="gy-group-count">{section.exercises.length}</span>
                      <span className="gy-rule" aria-hidden="true" />
                    </div>

                    <ul className="gy-rows">
                      {section.exercises.map((ex) => {
                        const open = isRowOpen(ex._id);
                        const summary = summarizeSets(ex._id);
                        const pr = newPRs[ex._id];
                        const stateLabel = pr
                          ? `PR ${pr.newPR} kg`
                          : savedExercises[ex._id]
                            ? "Saved"
                            : summary
                              ? "Logged"
                              : "Not logged";
                        return (
                          <li
                            key={ex._id}
                            className={`gy-row${open ? " is-open" : ""}${summary ? " is-logged" : ""}`}
                          >
                            <button
                              type="button"
                              className="gy-row-h"
                              onClick={() =>
                                setOpenExerciseId(open ? null : ex._id)
                              }
                              aria-expanded={open}
                              aria-controls={`gy-panel-${ex._id}`}
                            >
                              <span className="gy-no m-num">
                                {String(exerciseNo.get(ex._id)).padStart(2, "0")}
                              </span>
                              <span className="gy-row-main">
                                <span className="gy-row-name">{toTitleCase(ex.name)}</span>
                                {summary && (
                                  <span className="gy-row-meta">
                                    {`${summary.count} set${summary.count === 1 ? "" : "s"} · ${summary.top} kg top · ${summary.volume.toLocaleString()} kg volume`}
                                  </span>
                                )}
                              </span>
                              <span className={`gy-row-state${pr ? " is-pr" : ""}`}>{stateLabel}</span>
                              <span className="gy-caret" aria-hidden="true">
                                <Icon d={ICONS.chevron} className="w-4 h-4" />
                              </span>
                            </button>

                            {open && (
                              <div className="gy-panel" id={`gy-panel-${ex._id}`}>
                                <div className="gy-workbench">
                                  <aside className="gy-aside">
                                  <div className="gy-aside-block">
                                    <span className="gy-spec-lbl">
                                      <span className="gy-label">Warm up</span>
                                      <button
                                        type="button"
                                        onClick={() => openWarmUpEdit(ex)}
                                        aria-label={`Edit warm-up for ${toTitleCase(ex.name)}`}
                                        className="gy-edit"
                                      >
                                        <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                    {wuExerciseId === ex._id ? (
                                      <div className="gy-wu-edit">
                                        {wuDraft.map((set, idx) => (
                                          <div className="gy-wu-row" key={idx}>
                                            <input
                                              type="number"
                                              step="0.5"
                                              min="0"
                                              placeholder="kg"
                                              aria-label={`Warm-up set ${idx + 1} weight in kilograms`}
                                              value={set.weight}
                                              onChange={(e) => updateWuSet(idx, "weight", e.target.value)}
                                              className="gy-input"
                                            />
                                            <span className="gy-x" aria-hidden="true">×</span>
                                            <input
                                              type="number"
                                              min="0"
                                              placeholder="reps"
                                              aria-label={`Warm-up set ${idx + 1} repetitions`}
                                              value={set.reps}
                                              onChange={(e) => updateWuSet(idx, "reps", e.target.value)}
                                              className="gy-input"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeWuRow(idx)}
                                              aria-label={`Remove warm-up set ${idx + 1}`}
                                              className="gy-icon-btn"
                                            >
                                              <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                        <div className="gy-edit-actions">
                                          <button type="button" onClick={addWuRow} className="gy-text-btn">
                                            <Icon d={ICONS.plus} className="w-3.5 h-3.5" />
                                            Add
                                          </button>
                                          <button
                                            type="button"
                                            onClick={handleSaveWarmUp}
                                            disabled={savingWarmUp === wuExerciseId}
                                            className="gy-save-btn"
                                          >
                                            {savingWarmUp === wuExerciseId ? "Saving…" : "Save warm-up"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setWuExerciseId(null)}
                                            aria-label="Cancel warm-up editing"
                                            className="gy-icon-btn"
                                          >
                                            <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="gy-spec-val">
                                        {ex.warmUpSets?.length > 0
                                          ? formatSetsDisplay(ex.warmUpSets)
                                          : ex.warmUp || "Not set"}
                                      </p>
                                    )}
                                  </div>

                                  <div className="gy-aside-block">
                                    <span className="gy-spec-lbl">
                                      <span className="gy-label">Best</span>
                                      <button
                                        type="button"
                                        onClick={() => openPrEdit(ex)}
                                        aria-label={`Edit personal best for ${toTitleCase(ex.name)}`}
                                        className="gy-edit"
                                      >
                                        <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                    {prEditExerciseId === ex._id ? (
                                      <div className="gy-pr-edit">
                                        <input
                                          type="number"
                                          step="0.5"
                                          min="0"
                                          max="1000"
                                          placeholder="kg"
                                          aria-label={`Personal best weight in kilograms for ${ex.name}`}
                                          className="gy-input"
                                          value={prEditDraft.weight}
                                          autoFocus
                                          onChange={(e) =>
                                            setPrEditDraft((prev) => ({ ...prev, weight: e.target.value }))
                                          }
                                        />
                                        <input
                                          type="date"
                                          max={TODAY}
                                          aria-label="Date the personal best was set"
                                          className="gy-input gy-input-date"
                                          value={prEditDraft.date}
                                          onChange={(e) =>
                                            setPrEditDraft((prev) => ({ ...prev, date: e.target.value }))
                                          }
                                        />
                                        <button
                                          type="button"
                                          onClick={handleSavePrEdit}
                                          disabled={savingPrEdit}
                                          aria-label="Save personal best"
                                          className="gy-icon-btn"
                                        >
                                          <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setPrEditExerciseId(null)}
                                          aria-label="Cancel personal best editing"
                                          className="gy-icon-btn"
                                        >
                                          <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <p className="gy-spec-val">
                                        {ex.prWeight != null
                                          ? `${ex.prWeight} kg`
                                          : ex.lastPR || "None"}
                                        {ex.lastPRDate && (
                                          <span className="gy-spec-sub">
                                            {format(new Date(ex.lastPRDate), "d MMM yyyy")}
                                          </span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPRChart(ex._id)}
                                    aria-expanded={prExerciseId === ex._id}
                                    className="gy-prlink"
                                  >
                                    <Icon d={ICONS.trend} className="w-4 h-4" />
                                    {prExerciseId === ex._id ? "Hide PR trend" : "PR trend"}
                                  </button>
                                  </aside>

                                  <div className="gy-main">
                                <div className="gy-setblock">
                                  <div className="gy-setblock-h">
                                    <span className="gy-label">Working sets</span>
                                    <span className="gy-hint">{getSetsFor(ex._id).length} set{getSetsFor(ex._id).length === 1 ? "" : "s"}</span>
                                  </div>
                                  <div className="gy-setrow gy-setrow-head" aria-hidden="true">
                                    <span>Set</span>
                                    <span>Kg</span>
                                    <span>Reps</span>
                                    <span>Volume</span>
                                    <span></span>
                                  </div>
                                  <div className="gy-sets" data-ex-sets={ex._id}>
                                    {getSetsFor(ex._id).map((set, idx) => (
                                      <div className="gy-setrow" key={idx}>
                                        <span className="gy-setno m-num">
                                          {String(idx + 1).padStart(2, "0")}
                                        </span>
                                        <input
                                          type="number"
                                          step="0.5"
                                          min="0"
                                          placeholder="kg"
                                          aria-label={`Set ${idx + 1} weight in kilograms`}
                                          value={set.weight}
                                          onChange={(e) => updateSet(ex._id, idx, "weight", e.target.value)}
                                          className="gy-input"
                                        />
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="reps"
                                          aria-label={`Set ${idx + 1} repetitions`}
                                          value={set.reps}
                                          onChange={(e) => updateSet(ex._id, idx, "reps", e.target.value)}
                                          onKeyDown={(e) => handleSetRowKeyDown(e, ex._id)}
                                          className="gy-input"
                                        />
                                        <span
                                          className={`gy-setvol${
                                            Number(set.weight) > 0 && Number(set.reps) > 0 ? " has-value" : ""
                                          }`}
                                        >
                                          {Number(set.weight) > 0 && Number(set.reps) > 0
                                            ? `${(Number(set.weight) * Number(set.reps)).toLocaleString()} kg`
                                            : "—"}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => removeSetRow(ex._id, idx)}
                                          aria-label={`Remove set ${idx + 1}`}
                                          className="gy-icon-btn"
                                        >
                                          <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addSetRow(ex._id)}
                                    className="gy-addrow"
                                  >
                                    <Icon d={ICONS.plus} className="w-3.5 h-3.5" />
                                    Add set
                                  </button>
                                </div>

                                <div className="gy-main-foot">
                                  {(() => {
                                    const valid = getSetsFor(ex._id).filter(
                                      (s) => Number(s.weight) > 0 && Number(s.reps) > 0,
                                    );
                                    if (valid.length === 0) return null;
                                    const volume = valid.reduce(
                                      (sum, s) => sum + Number(s.weight) * Number(s.reps),
                                      0,
                                    );
                                    return (
                                      <span className="gy-foot-sum">
                                        {valid.length} set{valid.length === 1 ? "" : "s"} · {volume.toLocaleString()} kg
                                      </span>
                                    );
                                  })()}
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSessionSets(ex._id)}
                                    disabled={savingExercise === ex._id}
                                    className="gy-log-btn"
                                  >
                                    {savingExercise === ex._id ? "Saving…" : "Log sets"}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {prExerciseId === ex._id && (
                              <div className="gy-prchart">
                                <p className="gy-label">Top set weight — last 6 months</p>
                                {renderStaleNotice("pr", "Couldn't load your PR history.")}
                                {prSeries.length === 0 ? (
                                  <p className="gy-spec-val" style={{ margin: "8px 0 0" }}>
                                    No sets logged yet — save your working sets to build history.
                                  </p>
                                ) : (
                                  <div style={{ height: 180, marginTop: 10 }}>
                                    <ResponsiveContainer width="100%" height={180}>
                                      <LineChart data={prSeries}>
                                        <CartesianGrid stroke={RT_GRID} strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                          dataKey="date"
                                          tick={AXIS_TICK}
                                          axisLine={{ stroke: RT_GRID }}
                                          tickLine={false}
                                          tickFormatter={(d) => format(new Date(d), "MMM d")}
                                        />
                                        <YAxis
                                          tick={AXIS_TICK}
                                          axisLine={false}
                                          tickLine={false}
                                          width={34}
                                          domain={[0, "dataMax + 5"]}
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor: "var(--card)",
                                            border: "1px solid var(--line)",
                                            borderRadius: "var(--ng-r-sm, 6px)",
                                            boxShadow: "var(--ng-shadow-2)",
                                            fontSize: 12,
                                          }}
                                          formatter={(value, name) => [
                                            name === "weight" ? `${value} kg` : value,
                                            name === "weight" ? "Top set" : name,
                                          ]}
                                        />
                                        <Line
                                          type="monotone"
                                          dataKey="weight"
                                          stroke="var(--ac)"
                                          strokeWidth={2}
                                          dot={{ r: 3, fill: "var(--ac)" }}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                )}
                              </div>
                            )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </>
  );
}
