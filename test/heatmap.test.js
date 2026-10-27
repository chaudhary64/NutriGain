/**
 * lib/heatmap.js — merges workout-session days into the heatmap the gym
 * dashboard renders: [{ date, gymStatus, level, volume }].
 *
 * The interesting rules are the level ramp (completed 4, partial 2, nothing 0)
 * and the promise in the module comment that a session can only ever raise a
 * day, never weaken it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mergeSessionsIntoHeatmap } from '../lib/heatmap.js';

const session = (date, sets) => ({ date, exercises: [{ sets }] });

test('a logged day appears with volume summed over every set', () => {
  const merged = mergeSessionsIntoHeatmap([], [session('2026-10-05', [
    { weight: 100, reps: 5 },
    { weight: 80, reps: 10 },
  ])]);

  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0], {
    date: '2026-10-05',
    gymStatus: 'not-completed',
    level: 1,
    volume: 1300, // 100*5 + 80*10
    hasSession: true,
  });
});

test('history days take their level from the gym status', () => {
  const merged = mergeSessionsIntoHeatmap(
    [
      { date: '2026-10-01', gymStatus: 'completed' },
      { date: '2026-10-02', gymStatus: 'partially-completed' },
      { date: '2026-10-03', gymStatus: 'not-completed' },
    ],
    []
  );

  assert.deepEqual(merged.map((day) => day.level), [4, 2, 0]);
});

test('a session never lowers a completed day', () => {
  const merged = mergeSessionsIntoHeatmap(
    [{ date: '2026-10-01', gymStatus: 'completed' }],
    [session('2026-10-01', [{ weight: 50, reps: 5 }])]
  );

  assert.equal(merged.length, 1, 'the session must merge into the existing day, not duplicate it');
  assert.equal(merged[0].level, 4);
  assert.equal(merged[0].volume, 250);
  assert.equal(merged[0].hasSession, true);
});

test('volume accumulates on top of a value the day already carried', () => {
  const merged = mergeSessionsIntoHeatmap(
    [{ date: '2026-10-01', gymStatus: 'partially-completed', volume: 500 }],
    [session('2026-10-01', [{ weight: 40, reps: 10 }])]
  );

  assert.equal(merged[0].volume, 900);
  assert.equal(merged[0].level, 2);
});

test('days come back in date order regardless of input order', () => {
  const merged = mergeSessionsIntoHeatmap(
    [{ date: '2026-10-09', gymStatus: 'completed' }],
    [session('2026-10-02', [{ weight: 10, reps: 1 }])]
  );

  assert.deepEqual(merged.map((day) => day.date), ['2026-10-02', '2026-10-09']);
});

test('a day with no sets still counts as logged', () => {
  const merged = mergeSessionsIntoHeatmap([], [{ date: '2026-10-04', exercises: [] }]);

  assert.equal(merged[0].volume, 0);
  assert.equal(merged[0].level, 1);
  assert.equal(merged[0].hasSession, true);
});

test('empty input returns an empty list', () => {
  assert.deepEqual(mergeSessionsIntoHeatmap([], []), []);
});
