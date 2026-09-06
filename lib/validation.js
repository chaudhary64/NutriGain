/**
 * Small zero-dependency validation helpers for API routes.
 * Every validator returns an array of error message strings —
 * an empty array means the payload is valid.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
export const GYM_STATUSES = ['not-completed', 'partially-completed', 'completed'];
export const MUSCLE_GROUPS = ['Abs', 'Arms', 'Back', 'Bicep', 'Chest', 'Forearms', 'Legs', 'Shoulders', 'Tricep'];
export const EXERCISE_TYPES = ['COMPOUND', 'ISOLATION'];
export const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'general'];

/** 7-entry per-day meal schedule (admin UI only offers Chicken/Paneer today). */
export const MEAL_DAY_OPTIONS = ['Chicken', 'Paneer'];

/** Matches Mongo ObjectId shape (24 hex chars). */
export function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

/** Strict yyyy-MM-dd date string (also rejects impossible dates). */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function toFiniteNumber(value) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/** Validate the 4 macro fields; returns [errors, normalizedMacros]. */
export function validateMacros(input, { required = false } = {}) {
  const errors = [];
  const macros = {};
  const fields = ['calories', 'protein', 'carbs', 'fats'];

  for (const field of fields) {
    const raw = input?.[field];
    if (raw === undefined || raw === null || raw === '') {
      if (required) errors.push(`Macro '${field}' is required`);
      macros[field] = 0;
      continue;
    }
    const n = toFiniteNumber(raw);
    if (n === null || n < 0 || n > 10000) {
      errors.push(`Macro '${field}' must be a number between 0 and 10000`);
      continue;
    }
    macros[field] = n;
  }

  return [errors, macros];
}

/** Validate a registration payload; returns [errors, { email, name, password }]. */
export function validateRegister(body) {
  const errors = [];
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!EMAIL_RE.test(email)) errors.push('Please provide a valid email address');
  if (name.length < 2 || name.length > 80) errors.push('Name must be between 2 and 80 characters');
  if (password.length < 6 || password.length > 128) {
    errors.push('Password must be between 6 and 128 characters');
  }

  return [errors, { email, name, password }];
}

/** Validate a login payload; returns [errors, { email, password }]. */
export function validateLogin(body) {
  const errors = [];
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!EMAIL_RE.test(email)) errors.push('Please provide a valid email address');
  if (!password) errors.push('Password is required');

  return [errors, { email, password }];
}

/** Validate a daily-log meal entry payload; returns [errors, normalized]. */
export function validateDailyLogMeal(body) {
  const errors = [];
  const { mealId, mealType, date } = body || {};

  if (!isValidObjectId(mealId)) errors.push('A valid mealId is required');

  const quantity = toFiniteNumber(body?.quantity);
  if (quantity === null || quantity <= 0 || quantity > 1000) {
    errors.push('Quantity must be a positive number (max 1000)');
  }

  if (!MEAL_TYPES.includes(mealType)) {
    errors.push(`mealType must be one of: ${MEAL_TYPES.join(', ')}`);
  }

  if (!isValidDateString(date)) {
    errors.push('date must be a valid yyyy-MM-dd string');
  }

  return [errors, { mealId, quantity, mealType, date }];
}

/** Validate a gym status payload; returns [errors, { gymStatus, date }]. */
export function validateGymStatus(body) {
  const errors = [];
  const { gymStatus } = body || {};

  if (!GYM_STATUSES.includes(gymStatus)) {
    errors.push(`gymStatus must be one of: ${GYM_STATUSES.join(', ')}`);
  }

  const date = body?.date;
  if (date !== undefined && !isValidDateString(date)) {
    errors.push('date must be a valid yyyy-MM-dd string');
  }

  return [errors, { gymStatus, date }];
}

/** Validate a weight-entry payload; returns [errors, { weight, date }]. */
export function validateWeightEntry(body) {
  const errors = [];
  const weight = toFiniteNumber(body?.weight);

  if (weight === null || weight < 20 || weight > 400) {
    errors.push('Weight must be a number between 20 and 400 (kg)');
  }

  if (!isValidDateString(body?.date)) {
    errors.push('date must be a valid yyyy-MM-dd string');
  }

  return [errors, { weight, date: body?.date }];
}

/** Validate a target-weight payload; returns [errors, targetWeight]. */
export function validateTargetWeight(body) {
  const errors = [];
  const targetWeight = toFiniteNumber(body?.targetWeight);

  if (targetWeight === null || targetWeight < 20 || targetWeight > 400) {
    errors.push('targetWeight must be a number between 20 and 400 (kg)');
  }

  return [errors, targetWeight];
}

/** Validate an exercise payload; returns [errors, whitelisted]. */
export function validateExercise(body) {
  const errors = [];
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (name.length < 1 || name.length > 120) {
    errors.push('Exercise name is required (max 120 characters)');
  }
  if (!MUSCLE_GROUPS.includes(body?.muscleGroup)) {
    errors.push(`muscleGroup must be one of: ${MUSCLE_GROUPS.join(', ')}`);
  }
  if (!EXERCISE_TYPES.includes(body?.type)) {
    errors.push(`type must be one of: ${EXERCISE_TYPES.join(', ')}`);
  }

  return [errors, { name, muscleGroup: body.muscleGroup, type: body.type }];
}

/** Whitelist + validate a meal payload; returns [errors, whitelisted]. */
export function validateMeal(body) {
  const errors = [];
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (name.length < 1 || name.length > 200) {
    errors.push('Meal name is required (max 200 characters)');
  }

  const [macroErrors, macros] = validateMacros(body?.macros, { required: true });
  errors.push(...macroErrors);

  const servingSize =
    typeof body?.servingSize === 'string' && body.servingSize.trim()
      ? body.servingSize.trim().slice(0, 100)
      : '1 serving';

  const category = MEAL_CATEGORIES.includes(body?.category)
    ? body.category
    : 'general';

  return [errors, { name, servingSize, macros, category }];
}

/** Validate a 7-day meal schedule array; returns [errors, days]. */
export function validateMealSchedule(days) {
  const errors = [];

  if (!Array.isArray(days) || days.length !== 7) {
    return ['mealDays must be an array of exactly 7 entries'], days;
  }

  for (let i = 0; i < days.length; i++) {
    if (!MEAL_DAY_OPTIONS.includes(days[i])) {
      errors.push(
        `mealDays[${i}] must be one of: ${MEAL_DAY_OPTIONS.join(', ')}`
      );
    }
  }

  return [errors, days];
}

/** Validate per-user macro goal targets; returns [errors, goals]. */
export function validateMacroGoals(input) {
  const errors = [];
  const goals = {};
  const fields = ['calories', 'protein', 'carbs', 'fats'];

  for (const field of fields) {
    const raw = input?.[field];
    const n = toFiniteNumber(raw);

    if (n === null || n < 1 || n > 10000) {
      errors.push(`Goal '${field}' must be a number between 1 and 10000`);
      continue;
    }
    goals[field] = n;
  }

  return [errors, goals];
}
