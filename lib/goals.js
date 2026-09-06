/**
 * Per-user macro goal defaults.
 *
 * Goals used to come from NEXT_PUBLIC_GOAL_* build-time env vars. They now
 * live on each user document; these env values seed a user's goals exactly
 * once (at registration, or on first profile load for pre-existing users)
 * so nobody's targets silently change.
 */

export const FALLBACK_MACRO_GOALS = {
  calories: 1900,
  protein: 120,
  carbs: 170,
  fats: 60,
};

export function getDefaultMacroGoals() {
  return {
    calories: parseInt(process.env.NEXT_PUBLIC_GOAL_CALORIES) || FALLBACK_MACRO_GOALS.calories,
    protein: parseInt(process.env.NEXT_PUBLIC_GOAL_PROTEIN) || FALLBACK_MACRO_GOALS.protein,
    carbs: parseInt(process.env.NEXT_PUBLIC_GOAL_CARBS) || FALLBACK_MACRO_GOALS.carbs,
    fats: parseInt(process.env.NEXT_PUBLIC_GOAL_FATS) || FALLBACK_MACRO_GOALS.fats,
  };
}
