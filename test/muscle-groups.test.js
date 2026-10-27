/**
 * lib/muscle-groups.js — workout-split templates use composite day names
 * (Push, Pull, Upper Body...), while the exercise library tags granular groups.
 * Expanding a composite day is what makes its exercises render.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { expandMuscleGroups } from '../lib/muscle-groups.js';

test('push and pull days expand to their granular groups in order', () => {
  assert.deepEqual(expandMuscleGroups(['Push']), ['Chest', 'Shoulders', 'Tricep']);
  assert.deepEqual(expandMuscleGroups(['Pull']), ['Back', 'Bicep', 'Forearms']);
});

test('a group already listed alongside a composite day is not repeated', () => {
  assert.deepEqual(expandMuscleGroups(['Push', 'Chest']), ['Chest', 'Shoulders', 'Tricep']);
});

test('two composite days merge without duplicating a group', () => {
  const expanded = expandMuscleGroups(['Push', 'Pull']);
  assert.deepEqual(expanded, ['Chest', 'Shoulders', 'Tricep', 'Back', 'Bicep', 'Forearms']);
});

test('a rest day expands to nothing', () => {
  assert.deepEqual(expandMuscleGroups(['Rest Day']), []);
});

test('granular names pass through untouched', () => {
  assert.deepEqual(expandMuscleGroups(['Legs']), ['Legs']);
  assert.deepEqual(expandMuscleGroups(['Abs', 'Back']), ['Abs', 'Back']);
});

test('Full Body covers all eight granular groups exactly once', () => {
  const expanded = expandMuscleGroups(['Full Body']);

  assert.equal(expanded.length, 8);
  assert.equal(new Set(expanded).size, 8);
});

test('empty and missing input are safe', () => {
  assert.deepEqual(expandMuscleGroups([]), []);
  assert.deepEqual(expandMuscleGroups(undefined), []);
  assert.deepEqual(expandMuscleGroups(null), []);
});
