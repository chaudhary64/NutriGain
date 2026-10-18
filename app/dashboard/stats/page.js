"use client";

import { useEffect, useMemo, useState, cloneElement } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { format, parseISO } from "date-fns";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useTheme } from "@/context/ThemeContext";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

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
/* Stat tiles */
.st-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px}
.st-tile{background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:11px 13px}
.st-tile b{display:block;font-size:20px;font-weight:600;letter-spacing:-.03em;color:var(--t1);font-variant-numeric:tabular-nums;line-height:1.15}
.st-tile > span:not(.st-delta){display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:4px}
.st-delta{display:inline-block;font-size:11px;font-weight:500;font-variant-numeric:tabular-nums;margin-top:3px;color:var(--t3)}
.st-delta.over{color:var(--car)}
.st-delta.under{color:var(--t3)}
.st-delta.on{color:var(--green)}
/* Weekly rows */
.st-week{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px}
.st-week:last-child{border-bottom:0}
.st-week .st-wk-date{width:96px;color:var(--t2);font-weight:400;flex-shrink:0}
.st-week .st-wk-bar{flex:1;height:6px;border-radius:999px;background:var(--track);overflow:hidden}
.st-week .st-wk-bar i{display:block;height:100%;border-radius:999px;background:var(--ac)}
.st-week .st-wk-val{width:150px;text-align:right;color:var(--t1);font-weight:500;font-variant-numeric:tabular-nums;flex-shrink:0}
/* Consistency legend */
.st-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:11px;font-weight:400;color:var(--t3)}
.st-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px;border:1px solid var(--line)}
.st-empty{padding:20px;border:1px dashed var(--line);border-radius:6px;font-size:13px;color:var(--t3);text-align:center;background:var(--card-2)}
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
/* minmax(0,1fr): a plain 1fr track sizes to min-content, so wide
   children (charts, calendars) blow the column out on mid widths
   instead of shrinking. */
.st-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:20px}
@media(min-width:1000px){.st-layout{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  /* Canonical balance scale (Lucide) — "scale" had two spellings across the
     app; this is now the one the gym page and profile page share. */
  scale: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>,
  spark: <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8 2 9.2h7.6z" />,
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

/** Delta vs goal, rendered as "−120" / "+85" with a tone class. */
function GoalDelta({ value, goal }) {
  if (!goal) return null;
  const diff = Math.round(value - goal);
  const tone = Math.abs(diff) <= goal * 0.05 ? "on" : diff > 0 ? "over" : "under";
  return (
    <span className={`st-delta ${tone}`} title={`Goal ${goal.toLocaleString()}`}>
      {diff >= 0 ? "+" : "−"}
      {Math.abs(diff).toLocaleString()}
    </span>
  );
}

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
    return (
      <>
        <div className="gy-year-hd">
          <span className="m-crumb m-num">
            {yearActive} active {yearActive === 1 ? "day" : "days"} · {yearSessions} {yearSessions === 1 ? "session" : "sessions"}
          </span>
        </div>
        <div className="gy-year-map">
          <ActivityCalendar
            data={yearData}
            theme={{ light: LIGHT_RAMP, dark: DARK_RAMP }}
            blockSize={10}
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
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
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

        {stats && (
          <>
            {/* ---------------------- Weight trend ---------------------- */}
            <div className="m-card m-in" style={{ marginBottom: 20 }}>
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.scale} /></span>
                  Weight trend
                </h3>
                {latestWeight != null && (
                  <span className="m-crumb m-num">
                    {latestWeight} kg
                    {weightChange != null && weightChange !== 0 && (
                      <> · {weightChange > 0 ? "+" : "−"}{Math.abs(weightChange)} kg over {weightRows.length} entries</>
                    )}
                  </span>
                )}
              </div>
              <div style={{ padding: 18 }}>
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
                    Need at least two weight entries to draw a trend.
                    <div style={{ marginTop: 10 }}>                        <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                          Log your weight →
                        </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weightRows}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "var(--t3)" }}
                            axisLine={{ stroke: "var(--line)" }}
                            tickLine={false}
                            tickFormatter={(str) => fmtDate(str)}
                            minTickGap={28}
                          />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: "var(--t3)" }} axisLine={false} tickLine={false} width={34} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--line)", borderRadius: "6px", fontSize: 12, boxShadow: "var(--ng-shadow-2)" }}
                            itemStyle={{ color: "var(--t1)", fontWeight: 500 }}
                            labelStyle={{ color: "var(--t3)" }}
                            labelFormatter={(label) => format(parseISO(`${label}T00:00:00`), "MMMM d, yyyy")}
                          />
                          <ReferenceLine y={weight.targetWeight} stroke="var(--ac)" strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="weight" stroke="var(--ac)" strokeWidth={2} dot={{ fill: "var(--card)", stroke: "var(--ac)", strokeWidth: 2, r: 3 }} activeDot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="m-crumb" style={{ marginTop: 10 }}>
                      Dashed line: target {weight.targetWeight} kg (editable on the gym page).
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ---------------------- Consistency (full width — the year map needs the canvas, like the gym card) ---------------------- */}
            <div className="m-card m-in" style={{ marginBottom: 20 }}>
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.spark} /></span>
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
                <div className="st-tiles" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", marginBottom: 18 }}>
                  <div className="st-tile">
                    <b className="m-num">{consistency.currentStreak}</b>
                    <span>day streak</span>
                  </div>
                  <div className="st-tile">
                    <b className="m-num">{consistency.loggedDays}</b>
                    <span>logged days</span>
                  </div>
                  <div className="st-tile">
                    <b className="m-num">{consistency.loggedPct}%</b>
                    <span>of {consistency.totalDays}-day window</span>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>{renderYearHeatmap()}</div>
                <div className="st-legend">
                  <span><i style={{ background: yearFill.both }} />meals + session</span>
                  <span><i style={{ background: yearFill.meals }} />meals</span>
                  <span><i style={{ background: yearFill.session }} />session</span>
                  <span><i style={{ background: "var(--sunken)" }} />none</span>
                </div>
              </div>
            </div>

          </>
        )}

        {stats && (
          <div className="st-layout">
            {/* ---------------------- Weekly macros vs goals ---------------------- */}
            <div className="m-card m-in">
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.flame} /></span>
                  Nutrition
                </h3>
                <span className="m-crumb m-num">
                  avg of {nutrition.daysLogged} logged {nutrition.daysLogged === 1 ? "day" : "days"} · {nutrition.daysLoggedLast7} in last 7
                </span>
              </div>
              <div style={{ padding: 18 }}>
                {nutrition.daysLogged === 0 ? (
                  <div className="st-empty">
                    No meals logged in this window yet.
                    <div style={{ marginTop: 10 }}>
                      <Link href="/dashboard/meal" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                        Log your first meal →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="st-tiles">
                      <div className="st-tile">
                        <b className="m-num">{avg.calories.toLocaleString()}</b>
                        <span>kcal / day</span>
                        <GoalDelta value={avg.calories} goal={goals.calories} />
                      </div>
                      <div className="st-tile">
                        <b className="m-num">{avg.protein}</b>
                        <span>g protein</span>
                        <GoalDelta value={avg.protein} goal={goals.protein} />
                      </div>
                      <div className="st-tile">
                        <b className="m-num">{avg.carbs}</b>
                        <span>g carbs</span>
                        <GoalDelta value={avg.carbs} goal={goals.carbs} />
                      </div>
                      <div className="st-tile">
                        <b className="m-num">{avg.fats}</b>
                        <span>g fats</span>
                        <GoalDelta value={avg.fats} goal={goals.fats} />
                      </div>
                    </div>

                    {weeks.length > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <span className="m-lbl">Weekly averages (per logged day)</span>
                        {weeks.map((w) => (
                          <div key={w.weekStart} className="st-week">
                            <span className="st-wk-date m-num">wk of {fmtDate(w.weekStart)}</span>
                            <span className="st-wk-bar"><i style={{ width: `${Math.min(100, (w.avgCalories / goals.calories) * 100)}%` }} /></span>
                            <span className="st-wk-val m-num">
                              {w.avgCalories.toLocaleString()} kcal
                              <span className="m-crumb"> · {w.avgProtein}g P · {w.daysLogged}d</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ---------------------- Training frequency & volume ---------------------- */}
            <div className="m-card m-in">
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.activity} /></span>
                  Training
                </h3>
                <span className="m-crumb m-num">{training.sessionsInRange} sessions in window</span>
              </div>
              <div style={{ padding: 18 }}>
                {training.sessionsInRange === 0 ? (
                  <div className="st-empty">
                    No sessions logged in this window.
                    <div style={{ marginTop: 10 }}>
                      <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                        Log today&apos;s workout →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="st-tiles" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))" }}>
                      <div className="st-tile">
                        <b className="m-num">{training.sessionsLast7}</b>
                        <span>sessions / 7d</span>
                      </div>
                      <div className="st-tile">
                        <b className="m-num">{training.volumeLast7.toLocaleString()}</b>
                        <span>kg volume / 7d</span>
                      </div>
                      <div className="st-tile">
                        <b className="m-num">{training.activeDaysLast30}</b>
                        <span>active days / 30d</span>
                      </div>
                    </div>

                    {trainingWeeks.length > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <span className="m-lbl">Weekly volume</span>
                        {trainingWeeks.map((w) => (
                          <div key={w.weekStart} className="st-week">
                            <span className="st-wk-date m-num">wk of {fmtDate(w.weekStart)}</span>
                            <span className="st-wk-bar"><i style={{ width: `${(w.volume / maxTrainingVolume) * 100}%` }} /></span>
                            <span className="st-wk-val m-num">
                              {w.volume.toLocaleString()} kg
                              <span className="m-crumb"> · {w.sessions} {w.sessions === 1 ? "session" : "sessions"}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
