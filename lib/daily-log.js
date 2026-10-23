import { format } from 'date-fns';
import { MICRO_NUTRIENTS, servingGrams } from './micros.js';

/** Shared helpers for DailyLog creation, macro math, and date handling. */

export const EMPTY_TOTAL_MACROS = { calories: 0, protein: 0, carbs: 0, fats: 0 };

/** Today's date as a yyyy-MM-dd string. */
export function todayDateString() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * yyyy-MM-dd string bounding the gym-history heatmap window: Jan 1 of
 * (currentYear - 2), or the start of the signup month if the account is
 * younger — the heatmap renders up to 3 calendar rows (current year +
 * two prior), each a full year, gated client-side by the signup date.
 */
export function heatmapHistoryFromDateString(createdAt) {
  const floor = new Date(new Date().getFullYear() - 2, 0, 1);
  const signup = createdAt ? new Date(createdAt) : null;
  const from = signup && signup > floor ? signup : floor;
  return format(new Date(from.getFullYear(), from.getMonth(), 1), 'yyyy-MM-dd');
}

/** Timezone-safe conversions between yyyy-MM-dd strings and UTC-anchored ms. */
export function dateStrToUtcMs(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function utcMsToDateStr(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Shape for a brand-new daily log (used for DB creation and GET fallbacks). */
export function createEmptyDailyLog(userId, date, extra = {}) {
  return {
    user: userId,
    date,
    meals: [],
    totalMacros: { ...EMPTY_TOTAL_MACROS },
    gymStatus: 'not-completed',
    ...extra,
  };
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/** Per-entry macros for a meal at a given quantity. */
export function calculateEntryMacros(meal, quantity) {
  return {
    calories: Math.round(meal.macros.calories * quantity),
    protein: round1(meal.macros.protein * quantity),
    carbs: round1(meal.macros.carbs * quantity),
    fats: round1(meal.macros.fats * quantity),
  };
}

/**
 * Recompute totalMacros from the actual meal entries.
 * Called on every write so stored totals can never drift from entries
 * (the old add/subtract approach accumulated floating-point error).
 */
export function recalculateTotals(dailyLog) {
  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

  for (const entry of dailyLog.meals || []) {
    totals.calories += entry.macros?.calories || 0;
    totals.protein += entry.macros?.protein || 0;
    totals.carbs += entry.macros?.carbs || 0;
    totals.fats += entry.macros?.fats || 0;
  }

  dailyLog.totalMacros = {
    calories: Math.round(totals.calories),
    protein: round1(totals.protein),
    carbs: round1(totals.carbs),
    fats: round1(totals.fats),
  };

  return dailyLog;
}

/**
 * Streak math on distinct yyyy-MM-dd date strings.
 * Current streak counts consecutive days ending today (or yesterday, so
 * an unfinished today doesn't hide an active streak).
 */
export function calculateStreaks(dateStrings, todayString = todayDateString()) {
  const dateSet = new Set(dateStrings);
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Current streak: walk back from today (or yesterday if today isn't logged).
  let currentStreak = 0;
  let cursorMs = dateStrToUtcMs(todayString);
  if (!dateSet.has(utcMsToDateStr(cursorMs))) {
    cursorMs -= DAY_MS;
  }
  while (dateSet.has(utcMsToDateStr(cursorMs))) {
    currentStreak += 1;
    cursorMs -= DAY_MS;
  }

  // Longest streak: longest run of consecutive days ever logged.
  const sortedDates = [...dateSet].sort();
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (
      i > 0 &&
      dateStrToUtcMs(sortedDates[i]) - dateStrToUtcMs(sortedDates[i - 1]) === DAY_MS
    ) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

/**
 * Micros behind a logged entry: its own snapshot when it has one, otherwise the
 * linked food's profile scaled to the entry's quantity.
 *
 * The fallback exists because entries written before their food was enriched
 * carry no snapshot at all. Without it, every day already in an account would
 * read as "no data" and the board could not appear for an existing user. A
 * snapshot always wins, so once an entry is logged against an enriched food,
 * editing that food can no longer move the day.
 */
export function resolveEntryMicros(entry) {
  const snapshot = entry?.micros;
  if (Array.isArray(snapshot?.values) && snapshot.values.length > 0) return snapshot;

  const meal = entry?.meal;
  if (!meal || typeof meal !== 'object' || !Array.isArray(meal.micros?.values)) {
    return undefined;
  }

  const quantity = Number(entry.quantity);
  return calculateEntryMicros(meal, Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
}

/**
 * Day roll-up of the micros behind logged entries.
 *
 * Totals are derived from the entries rather than stored, so an old log needs
 * no migration and a day can never disagree with the foods it lists. Each
 * nutrient keeps the amount that came from verified profiles apart from the
 * amount that came from estimates — summing them into one number would make a
 * recipe guess look as solid as a composition-table row.
 *
 * Entries with no profile contribute nothing and are not counted as zero.
 */
export function rollupEntryMicros(entries = []) {
  const buckets = new Map();
  let enrichedEntries = 0;

  for (const entry of entries) {
    const micros = resolveEntryMicros(entry);
    const values = Array.isArray(micros?.values) ? micros.values : [];
    if (values.length === 0) continue;
    enrichedEntries += 1;
    const verified = Boolean(micros.verified);

    for (const value of values) {
      const key = String(value.key).toLowerCase();
      const nutrient = MICRO_NUTRIENTS[key];
      if (!nutrient) continue;

      const amount = Number(value.amount) || 0;
      const bucket = buckets.get(key) || {
        key,
        unit: nutrient.unit,
        amount: 0,
        verified: 0,
        estimated: 0,
        verifiedEntries: 0,
        estimatedEntries: 0,
      };
      bucket.amount += amount;
      // Provenance is counted per contributing entry, not inferred from the
      // amounts: a verified food reporting 0 and an estimated one reporting 5
      // still make a mixed answer, even though the verified share is zero.
      if (verified) {
        bucket.verified += amount;
        bucket.verifiedEntries += 1;
      } else {
        bucket.estimated += amount;
        bucket.estimatedEntries += 1;
      }
      buckets.set(key, bucket);
    }
  }

  const roundMicro = (value) => Math.round(value * 1000) / 1000;
  const values = Object.keys(MICRO_NUTRIENTS)
    .filter((key) => buckets.has(key))
    .map((key) => {
      const bucket = buckets.get(key);
      return {
        key,
        unit: bucket.unit,
        amount: roundMicro(bucket.amount),
        verified: roundMicro(bucket.verified),
        estimated: roundMicro(bucket.estimated),
        verifiedEntries: bucket.verifiedEntries,
        estimatedEntries: bucket.estimatedEntries,
      };
    });

  return { values, enrichedEntries, totalEntries: entries.length };
}

/**
 * Scaled micronutrient snapshot for one logged entry, or undefined when the
 * meal carries no micro profile — so foods that were never enriched stay
 * without the field instead of gaining an empty one.
 *
 * Three decimals, unlike the one-decimal macros: B12 and vitamin D are
 * measured in µg and would lose real information as 0.0.
 */
export function calculateEntryMicros(meal, quantity) {
  const profile = meal?.micros;
  const values = Array.isArray(profile?.values) ? profile.values : [];
  if (values.length === 0) return undefined;

  // Profile amounts are per their own basis, while a logged entry is counted in
  // servings. A per-100 g profile therefore goes through the food's own serving
  // weight first; without one (a bowl, a cup) the amounts cannot be converted,
  // so validation refuses to store that combination and one serving is the only
  // reading left. Per-serving profiles scale straight by quantity.
  const servingFactor =
    profile.basis === '100g'
      ? (servingGrams(meal?.servingSize) ?? 100) / 100
      : 1;
  const scale = servingFactor * quantity;

  return {
    values: values.map((value) => ({
      key: String(value.key).toLowerCase(),
      unit: value.unit || 'mg',
      amount: Math.round(value.amount * scale * 1000) / 1000,
    })),
    source: profile.source || undefined,
    basis: profile.basis || undefined,
    verified: Boolean(profile.verified),
  };
}
