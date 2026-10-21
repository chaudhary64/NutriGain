"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Today — the daily landing surface.                                  */
/*                                                                     */
/* The page answers one question: what is left to do today. It leads  */
/* with the food budget still available, lists the three meal slots    */
/* with their own log actions, and states today's session. History,    */
/* streaks, and weight belong to Progress; a second copy of them here  */
/* only competed with the actions.                                     */
/* ------------------------------------------------------------------ */

const TODAY_CSS = `
.today{color:var(--t1)}
/* Masthead — date, title, one sentence of state, one action. */
.td-mast{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.td-kicker{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 8px}
.td-sub{margin:8px 0 0;font-size:13px;line-height:1.5;color:var(--t2)}
.td-acts{display:flex;align-items:center;gap:9px;flex-wrap:wrap}

/* The budget band: the day's remaining allowance, read as a ledger of
   what is still available rather than a score of what was spent. */
.td-budget{display:grid;grid-template-columns:minmax(0,1.65fr) repeat(3,minmax(0,1fr));border-top:1px solid var(--line)}
.td-cell{padding:16px 18px 18px;min-width:0;border-left:1px solid var(--line)}
.td-cell:first-child{border-left:0}
.td-cell-k{display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)}
.td-figure{display:flex;align-items:baseline;gap:7px;margin-top:8px;font-size:34px;font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums}
.td-figure small{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.td-figure.over{color:var(--red)}
.td-cell .td-macro{font-size:24px;margin-top:9px}
.td-note{margin:9px 0 0;font-size:12px;line-height:1.45;color:var(--t3);font-variant-numeric:tabular-nums}
.td-note b{font-weight:500;color:var(--t1)}
/* Day track — consumed in ink, the rest as track, so the gap is the point. */
.td-day{margin-top:14px;height:8px;border-radius:999px;overflow:hidden;background:var(--track)}
.td-day i{display:block;height:100%;border-radius:999px;background:var(--t1);transition:width .7s cubic-bezier(.22,1,.36,1)}
.td-track{height:4px;margin-top:11px;border-radius:999px;overflow:hidden;background:var(--track)}
.td-track i{display:block;height:100%;border-radius:999px;background:var(--t2);transition:width .7s cubic-bezier(.22,1,.36,1)}
.td-track i.over{background:var(--red)!important}
@media(max-width:940px){.td-budget{grid-template-columns:repeat(2,minmax(0,1fr))}.td-cell:nth-child(3){border-left:0}.td-cell:nth-child(n+3){border-top:1px solid var(--line)}}
/* On a phone the band becomes four compact rows — label left, remaining
   right, bar beneath — instead of four stacked cards. */
@media(max-width:560px){
  .td-budget{grid-template-columns:minmax(0,1fr)}
  .td-cell{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:12px;border-left:0;padding:12px 16px}
  .td-cell+.td-cell{border-top:1px solid var(--line)}
  .td-cell-k{grid-column:1;grid-row:1}
  .td-figure{grid-column:2;grid-row:1;margin-top:0;font-size:22px}
  .td-figure.td-macro{margin-top:0}
  .td-track,.td-day{grid-column:1/-1;grid-row:2;margin-top:9px}
  .td-note{grid-column:1/-1;grid-row:3;margin-top:7px}
  .td-pend{grid-column:2;grid-row:1;margin-top:0}
}

/* Meal slots — one row per slot, always all three, so the shape of the
   day is visible before anything is logged. The macro column sits between
   the name and the slot total so the width carries reading, not air. */
.td-slot{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:4px 14px;align-items:start;padding:13px 18px;border-top:1px solid var(--line)}
.td-slot:first-child{border-top:0}
.td-slot-k{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);padding-top:3px;white-space:nowrap}
.td-slot.next .td-slot-k{color:var(--t1)}
/* The open slot is marked with a dot, so the row keeps one line and the
   marker costs no height. */
.td-slot.next .td-slot-k::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--t1);margin-right:6px;vertical-align:1px}
/* The dot is decoration; the words carry the state for screen readers. */
.td-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.td-slot-list{min-width:0;display:grid;gap:7px}
.td-entry{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:13px;color:var(--t1);min-width:0}
.td-entry span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.td-entry-m{flex:none;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--t3);font-variant-numeric:tabular-nums;white-space:nowrap}
.td-slot-none{font-size:13px;line-height:1.5;color:var(--t3);padding-top:2px}
.td-slot-end{display:flex;align-items:baseline;justify-content:flex-end;gap:18px;padding-top:2px}
.td-slot-kcal{font-size:13px;font-weight:500;text-align:right;color:var(--t1);font-variant-numeric:tabular-nums;white-space:nowrap}
.td-slot-kcal u{text-decoration:none;font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);margin-left:3px}
.td-slot-kcal.is-empty{color:var(--faint)}
.td-slot-log{font-size:12px;font-weight:500;text-align:right;color:var(--t1);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:1px;justify-self:end;white-space:nowrap}
.td-slot-log:hover{border-color:var(--t1)}
.td-slot-log:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
@media(max-width:560px){
  .td-slot{grid-template-columns:minmax(0,1fr) auto;gap:5px 12px}  .td-slot-k{grid-column:1;grid-row:1;padding-top:0}
  .td-slot-end{grid-column:2;grid-row:1;padding-top:0}
  .td-slot-list{grid-column:1/-1;grid-row:2;padding-top:3px}
  .td-entry-m{display:none}
}

/* Training band — the plan on the left, the action on the right, always
   on one line so a rest day does not leave a hole. */
.td-train{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:15px 18px}
.td-train-plan{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-width:0}
.td-group{font-size:14px;font-weight:500;color:var(--t1);letter-spacing:-.01em}
.td-group + .td-group::before{content:"/";margin-right:8px;color:var(--faint);font-weight:400}
.td-train-note{font-size:13px;color:var(--t3)}
.td-train-end{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.td-status{display:flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);font-variant-numeric:tabular-nums}
.td-dot{width:6px;height:6px;border-radius:50%;background:var(--t3);flex:none}
.td-dot.done{background:var(--green)}
.td-dot.part{background:var(--car)}
@media(max-width:560px){.td-train{align-items:flex-start;flex-direction:column}.td-train-end{width:100%;justify-content:space-between}}

/* Failure + loading states: never assert a number we do not have. */
.td-pend{display:block;width:84px;height:26px;border-radius:4px;background:var(--track);margin-top:10px}
.td-pend.tall{height:34px}
.td-stale{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-top:1px solid var(--line);font-size:12.5px;color:var(--t2)}
.td-stale:first-of-type{border-top:0}
.td-stale button{font:inherit;font-size:12.5px;font-weight:500;color:var(--t1);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:6px 12px;cursor:pointer}
.td-stale button:hover:not(:disabled){background:var(--sunken)}
.td-stale button:disabled{opacity:.6;cursor:wait}
.td-stale button:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
.td-foot{margin:18px 0 0;font-size:12px;color:var(--t3)}
.td-foot a{color:var(--t2);text-decoration:none;border-bottom:1px solid var(--line)}
.td-foot a:hover{color:var(--t1);border-color:var(--t1)}
`;

/* Slots are a fixed set in the log model, and the order is the order of
   a day — the index carries meaning, so it is not decorative. */
const SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

/* One ink, not a three-colour legend: the label carries the identity and the
   bar carries the proportion. Only an overshoot is allowed a colour. */
const MACROS = [
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fats", label: "Fats", unit: "g" },
];

const GYM_LABEL = {
  "not-completed": "Not logged",
  "partially-completed": "Partly logged",
  completed: "Session logged",
};

const DATASETS = [
  { key: "log", url: "/api/daily-log", label: "today's log" },
  { key: "split", url: "/api/workout-schedule", label: "your split" },
];

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString();

const toTitle = (s) => String(s || "").replace(/\b\w/g, (c) => c.toUpperCase());

/* The clock only ranks the slots; it never decides what counts as logged. */
const clockSlot = () => {
  const hour = new Date().getHours();
  return hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";
};

/** One macro's remaining allowance: the number left, and the bar spent. */
function Macro({ label, remaining, goal, unit, pending }) {
  const spent = Math.max(0, goal - remaining);
  const pct = goal > 0 ? Math.min(100, (spent / goal) * 100) : 0;
  const over = remaining < 0;
  return (
    <div className="td-cell">
      <span className="td-cell-k">{label}</span>
      {pending ? (
        <span className="td-pend" aria-hidden="true" />
      ) : (
        <div className="td-figure td-macro">
          {over ? `+${fmt(-remaining)}` : fmt(remaining)}
          <small>
            {unit} {over ? "over" : "left"}
          </small>
        </div>
      )}
      <div className="td-track" aria-hidden="true">
        <i className={over ? "over" : ""} style={{ width: `${pending ? 0 : pct}%` }} />
      </div>
      {!pending && (
        <p className="td-note">
          {fmt(spent)} of <b>{fmt(goal)}</b> {unit}
        </p>
      )}
    </div>
  );
}

/** One dataset failed — say which, and offer the one action that fixes it. */
function Stale({ label, message, retrying, onRetry }) {
  return (
    <div className="td-stale" role="status">
      <span>
        Couldn&apos;t load {label} ({message}).
      </span>
      <button type="button" onClick={onRetry} disabled={retrying}>
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

  /* Keyboard path — L and W jump straight to logging. Ignored while typing
     so a shortcut can never steal a keystroke from a field. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return;
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
  const split = data.split?.days || null;
  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;
  const totals = log?.totalMacros || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const entries = log?.meals || [];
  const gymStatus = log?.gymStatus || "not-completed";
  const weekday = format(new Date(), "EEEE");
  const todaySplit = Array.isArray(split?.[weekday]) ? split[weekday] : null;
  /* A rest day has no session board on the gym page, so Today must not offer
     to log one either. */
  const isRest = Boolean(todaySplit?.includes("Rest Day"));

  const bySlot = SLOTS.map((slot) => {
    const items = entries.filter((e) => e.mealType === slot.key);
    return {
      ...slot,
      items,
      kcal: items.reduce((sum, e) => sum + (Number(e.macros?.calories) || 0), 0),
    };
  });

  const remaining = {
    calories: (goals.calories || 0) - (totals.calories || 0),
    protein: (goals.protein || 0) - (totals.protein || 0),
    carbs: (goals.carbs || 0) - (totals.carbs || 0),
    fats: (goals.fats || 0) - (totals.fats || 0),
  };

  /* The next open slot is the first empty slot from the current one onwards,
     so a 2pm page never sends you back to breakfast while dinner is still
     open. If only earlier slots are empty, the earliest of those is offered.
     A fully logged day has no open slot — the action becomes adding food. */
  const clockIndex = SLOTS.findIndex((s) => s.key === clockSlot());
  const nextSlot =
    bySlot.find((s, i) => i >= clockIndex && s.items.length === 0) ||
    bySlot.find((s) => s.items.length === 0) ||
    null;
  const openCount = bySlot.filter((s) => s.items.length === 0).length;

  const sub = (() => {
    if (loading) return "Loading today’s log…";
    if (failed.log) return "Today’s log is unavailable right now.";
    if (!nextSlot) return "All three slots logged — the rest of the day is yours.";
    if (!entries.length) return "Nothing logged yet — every target is still open.";
    if (remaining.calories < 0) return `${fmt(-remaining.calories)} kcal over — noted, not judged.`;
    return `${openCount} ${openCount === 1 ? "slot" : "slots"} open — ${nextSlot.label.toLowerCase()} is next.`;
  })();

  const loggedKcal = fmt(totals.calories);
  const spentPct =
    goals.calories > 0 ? Math.min(100, ((totals.calories || 0) / goals.calories) * 100) : 0;
  const overDay = remaining.calories < 0;
  /* The bar stops at the track's end; the caption still tells the truth
     when the day runs past its goal. */
  const goalPct = goals.calories > 0 ? Math.round((totals.calories / goals.calories) * 100) : 0;

  return (
    <AppShell>
      <style>{TODAY_CSS}</style>

      <main
        className="mrd today ng-container"
        style={{ padding: "32px var(--layout-gutter) 56px" }}
        aria-busy={loading || undefined}
      >
        <header className="td-mast">
          <div>
            <p className="td-kicker">{format(new Date(), "EEEE, d MMMM")}</p>
            <div className="m-h1">Today</div>
            <p className="td-sub">{sub}</p>
          </div>
          <div className="td-acts">
            {/* The slot travels with the action, so the logger opens on the
                meal the button named. */}
            <Link
              href={nextSlot ? `/dashboard/meal?slot=${nextSlot.key}` : "/dashboard/meal"}
              className="m-btn m-btn-primary"
            >
              {nextSlot ? `Log ${nextSlot.label.toLowerCase()}` : "Add food"}
            </Link>
          </div>
        </header>

        {/* ---------- What is left ---------- */}
        <section className="m-card" style={{ marginBottom: 20 }} aria-label="Left today">
          <div className="m-card-h">
            <h2>Left today</h2>
            <span className="m-crumb m-num">
              {loading ? "Loading" : `${loggedKcal} of ${fmt(goals.calories)} kcal logged`}
            </span>
          </div>

          {failed.log ? (
            <Stale
              label="today's log"
              message={failed.log}
              retrying={retrying.log}
              onRetry={() => retry("log")}
            />
          ) : (
            <div className="td-budget">
              <div className="td-cell">
                <span className="td-cell-k">Calories</span>
                {loading ? (
                  <span className="td-pend tall" aria-hidden="true" />
                ) : (
                  <div className={`td-figure${overDay ? " over" : ""}`}>
                    {overDay ? `+${fmt(-remaining.calories)}` : fmt(remaining.calories)}
                    <small>{overDay ? "over" : "kcal left"}</small>
                  </div>
                )}
                <div className="td-day" aria-hidden="true">
                  <i style={{ width: `${loading ? 0 : spentPct}%`, background: overDay ? "var(--red)" : undefined }} />
                </div>
                {!loading && (
                  <p className="td-note">
                    <b>{goalPct}%</b> of the day’s goal
                    {entries.length > 0 &&
                      ` · ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
                  </p>
                )}
              </div>
              {MACROS.map((m) => (
                <Macro
                  key={m.key}
                  label={m.label}
                  remaining={remaining[m.key]}
                  goal={goals[m.key] || 0}
                  unit={m.unit}
                  pending={loading}
                />
              ))}
            </div>
          )}
        </section>

        {/* ---------- The three slots ---------- */}
        <section className="m-card" style={{ marginBottom: 20 }} aria-label="Today's meals">
          <div className="m-card-h">
            <h2>Meals</h2>
            <Link href="/dashboard/meal" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
              Open food log →
            </Link>
          </div>
          {failed.log ? (
            <div className="td-stale">
              <span>Entries unavailable until today’s log loads.</span>
            </div>
          ) : (
            bySlot.map((slot) => (
              <div
                className={`td-slot${nextSlot?.key === slot.key && !loading ? " next" : ""}`}
                key={slot.key}
              >
                <span className="td-slot-k">
                  {slot.label}
                  {nextSlot?.key === slot.key && !loading && (
                    <span className="td-sr"> — next open slot</span>
                  )}
                </span>
                <div className="td-slot-list">
                  {loading ? (
                    <span className="td-slot-none">Loading…</span>
                  ) : slot.items.length ? (
                    /* Per-entry macros, not per-entry calories: the slot total
                       already carries the calorie figure beside each row. */
                    slot.items.map((entry, idx) => (
                      <span className="td-entry" key={entry._id || idx}>
                        <span>
                          {toTitle(entry.mealName)}
                          {entry.quantity > 1 ? ` ×${entry.quantity}` : ""}
                        </span>
                        <small className="td-entry-m">
                          {fmt(entry.macros?.protein)}P {fmt(entry.macros?.carbs)}C{" "}
                          {fmt(entry.macros?.fats)}F
                        </small>
                      </span>
                    ))
                  ) : (
                    <span className="td-slot-none">Nothing logged.</span>
                  )}
                </div>
                <span className="td-slot-end">
                  <span className={`td-slot-kcal${slot.kcal ? "" : " is-empty"}`}>
                    {loading ? "—" : fmt(slot.kcal)}{" "}
                    <u>kcal</u>
                  </span>
                  <Link
                    href={`/dashboard/meal?slot=${slot.key}`}
                    className="td-slot-log"
                    aria-label={`Log food to ${slot.label}`}
                  >
                    Log
                  </Link>
                </span>
              </div>
            ))
          )}
        </section>

        {/* ---------- Today's session ---------- */}
        <section className="m-card" aria-label="Today's training">
          <div className="m-card-h">
            <h2>Training</h2>
            <Link href="/dashboard/gym" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
              Open gym →
            </Link>
          </div>
          {failed.split ? (
            <Stale
              label="your split"
              message={failed.split}
              retrying={retrying.split}
              onRetry={() => retry("split")}
            />
          ) : (
            <div className="td-train">
              <div className="td-train-plan">
                {loading ? (
                  <span className="td-train-note">Loading…</span>
                ) : isRest ? (
                  <>
                    <span className="td-group">Rest day</span>
                    <span className="td-train-note">Recovery — nothing planned.</span>
                  </>
                ) : todaySplit?.length ? (
                  todaySplit.map((g) => (
                    <span className="td-group" key={g}>
                      {g}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="td-train-note">No split set for {weekday}.</span>
                    <Link href="/dashboard/account" className="m-crumb" style={{ color: "var(--t1)", fontWeight: 500 }}>
                      Set your split →
                    </Link>
                  </>
                )}
              </div>
              {!loading && !isRest && (
                <div className="td-train-end">
                  <span className="td-status">
                    <span
                      className={`td-dot${gymStatus === "completed" ? " done" : gymStatus === "partially-completed" ? " part" : ""}`}
                      aria-hidden="true"
                    />
                    {failed.log ? "Status unavailable" : GYM_LABEL[gymStatus] || GYM_LABEL["not-completed"]}
                  </span>
                  <Link href="/dashboard/gym" className="m-btn m-btn-ghost">
                    {gymStatus === "completed" ? "View session" : "Log workout"}
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        <p className="td-foot">
          Weight, streaks, and 30-day trends live in <Link href="/dashboard/stats">Progress</Link>.
        </p>
      </main>
    </AppShell>
  );
}
