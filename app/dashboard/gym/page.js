"use client";

import { useEffect, useState, cloneElement } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { format, parseISO, startOfYear, differenceInCalendarDays } from "date-fns";
import { mergeSessionsIntoHeatmap } from "@/lib/heatmap";
import { expandMuscleGroups } from "@/lib/muscle-groups";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import SplitManager from "@/components/SplitManager";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as app/dashboard/meal.        */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.gym{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--amber:#b45309;--green:#047857;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--track:#efefec;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--green-soft:#ecfdf5;--amber-soft:#fef3c7;--red-soft:#fef2f2;--red-soft-b:#fecaca;color:var(--t1)}
html[data-theme="dark"] .gym{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--amber:#fbbf24;--green:#34d399;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--track:#2e2e34;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--green-soft:#0d2a22;--amber-soft:#3a2d10;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b}
.gym{background:var(--paper)}
.gym .m-card{background:var(--card);border:1px solid var(--line);border-radius:12px}
/* Theme-aware chart + heatmap chrome (overrides SVG presentation attrs) */
.gym .recharts-cartesian-grid line{stroke:var(--track)!important}
.gym .recharts-dot{fill:var(--card)!important}
.gym .recharts-line-curve{stroke:var(--ac)}
.gym .recharts-cartesian-axis-tick text{fill:var(--t3)}
.gym .m-card-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)}
.gym .m-card-h h3{font-size:13px;font-weight:700;color:var(--t1)}
.gym .m-h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.gym .m-sub{color:var(--t3);font-size:13px;margin-top:4px}
.gym .m-crumb{font-size:12px;color:var(--t3)}
.gym .m-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
.gym .m-chip-ac{background:var(--ac-soft);color:var(--ac)}
.gym .m-num{font-variant-numeric:tabular-nums}
.gym .m-ic{width:16px;height:16px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.gym .m-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13px;border-radius:8px;padding:10px 16px;cursor:pointer;border:1px solid transparent;transition:.15s}
.gym .m-btn-primary{background:var(--ac);color:var(--on-ac)}
.gym .m-btn-primary:hover{background:var(--ach)}
.gym .m-btn-primary:disabled{opacity:.6;cursor:wait}
.gym .m-btn-ghost{border:1px solid var(--line);color:var(--t1);background:var(--card)}
.gym .m-btn-ghost:hover{background:var(--sunken)}
.gym .m-field{border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--t1);background:var(--card);transition:.15s}
.gym .m-field:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 3px #4f46e51f}
.gym .m-lbl{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:5px}
.gym .m-stat{padding:14px 16px}
.gym .m-stat b{display:block;font-size:26px;font-weight:700;letter-spacing:-.02em;color:var(--t1)}
.gym .m-stat span{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-top:3px}
.gym .m-sep{height:1px;background:var(--line)}
@keyframes gym-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gym .m-in{animation:gym-in .45s cubic-bezier(.22,1,.36,1) both}
.gym .m-in:nth-child(2){animation-delay:.06s}
.gym .m-in:nth-child(3){animation-delay:.12s}
.gym-toast{position:fixed;bottom:24px;right:24px;z-index:var(--pop-z-toast, 80);display:flex;flex-direction:column;gap:10px;width:calc(100% - 48px);max-width:380px}
.gym-toast-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:color-mix(in srgb, var(--card) 88%, transparent);-webkit-backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));box-shadow:0 16px 40px -12px rgba(0,0,0,.5)}
.gym-toast-item.err{background:color-mix(in srgb, var(--red-soft) 88%, transparent);border-color:var(--red-soft-b)}
.gym-toast-item p{font-size:13px;color:var(--t1);flex:1;line-height:1.45}
.gym-toast-item.err p{color:#991b1b}
.gym-toast-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex-shrink:0}
.gym-toast-item.err .gym-toast-dot{background:var(--red)}
.gym-toast-x{flex-shrink:0;position:relative;color:var(--t3);background:none;border:0;cursor:pointer;padding:4px;border-radius:6px}
.gym-toast-x::after{content:"";position:absolute;inset:-6px}
.gym-toast-x:hover{color:var(--t1);background:var(--sunken)}
.gym .react-calendar-heatmap{color-scheme:light}
.gym .rt-cell{display:flex;flex-direction:column;gap:2px;padding:8px 12px;border-radius:8px;font-size:13px;border:1px solid transparent}
.gym .rt-cell:hover{background:var(--paper)}
/* Status — Whisper-styled segmented switcher: all options visible, active
   filled in ink. Full-width row on mobile, quiet right-aligned on desktop. */
.gym .status-seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;background:var(--card);padding:3px;gap:2px}
.gym .status-seg button{appearance:none;border:0;background:transparent;font-family:inherit;color:var(--t2);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:9px 14px;border-radius:6px;cursor:pointer;transition:.15s;white-space:nowrap}
.gym .status-seg button:hover{color:var(--t1);background:var(--sunken)}
.gym .status-seg button[aria-pressed="true"]{background:var(--t1);color:var(--card)}
@media (max-width:640px){.gym .status-wrap{width:100%}.gym .status-seg{display:flex;width:100%}.gym .status-seg button{flex:1;padding:11px 4px;text-align:center}}
@media (max-width:1024px){.gym .gym-layout{grid-template-columns:minmax(0,1fr) !important}}
/* Sticky rail: pinned on desktop, capped to the viewport so the whole card
   stays visible; internal scroll if it ever grows taller. Static on mobile —
   a sticky card there just gets scrolled over by the plan column. */
.gym .gym-rail{display:grid;gap:20px;position:sticky;top:88px;align-self:start;max-height:calc(100vh - 104px);overflow-y:auto}
.gym .gym-entries{max-height:200px;overflow-y:auto}
.gym .gym-rail::-webkit-scrollbar,.gym .gym-entries::-webkit-scrollbar{width:5px}
.gym .gym-rail::-webkit-scrollbar-thumb,.gym .gym-entries::-webkit-scrollbar-thumb{background:var(--track);border-radius:99px}
@media (max-width:1024px){.gym .gym-rail{position:static;max-height:none;overflow:visible}}
.gym .gym-stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
/* Consistency hero — a "story strip": the streak number is the point, the
   year map is the evidence. Sunken, hairline-divided cells keep the top
   band quiet; the calendar scrolls below with its legend on one baseline. */
.gym .gy-hero{display:flex;align-items:stretch;border:1px solid var(--line);border-radius:10px;background:var(--sunken);overflow:hidden}
.gym .gy-hero-cell{flex:1 1 0;min-width:0;padding:16px 18px;display:flex;flex-direction:column;justify-content:center}
.gym .gy-hero-cell+.gy-hero-cell{border-left:1px solid var(--line)}
.gym .gy-hero-row{display:flex;flex:1 1 0;min-width:0;border-left:1px solid var(--line)}
.gym .gy-hero-cell.is-hero{flex:0 0 auto;min-width:150px;background:var(--ac)}
.gym .gy-hero-cell.is-hero .gy-hero-num{color:var(--on-ac, #fff)}
.gym .gy-hero-cell.is-hero .gy-hero-lbl{color:color-mix(in srgb, var(--on-ac, #fff) 72%, transparent)}
.gym .gy-hero-num{font-size:26px;font-weight:800;line-height:1;letter-spacing:-.02em;color:var(--t1)}
.gym .gy-hero-lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);margin-top:6px}
.gym .gy-legend{display:inline-flex;align-items:center;gap:5px}
.gym .gy-legend i{width:9px;height:9px;border-radius:2px;display:inline-block}
.gym .gy-cell-hd{display:flex;align-items:baseline;gap:10px;padding-top:14px;padding-bottom:6px}
.gym .gy-cell-hd .m-crumb{margin:0}
/* Year switcher — GitHub-profile model: one calendar on screen; the chip
   row in the card header selects the year. Accent chip = active year. */
.gym .gy-years{display:grid;gap:8px}
.gym .gy-year{display:grid;gap:8px}
.gym .gy-year-hd{display:flex;align-items:baseline;gap:10px}
.gym .gy-year-tabs{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.gym .gy-year-tab{appearance:none;border:1px solid var(--line);background:var(--sunken);color:var(--t2);font:inherit;font-size:12px;font-weight:800;letter-spacing:.06em;font-variant-numeric:tabular-nums;padding:4px 12px;border-radius:999px;cursor:pointer;transition:color .15s,border-color .15s,background .15s}
.gym .gy-year-tab:hover{color:var(--t1);border-color:var(--t2)}
.gym .gy-year-tab.is-active{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.gym .gy-year-map{overflow-x:auto;width:100%;max-width:100%}
@media (max-width:640px){
  .gym .gy-hero{flex-direction:column}
  .gym .gy-hero-row{border-left:0;border-top:1px solid var(--line)}
  .gym .gy-hero-cell.is-hero{flex-direction:row;align-items:baseline;gap:10px;padding:13px 18px}
  .gym .gy-hero-cell.is-hero .gy-hero-num{font-size:20px}
  .gym .gy-hero-cell.is-hero .gy-hero-lbl{margin-top:0}
}
.gym .gym-layout > *{min-width:0}
.gym .m-card{min-width:0}
/* Training split card styles live in components/SplitManager.js */
`;

/* Inline dataset-failure notice — matches the stats-page error pattern. */
const STALE_NOTICE_CSS = `
.gym .st-notice{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid var(--red-soft-b);background:var(--red-soft);border-radius:8px;font-size:12px;font-weight:600;color:var(--red);margin-bottom:12px}
.gym .st-notice button{flex-shrink:0;background:var(--red);color:#fff;border:0;border-radius:6px;font-size:11px;font-weight:700;padding:5px 10px;cursor:pointer}
.gym .st-notice button:hover{filter:brightness(1.08)}
`;

const Icon = ({ d, className = "m-ic" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  flame: <><path d="M12 3s-6 5.2-6 10a6 6 0 0 0 12 0c0-1.6-.6-3.1-1.4-4.4-.9 1-1.9 1.5-1.9 1.5.3-2.3-.9-5.4-2.7-7.1z" /><path d="M12 21a3 3 0 0 1-3-3c0-1.7 1.5-3.2 3-4 1.5.8 3 2.3 3 4a3 3 0 0 1-3 3z" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  scale: <><path d="M12 3v3" /><path d="m7 6-4 8a4.5 4.5 0 0 0 8 0L7 6z" /><path d="m17 6-4 8a4.5 4.5 0 0 0 8 0l-4-8z" /><path d="M4 21h16" /><path d="M5 6h14" /></>,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></>,
  dumbbell: <><path d="M6.5 6.5 17.5 17.5" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="M18 22l4-4" /><path d="M2 6l4-4" /><path d="M3 9l6-6" /><path d="M21 15l-6 6" /></>,
  pencil: <><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></>,
};

let toastSeq = 0;

const SPLIT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
const AXIS_TICK = { fill: "var(--t3)", fontSize: 11 };
const RT_GRID = "var(--track)";

const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const STATUS_META = {
  completed: { label: "Completed", chip: { background: "var(--ac-soft)", color: "var(--ac)" } },
  "partially-completed": { label: "Partial", chip: { background: "var(--amber-soft)", color: "var(--amber)" } },
  "not-completed": { label: "Pending", chip: { background: "var(--sunken)", color: "var(--t2)" } },
};

/* Heatmap ramps — Meridian indigo, light + dark tracks matching the theme */
const LIGHT_RAMP = ["#ececea", "#c7d2fe", "#a5b4fc", "#818cf8", "#4f46e5"];
const DARK_RAMP = ["#2e2e34", "#3730a3", "#4f46e5", "#818cf8", "#a5b4fc"];

export default function GymTrackingPage() {
  const { user, checkAuth } = useAuth();
  const { theme } = useTheme();

  // Data State
  const [exercises, setExercises] = useState([]);
  const [workoutSchedule, setWorkoutSchedule] = useState([]); // derived: [{day, muscleGroups}]
  const [splitDays, setSplitDays] = useState({}); // raw user schedule: { Monday: [...], ... }
  const [splitSource, setSplitSource] = useState(null); // template name the split came from
  const [weightEntries, setWeightEntries] = useState([]);
  const [gymHistory, setGymHistory] = useState([]);

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
  const [yearSessions, setYearSessions] = useState([]); // lean sessions feeding the heatmap
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear()); // selected calendar year (chip switcher)
  const [setDrafts, setSetDrafts] = useState({}); // exerciseId -> [{weight, reps}]
  const [historySessions, setHistorySessions] = useState(null); // session for the selected date (source of set editor seeds)
  const [savingExercise, setSavingExercise] = useState(null); // exerciseId being saved
  const [savedExercises, setSavedExercises] = useState({}); // exerciseId -> true (flash)
  const [newPRs, setNewPRs] = useState({}); // exerciseId -> { newPR, previousPR }
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [toasts, setToasts] = useState([]);

  // Stats
  const [todayGymStatus, setTodayGymStatus] = useState("not-completed");
  const [targetWeight, setTargetWeight] = useState(75);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);

  // Forms
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [prExerciseId, setPrExerciseId] = useState(null); // exerciseId whose PR chart is open
  const [prSeries, setPrSeries] = useState([]);

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

  useEffect(() => {
    if (user) {
      fetchData();
    }
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

  const fetchData = async () => {
    // Only set loading on initial mount
    if (loading) setLoading(true);

    await Promise.all([fetchGymData(), fetchWeightData(), fetchGymHistory(), fetchSession(), fetchYearSessions()]);

    setLoading(false);
  };

  const fetchGymHistory = async () => {
    try {
      const res = await fetch(`/api/daily-log?date=${currentDate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.gymHistory) {
        setGymHistory(data.gymHistory);
      }
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
        setSplitSource(scheduleData.sourceTemplateName || null);
        setWorkoutSchedule(
          SPLIT_DAYS.map((day) => ({ day, muscleGroups: days[day] || ["Rest Day"] }))
        );
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

  const fetchYearSessions = async () => {
    try {
      // Match the heatmap window: up to 3 stacked year rows (current + two
      // prior), so every rendered year can show real session volume.
      const from = format(startOfYear(new Date(new Date().getFullYear() - 2, 0, 1)), "yyyy-MM-dd");
      const to = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(`/api/workout-sessions?from=${from}&to=${to}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setYearSessions(data.sessions || []);
      setDataError("consistency", false);
    } catch (error) {
      console.error("Error fetching year sessions:", error);
      setDataError("consistency", true);
    }
  };

  const fetchWeightData = async () => {
    try {
      const res = await fetch("/api/weight");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWeightEntries(data.weightEntries || []);
      setTargetWeight(data.targetWeight || 75);
      setDataError("weight", false);
    } catch (error) {
      console.error("Error fetching weight data:", error);
      setDataError("weight", true);
    }
  };


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
        if (data.gymHistory) {
          setGymHistory(data.gymHistory);
        }
        pushToast(status === prev ? `Status set to ${STATUS_META[status]?.label}.` : `Marked ${STATUS_META[status]?.label.toLowerCase()}${isToday ? " for today" : ` for ${format(parseISO(currentDate), "d MMM")}`}.`);
      } else {
        pushToast("Couldn't update status. Check your connection and retry.", "error");
      }
    } catch (error) {
      console.error("Error updating gym status:", error);
      pushToast("Couldn't update status. Check your connection and retry.", "error");
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(newWeight);
    if (!newWeight || !Number.isFinite(parsed) || parsed <= 0) {
      pushToast("Enter a weight in kilograms first (e.g. 74.5).", "error");
      return;
    }

    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parsed,
          date: newWeightDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
        setNewWeight("");
        pushToast(`Logged ${parsed} kg for today.`);
      } else {
        pushToast("Couldn't log that weight. Check the value and retry.", "error");
      }
    } catch (error) {
      console.error("Error adding weight:", error);
      pushToast("Network error — your weight wasn't logged. Try again.", "error");
    }
  };

  const handleSaveTargetWeight = async () => {
    const parsed = parseFloat(targetDraft);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 400) {
      pushToast("Target weight must be between 20 and 400 kg.", "error");
      return;
    }

    setSavingTarget(true);
    try {
      const res = await fetch("/api/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetWeight: parsed }),
      });
      if (res.ok) {
        setTargetWeight(parsed);
        setEditingTarget(false);
        pushToast(`Target weight set to ${parsed} kg.`);
      } else {
        const data = await res.json().catch(() => ({}));
        pushToast(data.error || "Couldn't update the target weight. Try again.", "error");
      }
    } catch (error) {
      console.error("Error updating target weight:", error);
      pushToast("Network error — target weight wasn't saved. Try again.", "error");
    } finally {
      setSavingTarget(false);
    }
  };

  const handleDeleteWeight = async (entryId, weightKg) => {
    try {
      const res = await fetch(`/api/weight/${entryId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
        pushToast(`Removed the ${weightKg} kg entry.`);
      } else {
        pushToast("Couldn't remove that entry. Try again.", "error");
      }
    } catch (error) {
      console.error(error);
      pushToast("Network error — the entry is still there. Try again.", "error");
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

  const addSetRow = (exerciseId) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      return { ...prev, [exerciseId]: [...base, { weight: "", reps: "" }] };
    });
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
        fetchYearSessions();
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
  const renderCalendar = () => {
    // GitHub-profile model: one calendar on screen; the chip row in the
    // card header selects the year (default = current). The view spans
    // Jan 1 → Dec 31; future days of the running year stay blank blocks,
    // as GitHub's profile graph does.
    const merged = mergeSessionsIntoHeatmap(gymHistory, yearSessions);
    const statusMap = new Map(merged.map((day) => [day.date, day]));

    const yearData = [];
    const endDate = new Date(heatmapYear, 11, 31);
    let curr = new Date(heatmapYear, 0, 1);
    while (curr <= endDate) {
      const dateStr = format(curr, "yyyy-MM-dd");
      const day = statusMap.get(dateStr);
      yearData.push({
        date: dateStr,
        count: day?.level || 0,
        level: day?.level || 0,
        volume: day?.volume || 0,
        hasSession: Boolean(day?.hasSession),
        gymStatus: day?.gymStatus || "not-completed",
      });
      curr.setDate(curr.getDate() + 1);
    }
    // Summary follows the selection, as GitHub's contribution total does.
    const yearVolume = yearData.reduce((sum, d) => sum + (d.volume || 0), 0);
    const yearSessionsCount = yearData.filter((d) => d.hasSession).length;

    return (
      <div className="gy-years">
        <div className="gy-year">
          <div className="gy-year-hd">
            <span className="m-crumb">
              {yearSessionsCount} session{yearSessionsCount === 1 ? "" : "s"} · {yearVolume.toLocaleString()} kg
            </span>
          </div>
          <div className="gy-year-map">
                <ActivityCalendar
                  data={yearData}
                  theme={{
                    light: LIGHT_RAMP,
                    dark: DARK_RAMP,
                  }}
                  blockSize={10}
                  blockMargin={4}
                  colorScheme={theme === "dark" ? "dark" : "light"}
                  showTotalCount={false}
                  showColorLegend={false}
                  showMonthLabels="if-needed"
                  showWeekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                  style={{ width: "100%", minWidth: "800px" }}
                  renderBlock={(block, activity) =>
                    cloneElement(block, {
                      "data-tooltip-id": "react-tooltip",
                      "data-tooltip-content": `${format(parseISO(activity.date), "d MMMM yyyy")} • ${
                        activity.hasSession && activity.volume > 0
                          ? `${activity.volume.toLocaleString()} kg volume`
                          : activity.level === 4
                            ? "Completed"
                            : activity.level === 2
                              ? "Partially Completed"
                              : activity.level >= 1
                                ? "Trained"
                                : "No Activity"
                      }`,
                    })
                  }
                />
          </div>
        </div>
        <ReactTooltip id="react-tooltip" />
      </div>
    );
  };

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
  // Consistency hero stats — computed for the selected heatmap year so the
  // headline numbers follow the year chips (GitHub's contribution model)
  // instead of silently counting all fetched history. Derived in render
  // scope, so they can never drift from the selection. A day counts as
  // trained when it was marked completed/partially-completed OR has a
  // logged session — matching what the calendar colors.
  const heroStats = (() => {
    const inYear = mergeSessionsIntoHeatmap(gymHistory, yearSessions)
      .filter((day) => day.date.startsWith(`${heatmapYear}-`))
      .filter(
        (day) =>
          day.gymStatus === "completed" ||
          day.gymStatus === "partially-completed" ||
          day.hasSession,
      )
      .map((day) => day.date)
      .sort();

    // Longest run of consecutive trained days within the selected year.
    let longestStreak = 0;
    let run = 0;
    let prev = null;
    for (const dateStr of inYear) {
      run =
        prev && differenceInCalendarDays(parseISO(dateStr), prev) === 1
          ? run + 1
          : 1;
      if (run > longestStreak) longestStreak = run;
      prev = parseISO(dateStr);
    }

    // Current streak: consecutive trained days ending today — or ending
    // yesterday when today isn't trained yet, so an open day doesn't reset
    // the count. Past years have no open day, so the streak is measured at
    // that year's end.
    const completedSet = new Set(inYear);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd =
      heatmapYear === today.getFullYear() ? today : new Date(heatmapYear, 11, 31);
    let currentStreak = 0;
    const cursor = new Date(windowEnd);
    while (cursor >= new Date(heatmapYear, 0, 1)) {
      if (completedSet.has(format(cursor, "yyyy-MM-dd"))) {
        currentStreak += 1;
      } else if (cursor.getTime() !== windowEnd.getTime()) {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }

    return { currentStreak, longestStreak, trainedDays: inYear.length };
  })();

  // Heatmap year switcher: current year plus prior years the account
  // existed for, capped at 3 — derived client-side from the signup month
  // so a fresh account never sees an empty year chip.
  const heatmapYears = (() => {
    const now = new Date();
    const signup = user?.createdAt ? new Date(user.createdAt) : null;
    const maxRows = 3;
    const years = [];
    for (let i = 0; i < maxRows; i += 1) {
      const y = now.getFullYear() - i;
      if (signup && y < signup.getFullYear()) break; // account didn't exist this year
      if (signup && y === signup.getFullYear() && now < signup && i === 0) break;
      years.push(y);
    }
    return years;
  })();

  // SplitManager reports back after a template apply or custom save — keep
  // the gym page's derived views (today's plan, week grid) in sync.
  // Date navigation — view and edit any past day (the API accepts any non-future date).
  const shiftDate = (days) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    const nextStr = format(next, "yyyy-MM-dd");
    if (nextStr > TODAY) return; // never navigate into the future
    setCurrentDate(nextStr);
    setSetDrafts({}); // stale drafts from another date would mislead
    setPrExerciseId(null);
  };

  const goToday = () => {
    if (currentDate === TODAY) return;
    setCurrentDate(TODAY);
    setSetDrafts({});
    setPrExerciseId(null);
  };

  const handleSplitChanged = (nextDays) => {
    setSplitDays(nextDays);
    setWorkoutSchedule(
      SPLIT_DAYS.map((day) => ({ day, muscleGroups: nextDays[day] || ["Rest Day"] }))
    );
  };

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <style>{STALE_NOTICE_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="gym ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — title left, today's status right */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="m-h1">Gym</div>
              <div className="m-sub">
                {isToday
                  ? `${format(new Date(), "EEEE, d MMMM")} — ${muscleGroups.join(" & ")} day.`
                  : `${format(parseISO(currentDate), "EEEE, d MMMM")} — ${muscleGroups.join(" & ")} day.`}
              </div>
            </div>

            {/* Today's status — segmented switcher, Whisper-styled */}
            <div className="status-wrap" style={{ flex: "0 0 auto" }}>
              <span className="m-lbl" style={{ display: "block", marginBottom: 6 }}>Today&apos;s status</span>
              <div className="status-seg" role="group" aria-label="Today's gym status">
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

          {/* Consistency band — full width so the year map always fits.
              An 800px calendar can never live in a 360px sidebar without
              either bleeding over the workbench or shrinking to a sliver.
              Layout: streak-led hero strip (the number is the point), the
              year map as evidence below, legend riding one baseline. */}
          <div className="m-card m-in" style={{ marginBottom: 24 }}>
            <div className="m-card-h">
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--ac)" }}><Icon d={ICONS.flame} /></span>
                Consistency
              </h3>
              <div className="gy-year-tabs" role="tablist" aria-label="Heatmap year">
                {heatmapYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    role="tab"
                    aria-selected={heatmapYear === year}
                    className={`gy-year-tab${heatmapYear === year ? " is-active" : ""}`}
                    onClick={() => setHeatmapYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: 18 }}>
              {renderStaleNotice("consistency", "Couldn't refresh your training history — showing the last loaded data.")}
              <div className="gy-hero">
                <div className="gy-hero-cell is-hero">
                  <b className="m-num gy-hero-num">{heroStats.currentStreak}</b>
                  <span className="gy-hero-lbl">Day streak</span>
                </div>
                <div className="gy-hero-row">
                  <div className="gy-hero-cell">
                    <b className="m-num gy-hero-num">{heroStats.longestStreak}</b>
                    <span className="gy-hero-lbl">Longest</span>
                  </div>
                  <div className="gy-hero-cell">
                    <b className="m-num gy-hero-num">{heroStats.trainedDays}</b>
                    <span className="gy-hero-lbl">Trained days</span>
                  </div>
                </div>
              </div>

              <div className="gy-cell-hd">
                <span className="m-crumb">Every logged set feeds this map.</span>
                <span className="m-crumb" style={{ marginLeft: "auto" }}>Less</span>
                <span className="gy-legend" aria-hidden="true">
                  {(theme === "dark" ? DARK_RAMP : LIGHT_RAMP).map((c) => (
                    <i key={c} style={{ background: c }}></i>
                  ))}
                </span>
                <span className="m-crumb">More</span>
              </div>
              <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>{renderCalendar()}</div>
            </div>
          </div>

          <div className="gym-layout" style={{ display: "grid", gridTemplateColumns: "min(360px,100%) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
            {/* Left column: weight tracker */}
            <div className="gym-rail">
              {/* Weight tracker card */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.scale} /></span>
                    Body weight
                  </h3>
                  {editingTarget ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="400"
                        aria-label="Target weight in kilograms"
                        className="m-field m-num"
                        value={targetDraft}
                        autoFocus
                        onChange={(e) => setTargetDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setEditingTarget(false)}
                        style={{ width: 96, padding: "6px 10px" }}
                      />
                      <button
                        onClick={handleSaveTargetWeight}
                        disabled={savingTarget}
                        aria-label="Save target weight"
                        className="m-btn m-btn-primary"
                        style={{ padding: "6px 10px" }}
                      >
                        <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTarget(false)}
                        disabled={savingTarget}
                        aria-label="Cancel editing target weight"
                        className="m-btn"
                        style={{ padding: "6px 10px", border: "1px solid var(--line)", color: "var(--t2)", background: "var(--card)" }}
                      >
                        <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setTargetDraft(String(targetWeight));
                        setEditingTarget(true);
                      }}
                      className="m-crumb m-num"
                      style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit", color: "inherit", borderBottom: "1px dashed var(--t3)" }}
                      title="Edit target weight"
                    >
                      Target: {targetWeight} kg
                    </button>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  {renderStaleNotice("weight", "Couldn't refresh your weight — showing the last loaded entries.")}
                  <div style={{ height: 240, marginBottom: 14 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={[...weightEntries].sort(
                          (a, b) => new Date(a.date) - new Date(b.date),
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={RT_GRID} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={AXIS_TICK}
                          axisLine={{ stroke: RT_GRID }}
                          tickLine={false}
                          tickFormatter={(str) => format(parseISO(str), "MMM d")}
                        />
                        <YAxis
                          domain={["dataMin - 1", "dataMax + 1"]}
                          tick={AXIS_TICK}
                          axisLine={false}
                          tickLine={false}
                          width={34}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--line)",
                            borderRadius: "8px",
                            boxShadow: "0 8px 24px -8px rgba(26,26,30,.18)",
                            fontSize: 12,
                          }}
                          itemStyle={{ color: "#1a1a1e", fontWeight: 600 }}
                          labelStyle={{ color: "#6b6b76" }}
                          labelFormatter={(label) =>
                            format(parseISO(label), "MMMM d, yyyy")
                          }
                        />
                        <ReferenceLine
                          y={targetWeight}
                          stroke={theme === "dark" ? "#2e2e34" : "#c7d2fe"}
                          strokeDasharray="4 4"
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={{ fill: "var(--card)", stroke: "#4f46e5", strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <form onSubmit={handleAddWeight} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Today's weight (kg)"
                      aria-label="Today's weight in kilograms"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="m-field m-num"
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <button
                      type="submit"
                      aria-label="Log weight"
                      className="m-btn m-btn-primary"
                      style={{ padding: "10px 12px" }}
                    >
                      <Icon d={ICONS.plus} />
                    </button>
                  </form>

                  {/* Recent entries */}
                  <div className="gym-entries" style={{ marginTop: 12 }}>
                    {[...weightEntries]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((entry) => (
                        <div
                          key={entry._id}
                          className="rt-cell"
                          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "8px 10px" }}
                        >
                          <span className="m-crumb m-num">{format(new Date(entry.date), "d MMM yyyy")}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="m-num" style={{ fontSize: 13, fontWeight: 700 }}>{entry.weight} kg</span>
                            <button
                              onClick={() => handleDeleteWeight(entry._id, entry.weight)}
                              aria-label={`Delete weight entry from ${format(new Date(entry.date), "d MMM yyyy")}`}
                              style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 8, borderRadius: 6 }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
                            >
                              <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: plan + exercises */}
            <div style={{ display: "grid", gap: 20 }}>
              {/* Training split — shared manager (gallery + custom editor) */}
              <SplitManager
                initialDays={splitDays}
                initialSource={splitSource}
                onChanged={handleSplitChanged}
                pushToast={pushToast}
              />

              {/* Today's plan card */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.calendar} /></span>
                    {isToday ? "Today's plan" : "Workout plan"}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }} role="group" aria-label="Change the plan date">
                    <button
                      onClick={() => shiftDate(-1)}
                      aria-label="View the previous day"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--t2)", cursor: "pointer" }}
                    >
                      <span style={{ display: "inline-flex", transform: "rotate(90deg)" }} aria-hidden="true"><Icon d={ICONS.chevron} className="w-3.5 h-3.5" /></span>
                    </button>
                    <span className="m-chip m-chip-ac">
                      {isToday ? format(new Date(), "EEEE") : format(parseISO(currentDate), "EEE d MMM")}
                    </span>
                    <button
                      onClick={() => shiftDate(1)}
                      aria-label="View the next day"
                      disabled={isToday}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--t2)", cursor: isToday ? "default" : "pointer", opacity: isToday ? 0.4 : 1 }}
                    >
                      <span style={{ display: "inline-flex", transform: "rotate(-90deg)" }} aria-hidden="true"><Icon d={ICONS.chevron} className="w-3.5 h-3.5" /></span>
                    </button>
                  </div>
                </div>
                <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {renderStaleNotice("plan", "Couldn't load today's plan or exercises.")}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.2 }}>
                      {muscleGroups.join(" & ")}
                    </p>
                    <p className="m-sub" style={{ marginTop: 4 }}>
                      {isToday
                        ? "Track every set as you work — the log saves per exercise."
                        : "Viewing a past session — edits update that day's log."}
                    </p>
                  </div>
                  {!isToday && (
                    <button
                      onClick={goToday}
                      className="m-btn"
                      style={{ color: "var(--ac)", background: "none", fontSize: 12.5, padding: "6px 10px" }}
                    >
                      Back to today
                    </button>
                  )}
                  <span style={{ color: "var(--ac)", opacity: 0.85 }}>
                    <Icon d={ICONS.dumbbell} className="w-8 h-8" />
                  </span>
                </div>
              </div>

              {/* Exercises */}
              {(() => {
                const todaySchedule = workoutSchedule.find((d) => d.day === selectedDayName);

                // If rest day or no schedule
                if (
                  !todaySchedule ||
                  todaySchedule.muscleGroups.includes("Rest Day")
                ) {
                  return (
                    <div className="m-card m-in" style={{ padding: "40px 24px", textAlign: "center" }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: "50%", background: "var(--ac-soft)", color: "var(--ac)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                        }}
                        aria-hidden="true"
                      >
                        <Icon d={ICONS.bolt} className="w-6 h-6" />
                      </div>
                      <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 6 }}>
                        Rest & recovery
                      </p>
                      <p className="m-sub" style={{ maxWidth: 420, margin: "0 auto" }}>
                        Micro-tears build muscle, but rest repairs them. Fuel up today — tomorrow&apos;s session is where the plan resumes.
                      </p>
                    </div>
                  );
                }

                // Composite split names (from templates) expand to the granular
                // muscleGroup values the exercise library is actually tagged with.
                const COMPOSITE_GROUPS = {
                  "Upper Body": ["Chest", "Back", "Shoulders", "Bicep", "Tricep", "Forearms"],
                  "Lower Body": ["Legs", "Abs"],
                  "Push": ["Chest", "Shoulders", "Tricep"],
                  "Pull": ["Back", "Bicep", "Forearms"],
                  "Full Body": ["Chest", "Back", "Shoulders", "Bicep", "Tricep", "Forearms", "Legs", "Abs"],
                };
                const seenExerciseIds = new Set();

                // Group exercises by muscle group
                return expandMuscleGroups(todaySchedule.muscleGroups).map((group) => {
                  const memberGroups = COMPOSITE_GROUPS[group] || [group];
                  const groupExercises = exercises.filter(
                    (ex) => memberGroups.includes(ex.muscleGroup) && !seenExerciseIds.has(ex._id),
                  );
                  groupExercises.forEach((ex) => seenExerciseIds.add(ex._id));

                  if (groupExercises.length === 0) return null;

                  return (
                    <div key={group} className="m-in">
                      {/* Muscle group divider */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 2px" }}>
                        <div className="m-sep" style={{ flex: 1 }}></div>
                        <span className="m-lbl" style={{ margin: 0, color: "var(--t2)" }}>{group}</span>
                        <div className="m-sep" style={{ flex: 1 }}></div>
                      </div>

                      <div style={{ display: "grid", gap: 14 }}>
                        {groupExercises.map((ex) => (
                          <div key={ex._id} className="m-card" style={{ overflow: "hidden" }}>
                            <div className="m-card-h">
                              <div>
                                <h3 style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                  {toTitleCase(ex.name)}
                                  {savedExercises[ex._id] && (
                                    <span className="m-chip" style={{ background: "var(--green-soft)", color: "var(--green)" }}>
                                      <Icon d={ICONS.check} className="w-3 h-3" />
                                      Saved
                                    </span>
                                  )}
                                  {newPRs[ex._id] && (
                                    <span className="m-chip" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                                      <Icon d={ICONS.trophy} className="w-3 h-3" />
                                      New PR {newPRs[ex._id].newPR} kg{newPRs[ex._id].previousPR != null ? ` · was ${newPRs[ex._id].previousPR}` : ""}
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button
                                  onClick={() => handleOpenPRChart(ex._id)}
                                  aria-expanded={prExerciseId === ex._id}
                                  aria-label={`${toTitleCase(ex.name)} PR progression`}
                                  className="m-btn m-btn-ghost"
                                  style={{ padding: "7px 9px" }}
                                >
                                  <Icon d={ICONS.trend} className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSaveSessionSets(ex._id)}
                                  disabled={savingExercise === ex._id}
                                  className="m-btn m-btn-primary"
                                  style={{ padding: "7px 14px", fontSize: 12.5 }}
                                >
                                  {savingExercise === ex._id ? "Saving…" : "Log sets"}
                                </button>
                              </div>
                            </div>

                            <div style={{ padding: 16 }}>
                              {/* Warm-up + PR summary row — pencil affordances open inline editors */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                <div style={{ background: "var(--sunken)", borderRadius: 8, padding: "10px 12px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <span className="m-lbl">Warm up</span>
                                    <button
                                      onClick={() => openWarmUpEdit(ex)}
                                      aria-label={`Edit warm-up for ${ex.name}`}
                                      style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ac)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
                                    >
                                      <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {wuExerciseId === ex._id ? (
                                    <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                                      {wuDraft.map((set, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="kg"
                                            aria-label={`Warm-up set ${idx + 1} weight in kilograms`}
                                            value={set.weight}
                                            onChange={(e) => updateWuSet(idx, "weight", e.target.value)}
                                            className="m-field m-num"
                                            style={{ width: 78, padding: "5px 8px" }}
                                          />
                                          <span style={{ color: "var(--t3)", fontSize: 12 }}>×</span>
                                          <input
                                            type="number"
                                            min="0"
                                            placeholder="reps"
                                            aria-label={`Warm-up set ${idx + 1} repetitions`}
                                            value={set.reps}
                                            onChange={(e) => updateWuSet(idx, "reps", e.target.value)}
                                            className="m-field m-num"
                                            style={{ width: 64, padding: "5px 8px" }}
                                          />
                                          <button
                                            onClick={() => removeWuRow(idx)}
                                            aria-label={`Remove warm-up set ${idx + 1}`}
                                            style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 6, borderRadius: 6, flexShrink: 0 }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
                                          >
                                            <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                        <button
                                          onClick={addWuRow}
                                          className="m-btn"
                                          style={{ color: "var(--ac)", background: "none", padding: "3px 2px", fontSize: 12, width: "fit-content" }}
                                        >
                                          <Icon d={ICONS.plus} className="w-3.5 h-3.5" />
                                          Add
                                        </button>
                                        <button
                                          onClick={handleSaveWarmUp}
                                          disabled={savingWarmUp === wuExerciseId}
                                          className="m-btn m-btn-primary"
                                          style={{ padding: "5px 12px", fontSize: 12 }}
                                        >
                                          {savingWarmUp === wuExerciseId ? "Saving…" : "Save warm-up"}
                                        </button>
                                        <button
                                          onClick={() => setWuExerciseId(null)}
                                          aria-label="Cancel warm-up editing"
                                          style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 6 }}
                                        >
                                          <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginTop: 3 }}>
                                      {ex.warmUpSets?.length > 0 ? formatSetsDisplay(ex.warmUpSets) : ex.warmUp || "Not set"}
                                    </p>
                                  )}
                                </div>
                                <div style={{ background: "var(--sunken)", borderRadius: 8, padding: "10px 12px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <span className="m-lbl" style={{ color: "var(--amber)" }}>Personal best</span>
                                    <button
                                      onClick={() => openPrEdit(ex)}
                                      aria-label={`Edit personal best for ${ex.name}`}
                                      style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
                                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ac)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
                                    >
                                      <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {prEditExerciseId === ex._id ? (
                                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="1000"
                                        placeholder="kg"
                                        aria-label={`Personal best weight in kilograms for ${ex.name}`}
                                        className="m-field m-num"
                                        value={prEditDraft.weight}
                                        autoFocus
                                        onChange={(e) => setPrEditDraft((prev) => ({ ...prev, weight: e.target.value }))}
                                        style={{ width: 76, padding: "5px 8px" }}
                                      />
                                      <input
                                        type="date"
                                        max={TODAY}
                                        aria-label={`Date the personal best was set`}
                                        className="m-field m-num"
                                        value={prEditDraft.date}
                                        onChange={(e) => setPrEditDraft((prev) => ({ ...prev, date: e.target.value }))}
                                        style={{ width: 128, padding: "4px 8px", fontSize: 12 }}
                                      />
                                      <button
                                        onClick={handleSavePrEdit}
                                        disabled={savingPrEdit}
                                        aria-label="Save personal best"
                                        className="m-btn m-btn-primary"
                                        style={{ padding: "5px 8px" }}
                                      >
                                        <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setPrEditExerciseId(null)}
                                        aria-label="Cancel personal best editing"
                                        style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 6 }}
                                      >
                                        <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="m-num" style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginTop: 3 }}>
                                      {ex.prWeight != null ? `${ex.prWeight} kg` : ex.lastPR ? ex.lastPR : "None"}
                                      {ex.lastPRDate && (
                                        <span className="m-crumb" style={{ fontWeight: 500, marginLeft: 8 }}>
                                          {format(new Date(ex.lastPRDate), "d MMM yyyy")}
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Working sets — borderless editable rows */}
                              <div>
                                <span className="m-lbl" style={{ marginBottom: 6 }}>Working sets</span>
                                <div style={{ display: "grid", gap: 8 }}>
                                  {getSetsFor(ex._id).map((set, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span className="m-crumb m-num" style={{ width: 22, textAlign: "right", flexShrink: 0 }}>{idx + 1}</span>
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        placeholder="kg"
                                        aria-label={`Set ${idx + 1} weight in kilograms`}
                                        value={set.weight}
                                        onChange={(e) => updateSet(ex._id, idx, "weight", e.target.value)}
                                        className="m-field m-num"
                                        style={{ width: 90, padding: "7px 10px" }}
                                      />
                                      <span style={{ color: "var(--t3)", fontSize: 12 }}>×</span>
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="reps"
                                        aria-label={`Set ${idx + 1} repetitions`}
                                        value={set.reps}
                                        onChange={(e) => updateSet(ex._id, idx, "reps", e.target.value)}
                                        className="m-field m-num"
                                        style={{ width: 76, padding: "7px 10px" }}
                                      />
                                      <button
                                        onClick={() => removeSetRow(ex._id, idx)}
                                        aria-label={`Remove set ${idx + 1}`}
                                        style={{ color: "var(--t3)", background: "none", border: 0, cursor: "pointer", padding: 8, borderRadius: 6, flexShrink: 0 }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
                                      >
                                        <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addSetRow(ex._id)}
                                    className="m-btn"
                                    style={{ color: "var(--ac)", background: "none", padding: "4px 2px", fontSize: 12.5, width: "fit-content" }}
                                  >
                                    <Icon d={ICONS.plus} className="w-3.5 h-3.5" />
                                    Add set
                                  </button>
                                </div>
                              </div>

                              {/* PR progression chart */}
                              {prExerciseId === ex._id && (
                                <div style={{ marginTop: 14, background: "var(--sunken)", borderRadius: 8, padding: 14 }}>
                                  <p className="m-lbl" style={{ marginBottom: 10 }}>Top set weight — last 6 months</p>
                                  {renderStaleNotice("pr", "Couldn't load your PR history.")}
                                  {prSeries.length === 0 ? (
                                    <p className="m-sub" style={{ margin: 0 }}>
                                      No sets logged yet — save your working sets to build history.
                                    </p>
                                  ) : (
                                    <ResponsiveContainer width="100%" height={200}>
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
                                            borderRadius: "8px",
                                            boxShadow: "0 8px 24px -8px rgba(26,26,30,.18)",
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
                                          stroke="#4f46e5"
                                          strokeWidth={2}
                                          dot={{ r: 3, fill: "#4f46e5" }}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
