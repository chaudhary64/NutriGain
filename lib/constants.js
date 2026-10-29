/**
 * Domain vocabulary shared by the models, the API routes and the UI.
 *
 * Plain data only, so client components can import it without dragging server
 * code into the bundle, and Mongoose schemas can use the same arrays for their
 * enums. Adding a muscle group or a meal slot is a one-line change here instead
 * of a hunt through eight files.
 */

/** The granular groups an exercise in the library is tagged with. */
export const MUSCLE_GROUPS = [
  'Abs',
  'Back',
  'Bicep',
  'Chest',
  'Forearms',
  'Legs',
  'Shoulders',
  'Tricep',
];

/**
 * Split vocabulary: the granular groups plus composite day names (Push, Pull,
 * Upper/Lower/Full Body) and Rest Day. A day can hold up to four of these.
 */
export const MUSCLE_GROUP_OPTIONS = [
  ...MUSCLE_GROUPS,
  'Push',
  'Pull',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Rest Day',
];

/** Weekdays in schedule order — Monday first, matching the printed split. */
export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** Meal slots, ordered as a day reads: snacks sit between lunch and dinner. */
export const MEAL_TYPES = ['breakfast', 'lunch', 'snacks', 'dinner'];

/** Food-library categories — a property of the food, not of a log entry. */
export const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'general'];

/** Completed state of a day's workout, tracked on the daily log. */
export const GYM_STATUSES = ['not-completed', 'partially-completed', 'completed'];

/** Exercise classification in the shared library. */
export const EXERCISE_TYPES = ['COMPOUND', 'ISOLATION'];
