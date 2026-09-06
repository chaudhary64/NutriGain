import { format, subYears } from 'date-fns';

/** Shared helpers for DailyLog creation, macro math, and date handling. */

export const EMPTY_TOTAL_MACROS = { calories: 0, protein: 0, carbs: 0, fats: 0 };

/** Today's date as a yyyy-MM-dd string. */
export function todayDateString() {
  return format(new Date(), 'yyyy-MM-dd');
}

/** yyyy-MM-dd string for exactly one year ago (gym history window). */
export function oneYearAgoDateString() {
  return format(subYears(new Date(), 1), 'yyyy-MM-dd');
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
