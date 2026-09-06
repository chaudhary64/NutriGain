import UserExerciseData from '@/models/UserExerciseData';
import { mergeSessionsIntoHeatmap } from '@/lib/heatmap';

export { mergeSessionsIntoHeatmap };

/** Shared helpers for WorkoutSession validation, merging, and PR tracking. */

const MAX_SETS = 20;

/**
 * Validate + normalize one exercise payload: { exercise, sets: [{weight, reps}] }.
 * Returns [errors, normalized] — normalized has numeric weight/reps.
 */
export function validateSessionExercise(raw) {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return ['each exercise must be an object', null];
  }
  if (typeof raw.exercise !== 'string' || !/^[a-f\d]{24}$/i.test(raw.exercise)) {
    return ['exercise must be a valid id', null];
  }
  if (!Array.isArray(raw.sets) || raw.sets.length === 0) {
    return ['sets must be a non-empty array', null];
  }
  if (raw.sets.length > MAX_SETS) {
    return [`at most ${MAX_SETS} sets per exercise`, null];
  }

  const sets = [];
  for (const s of raw.sets) {
    const weight = Number(s?.weight);
    const reps = Number(s?.reps);
    if (!Number.isFinite(weight) || weight < 0 || weight > 1000) {
      return ['each set needs a weight between 0 and 1000', null];
    }
    if (!Number.isInteger(reps) || reps < 0 || reps > 500) {
      return ['each set needs integer reps between 0 and 500', null];
    }
    sets.push({ weight: Math.round(weight * 100) / 100, reps });
  }

  return [null, { exercise: raw.exercise, sets }];
}

/**
 * Validate a full exercises array for a session.
 * Returns [errors, normalized]. Duplicate exercises (last write wins) are merged.
 */
export function validateSessionExercises(rawExercises) {
  if (!Array.isArray(rawExercises) || rawExercises.length === 0) {
    return ['exercises must be a non-empty array', null];
  }
  if (rawExercises.length > 50) {
    return ['at most 50 exercises per session', null];
  }

  const errors = [];
  const byId = new Map();
  for (const raw of rawExercises) {
    const [err, normalized] = validateSessionExercise(raw);
    if (err) {
      errors.push(err);
      continue;
    }
    byId.set(normalized.exercise, normalized); // dedupe
  }
  if (errors.length > 0) return [errors, null];

  return [null, [...byId.values()]];
}

/**
 * Merge incoming exercises into an existing session's exercise list (pure).
 * Default: same exercise appends sets. With mode "replace": incoming sets
 * replace that exercise's sets entirely (edit semantics). Never deletes
 * exercises that are absent from the payload.
 */
export function mergeSessionExercises(existingExercises, incoming, mode = "append") {
  const byId = new Map(
    (existingExercises || []).map((e) => [e.exercise.toString(), [...(e.sets || [])]])
  );
  for (const ex of incoming) {
    const key = ex.exercise.toString();
    byId.set(key, mode === "replace" ? [...ex.sets] : [...(byId.get(key) || []), ...ex.sets]);
  }
  return [...byId.entries()].map(([exerciseId, sets]) => ({
    exercise: exerciseId,
    sets,
  }));
}

/**
 * Recompute the user's numeric PR for one exercise from a (possibly merged)
 * list of session exercises and auto-update UserExerciseData when it grew.
 *
 * Returns { newPR, previousPR } for the route to report — newPR is null when
 * nothing changed, so the client can show a badge only on real progress.
 */
export async function updatePrForExercise(userId, exerciseId, sessionExercises) {
  const doc = sessionExercises.find(
    (e) => e.exercise.toString() === exerciseId.toString()
  );
  const bestSet = (doc?.sets || []).reduce(
    (best, s) => (s.weight > best ? s.weight : best),
    0
  );

  const userData = await UserExerciseData.findOne({ userId, exerciseId });
  const previousPR =
    userData?.prWeight ??
    (userData?.lastPR ? parseFloat(userData.lastPR) || null : null);

  if (bestSet <= 0 || (previousPR != null && bestSet <= previousPR)) {
    return { newPR: null, previousPR: previousPR ?? null };
  }

  await UserExerciseData.updateOne(
    { userId, exerciseId },
    {
      $set: {
        prWeight: bestSet,
        lastPR: String(bestSet),
        lastPRDate: new Date().toISOString().slice(0, 10),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return { newPR: bestSet, previousPR: previousPR ?? null };
}


