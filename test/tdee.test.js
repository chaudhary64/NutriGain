/**
 * lib/tdee.js — Mifflin-St Jeor nutrition math.
 *
 * Pure functions: no database, no network, no Next imports. Expected numbers
 * are worked out by hand from the formulas the module documents.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIVITY_LEVELS,
  GOALS,
  calculateBmr,
  calculateTdee,
  suggestMacroGoals,
} from '../lib/tdee.js';

const MALE = { sex: 'male', weightKg: 70, heightCm: 175, age: 25 };
const FEMALE = { ...MALE, sex: 'female' };

test('BMR follows Mifflin-St Jeor for a male profile', () => {
  // 10*70 + 6.25*175 - 5*25 + 5
  assert.equal(calculateBmr(MALE), 1673.75);
});

test('BMR applies the female offset', () => {
  // 10*70 + 6.25*175 - 5*25 - 161
  assert.equal(calculateBmr(FEMALE), 1507.75);
});

test("BMR for 'other' sits midway between the male and female values", () => {
  const other = calculateBmr({ ...MALE, sex: 'other' });
  assert.equal(other, (calculateBmr(MALE) + calculateBmr(FEMALE)) / 2);
});

test('BMR rejects an unknown sex', () => {
  assert.equal(calculateBmr({ ...MALE, sex: 'robot' }), null);
});

test('BMR rejects non-numeric and missing measurements', () => {
  assert.equal(calculateBmr({ ...MALE, weightKg: 'seventy' }), null);
  assert.equal(calculateBmr({ ...MALE, heightCm: undefined }), null);
  assert.equal(calculateBmr({ sex: 'male', weightKg: 70, heightCm: 175 }), null);
});

test('TDEE multiplies BMR by each activity multiplier', () => {
  for (const level of ACTIVITY_LEVELS) {
    assert.equal(calculateTdee(2000, level.value), 2000 * level.multiplier);
  }
});

test('TDEE rejects an unknown activity level or a null BMR', () => {
  assert.equal(calculateTdee(2000, 'marathon'), null);
  assert.equal(calculateTdee(null, 'moderate'), null);
});

test('a cut follows the documented calorie and macro formulas', () => {
  const goals = suggestMacroGoals({ ...MALE, activityLevel: 'moderate', goal: 'cut' });

  assert.equal(goals.bmr, 1674);
  assert.equal(goals.tdee, 2594);
  assert.equal(goals.calories, 2080); // TDEE x 0.8, rounded to the nearest 10 kcal
  assert.equal(goals.protein, 154); // 70 kg x 2.2 g/kg
  assert.equal(goals.fats, 62); // 27% of calories, at 9 kcal per gram
  assert.equal(goals.carbs, 227); // whatever the protein and fat leave over
});

test('the macro split reconciles with the calorie target', () => {
  for (const goal of GOALS) {
    const goals = suggestMacroGoals({ ...MALE, activityLevel: 'moderate', goal: goal.value });
    const fromMacros = goals.protein * 4 + goals.carbs * 4 + goals.fats * 9;
    // Rounding every macro to whole grams leaves a few kcal of drift by design.
    assert.ok(
      Math.abs(fromMacros - goals.calories) <= 12,
      `${goal.value}: macros account for ${fromMacros} kcal, target is ${goals.calories}`
    );
  }
});

test('calories are clamped to the 1200 kcal floor', () => {
  const goals = suggestMacroGoals({
    sex: 'female',
    weightKg: 40,
    heightCm: 150,
    age: 60,
    activityLevel: 'sedentary',
    goal: 'cut',
  });
  assert.equal(goals.calories, 1200);
});

test('protein is clamped between 60 g and 300 g', () => {
  const light = suggestMacroGoals({ ...MALE, weightKg: 20, activityLevel: 'light', goal: 'cut' });
  const heavy = suggestMacroGoals({ ...MALE, weightKg: 200, activityLevel: 'moderate', goal: 'cut' });

  assert.equal(light.protein, 60);
  assert.equal(heavy.protein, 300);
});

test('carbs never drop below the 20 g floor', () => {
  const profiles = [
    { ...MALE, weightKg: 20 },
    { ...MALE, weightKg: 200 },
    { ...FEMALE, weightKg: 40, heightCm: 150, age: 60 },
  ];

  for (const profile of profiles) {
    for (const goal of GOALS) {
      const goals = suggestMacroGoals({ ...profile, activityLevel: 'sedentary', goal: goal.value });
      assert.ok(goals.carbs >= 20, `${goal.value} at ${profile.weightKg}kg produced ${goals.carbs} g`);
    }
  }
});

test('an unknown goal or an incomplete profile returns null', () => {
  assert.equal(
    suggestMacroGoals({ ...MALE, activityLevel: 'moderate', goal: 'recomp' }),
    null
  );
  assert.equal(
    suggestMacroGoals({ sex: 'male', weightKg: 70, activityLevel: 'moderate', goal: 'cut' }),
    null
  );
});
