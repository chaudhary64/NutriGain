"use client";

import { useEffect, useState, cloneElement } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { format, parseISO, startOfYear } from "date-fns";
import { mergeSessionsIntoHeatmap } from "@/lib/heatmap";
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
.gym-toast{position:fixed;bottom:24px;right:24px;z-index:100;display:flex;flex-direction:column;gap:10px;width:calc(100% - 48px);max-width:380px}
.gym-toast-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--card);box-shadow:0 16px 40px -12px rgba(0,0,0,.5)}
.gym-toast-item.err{background:var(--red-soft);border-color:var(--red-soft-b)}
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
.gym .gym-layout > *{min-width:0}
.gym .m-card{min-width:0}
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
};

let toastSeq = 0;

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="gym-toast" aria-live="polite" role="status">
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
  const [workoutSchedule, setWorkoutSchedule] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [gymHistory, setGymHistory] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [todaySession, setTodaySession] = useState(null);
  const [yearSessions, setYearSessions] = useState([]); // lean sessions feeding the heatmap
  const [setDrafts, setSetDrafts] = useState({}); // exerciseId -> [{weight, reps}]
  const [savingExercise, setSavingExercise] = useState(null); // exerciseId being saved
  const [savedExercises, setSavedExercises] = useState({}); // exerciseId -> true (flash)
  const [newPRs, setNewPRs] = useState({}); // exerciseId -> { newPR, previousPR }
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [toasts, setToasts] = useState([]);

  // Stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayGymStatus, setTodayGymStatus] = useState("not-completed");
  const [targetWeight, setTargetWeight] = useState(75);

  // Forms
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [prExercise, setPrExercise] = useState(null); // exerciseId whose PR chart is open
  const [prSeries, setPrSeries] = useState([]);

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
    if (user && !user.isAdmin) {
      fetchData();
    }
  }, [user]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
        if (user && !user.isAdmin) {
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
      if (res.ok) {
        const data = await res.json();
        if (data.gymHistory) {
          setGymHistory(data.gymHistory);
          calculateStreaks(data.gymHistory);
        }
        if (data.dailyLog) {
          setTodayGymStatus(data.dailyLog.gymStatus || "not-completed");
        }
      }
    } catch (error) {
      console.error("Error fetching gym history:", error);
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

      if (Array.isArray(exercisesData)) setExercises(exercisesData);

      if (Array.isArray(scheduleData)) {
        const validMuscleGroups = [
          "Abs",
          "Back",
          "Bicep",
          "Chest",
          "Forearms",
          "Legs",
          "Rest Day",
          "Shoulders",
          "Tricep",
        ];
        const dayOrder = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const filteredSchedule = scheduleData
          .map((s) => ({
            ...s,
            muscleGroups: (s.muscleGroups || []).filter((g) =>
              validMuscleGroups.includes(g),
            ),
          }))
          .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        setWorkoutSchedule(filteredSchedule);
      }
    } catch (error) {
      console.error("Error fetching gym data:", error);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/workout-sessions?date=${currentDate}`);
      if (res.ok) {
        const data = await res.json();
        setTodaySession(data.session || null);
      }
    } catch (error) {
      console.error("Error fetching workout session:", error);
    }
  };

  const fetchYearSessions = async () => {
    try {
      const from = format(startOfYear(new Date()), "yyyy-MM-dd");
      const to = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(`/api/workout-sessions?from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setYearSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching year sessions:", error);
    }
  };

  const fetchWeightData = async () => {
    try {
      const res = await fetch("/api/weight");
      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
        setTargetWeight(data.targetWeight || 75);
      }
    } catch (error) {
      console.error("Error adding weight:", error);
    }
  };

  const calculateStreaks = (history) => {
    if (!history || history.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const completedDates = new Set(
      history
        .filter(
          (log) =>
            log.gymStatus === "completed" ||
            log.gymStatus === "partially-completed",
        )
        .map((log) => log.date),
    );

    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = format(checkDate, "yyyy-MM-dd");

      if (completedDates.has(dateStr)) {
        current++;
      } else if (i > 0) {
        break;
      }
    }

    let longest = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(completedDates).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round(
          (currDate - prevDate) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longest = Math.max(longest, tempStreak);

    setCurrentStreak(current);
    setLongestStreak(longest);
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
          calculateStreaks(data.gymHistory);
        }
        pushToast(status === prev ? `Status set to ${STATUS_META[status]?.label}.` : `Marked ${STATUS_META[status]?.label.toLowerCase()} for today.`);
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
    const logged = (todaySession?.exercises || []).find(
      (e) => e.exercise === exerciseId || e.exercise?.toString() === exerciseId,
    );
    return logged?.sets?.length ? [...logged.sets] : [{ weight: "", reps: "" }];
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
          pushToast("Sets logged for today.");
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
    if (prExercise === exerciseId) {
      setPrExercise(null);
      return;
    }
    setPrExercise(exerciseId);
    try {
      const res = await fetch(`/api/workout-sessions?exerciseId=${exerciseId}&months=6`);
      if (res.ok) {
        const data = await res.json();
        setPrSeries(data.series || []);
      }
    } catch (error) {
      console.error("Error fetching PR series:", error);
      setPrSeries([]);
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
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Real training data (sessions with numeric sets) merged under the
    // self-reported gym status — sessions only ever raise a day's level.
    const merged = mergeSessionsIntoHeatmap(gymHistory, yearSessions);
    const statusMap = new Map(merged.map((day) => [day.date, day]));

    const data = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      const dateStr = format(curr, "yyyy-MM-dd");
      const day = statusMap.get(dateStr);
      data.push({
        date: dateStr,
        count: day?.level || 0,
        level: day?.level || 0,
        volume: day?.volume || 0,
        hasSession: Boolean(day?.hasSession),
        gymStatus: day?.gymStatus || "not-completed",
      });
      curr.setDate(curr.getDate() + 1);
    }

    return (
      <>
        <ActivityCalendar
          data={data}
          theme={{
            light: LIGHT_RAMP,
            dark: DARK_RAMP,
          }}
          blockSize={10}
          blockMargin={4}
          colorScheme={theme === "dark" ? "dark" : "light"}
          showTotalCount={false}
          showColorLegend={false}
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
        <ReactTooltip id="react-tooltip" />
      </>
    );
  };

  const getTodayMuscleGroups = () => {
    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todaySchedule = workoutSchedule.find((s) => s.day === dayName);
    return todaySchedule ? todaySchedule.muscleGroups : ["Rest Day"];
  };

  const muscleGroups = getTodayMuscleGroups();

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="gym ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — title left, today's status right */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="m-h1">Gym</div>
              <div className="m-sub">
                {format(new Date(), "EEEE, d MMMM")} — {muscleGroups.join(" & ")} day.
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
              either bleeding over the workbench or shrinking to a sliver. */}
          <div className="m-card m-in" style={{ marginBottom: 24 }}>
            <div className="m-card-h">
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--ac)" }}><Icon d={ICONS.flame} /></span>
                Consistency
              </h3>
              <span className="m-crumb">This year</span>
            </div>
            <div style={{ padding: 18 }}>
              <div className="gym-stats-row">
                <div className="m-stat" style={{ background: "var(--sunken)", borderRadius: 8 }}>
                  <b className="m-num">{currentStreak}</b>
                  <span>Current streak</span>
                </div>
                <div className="m-stat" style={{ background: "var(--sunken)", borderRadius: 8 }}>
                  <b className="m-num">{longestStreak}</b>
                  <span>Longest streak</span>
                </div>
                {(() => {
                  const yearVolume = yearSessions.reduce(
                    (total, s) =>
                      total +
                      (s.exercises || []).reduce(
                        (t, ex) =>
                          t + (ex.sets || []).reduce((sum, set) => sum + set.weight * set.reps, 0),
                        0,
                      ),
                    0,
                  );
                  const trainedDays = yearSessions.length;
                  if (trainedDays === 0) return null;
                  return (
                    <>
                      <div className="m-stat" style={{ background: "var(--sunken)", borderRadius: 8 }}>
                        <b className="m-num">{trainedDays}</b>
                        <span>Trained days</span>
                      </div>
                      <div className="m-stat" style={{ background: "var(--sunken)", borderRadius: 8 }}>
                        <b className="m-num">{Math.round(yearVolume).toLocaleString()}</b>
                        <span>Kg lifted</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", paddingBottom: 8 }}>{renderCalendar()}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
                <p className="m-crumb">Every logged set feeds this map.</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} aria-hidden="true">
                  <span className="m-crumb">Less</span>
                  {(theme === "dark" ? DARK_RAMP : LIGHT_RAMP).map((c) => (
                    <span key={c} style={{ width: 9, height: 9, borderRadius: 2, background: c }}></span>
                  ))}
                  <span className="m-crumb">More</span>
                </span>
              </div>
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
                  <span className="m-crumb m-num">Target: {targetWeight} kg</span>
                </div>
                <div style={{ padding: 18 }}>
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
              {/* Today's plan card */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.calendar} /></span>
                    Today's plan
                  </h3>
                  <span className="m-chip m-chip-ac">{format(new Date(), "EEEE")}</span>
                </div>
                <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.2 }}>
                      {muscleGroups.join(" & ")}
                    </p>
                    <p className="m-sub" style={{ marginTop: 4 }}>
                      Track every set as you work — the log saves per exercise.
                    </p>
                  </div>
                  <span style={{ color: "var(--ac)", opacity: 0.85 }}>
                    <Icon d={ICONS.dumbbell} className="w-8 h-8" />
                  </span>
                </div>
              </div>

              {/* Exercises */}
              {(() => {
                const todaySchedule = workoutSchedule.find(
                  (d) =>
                    d.day ===
                    new Date().toLocaleDateString("en-US", { weekday: "long" }),
                );

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
                        Micro-tears build muscle, but rest repairs them. Fuel up today — tomorrow's session is where the plan resumes.
                      </p>
                    </div>
                  );
                }

                // Group exercises by muscle group
                return todaySchedule.muscleGroups.map((group) => {
                  const groupExercises = exercises.filter(
                    (ex) => ex.muscleGroup === group,
                  );

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
                                  aria-expanded={prExercise === ex._id}
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
                              {/* Template + PR summary row */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                <div style={{ background: "var(--sunken)", borderRadius: 8, padding: "10px 12px" }}>
                                  <span className="m-lbl" style={{ marginBottom: 3 }}>Warm up</span>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>
                                    {ex.warmUpSets?.length > 0 ? formatSetsDisplay(ex.warmUpSets) : ex.warmUp || "Not set"}
                                  </p>
                                </div>
                                <div style={{ background: "var(--sunken)", borderRadius: 8, padding: "10px 12px" }}>
                                  <span className="m-lbl" style={{ marginBottom: 3, color: "var(--amber)" }}>Personal best</span>
                                  <p className="m-num" style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
                                    {ex.prWeight != null ? `${ex.prWeight} kg` : ex.lastPR ? ex.lastPR : "None"}
                                    {ex.lastPRDate && (
                                      <span className="m-crumb" style={{ fontWeight: 500, marginLeft: 8 }}>
                                        {format(new Date(ex.lastPRDate), "d MMM yyyy")}
                                      </span>
                                    )}
                                  </p>
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
                              {prExercise === ex._id && (
                                <div style={{ marginTop: 14, background: "var(--sunken)", borderRadius: 8, padding: 14 }}>
                                  <p className="m-lbl" style={{ marginBottom: 10 }}>Top set weight — last 6 months</p>
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
