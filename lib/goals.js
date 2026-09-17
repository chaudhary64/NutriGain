/**
 * Per-user macro goal defaults.
 *
 * Goals live on each user document (set during onboarding, editable on the
 * profile page). These fallbacks seed a user's goals exactly once (at
 * registration, or on first profile load for pre-existing users) so nobody's
 * targets silently change.
 */

export const FALLBACK_MACRO_GOALS = {
  calories: 1900,
  protein: 120,
  carbs: 170,
  fats: 60,
};

export function getDefaultMacroGoals() {
  return { ...FALLBACK_MACRO_GOALS };
}
