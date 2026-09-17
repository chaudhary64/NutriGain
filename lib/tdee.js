/**
 * Pure nutrition math — client-safe (no models, no Next imports).
 *
 * Used by POST /api/onboarding to derive macro targets server-side (client
 * math is never trusted) and by the /onboarding page to preview the exact
 * same numbers live while the user types.
 */

export const SEXES = ['male', 'female', 'other'];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise', multiplier: 1.2 },
  { value: 'light', label: 'Lightly active', hint: 'Light exercise 1–3 days/week', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately active', hint: 'Exercise 3–5 days/week', multiplier: 1.55 },
  { value: 'active', label: 'Very active', hint: 'Hard exercise 6–7 days/week', multiplier: 1.725 },
  { value: 'athlete', label: 'Athlete', hint: 'Physical job + daily training', multiplier: 1.9 },
];

export const GOALS = [
  { value: 'cut', label: 'Cut', hint: 'Lose fat, keep muscle', calorieAdjust: 0.8, proteinPerKg: 2.2 },
  { value: 'maintain', label: 'Maintain', hint: 'Hold weight, recomp', calorieAdjust: 1, proteinPerKg: 1.8 },
  { value: 'bulk', label: 'Bulk', hint: 'Build size and strength', calorieAdjust: 1.1, proteinPerKg: 2 },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/**
 * Mifflin-St Jeor basal metabolic rate (kcal/day).
 * 'other' averages the male/female offsets. Returns null when the inputs
 * are missing or not plausible numbers.
 */
export function calculateBmr({ sex, weightKg, heightCm, age }) {
  if (!SEXES.includes(sex)) return null;

  const w = Number(weightKg);
  const h = Number(heightCm);
  const a = Number(age);
  if (!Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(a)) return null;

  const offset = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  return 10 * w + 6.25 * h - 5 * a + offset;
}

/** TDEE = BMR × activity multiplier. Returns null on invalid inputs. */
export function calculateTdee(bmr, activityLevel) {
  const level = ACTIVITY_LEVELS.find((l) => l.value === activityLevel);
  if (bmr == null || !level) return null;
  return bmr * level.multiplier;
}

/**
 * Suggest daily macro targets from a profile + goal.
 * Calories come from TDEE adjusted by the goal (cut −20%, bulk +10%),
 * protein from bodyweight (g/kg by goal), fats at 27% of calories, and
 * carbs fill the remainder. Returns
 *   { bmr, tdee, calories, protein, carbs, fats }
 * or null when the profile is incomplete.
 */
export function suggestMacroGoals({ sex, weightKg, heightCm, age, activityLevel, goal: goalValue }) {
  const goal = GOALS.find((g) => g.value === goalValue);
  const bmr = calculateBmr({ sex, weightKg, heightCm, age });
  const tdee = calculateTdee(bmr, activityLevel);
  if (!goal || bmr == null || tdee == null) return null;

  const calories = Math.round(clamp(tdee * goal.calorieAdjust, 1200, 6000) / 10) * 10;
  const protein = Math.round(clamp(weightKg * goal.proteinPerKg, 60, 300));
  const fats = Math.round(clamp((calories * 0.27) / 9, 30, 150));
  const carbs = Math.max(20, Math.round((calories - protein * 4 - fats * 9) / 4));

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, protein, carbs, fats };
}
