"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as the other dashboards.      */
/* ------------------------------------------------------------------ */

const STATS_CSS = `
.st *{box-sizing:border-box}
.st{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--red-soft:#fef2f2;--red-soft-b:#fecaca;--pro:#7c3aed;--car:#b45309;--green:#047857;color:var(--t1)}
html[data-theme="dark"] .st{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--pro:#a78bfa;--car:#fbbf24;--green:#34d399}
.st .m-card{background:var(--card);border:1px solid var(--line);border-radius:12px}
.st .m-card-h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border-bottom:1px solid var(--line)}
.st .m-card-h h3{font-size:13px;font-weight:700;color:var(--t1);margin:0}
.st .m-h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.st .m-sub{color:var(--t3);font-size:13px;margin-top:4px}
.st .m-crumb{font-size:12px;color:var(--t3)}
.st .m-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
.st .m-chip-ac{background:var(--ac-soft);color:var(--ac)}
.st .m-num{font-variant-numeric:tabular-nums}
.st .m-ic{width:16px;height:16px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.st .m-lbl{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:5px}
@keyframes st-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.st .m-in{animation:st-in .45s cubic-bezier(.22,1,.36,1) both}
.st .m-in:nth-child(2){animation-delay:.06s}
.st .m-in:nth-child(3){animation-delay:.12s}
.st .m-in:nth-child(4){animation-delay:.18s}
/* Range segmented control */
.st-seg{display:inline-flex;gap:4px;background:var(--sunken);border:1px solid var(--line);border-radius:10px;padding:4px}
.st-seg button{border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:700;color:var(--t2);padding:6px 14px;border-radius:7px;cursor:pointer;transition:background .15s,color .15s}
.st-seg button:hover{color:var(--t1)}
.st-seg button.on{background:var(--card);color:var(--ac);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.st-seg button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
/* Stat tiles */
.st-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px}
.st-tile{background:var(--sunken);border:1px solid var(--line);border-radius:10px;padding:11px 13px}
.st-tile b{display:block;font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.st-tile span{display:block;font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-top:3px}
.st-delta{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}
.st-delta.over{color:var(--car)}
.st-delta.under{color:var(--t3)}
.st-delta.on{color:var(--green)}
/* Weekly rows */
.st-week{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px}
.st-week:last-child{border-bottom:0}
.st-week .st-wk-date{width:96px;color:var(--t2);font-weight:600;flex-shrink:0}
.st-week .st-wk-bar{flex:1;height:6px;border-radius:3px;background:var(--track,#efefec);overflow:hidden}
html[data-theme="dark"] .st .st-week .st-wk-bar{background:var(--track,#2e2e34)}
.st-week .st-wk-bar i{display:block;height:100%;border-radius:3px;background:var(--ac)}
.st-week .st-wk-val{width:150px;text-align:right;color:var(--t1);font-weight:700;font-variant-numeric:tabular-nums;flex-shrink:0}
/* 28-day consistency strip */
.st-strip{display:grid;grid-template-columns:repeat(14,1fr);gap:4px}
.st-cell{aspect-ratio:1;border-radius:3px;background:var(--sunken);border:1px solid var(--line);position:relative}
.st-cell.meals{background:var(--ac-soft);border-color:var(--ac-soft-b)}
.st-cell.session{background:color-mix(in srgb,var(--pro) 26%,var(--card))}
.st-cell.both{background:var(--ac);border-color:var(--ac)}
.st-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:11px;font-weight:600;color:var(--t3)}
.st-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1px solid var(--line)}
.st-empty{padding:18px;border:1px dashed var(--line);border-radius:10px;font-size:13px;color:var(--t3);text-align:center}
/* Inline loading + error states (same ring language as components/Loader) */
.st-loading{display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 0;color:var(--t3)}
.st-loading i{display:block;width:32px;height:32px;border-radius:9999px;border:3px solid var(--line);border-top-color:var(--ac);animation:st-spin .8s linear infinite}
.st-loading p{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;margin:0}
@keyframes st-spin{to{transform:rotate(360deg)}}
.st-error{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:22px;border:1px solid var(--red-soft-b);background:var(--red-soft);border-radius:12px}
.st-error p{font-size:13px;font-weight:600;color:var(--red);margin:0}
.st-error button{font:inherit;font-size:13px;font-weight:700;color:var(--on-ac);background:var(--red);border:none;border-radius:8px;padding:9px 16px;cursor:pointer}
.st-error button:hover{filter:brightness(.94)}
.st-error button:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.st-layout{display:grid;grid-template-columns:1fr;gap:20px}
@media(min-width:1000px){.st-layout{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.st-strip{grid-template-columns:repeat(7,1fr)}}
@media(prefers-reduced-motion:reduce){.st *{animation:none!important;transition:none!important}}
`;

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  scale: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 8a4 4 0 0 1 8 0" /><path d="M12 8v.01" /></>,
  spark: <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8 2 9.2h7.6z" />,
};

const RANGES = [7, 30, 90];

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
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
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

  const goals = user?.macroGoals || { calories: 1900, protein: 120, carbs: 170, fats: 60 };

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

  return (
    <AppShell>
      <style>{STATS_CSS}</style>
      <div className="st ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
        {/* Header + range selector */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div className="m-h1">Progress</div>
            <div className="m-sub">How your nutrition, training, and consistency trend over time.</div>
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
          <p className="m-crumb" role="alert" style={{ color: "var(--red)", fontWeight: 600, margin: "-8px 0 12px" }}>
            Couldn&apos;t refresh — showing the last loaded data.
          </p>
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
                      <Link href="/dashboard/meal" className="m-crumb" style={{ color: "var(--ac)", fontWeight: 700 }}>
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
                      <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--ac)", fontWeight: 700 }}>
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

            {/* ---------------------- Weight trend ---------------------- */}
            <div className="m-card m-in">
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
                  <p className="m-crumb" role="alert" style={{ color: "var(--red)", fontWeight: 600, margin: "0 0 12px" }}>
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
                    <div style={{ marginTop: 10 }}>
                      <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--ac)", fontWeight: 700 }}>
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
                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: 12 }}
                            itemStyle={{ color: "var(--t1)", fontWeight: 600 }}
                            labelStyle={{ color: "var(--t3)" }}
                            labelFormatter={(label) => format(parseISO(`${label}T00:00:00`), "MMMM d, yyyy")}
                          />
                          <ReferenceLine y={weight.targetWeight} stroke="var(--ac)" strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={2} dot={{ fill: "var(--card)", stroke: "#4f46e5", strokeWidth: 2, r: 3 }} activeDot={{ r: 4 }} />
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

            {/* ---------------------- Consistency ---------------------- */}
            <div className="m-card m-in">
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.spark} /></span>
                  Consistency
                </h3>
                <span className="m-chip m-chip-ac">{consistency.loggedPct}% of {consistency.totalDays} days</span>
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
                </div>

                <span className="m-lbl">Last 28 days</span>
                <div className="st-strip" role="img" aria-label="28-day activity strip: meals logged and workout sessions per day">
                  {consistency.strip.map((d) => (
                    <div
                      key={d.date}
                      className={`st-cell ${d.meals && d.session ? "both" : d.meals ? "meals" : d.session ? "session" : ""}`}
                      title={`${fmtDate(d.date)}${d.meals ? " · meals" : ""}${d.session ? " · session" : ""}`}
                    />
                  ))}
                </div>
                <div className="st-legend">
                  <span><i style={{ background: "var(--ac)" }} />meals + session</span>
                  <span><i style={{ background: "var(--ac-soft)", borderColor: "var(--ac-soft-b)" }} />meals</span>
                  <span><i style={{ background: "color-mix(in srgb,var(--pro) 26%,var(--card))" }} />session</span>
                  <span><i style={{ background: "var(--sunken)" }} />rest</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
