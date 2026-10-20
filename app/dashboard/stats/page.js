"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { format, parseISO, subDays } from "date-fns";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useTheme } from "@/context/ThemeContext";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as the other dashboards.      */
/* ------------------------------------------------------------------ */

const STATS_CSS = `
.st{color:var(--t1)}
.st .m-card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}
.st .m-card-h h3{font-size:13px;font-weight:600;letter-spacing:-.01em;color:var(--t1);margin:0}
/* Page eyebrow — Geist Mono, spec-sheet voice */
.st-kicker{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 8px}
/* Range segmented control — white rail, sunken active, ink label */
.st-seg{display:inline-flex;gap:2px;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:2px}
.st-seg button{border:0;background:transparent;font:inherit;font-size:12px;font-weight:500;color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;transition:background .15s,color .15s}
.st-seg button:hover{color:var(--t1)}
.st-seg button.on{background:var(--sunken);color:var(--t1)}
.st-seg button:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(0,112,243,.2)}
/* Masthead + window meta — the range is stated as a fact under the title. */
.st-mast{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.st-meta{display:flex;flex-wrap:wrap;align-items:center;gap:5px 10px;margin:0 0 20px;padding-top:14px;border-top:1px solid var(--line);font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);font-variant-numeric:tabular-nums}
.st-meta span + span::before{content:"·";margin-right:10px;color:var(--faint)}
.st-meta .st-meta-r{margin-left:auto;color:var(--t2)}
.st-meta .st-meta-r::before{content:none}

/* Lead plate — one bordered band holding the page's three readings, split
   by hairlines. This is the answer; the cards below are the evidence. */
.st-lead{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--line);border-radius:12px;background:var(--card);margin-bottom:20px;overflow:hidden}
.st-cell{padding:17px 20px 18px;min-width:0;border-left:1px solid var(--line)}
.st-cell:first-child{border-left:0}
.st-lbl2{display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)}
.st-figure{display:flex;align-items:baseline;gap:6px;margin-top:9px;font-size:33px;font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums}
.st-figure small{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;color:var(--t3)}
.st-note{margin:9px 0 0;font-size:12px;line-height:1.45;color:var(--t3);font-variant-numeric:tabular-nums}
.st-note b{font-weight:500;color:var(--t1)}
.st-spark{display:block;width:100%;height:26px;margin-top:12px;overflow:visible}
.st-meter{height:4px;border-radius:999px;background:var(--track);margin-top:13px;overflow:hidden}
.st-meter i{display:block;height:100%;border-radius:999px;background:var(--ac)}
.st-dots{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;margin-top:13px}
.st-dots i{display:block;height:12px;border-radius:1px;background:var(--line)}
.st-dots i.m{background:var(--t3)}
.st-dots i.s{background:var(--pro)}
.st-dots i.b{background:var(--ac)}
@media(max-width:860px){.st-lead{grid-template-columns:minmax(0,1fr)}.st-cell{border-left:0;border-top:1px solid var(--line)}.st-cell:first-child{border-top:0}}

/* Section index — the page reads as a numbered report, not a widget board. */
.st-idx{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;color:var(--faint)}

/* Figure row — bare readings sitting on the rule, not boxed tiles. */
.st-figs{display:flex;flex-wrap:wrap;margin-bottom:18px}
.st-fig{padding:0 16px;border-left:1px solid var(--line);min-width:0}
.st-fig:first-child{padding-left:0;border-left:0}
.st-fig b{display:block;font-size:22px;font-weight:600;letter-spacing:-.03em;line-height:1.1;font-variant-numeric:tabular-nums;color:var(--t1)}
.st-fig span{display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-top:5px}
@media(max-width:520px){.st-figs{gap:14px 0}.st-fig{padding:0 12px}.st-fig b{font-size:19px}}

/* Macro meters — the goal is the full track, so the gap is legible. */
.st-macros{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:18px 22px}
.st-macro{min-width:0}
.st-macro b{display:flex;align-items:baseline;gap:5px;margin-top:7px;font-size:20px;font-weight:600;letter-spacing:-.03em;line-height:1.15;font-variant-numeric:tabular-nums;color:var(--t1)}
.st-macro b small{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.04em;color:var(--t3)}
.st-mbar{height:4px;border-radius:999px;background:var(--track);margin-top:8px;overflow:hidden}
.st-mbar i{display:block;height:100%;border-radius:999px;background:var(--ac)}
.st-mbar i.over{background:var(--car)}
.st-mfoot{margin-top:7px;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);font-variant-numeric:tabular-nums}
.st-caps{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);font-variant-numeric:tabular-nums}
/* Weekly rows */
.st-week{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px}
.st-week:last-child{border-bottom:0}
.st-week .st-wk-date{width:92px;color:var(--t2);font-weight:400;flex-shrink:0}
.st-week .st-wk-bar{flex:1;height:6px;border-radius:999px;background:var(--track);overflow:hidden}
.st-week .st-wk-bar i{display:block;height:100%;border-radius:999px;background:var(--ac)}
.st-week .st-wk-val{width:146px;text-align:right;color:var(--t1);font-weight:500;font-variant-numeric:tabular-nums;flex-shrink:0}
/* Consistency legend */
.st-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:11px;font-weight:400;color:var(--t3)}
.st-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px;border:1px solid var(--line)}
/* Empty states read as a note in the card, not a dashed placeholder. */
.st-empty{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:6px 0 2px;font-size:13px;line-height:1.5;color:var(--t3)}
/* A band with no data still spans the band: note left, action right. */
.st-empty-row{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:4px 0 2px;font-size:13px;line-height:1.5;color:var(--t3)}
.st-empty-row a{color:var(--t1);font-weight:500;white-space:nowrap}
/* Year switcher — GitHub-profile model, shared with the gym card: one
   calendar on screen; the chip row in the card header selects the year. */
.gy-year-tabs{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.gy-year-tab{appearance:none;border:1px solid var(--line);background:var(--card);color:var(--t2);font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;font-variant-numeric:tabular-nums;padding:4px 11px;border-radius:999px;cursor:pointer;transition:color .15s,border-color .15s,background .15s}
.gy-year-tab:hover{color:var(--t1);border-color:var(--t2)}
.gy-year-tab.is-active{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.gy-year-map{overflow-x:auto;width:100%;max-width:100%}
.gy-year-hd{display:flex;align-items:baseline;gap:10px;margin:14px 0 8px}
/* Inline loading + error states (same ring language as components/Loader) */
.st-loading{display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 0;color:var(--t3)}
.st-loading i{display:block;width:32px;height:32px;border-radius:9999px;border:3px solid var(--line);border-top-color:var(--ac);animation:st-spin .8s linear infinite}
.st-loading p{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin:0}
@keyframes st-spin{to{transform:rotate(360deg)}}
.st-error{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:20px;border:1px solid var(--red-soft-b);background:var(--red-soft);border-radius:6px}
.st-error p{font-size:13px;font-weight:400;color:var(--red);margin:0}
.st-error button{font:inherit;font-size:13px;font-weight:500;color:var(--on-ac);background:var(--red);border:none;border-radius:6px;padding:8px 14px;cursor:pointer;transition:background .15s}
.st-error button:hover{background:var(--red-deep)}
.st-error button:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(0,112,243,.2)}
/* Full-width evidence bands. Side-by-side cards of unequal height leave a
   dead column under the shorter one — a band per section never does. */
.st-bands{display:flex;flex-direction:column;gap:20px;margin-bottom:20px}
/* Weekly rows span the band edge to edge — a half-filled row would put the
   void back, just horizontally. */
.st-weeks{margin-top:10px}
/* Weight logging — sits under the chart it feeds. */
.st-input{height:34px;padding:0 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--t1);font:inherit;font-size:13px;font-variant-numeric:tabular-nums;min-width:0}
.st-input::placeholder{color:var(--t3)}
.st-input:focus{outline:none;border-color:var(--t1)}
.st-input:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
.st-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 14px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--t1);font:inherit;font-size:13px;font-weight:500;letter-spacing:-.01em;cursor:pointer;transition:background .15s,color .15s}
.st-btn:hover{background:var(--sunken)}
.st-btn.primary{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.st-btn.primary:hover{background:var(--ach)}
.st-btn:disabled{opacity:.5;cursor:wait}
.st-btn:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
.st-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:5px;background:none;color:var(--t3);cursor:pointer}
.st-icon-btn:hover{background:var(--sunken);color:var(--t1)}
.st-icon-btn:focus-visible{outline:2px solid var(--t1);outline-offset:1px}
/* Body split — the chart gets the width it needs; the weigh-in ledger sits
   beside it so the card never becomes a chart floating in empty space. */
.st-wt{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(258px,.85fr)}
.st-wt-main{padding:16px 18px;min-width:0}
.st-wt-side{padding:16px 18px;border-left:1px solid var(--line);display:flex;flex-direction:column;gap:16px;min-width:0}
@media(max-width:900px){.st-wt{grid-template-columns:minmax(0,1fr)}.st-wt-side{border-left:0;border-top:1px solid var(--line)}}
.st-side-h{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:2px}
.st-weigh-row{display:flex;align-items:center;gap:8px;margin-top:9px}
.st-weigh-row .st-input{width:92px;flex-shrink:0}
.st-weigh-row .st-btn{flex:0 0 auto;padding:0 12px}
.st-wt-side .st-entries{grid-template-columns:minmax(0,1fr);gap:0;margin-top:0}
.st-wt-side .st-entry{padding:6px 0;font-size:12px}
.st-wt-side .st-entry b{font-size:13px}
.st-weight-unit{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.st-weight-target{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.st-target{display:inline-flex;align-items:baseline;gap:6px;border:0;border-bottom:1px dashed var(--t3);background:none;padding:0 0 2px;color:var(--t2);font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
.st-target b{color:var(--t1);font-family:inherit;font-size:11px}
.st-target:hover{color:var(--t1);border-color:var(--t1)}
.st-target-edit{display:flex;align-items:center;gap:4px}
.st-target-edit .st-input{width:66px;height:30px;padding:0 8px}
.st-weight-note{margin:10px 0 0;font-size:12px;color:var(--t3)}
.st-weight-note.err{color:var(--red)}
.st-entries{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin-top:12px}
.st-entry{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--t2)}
.st-entry b{font-size:14px;font-weight:600;letter-spacing:-.01em;color:var(--t1);font-variant-numeric:tabular-nums}
.st-entry b span{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.04em;color:var(--t3);margin-left:3px}
.st-entry-r{display:flex;align-items:center;gap:2px}
@media(max-width:640px){.st-entries{grid-template-columns:1fr}.st-weight-target{margin-left:0}}
`;

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);const ICONS = {
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  check: <path d="M5 13l4 4L19 7" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
};

const RANGES = [7, 30, 90];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Ink scale — the calendar reads as a print density ramp, not a colour key. */
const LIGHT_RAMP = ["#f2f2f2", "#d4d4d4", "#a1a1a1", "#6b6b6b", "#171717"];
const DARK_RAMP = ["#1f1f1f", "#333333", "#666666", "#a1a1a1", "#ededed"];

/**
 * Build the selected year's Jan 1 → Dec 31 day list from the sparse
 * yearMap — future days of the running year stay blank, as GitHub's
 * profile graph does.
 */
function buildYearCalendarData(yearMap, year) {
  const byDate = new Map((yearMap || []).map((d) => [d.date, d]));
  const data = [];
  const end = new Date(year, 11, 31);
  let curr = new Date(year, 0, 1);
  while (curr <= end) {
    const dateStr = format(curr, "yyyy-MM-dd");
    const day = byDate.get(dateStr);
    data.push({
      date: dateStr,
      count: day ? 1 : 0,
      level: day ? 1 : 0,
      meals: Boolean(day?.meals),
      session: Boolean(day?.session),
    });
    curr.setDate(curr.getDate() + 1);
  }
  return data;
}

const fmtDate = (dateStr) => format(parseISO(`${dateStr}T00:00:00`), "MMM d");

/** Share of a goal, clamped so a heavy day still fills exactly the track. */
const goalPct = (value, goal) => (goal > 0 && Number.isFinite(value) ? Math.min(100, Math.round((value / goal) * 100)) : 0);

/** Signed one-decimal delta, e.g. "−2.0". */
const signed = (n) => `${n > 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}`;

export default function StatsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear()); // selected calendar year (chip switcher)
  const [weight, setWeight] = useState({ entries: [], targetWeight: 75 });
  const [weightError, setWeightError] = useState("");
  // Weight editing lives here now that the gym page is session-only.
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);
  const [weightNote, setWeightNote] = useState(null); // { text, tone }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // Note: no synchronous setLoading(true) here — while a new range
    // loads, the previous range's stats stay visible (stale-while-revalidate).
    fetch(`/api/stats?days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Network error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetch("/api/weight")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled && data) {
          setWeight({ entries: data.weightEntries || [], targetWeight: data.targetWeight || 75 });
          setWeightError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setWeightError(err?.message || "Network error");
      });
    return () => {
      cancelled = true;
    };
  }, [user, days, tick]);

  const goals = user?.macroGoals || FALLBACK_MACRO_GOALS;

  const weightRows = useMemo(
    () =>
      [...weight.entries]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-90)
        .map((e) => ({ date: format(new Date(e.date), "yyyy-MM-dd"), weight: e.weight })),
    [weight.entries]
  );

  const latestWeight = weightRows.length > 0 ? weightRows[weightRows.length - 1].weight : null;
  const firstWeight = weightRows.length > 0 ? weightRows[0].weight : null;
  const weightChange = latestWeight != null && firstWeight != null ? Math.round((latestWeight - firstWeight) * 10) / 10 : null;

  /* Sparkline geometry for the lead plate's weight reading — a line plus a
     closed area, so two weigh-ins still read as a chart and not a rule. */
  const weightSpark = useMemo(() => {
    const rows = weightRows.slice(-30).map((r) => r.weight);
    if (rows.length < 2) return null;
    const min = Math.min(...rows);
    const max = Math.max(...rows);
    const span = max - min || 1;
    const pts = rows.map((w, i) => [
      (i / (rows.length - 1)) * 100,
      22 - ((w - min) / span) * 16,
    ]);
    const poly = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`);
    return {
      line: poly.join(" "),
      area: `M${poly.join(" L")} L100,26 L0,26 Z`,
    };
  }, [weightRows]);

  /* The year calendar is sized from its container so the map fills the card
     instead of ending in a dead column of whitespace. */
  const heatRef = useRef(null);
  const [heatWidth, setHeatWidth] = useState(0);
  useEffect(() => {
    const el = heatRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      // Ignore sub-pixel churn; only a real column change should re-tile.
      if (w > 0) setHeatWidth((prev) => (Math.abs(prev - w) > 2 ? w : prev));
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
    // The map only exists once stats have loaded, so measure again then.
  }, [stats]);

  /* Last 30 calendar days of activity, independent of the selected window
     so the strip keeps a fixed resolution — meals, sessions, or both. */
  const recent30 = useMemo(() => {
    const byDate = new Map((stats?.consistency?.yearMap || []).map((d) => [d.date, d]));
    return Array.from({ length: 30 }, (_, i) => {
      const key = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
      const day = byDate.get(key);
      return {
        key,
        both: Boolean(day?.meals && day?.session),
        meals: Boolean(day?.meals),
        session: Boolean(day?.session),
      };
    });
  }, [stats]);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(newWeight);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setWeightNote({ text: "Enter a weight in kilograms first (e.g. 74.5).", tone: "err" });
      return;
    }

    setSavingWeight(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parsed, date: format(new Date(), "yyyy-MM-dd") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWeightNote({ text: data.error || "Couldn't log that weight. Check the value and retry.", tone: "err" });
        return;
      }
      setWeight((prev) => ({ ...prev, entries: data.weightEntries || prev.entries }));
      setNewWeight("");
      setWeightError("");
      setWeightNote({ text: `Logged ${parsed} kg for ${format(new Date(), "d MMM")}.`, tone: "ok" });
    } catch (err) {
      setWeightNote({ text: `Network error — your weight wasn't logged. ${err?.message || "Try again."}`, tone: "err" });
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (entryId, weightKg) => {
    try {
      const res = await fetch(`/api/weight/${entryId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWeightNote({ text: data.error || "Couldn't remove that entry. Try again.", tone: "err" });
        return;
      }
      setWeight((prev) => ({
        ...prev,
        entries: data.weightEntries || prev.entries.filter((entry) => entry._id !== entryId),
      }));
      setWeightNote({ text: `Removed the ${weightKg} kg entry.`, tone: "ok" });
    } catch (err) {
      setWeightNote({ text: `Network error — the entry is still there. ${err?.message || "Try again."}`, tone: "err" });
    }
  };

  const handleSaveTarget = async () => {
    const parsed = parseFloat(targetDraft);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 400) {
      setWeightNote({ text: "Target weight must be between 20 and 400 kg.", tone: "err" });
      return;
    }

    setSavingTarget(true);
    try {
      const res = await fetch("/api/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetWeight: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWeightNote({ text: data.error || "Couldn't update the target weight. Try again.", tone: "err" });
        return;
      }
      setWeight((prev) => ({ ...prev, targetWeight: data.targetWeight ?? parsed }));
      setEditingTarget(false);
      setWeightNote({ text: `Target weight set to ${parsed} kg.`, tone: "ok" });
    } catch (err) {
      setWeightNote({ text: `Network error — target weight wasn't saved. ${err?.message || "Try again."}`, tone: "err" });
    } finally {
      setSavingTarget(false);
    }
  };

  if (!user) {
    return null;
  }

  const nutrition = stats?.nutrition;
  const training = stats?.training;
  const consistency = stats?.consistency;
  const avg = nutrition?.overallAvg;
  const weeks = (nutrition?.weekly || []).slice(-5);
  const trainingWeeks = (training?.weekly || []).slice(-5);
  const maxTrainingVolume = Math.max(1, ...trainingWeeks.map((w) => w.volume));

  // Consistency year switcher — GitHub-profile model, matching the gym
  // card: one calendar on screen; chips select the year (current year
  // plus prior years the account existed for, capped at 3).
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

  // Activity-state fills keep the strip's semantic families (accent for
  // meals+session, soft accent for meals, violet "pro" for session) in
  // both themes — solid enough to read on the calendar's grid.
  const dark = theme === "dark";
  const yearFill = {
    both: dark ? "#ededed" : "#171717",
    meals: dark ? "#8f8f8f" : "#a1a1a1",
    session: dark ? "#a78bfa" : "#7928ca",
  };

  const renderYearHeatmap = () => {
    const yearData = buildYearCalendarData(consistency?.yearMap, heatmapYear);
    const yearSessions = yearData.filter((d) => d.session).length;
    const yearActive = yearData.filter((d) => d.meals || d.session).length;
    // 53 week columns + a 46px weekday gutter; squares grow with the card
    // (10px on a narrow viewport, up to 17px on a wide one).
    const blockSize = heatWidth ? Math.max(8, Math.min(17, Math.floor((heatWidth - 42) / 53) - 4)) : 10;
    return (
      <>
        <div className="gy-year-hd">
          <span className="m-crumb m-num">
            {heatmapYear} · {yearActive} active {yearActive === 1 ? "day" : "days"} · {yearSessions} {yearSessions === 1 ? "session" : "sessions"}
          </span>
        </div>
        <div className="gy-year-map" ref={heatRef}>
          <ActivityCalendar
            data={yearData}
            theme={{ light: LIGHT_RAMP, dark: DARK_RAMP }}
            blockSize={blockSize}
            blockMargin={4}
            colorScheme={dark ? "dark" : "light"}
            showTotalCount={false}
            showColorLegend={false}
            showMonthLabels="if-needed"
            showWeekdayLabels={WEEKDAY_LABELS}
            style={{ width: "100%", minWidth: "800px" }}
            renderBlock={(block, activity) =>
              cloneElement(block, {
                ...(activity.meals || activity.session
                  ? { fill: activity.meals && activity.session ? yearFill.both : activity.meals ? yearFill.meals : yearFill.session }
                  : {}),
                "data-tooltip-id": "st-tooltip",
                "data-tooltip-content": `${format(parseISO(activity.date), "d MMMM yyyy")} • ${
                  activity.meals && activity.session
                    ? "Meals + session"
                    : activity.meals
                      ? "Meals logged"
                      : activity.session
                        ? "Workout session"
                        : "No activity"
                }`,
              })
            }
          />
        </div>
        <ReactTooltip id="st-tooltip" />
      </>
    );
  };

  return (
    <AppShell>
      <style>{STATS_CSS}</style>
      <div className="st ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
        {/* Header + range selector */}
        <div className="st-mast">
          <div>
            <p className="st-kicker">Insights · Trends</p>
            <div className="m-h1">Progress</div>
            <div className="m-sub">Nutrition, training, and consistency — one window at a time.</div>
          </div>
          <div className="st-seg" role="radiogroup" aria-label="Stats window">
            {RANGES.map((r) => (
              <button key={r} type="button" role="radio" aria-checked={days === r} className={days === r ? "on" : ""} onClick={() => setDays(r)}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <div className="st-meta">
            <span className="m-num">
              {fmtDate(stats.range.from)} – {format(parseISO(`${stats.range.to}T00:00:00`), "d MMM yyyy")}
            </span>
            <span>{stats.range.days}-day window</span>
            <span>
              {nutrition.daysLogged} {nutrition.daysLogged === 1 ? "day" : "days"} logged
            </span>
            <span>
              {training.sessionsInRange} {training.sessionsInRange === 1 ? "session" : "sessions"}
            </span>
            {days > 7 && <span className="st-meta-r">{nutrition.daysLoggedLast7} logged in last 7</span>}
          </div>
        )}

        {loading && !stats && (
          <div className="st-loading" role="status" aria-live="polite">
            <i aria-hidden="true" />
            <p>Loading your stats…</p>
          </div>
        )}

        {!loading && !stats && error && (
          <div className="st-error" role="alert">
            <p>Couldn&apos;t load your stats — {error}. Check your connection and try again.</p>
            <button type="button" onClick={() => setTick((t) => t + 1)}>
              Try again
            </button>
          </div>
        )}

        {stats && error && !loading && (
          <p className="m-crumb" role="alert" style={{ color: "var(--red)", fontWeight: 400, margin: "-8px 0 12px" }}>
            Couldn&apos;t refresh — showing the last loaded data.
          </p>
        )}

        {/* ---------------------- The window, answered ---------------------- */}
        {stats && (
          <section className="st-lead m-in" aria-label="This window at a glance">
            <div className="st-cell">
              <span className="st-lbl2">Weight</span>
              <div className="st-figure">
                {latestWeight != null ? (
                  <>
                    {latestWeight}
                    <small>kg</small>
                  </>
                ) : (
                  <small>no weigh-ins</small>
                )}
              </div>
              <p className="st-note">
                {latestWeight != null ? (
                  <>
                    {weightChange != null && weightChange !== 0 ? <b>{signed(weightChange)} kg</b> : <b>flat</b>} since {weightRows.length > 0 ? fmtDate(weightRows[0].date) : "—"} · {signed(Math.round((latestWeight - weight.targetWeight) * 10) / 10)}{" "}
                    kg vs target
                  </>
                ) : (
                  "The trend starts with one weigh-in."
                )}
              </p>
              {weightSpark ? (
                <svg className="st-spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
                  <path d={weightSpark.area} fill="var(--sunken)" />
                  <polyline
                    points={weightSpark.line}
                    fill="none"
                    stroke="var(--t2)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <div className="st-spark" />
              )}
            </div>

            <div className="st-cell">
              <span className="st-lbl2">Intake · daily avg</span>
              <div className="st-figure">
                {nutrition.daysLogged > 0 ? (
                  <>
                    {avg.calories.toLocaleString()}
                    <small>kcal</small>
                  </>
                ) : (
                  <small>nothing logged</small>
                )}
              </div>
              <div className="st-meter" aria-hidden="true">
                <i style={{ width: `${goalPct(avg?.calories || 0, goals.calories)}%` }} />
              </div>
              <p className="st-note">
                {nutrition.daysLogged > 0 ? (
                  <>
                    {goalPct(avg.calories, goals.calories)}% of {goals.calories.toLocaleString()} goal · {avg.protein}P {avg.carbs}C {avg.fats}F
                  </>
                ) : (
                  "Log a meal to start this reading."
                )}
              </p>
            </div>

            <div className="st-cell">
              <span className="st-lbl2">Rhythm · last 30 days</span>
              <div className="st-figure">
                {consistency.currentStreak}
                <small>day streak</small>
              </div>
              <p className="st-note">
                <b>{consistency.loggedDays}</b> of {consistency.totalDays} days logged · {training.sessionsInRange}{" "}
                {training.sessionsInRange === 1 ? "session" : "sessions"}
              </p>
              <div className="st-dots" role="img" aria-label="Activity over the last 30 days">
                {recent30.map((d) => (
                  <i
                    key={d.key}
                    className={d.both ? "b" : d.meals ? "m" : d.session ? "s" : ""}
                    title={`${format(parseISO(`${d.key}T00:00:00`), "d MMM")} — ${d.both ? "meals + session" : d.meals ? "meals" : d.session ? "session" : "no activity"}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {stats && (
          <>
            {/* ---------------------- Weight trend + logging ---------------------- */}
            <div className="m-card m-in" style={{ marginBottom: 20 }}>
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="st-idx">01</span>
                  Weight trend
                </h3>
                <span className="st-weight-target">
                  {editingTarget ? (
                    <span className="st-target-edit">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="20"
                        max="400"
                        aria-label="Target weight in kilograms"
                        className="st-input"
                        value={targetDraft}
                        autoFocus
                        onChange={(e) => setTargetDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingTarget(false);
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveTarget();
                          }
                        }}
                      />
                      <button type="button" className="st-icon-btn" aria-label="Save target weight" onClick={handleSaveTarget} disabled={savingTarget}>
                        <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="st-icon-btn" aria-label="Cancel target editing" onClick={() => setEditingTarget(false)} disabled={savingTarget}>
                        <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="st-target"
                      title="Edit target weight"
                      onClick={() => {
                        setTargetDraft(String(weight.targetWeight));
                        setEditingTarget(true);
                      }}
                    >
                      Target <b>{weight.targetWeight} kg</b>
                      <Icon d={ICONS.pencil} className="w-3 h-3" />
                    </button>
                  )}
                </span>
              </div>

              <div className="st-wt">
                <div className="st-wt-main">
                  {weightError && weightRows.length > 0 && (
                    <p className="m-crumb" role="alert" style={{ color: "var(--red)", fontWeight: 400, margin: "0 0 12px" }}>
                      Couldn&apos;t refresh your weight — showing the last loaded entries.
                    </p>
                  )}
                  {weightError && weightRows.length === 0 ? (
                    <div className="st-error" role="alert">
                      <p>Couldn&apos;t load your weight data — {weightError}.</p>
                      <button type="button" onClick={() => setTick((t) => t + 1)}>
                        Try again
                      </button>
                    </div>
                  ) : weightRows.length < 2 ? (
                    <div className="st-empty">
                      {weightRows.length === 0
                        ? "No weigh-ins yet — log today's weight to start the trend."
                        : "One entry so far — log another day to draw the trend."}
                    </div>
                  ) : (
                    <div style={{ height: 236 }}>
                      <ResponsiveContainer width="100%" height={236}>
                        <AreaChart data={weightRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="st-wt-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--ac)" stopOpacity={0.16} />
                              <stop offset="100%" stopColor="var(--ac)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "var(--t3)" }}
                            axisLine={{ stroke: "var(--line)" }}
                            tickLine={false}
                            tickFormatter={fmtDate}
                            minTickGap={28}
                          />
                          <YAxis
                            /* Keep the target line on-chart even when it sits
                               outside the logged range (a 79 kg goal over a
                               72–75 kg stretch would otherwise vanish). */
                            domain={[(min) => Math.min(min - 1, weight.targetWeight - 1), (max) => Math.max(max + 1, weight.targetWeight + 1)]}
                            tick={{ fontSize: 10, fill: "var(--t3)" }}
                            axisLine={false}
                            tickLine={false}
                            width={34}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--line)", borderRadius: "6px", fontSize: 12, boxShadow: "var(--ng-shadow-2)" }}
                            itemStyle={{ color: "var(--t1)", fontWeight: 500 }}
                            labelStyle={{ color: "var(--t3)" }}
                            labelFormatter={(label) => format(parseISO(`${label}T00:00:00`), "MMMM d, yyyy")}
                          />
                          <ReferenceLine
                            y={weight.targetWeight}
                            stroke="var(--t3)"
                            strokeDasharray="4 4"
                            label={{ value: `target ${weight.targetWeight} kg`, position: "insideTopRight", fill: "var(--t3)", fontSize: 10 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="var(--ac)"
                            strokeWidth={2}
                            fill="url(#st-wt-fill)"
                            /* A ledger reading should be complete on arrival —
                               the sweeping draw-in only muddies the window. */
                            isAnimationActive={false}
                            dot={{ fill: "var(--card)", stroke: "var(--ac)", strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <p className="st-caps" style={{ marginTop: 12 }}>
                    Dashed rule marks target · {weightRows.length} weigh-ins plotted
                  </p>
                </div>

                <aside className="st-wt-side">
                  <form onSubmit={handleAddWeight}>
                    <label htmlFor="st-weight" className="st-lbl2">
                      Today&apos;s weigh-in
                    </label>
                    <div className="st-weigh-row">
                      <input
                        id="st-weight"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        max="400"
                        placeholder={latestWeight != null ? String(latestWeight) : "72.5"}
                        aria-label="Today's weight in kilograms"
                        className="st-input"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                      />
                      <span className="st-weight-unit">kg</span>
                      <button type="submit" className="st-btn primary" disabled={savingWeight}>
                        {savingWeight ? "Saving…" : "Log"}
                      </button>
                    </div>
                    {weightNote && (
                      <p className={`st-weight-note${weightNote.tone === "err" ? " err" : ""}`} role={weightNote.tone === "err" ? "alert" : "status"}>
                        {weightNote.text}
                      </p>
                    )}
                  </form>

                  <div>
                    <div className="st-side-h">
                      <span className="st-lbl2">Recent</span>
                      <span className="st-caps">{weight.entries.length} total</span>
                    </div>
                    {weight.entries.length === 0 ? (
                      <p className="st-weight-note" style={{ marginTop: 6 }}>
                        Nothing logged yet.
                      </p>
                    ) : (
                      <div className="st-entries">
                        {[...weight.entries]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 6)
                          .map((entry) => (
                            <div className="st-entry" key={entry._id}>
                              <span className="m-num">{format(new Date(entry.date), "d MMM yyyy")}</span>
                              <span className="st-entry-r">
                                <b className="m-num">
                                  {entry.weight}
                                  <span>kg</span>
                                </b>
                                <button
                                  type="button"
                                  className="st-icon-btn"
                                  aria-label={`Delete weight entry from ${format(new Date(entry.date), "d MMM yyyy")}`}
                                  onClick={() => handleDeleteWeight(entry._id, entry.weight)}
                                >
                                  <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>

            <div className="st-bands">
              {/* ---------------------- Weekly macros vs goals ---------------------- */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="st-idx">02</span>
                    Nutrition
                  </h3>
                  <span className="m-crumb m-num">
                    avg of {nutrition.daysLogged} logged {nutrition.daysLogged === 1 ? "day" : "days"}
                  </span>
                </div>
                <div style={{ padding: 18 }}>
                  {nutrition.daysLogged === 0 ? (
                    <div className="st-empty-row">
                      <span>No meals logged in this window yet.</span>
                      <Link href="/dashboard/meal" className="m-crumb">
                        Log your first meal →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="st-macros">
                        {[
                          { key: "calories", label: "Calories", unit: "kcal", value: avg.calories, goal: goals.calories },
                          { key: "protein", label: "Protein", unit: "g", value: avg.protein, goal: goals.protein },
                          { key: "carbs", label: "Carbs", unit: "g", value: avg.carbs, goal: goals.carbs },
                          { key: "fats", label: "Fats", unit: "g", value: avg.fats, goal: goals.fats },
                        ].map((m) => (
                          <div className="st-macro" key={m.key}>
                            <span className="st-lbl2">{m.label}</span>
                            <b className="m-num">
                              {m.value.toLocaleString()}
                              <small>
                                {m.unit}/day
                              </small>
                            </b>
                            <div className="st-mbar" aria-hidden="true">
                              <i
                                className={m.value > m.goal * 1.05 ? "over" : ""}
                                style={{ width: `${goalPct(m.value, m.goal)}%` }}
                              />
                            </div>
                            <div className="st-mfoot">
                              {goalPct(m.value, m.goal)}% of {m.goal.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {weeks.length > 0 && (
                        <>
                          <span className="m-lbl" style={{ marginTop: 20 }}>
                            Weekly averages · per logged day
                          </span>
                          <div className="st-weeks">
                            {weeks.map((w) => (
                              <div key={w.weekStart} className="st-week">
                                <span className="st-wk-date m-num">wk of {fmtDate(w.weekStart)}</span>
                                <span className="st-wk-bar">
                                  <i style={{ width: `${Math.min(100, (w.avgCalories / goals.calories) * 100)}%` }} />
                                </span>
                                <span className="st-wk-val m-num">
                                  {w.avgCalories.toLocaleString()} kcal
                                  <span className="m-crumb"> · {w.avgProtein}g P · {w.daysLogged}d</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

                            {/* ---------------------- Training frequency & volume ---------------------- */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="st-idx">03</span>
                    Training
                  </h3>
                  <span className="m-crumb m-num">
                    {training.sessionsInRange} {training.sessionsInRange === 1 ? "session" : "sessions"} in window
                  </span>
                </div>
                <div style={{ padding: 18 }}>
                  <div className="st-figs">
                    <div className="st-fig">
                      <b className="m-num">{training.sessionsLast7}</b>
                      <span>sessions / 7d</span>
                    </div>
                    <div className="st-fig">
                      <b className="m-num">{training.volumeLast7.toLocaleString()}</b>
                      <span>kg volume / 7d</span>
                    </div>
                    <div className="st-fig">
                      <b className="m-num">{training.activeDaysLast30}</b>
                      <span>active days / 30d</span>
                    </div>
                  </div>

                  {trainingWeeks.length > 0 ? (
                    <>
                      <span className="m-lbl" style={{ marginTop: 20 }}>
                        Weekly volume
                      </span>
                      <div className="st-weeks">
                        {trainingWeeks.map((w) => (
                          <div key={w.weekStart} className="st-week">
                            <span className="st-wk-date m-num">wk of {fmtDate(w.weekStart)}</span>
                            <span className="st-wk-bar">
                              <i style={{ width: `${(w.volume / maxTrainingVolume) * 100}%` }} />
                            </span>
                            <span className="st-wk-val m-num">
                              {w.volume.toLocaleString()} kg
                              <span className="m-crumb"> · {w.sessions} {w.sessions === 1 ? "session" : "sessions"}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="st-empty-row">
                      <span>No sessions logged in this window.</span>
                      <Link href="/dashboard/gym" className="m-crumb">
                        Log today&apos;s workout →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------- Consistency (full width — the year map needs the canvas) ---------------------- */}
            <div className="m-card m-in">
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="st-idx">04</span>
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
                <div className="st-figs">
                  <div className="st-fig">
                    <b className="m-num">{consistency.currentStreak}</b>
                    <span>day streak</span>
                  </div>
                  <div className="st-fig">
                    <b className="m-num">{consistency.loggedDays}</b>
                    <span>{consistency.loggedDays === 1 ? "logged day" : "logged days"}</span>
                  </div>
                  <div className="st-fig">
                    <b className="m-num">{consistency.loggedPct}%</b>
                    <span>of {consistency.totalDays}-day window</span>
                  </div>
                </div>

                {renderYearHeatmap()}
                <div className="st-legend">
                  <span>
                    <i style={{ background: yearFill.both }} />
                    meals + session
                  </span>
                  <span>
                    <i style={{ background: yearFill.meals }} />
                    meals
                  </span>
                  <span>
                    <i style={{ background: yearFill.session }} />
                    session
                  </span>
                  <span>
                    <i style={{ background: "var(--sunken)" }} />
                    none
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
