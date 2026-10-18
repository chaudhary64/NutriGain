"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isToday, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Today — the daily landing surface.                                  */
/*                                                                     */
/* Replaces the old photo-card hub: the sidebar already links to Meal, */
/* Gym, and Progress, so a second copy of those links earned nothing.  */
/* What a landing page owes the athlete is the state of TODAY — macros  */
/* against targets, streak, weight, and the split — with logging one    */
/* click away. Tokens are the shared Geist set; every rule is          */
/* scoped to .today so nothing leaks into sibling pages.                */
/* ------------------------------------------------------------------ */

const TODAY_CSS = `
.today{color:var(--t1)}
.today-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px}
/* The page's one flourish: the brand mesh, bled behind the masthead only
   and faded out before it can touch the cards. */
.today-hero{position:relative;overflow:hidden}
.today-hero .g-mesh{inset:-48px -28px 0;opacity:.85;-webkit-mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.5) 62%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.5) 62%,transparent 100%)}
.today-hero>.today-head{position:relative;z-index:1}
.today-kicker{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.today-h1{font-size:28px;font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:0;color:var(--t1)}
.today-sub{font-size:13px;font-weight:400;color:var(--t2);margin:8px 0 0}
.today-acts{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
/* Header stat — the one body metric that no card owns, carried inline */
.today-head-end{display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.today-weigh{display:flex;align-items:baseline;gap:9px;margin:0;font-size:12px;font-weight:400;color:var(--t3)}
.today-weigh-k{font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.today-weigh b{font-size:14px;font-weight:600;color:var(--t1);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
/* Stat tile — inset stats inside cards */
.today-tile{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:14px 16px}
.today-tile-k{font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);display:block}
.today-tile-v{display:block;font-size:24px;font-weight:600;letter-spacing:-.03em;color:var(--t1);font-variant-numeric:tabular-nums;line-height:1.15;margin-top:6px}
.today-tile-v small{font-size:13px;font-weight:400;color:var(--t3);letter-spacing:0}
.today-tile-m{display:block;font-size:12px;font-weight:400;color:var(--t3);margin-top:4px}
/* Two-column body: targets rail + today's training */
.today-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start}
@media(min-width:1000px){.today-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
/* Macro meter — one row per macro: label, value, bar. */
.today-meter{padding:15px 18px;border-bottom:1px solid var(--line)}
.today-meter:last-child{border-bottom:0}
.today-meter-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}
.today-meter-name{font-size:13px;font-weight:400;color:var(--t1)}
.today-meter-val{font-size:13px;font-weight:500;color:var(--t1);font-variant-numeric:tabular-nums}
.today-meter-val u{text-decoration:none;color:var(--t3);font-weight:400}
.today-meter-val.over{color:var(--red)}
.today-meter-val.near{color:var(--ac)}
.today-track{height:7px;border-radius:999px;background:var(--track);overflow:hidden}
.today-track i{display:block;height:100%;border-radius:999px;transform-origin:left center;transition:transform .7s cubic-bezier(.22,1,.36,1)}
.today-track i.over{background:var(--red)!important}
/* Split row */
.today-split{display:flex;flex-wrap:wrap;gap:7px;padding:16px 18px}
.today-chip{font-size:12px;font-weight:500;padding:5px 11px;border-radius:6px;background:var(--sunken);color:var(--t2);border:1px solid transparent}
.today-chip.rest{background:var(--sunken);color:var(--t3);border-color:var(--line)}
.today-status{display:flex;align-items:center;gap:9px;padding:14px 18px;border-top:1px solid var(--line);font-size:12.5px;font-weight:400;color:var(--t2)}
.today-dot{width:8px;height:8px;border-radius:50%;background:var(--t3);flex:none}
.today-dot.done{background:var(--green)}
.today-dot.part{background:var(--car)}
.today-empty{padding:24px 18px;text-align:center;font-size:13px;color:var(--t3);font-weight:400}
.today-empty .m-btn{margin-top:14px}
/* Help — contextual, toggled from the header, never in the reading path by default */
.today-help-btn{width:35px;height:35px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t2);font-size:13px;font-weight:500;line-height:1;cursor:pointer;transition:.15s;padding:0}
.today-help-btn:hover{background:var(--sunken);color:var(--t1)}
.today-help{margin:0 0 20px;padding:15px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;font-size:13px;color:var(--t2);line-height:1.65}
.today-help ul{margin:0;padding-left:18px}
.today-help li{margin:3px 0}
.today-help b{color:var(--t1);font-weight:600}
/* Pending + failed states — never assert a number we do not have */
.today-pend{display:inline-block;width:88px;height:13px;border-radius:3px;background:var(--track)}
.today-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:16px 18px}
.today-stats .today-tile{border:0;background:var(--sunken);padding:12px 13px}
.today-stale{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 18px;font-size:12.5px;font-weight:400;color:var(--t2)}
.today-stale-btn{font:inherit;font-weight:500;font-size:12.5px;color:var(--t1);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:6px 12px;cursor:pointer;transition:.15s}
.today-stale-btn:hover:not(:disabled){background:var(--sunken)}
.today-stale-btn:disabled{opacity:.6;cursor:wait}
.today-weigh-retry{font:inherit;font-size:12px;font-weight:500;color:var(--t1);background:none;border:0;padding:0;cursor:pointer}
.today-weigh-retry:disabled{opacity:.6;cursor:wait}
/* Column stack — both sides size to their content */
.today-col{display:grid;gap:20px;align-content:start}
/* Today's log — one row per meal entry */
.today-entry{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line);font-size:13px}
.today-entry:last-child{border-bottom:0}
.today-entry-n{flex:1;min-width:0;font-weight:500;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.today-entry-t{display:block;font-size:12px;color:var(--t3);font-weight:400;margin-top:2px}
.today-entry-k{flex:none;font-weight:500;color:var(--t1);font-variant-numeric:tabular-nums}
.today-entry-k u{text-decoration:none;color:var(--t3);font-weight:400;font-size:11px}
`;

const MACROS = [
  { key: "calories", label: "Calories", unit: "kcal", color: "var(--ac)" },
  { key: "protein", label: "Protein", unit: "g", color: "var(--pro)" },
  { key: "carbs", label: "Carbs", unit: "g", color: "var(--car)" },
  { key: "fats", label: "Fats", unit: "g", color: "var(--green)" },
];

const GYM_LABEL = {
  "not-completed": "Not logged yet",
  "partially-completed": "Partially completed",
  completed: "Completed",
};

/* The four datasets this view reads. One list so a failed fetch can name
   itself and retry alone instead of blanking the whole page. */
const DATASETS = [
  { key: "log", url: "/api/daily-log", label: "today's log" },
  { key: "stats", url: "/api/stats?days=30", label: "your progress" },
  { key: "weight", url: "/api/weight", label: "your weight" },
  { key: "split", url: "/api/workout-schedule", label: "your split" },
];

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString();

const toTitle = (s) => String(s || "").replace(/\b\w/g, (c) => c.toUpperCase());

/** One macro meter: label, value / goal, and a bar capped at 100%. */
function Meter({ label, value, goal, unit, color, pending }) {
  const pct = goal > 0 ? (value / goal) * 100 : 0;
  const capped = pending ? 0 : Math.min(pct, 100);
  const over = !pending && value > goal;
  const near = !pending && !over && pct >= 85;
  return (
    <div className="today-meter">
      <div className="today-meter-top">
        <span className="today-meter-name">{label}</span>
        <span className={`today-meter-val${over ? " over" : near ? " near" : ""}`}>
          {pending ? (
            <span className="today-pend" aria-hidden="true" />
          ) : (
            <>
              {fmt(value)} <u>/ {fmt(goal)} {unit}</u>
            </>
          )}
        </span>
      </div>
      <div className="today-track">
        <i
          className={over ? "over" : ""}
          style={{
            width: `${capped}%`,
            background: over ? undefined : color,
            transform: `scaleX(${capped / 100})`,
          }}
        />
      </div>
    </div>
  );
}

/** One dataset failed — say which, and offer the one action that fixes it. */
function Stale({ label, message, retrying, onRetry }) {
  return (
    <div className="today-stale" role="status">
      <span>
        Couldn&apos;t load {label} ({message}).
      </span>
      <button type="button" className="today-stale-btn" onClick={onRetry} disabled={retrying}>
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export default function TodayPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({});
  const [failed, setFailed] = useState({});
  const [loadedUser, setLoadedUser] = useState(null);
  const [retrying, setRetrying] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();

  const fetchOne = useCallback((key) => {
    const url = DATASETS.find((d) => d.key === key).url;
    return fetch(url, { credentials: "include" }).then((res) =>
      res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)),
    );
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.allSettled(DATASETS.map((d) => fetchOne(d.key))).then((results) => {
      if (cancelled) return;
      const values = {};
      const errors = {};
      results.forEach((result, i) => {
        const key = DATASETS[i].key;
        if (result.status === "fulfilled") values[key] = result.value;
        else errors[key] = result.reason?.message || "network error";
      });
      setData(values);
      setFailed(errors);
      setLoadedUser(user);
    });
    return () => {
      cancelled = true;
    };
  }, [user, fetchOne]);

  /* Keyboard path — the critique's “reachable only by tab order” fix. L and W
     jump straight to logging, ? toggles help. Ignored while typing so a
     shortcut can never steal a keystroke from a field. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setHelpOpen(false);
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        router.push("/dashboard/meal");
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        router.push("/dashboard/gym");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  /* Retry a single dataset in place — one failure never blanks the page. */
  const retry = useCallback(
    (key) => {
      setRetrying((r) => ({ ...r, [key]: true }));
      fetchOne(key)
        .then((value) => {
          setData((d) => ({ ...d, [key]: value }));
          setFailed((f) => {
            const next = { ...f };
            delete next[key];
            return next;
          });
        })
        .catch((err) => setFailed((f) => ({ ...f, [key]: err?.message || "network error" })))
        .finally(() => setRetrying((r) => ({ ...r, [key]: false })));
    },
    [fetchOne],
  );

  if (authLoading) return <Loader />;
  if (!user) return null;

  /* Derived, not effect-set: nothing renders as real until the data for THIS
     user has actually arrived. */
  const loading = loadedUser !== user;

  const log = data.log?.dailyLog || null;
  const stats = data.stats || null;
  const weight = data.weight || null;
  const split = data.split?.days || null;
  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;
  const totals = log?.totalMacros || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const logMeals = log?.meals || [];
  const meals = logMeals.length;
  const gymStatus = log?.gymStatus || "not-completed";
  const streak = stats?.consistency?.currentStreak ?? 0;
  const entries = weight?.weightEntries || [];
  const latest = entries.length ? entries[entries.length - 1] : null;
  const target = weight?.targetWeight || null;
  const weekday = format(new Date(), "EEEE");
  const todaySplit = Array.isArray(split?.[weekday]) ? split[weekday] : null;

  const weightDelta =
    target != null && latest ? Math.round((latest.weight - target) * 10) / 10 : null;

  /* Day-level coach line — the header speaks in plain language about today
     instead of restating a number a tile already owns. Truthful in every
     state: wide-open day, on pace, gap to close, over goal. */
  const coach = (() => {
    const active = MACROS.filter((m) => (goals[m.key] || 0) > 0);
    if (!active.length) return `${meals} ${meals === 1 ? "entry" : "entries"} logged`;
    if (meals === 0) return "The day's wide open — every target still stands.";
    const state = active.map((m) => ({
      label: m.label,
      pct: (totals[m.key] || 0) / (goals[m.key] || 1),
      over: (totals[m.key] || 0) > (goals[m.key] || 0),
    }));
    const over = state.find((s) => s.over);
    if (over) {
      if (over.label === "Calories") return "Past the calorie goal — noted, not judged.";
      return over.label.endsWith("s")
        ? `${over.label} are past their goal — noted, not judged.`
        : `${over.label}'s past its goal — noted, not judged.`;
    }
    const min = Math.min(...state.map((s) => s.pct));
    if (min >= 0.85) return "Every target in reach — steady day.";
    const gap = [...state].sort((a, b) => a.pct - b.pct)[0];
    if (gap.label === "Calories") return "Calories are the gap — the next meal can close it.";
    return gap.label.endsWith("s")
      ? `${gap.label} are the gap — the next meal can close it.`
      : `${gap.label}'s the gap — the next meal can close it.`;
  })();

  return (
    <AppShell>
      <style>{TODAY_CSS}</style>

      <main
        className="mrd today ng-container"
        style={{ padding: "32px var(--layout-gutter) 56px" }}
        aria-busy={loading || undefined}
      >
        {/* ---------- Header ---------- */}
        <div className="today-hero">
          <div className="g-mesh" aria-hidden="true" />
          <header className="today-head">
          <div>
            <p className="today-kicker">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="today-h1">Today</h1>
            <p className="today-sub">
              {loading ? "Loading today's log…" : failed.log ? "Today's log unavailable" : coach}
            </p>
          </div>
          <div className="today-head-end">
            <p className="today-weigh">
              <span className="today-weigh-k">Weight</span>
              <b>{loading || !latest ? "—" : `${latest.weight} kg`}</b>
              {loading ? (
                <span>loading…</span>
              ) : failed.weight ? (
                <button
                  type="button"
                  className="today-weigh-retry"
                  onClick={() => retry("weight")}
                  disabled={retrying.weight}
                >
                  {retrying.weight ? "retrying…" : "unavailable · retry"}
                </button>
              ) : (
                <span>
                  {weightDelta == null
                    ? target ? `target ${target} kg` : "no target set"
                    : weightDelta === 0 ? `on target (${target} kg)`
                    : `${weightDelta > 0 ? "+" : ""}${weightDelta} kg vs target`}
                </span>
              )}
            </p>
            <div className="today-acts">
              <Link href="/dashboard/meal" className="m-btn m-btn-primary">Log a meal</Link>
              <Link href="/dashboard/gym" className="m-btn m-btn-ghost">Log workout</Link>
              <button
                type="button"
                className="today-help-btn"
                aria-expanded={helpOpen}
                aria-controls="today-help"
                aria-label={helpOpen ? "Hide help" : "How this page works"}
                title="How this page works (?)"
                onClick={() => setHelpOpen((v) => !v)}
              >
                ?
              </button>
            </div>
          </div>
          </header>
        </div>

        {/* Contextual help — one toggle, task-focused, out of the reading path. */}
        {helpOpen && (
          <div className="today-help" id="today-help" role="region" aria-label="How this page works">
            <ul>
              <li>The bars fill as you log food — red means you are past your goal for that one.</li>
              <li>The day counter resets whenever a full day passes with nothing recorded.</li>
              <li>Shortcuts: <b>L</b> opens meal logging, <b>W</b> opens the gym, <b>?</b> closes this help.</li>
            </ul>
          </div>
        )}

        {/* ---------- Body ---------- */}
        <div className="today-grid">
          <div className="today-col">
          <section className="m-card" aria-label="Daily targets">
            <div className="m-card-h">
              <h2>Daily targets</h2>
              <span className="m-crumb">live against your goals</span>
            </div>
            {failed.log ? (
              <Stale
                label="today's log"
                message={failed.log}
                retrying={retrying.log}
                onRetry={() => retry("log")}
              />
            ) : (
              MACROS.map((m) => (
                <Meter
                  key={m.key}
                  label={m.label}
                  value={totals[m.key]}
                  goal={goals[m.key]}
                  unit={m.unit}
                  color={m.color}
                  pending={loading}
                />
              ))
            )}
          </section>

          <section className="m-card" aria-label="Today's log">
            <div className="m-card-h">
              <h2>Today&apos;s log</h2>
              <Link href="/dashboard/meal" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                Add a meal →
              </Link>
            </div>
            {loading ? (
              <div className="today-empty">Loading…</div>
            ) : failed.log ? (
              /* One fetch feeds this card and Daily targets; that card owns the
                 single retry, so this one states the fact without a second one. */
              <div className="today-empty">Entries unavailable.</div>
            ) : logMeals.length ? (
              <div>
                {logMeals.map((entry, idx) => (
                  <div className="today-entry" key={entry._id || idx}>
                    <span className="today-entry-n">
                      {toTitle(entry.mealName)}
                      <span className="today-entry-t">
                        {[entry.mealType, entry.quantity ? `×${entry.quantity}` : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="today-entry-k">
                      {fmt(entry.macros?.calories)} <u>kcal</u>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="today-empty">
                Nothing logged yet today.
                <br />
                <Link href="/dashboard/meal" className="m-btn m-btn-primary">
                  Log your first meal
                </Link>
              </div>
            )}
          </section>
          </div>

          <div className="today-col">
            <section className="m-card" aria-label="Today's split">
              <div className="m-card-h">
                <h2>Today&apos;s split</h2>
                <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                  Open gym →
                </Link>
              </div>
              {loading ? (
                <div className="today-empty">Loading…</div>
              ) : failed.split ? (
                <Stale
                  label="your split"
                  message={failed.split}
                  retrying={retrying.split}
                  onRetry={() => retry("split")}
                />
              ) : todaySplit ? (
                <div className="today-split">
                  {todaySplit.map((g) => (
                    <span key={g} className={`today-chip${g === "Rest Day" ? " rest" : ""}`}>{g}</span>
                  ))}
                </div>
              ) : (
                <div className="today-empty">No split set for {weekday}.</div>
              )}
              {!loading && (
                <div className="today-status">
                  <span
                    className={`today-dot${gymStatus === "completed" ? " done" : gymStatus === "partially-completed" ? " part" : ""}`}
                    aria-hidden="true"
                  />
                  {failed.log
                    ? "Workout status unavailable"
                    : `Workout: ${GYM_LABEL[gymStatus] || GYM_LABEL["not-completed"]}`}
                </div>
              )}
            </section>

            <section className="m-card" aria-label="Recent consistency">
              <div className="m-card-h">
                <h2>Consistency</h2>
                <Link href="/dashboard/stats" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                  All progress →
                </Link>
              </div>
              {failed.stats ? (
                <Stale
                  label="your progress"
                  message={failed.stats}
                  retrying={retrying.stats}
                  onRetry={() => retry("stats")}
                />
              ) : (
                <div className="today-stats">
                  <div className="today-tile">
                    <span className="today-tile-k">Streak</span>
                    <span className="today-tile-v">
                      {loading ? "—" : <>{streak}<small> {streak === 1 ? "day" : "days"}</small></>}
                    </span>
                    {!loading && (
                      <span className="today-tile-m">
                        {streak > 0 ? "in a row, no misses" : "log today to start"}
                      </span>
                    )}
                  </div>
                  <div className="today-tile">
                    <span className="today-tile-k">Logged days</span>
                    <span className="today-tile-v">
                      {loading ? (
                        "—"
                      ) : (
                        <>{stats?.consistency?.loggedDays ?? 0}<small> / {stats?.consistency?.totalDays ?? 30}</small></>
                      )}
                    </span>
                    {!loading && (
                      <span className="today-tile-m">
                        {stats?.consistency?.loggedPct ?? 0}% of 30d
                      </span>
                    )}
                  </div>
                  <div className="today-tile">
                    <span className="today-tile-k">Weekly volume</span>
                    <span className="today-tile-v">
                      {loading ? "—" : <>{fmt(stats?.training?.volumeLast7 ?? 0)}<small> kg</small></>}
                    </span>
                    {!loading && (
                      <span className="today-tile-m">
                        {stats?.training?.sessionsLast7 ?? 0} sessions
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
