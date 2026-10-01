/**
 * Client-safe heatmap helpers (no model imports — used by both the
 * workout-sessions API and the gym dashboard).
 */

/**
 * Baseline heatmap intensity per gym status — the ramp the tooltips describe:
 * 4 = a completed session, 2 = a partial one, 0 = nothing logged.
 */
const STATUS_LEVEL = {
  completed: 4,
  'partially-completed': 2,
  'not-completed': 0,
};

/**
 * Merge session days into the heatmap-level shape the client renders:
 * [{ date, gymStatus, level, volume }]. Sessions only ever raise a day's level —
 * a logged session can't make a completed day look weaker.
 *
 * The daily-log API projects date/gymStatus/gymCompletedAt and no level, so the
 * baseline is derived from the status here; a level supplied by a caller wins.
 */
export function mergeSessionsIntoHeatmap(history, sessions) {
  const byDate = new Map(
    history.map((h) => [
      h.date,
      { ...h, level: Number(h.level) || STATUS_LEVEL[h.gymStatus] || 0 },
    ])
  );

  for (const s of sessions) {
    const volume =
      (s.exercises || []).reduce(
        (total, ex) =>
          total + (ex.sets || []).reduce((sum, set) => sum + set.weight * set.reps, 0),
        0
      ) || 0;

    const existing = byDate.get(s.date) || {
      date: s.date,
      gymStatus: 'not-completed',
      level: 0,
    };

    existing.hasSession = true;
    existing.volume = Math.round((existing.volume || 0) + volume);

    // A day with logged sets is never blank, even if its status is untouched.
    existing.level = Math.max(1, Number(existing.level) || 0);
    byDate.set(s.date, existing);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

