import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import WorkoutSession from '@/models/WorkoutSession';
import { withAuth } from '@/lib/auth';
import { heatmapHistoryFromDateString } from '@/lib/daily-log';

export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------ */
/* Local-date helpers — the app stores all day keys as local           */
/* 'yyyy-MM-dd' strings, so all math stays on string/UTC-calendar      */
/* arithmetic (parsing as UTC noon-of-day and stepping whole days      */
/* is timezone-safe: we never leave the date-string domain).           */
/* ------------------------------------------------------------------ */

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Monday-start week key for a local date string. */
function weekStart(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

const round = (v) => Math.round(v || 0);

/**
 * GET /api/stats?days=30 — cross-surface progress stats for the signed-in
 * user over the trailing window (7–365, default 30 local days).
 *
 * Sources:
 *  - DailyLog (flat docs, plain query): per-day macro totals for averages,
 *    goal hit-rates, and meal-consistency flags.
 *  - WorkoutSession (nested exercises[].sets[]): volume per session via an
 *    aggregation pipeline ($unwind -> $group), the same shape /api/users
 *    already uses for server-side rollups.
 *  - Weight trend lives on GET /api/weight and is fetched by the page.
 *
 * Streaks count a day as active when it has logged meals (calories > 0)
 * OR a workout session. A streak anchored to today survives until the day
 * ends; if today is inactive the anchor falls back to yesterday.
 */
export const GET = withAuth(async (request, user) => {
  const url = new URL(request.url);
  let days = parseInt(url.searchParams.get('days'), 10);
  if (!Number.isFinite(days)) days = 30;
  days = Math.min(Math.max(days, 7), 365);

  const today = todayLocal();
  const from = addDays(today, -(days - 1));
  const last7From = addDays(today, -6);
  const last30From = addDays(today, -29);

  // The consistency heatmap renders a full calendar year selectable by
  // year chips (GitHub-profile model), so the window must reach Jan 1 of
  // the oldest eligible year — bounded by signup the same way.
  const heatmapFloor = heatmapHistoryFromDateString(user.createdAt);
  const windowFrom = from < heatmapFloor ? from : heatmapFloor;

  await dbConnect();

  const [logs, volumeRows] = await Promise.all([
    DailyLog.find({ user: user.id, date: { $gte: windowFrom } })
      .select('date totalMacros gymStatus')
      .sort({ date: 1 })
      .lean(),
    WorkoutSession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(user.id), date: { $gte: windowFrom } } },
      { $unwind: '$exercises' },
      { $unwind: '$exercises.sets' },
      {
        $group: {
          _id: '$date',
          volume: {
            $sum: { $multiply: ['$exercises.sets.weight', '$exercises.sets.reps'] },
          },
        },
      },
      { $project: { _id: 0, date: '$_id', volume: { $round: ['$volume', 0] } } },
      { $sort: { date: 1 } },
    ]),
  ]);

  /* ------------------------------ Nutrition ------------------------------ */

  const nutritionLogs = logs.filter((l) => (l.totalMacros?.calories || 0) > 0);
  const daily = nutritionLogs.map((l) => ({
    date: l.date,
    calories: round(l.totalMacros?.calories),
    protein: round(l.totalMacros?.protein),
    carbs: round(l.totalMacros?.carbs),
    fats: round(l.totalMacros?.fats),
  }));

  const sumMacros = (rows) =>
    rows.reduce(
      (acc, r) => ({
        calories: acc.calories + r.calories,
        protein: acc.protein + r.protein,
        carbs: acc.carbs + r.carbs,
        fats: acc.fats + r.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

  const overall = sumMacros(daily);
  const nLogged = daily.length;

  // Per-Monday-week averages (rows are logged days only, so the average
  // denominator is "days actually logged" — zero days never dilute).
  const nutritionWeeks = new Map();
  for (const row of daily) {
    const wk = weekStart(row.date);
    if (!nutritionWeeks.has(wk)) {
      nutritionWeeks.set(wk, { weekStart: wk, daysLogged: 0, totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } });
    }
    const bucket = nutritionWeeks.get(wk);
    bucket.daysLogged += 1;
    bucket.totals.calories += row.calories;
    bucket.totals.protein += row.protein;
    bucket.totals.carbs += row.carbs;
    bucket.totals.fats += row.fats;
  }
  const weekly = [...nutritionWeeks.values()]
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .map((w) => ({
      weekStart: w.weekStart,
      daysLogged: w.daysLogged,
      avgCalories: round(w.totals.calories / w.daysLogged),
      avgProtein: round(w.totals.protein / w.daysLogged),
      avgCarbs: round(w.totals.carbs / w.daysLogged),
      avgFats: round(w.totals.fats / w.daysLogged),
    }));

  /* ------------------------------ Training ------------------------------- */

  const sessionsLast7 = volumeRows.filter((r) => r.date >= last7From);
  const volumeLast7 = round(sessionsLast7.reduce((s, r) => s + r.volume, 0));
  const sessionsInRange = volumeRows.length;
  const volumeInRange = round(volumeRows.reduce((s, r) => s + r.volume, 0));
  const activeDaysLast30 = volumeRows.filter((r) => r.date >= last30From).length;

  const trainingWeeks = new Map();
  for (const row of volumeRows) {
    const wk = weekStart(row.date);
    if (!trainingWeeks.has(wk)) {
      trainingWeeks.set(wk, { weekStart: wk, sessions: 0, volume: 0 });
    }
    const bucket = trainingWeeks.get(wk);
    bucket.sessions += 1;
    bucket.volume += row.volume;
  }
  const trainingWeekly = [...trainingWeeks.values()]
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .map((w) => ({ weekStart: w.weekStart, sessions: w.sessions, volume: round(w.volume) }));

  /* ----------------------------- Consistency ----------------------------- */

  const mealDays = new Set(nutritionLogs.map((l) => l.date));
  const sessionDays = new Set(volumeRows.map((r) => r.date));

  let anchor = today;
  if (!mealDays.has(anchor) && !sessionDays.has(anchor)) anchor = addDays(anchor, -1);
  let currentStreak = 0;
  let cursor = anchor;
  while (mealDays.has(cursor) || sessionDays.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // Full-window per-day activity flags feeding the year-switcher heatmap
  // (client builds Jan 1 → Dec 31 per selected year from this).
  const allDates = [...new Set([...mealDays, ...sessionDays])].sort();
  const yearMap = allDates.map((date) => ({
    date,
    meals: mealDays.has(date),
    session: sessionDays.has(date),
  }));

  return NextResponse.json({
    range: { days, from, to: today },
    nutrition: {
      overallAvg: {
        calories: nLogged ? round(overall.calories / nLogged) : 0,
        protein: nLogged ? round(overall.protein / nLogged) : 0,
        carbs: nLogged ? round(overall.carbs / nLogged) : 0,
        fats: nLogged ? round(overall.fats / nLogged) : 0,
      },
      daysLogged: nLogged,
      daysLoggedLast7: daily.filter((r) => r.date >= last7From).length,
      weekly,
      daily,
    },
    training: {
      sessionsLast7: sessionsLast7.length,
      volumeLast7,
      sessionsInRange,
      volumeInRange,
      activeDaysLast30,
      weekly: trainingWeekly,
    },
    consistency: {
      currentStreak,
      loggedDays: mealDays.size + [...sessionDays].filter((d) => !mealDays.has(d)).length,
      totalDays: days,
      loggedPct: Math.round(((mealDays.size + [...sessionDays].filter((d) => !mealDays.has(d)).length) / days) * 100),
      yearMap,
    },
  });
});
