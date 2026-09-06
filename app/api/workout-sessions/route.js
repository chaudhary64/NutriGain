import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutSession from "@/models/WorkoutSession";
import Exercise from "@/models/Exercise";
import {
  validateSessionExercises,
  mergeSessionExercises,
  updatePrForExercise,
} from "@/lib/workout-session";
import { isValidObjectId } from "@/lib/validation";
import { withAuth } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && !Number.isNaN(Date.parse(value));
}

/**
 * GET /api/workout-sessions
 *   ?date=yyyy-MM-dd                -> { session }
 *   ?from=...&to=...                -> { sessions } (lean, for heatmap merge)
 *   ?exerciseId=...&months=6        -> { series } (PR progression per day)
 *   ?summary=1                      -> { summary } (all-time totals)
 */
export const GET = withAuth(async (request, user) => {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const exerciseId = searchParams.get("exerciseId");
  const wantsSummary = searchParams.get("summary") === "1";

  if (date) {
    if (!isValidDateString(date)) {
      return NextResponse.json({ error: "date must be a valid yyyy-MM-dd string" }, { status: 400 });
    }
    const session = await WorkoutSession.findOne({ user: user.id, date }).lean();
    return NextResponse.json({ session: session || null });
  }

  if (from || to) {
    if (!isValidDateString(from) || !isValidDateString(to) || from > to) {
      return NextResponse.json({ error: "from and to must be valid yyyy-MM-dd strings, from <= to" }, { status: 400 });
    }
    const sessions = await WorkoutSession.find({
      user: user.id,
      date: { $gte: from, $lte: to },
    })
      .select("date exercises")
      .lean();
    return NextResponse.json({ sessions });
  }

  if (exerciseId) {
    if (!isValidObjectId(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise id" }, { status: 400 });
    }
    const months = Math.min(Math.max(parseInt(searchParams.get("months") || "6", 10) || 6, 1), 24);
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const sinceStr = since.toISOString().slice(0, 10);

    const sessions = await WorkoutSession.find({
      user: user.id,
      date: { $gte: sinceStr },
      "exercises.exercise": exerciseId,
    })
      .select("date exercises")
      .sort({ date: 1 })
      .lean();

    const series = sessions.map((s) => {
      const ex = (s.exercises || []).find(
        (e) => e.exercise.toString() === exerciseId
      );
      const sets = ex?.sets || [];
      return {
        date: s.date,
        weight: sets.reduce((m, set) => Math.max(m, set.weight), 0),
        sets: sets.length,
        reps: sets.reduce((sum, set) => sum + set.reps, 0),
        volume: Math.round(sets.reduce((sum, set) => sum + set.weight * set.reps, 0)),
      };
    });

    return NextResponse.json({ series });
  }

  if (wantsSummary) {
    const docs = await WorkoutSession.find({ user: user.id })
      .select("date exercises")
      .lean();

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let bestSetWeight = 0;
    const days = new Set();

    for (const doc of docs) {
      days.add(doc.date);
      for (const ex of doc.exercises || []) {
        for (const set of ex.sets || []) {
          totalSets += 1;
          totalReps += set.reps || 0;
          totalVolume += (set.weight || 0) * (set.reps || 0);
          bestSetWeight = Math.max(bestSetWeight, set.weight || 0);
        }
      }
    }

    return NextResponse.json({
      summary: {
        daysTrained: days.size,
        totalVolume: Math.round(totalVolume),
        totalSets,
        totalReps,
        bestSetWeight,
      },
    });
  }

  return NextResponse.json(
    { error: "Provide date, from/to, exerciseId, or summary=1" },
    { status: 400 }
  );
});

/**
 * PUT /api/workout-sessions
 * Body: { date, exercises: [{ exercise, sets: [{weight, reps}] }], mode? }
 *
 * mode "append" (default): same-exercise sets are appended (multiple entries
 * through the day accumulate). mode "replace": the payload's sets replace
 * that exercise's sets for the day (edit semantics) — never deletes other
 * exercises. PRs auto-update on strictly heavier sets; PR history is kept.
 */
export const PUT = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));
  const mode = body?.mode === "replace" ? "replace" : "append";

  if (!isValidDateString(body?.date)) {
    return NextResponse.json({ error: "date must be a valid yyyy-MM-dd string" }, { status: 400 });
  }
  if (body.date > new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "date cannot be in the future" }, { status: 400 });
  }

  const [errors, normalized] = validateSessionExercises(body.exercises);
  if (errors) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }

  await dbConnect();

  // All referenced exercises must exist in the shared library.
  const ids = normalized.map((e) => e.exercise);
  const existing = await Exercise.find({ _id: { $in: ids } }).select("_id").lean();
  if (existing.length !== new Set(ids).size) {
    return NextResponse.json({ error: "One or more exercises do not exist" }, { status: 400 });
  }

  const current = await WorkoutSession.findOne({ user: user.id, date: body.date });
  const merged = mergeSessionExercises(current?.exercises || [], normalized, mode);

  if (current) {
    current.exercises = merged;
    current.updatedAt = new Date();
    await current.save();
  } else {
    await WorkoutSession.create({ user: user.id, date: body.date, exercises: merged });
  }

  // Auto-PR per touched exercise (strictly greater weights only).
  const prs = [];
  for (const ex of normalized) {
    const { newPR, previousPR } = await updatePrForExercise(user.id, ex.exercise, merged);
    if (newPR != null) {
      prs.push({ exerciseId: ex.exercise, newPR, previousPR });
    }
  }

  const session = await WorkoutSession.findOne({ user: user.id, date: body.date }).lean();
  return NextResponse.json({ session, prs });
});

/** DELETE /api/workout-sessions?date=yyyy-MM-dd — clears that day's session (PRs kept). */
export const DELETE = withAuth(async (request, user) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!isValidDateString(date)) {
    return NextResponse.json({ error: "date must be a valid yyyy-MM-dd string" }, { status: 400 });
  }

  await dbConnect();
  const removed = await WorkoutSession.findOneAndDelete({ user: user.id, date });

  return NextResponse.json({
    message: removed ? "Session deleted" : "No session for that date",
    deleted: Boolean(removed),
  });
});
