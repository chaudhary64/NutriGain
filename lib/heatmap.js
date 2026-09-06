/**
 * Client-safe heatmap helpers (no model imports — used by both the
 * workout-sessions API and the gym dashboard).
 */

/**
 * Merge session days into the heatmap-level shape the client already builds
 * from gymHistory: [{ date, gymStatus, level, volume }]. Sessions only ever
 * raise a day's level — a logged session can't make a completed day look weaker.
 */
export function mergeSessionsIntoHeatmap(history, sessions) {
  const byDate = new Map(history.map((h) => [h.date, { ...h }]));

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

    if (existing.level < 1) {
      existing.level = 1;
    }
    byDate.set(s.date, existing);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

