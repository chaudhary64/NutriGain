/**
 * Exercise illustrations from the open Workout Guide library
 * (https://github.com/bryllim/workout-guide) — 302 movements, three
 * consistent frames each, drawn by Bryl Lim from Everkinetic poses.
 *
 * Keyed by the shared exercise library's names rather than stored on the
 * Exercise document: the catalogue is global and read-only here, so a static
 * map needs no migration, and an exercise an admin adds later simply renders
 * without a picture instead of with a broken one.
 *
 * Assets live at public/exercises/<slug>/frame-{1,2,3}.svg. The artwork is
 * CC BY-SA 4.0, which is why every surface that shows it carries the credit
 * below and public/exercises/ATTRIBUTION.md keeps the full notice.
 */

const MEDIA = {
  "ab wheel rollout": "ab-wheel",
  "abdominal crunch": "crunch",
  "cable crunch": "cable-crunch",
  "hanging leg raise": "hanging-leg-raise",
  "close-grip lat pulldown": "close-grip-lat-pulldown",
  deadlift: "deadlift",
  "lat pulldown": "lat-pulldown",
  "seal rows": "chest-supported-row",
  "seated cable row": "seated-row",
  "barbell curl": "bicep-curl",
  "ez bar curl": "ez-bar-curl",
  "hammer curl": "hammer-curl",
  "incline dumbbell curl": "incline-dumbbell-curl",
  "bench press (flat)": "bench-press",
  "high-to-low cable fly( lower chest )": "cable-fly",
  "incline dumbbell press": "incline-dumbbell-press",
  "pec flys": "pec-deck",
  "reverse barbell curls": "reverse-curl",
  "reverse standing wrist curls": "wrist-extension",
  "wrist curls": "wrist-curl",
  "bulgarian split squat": "bulgarian-split-squat",
  "calf raises": "standing-calf-raise",
  "goblet squat": "goblet-squat",
  "hip thrust": "hip-thrust",
  "leg curl": "leg-curl",
  "leg extension": "leg-extension",
  "leg press": "leg-press",
  "romanian deadlift": "romanian-deadlift",
  "seated calf raise": "seated-calf-raise",
  "walking lunge": "walking-lunge",
  "weighted squats": "squat",
  "dumbbell front raises": "front-raise",
  "dumbbell shoulder press": "seated-dumbbell-press",
  "face pull": "face-pull",
  "lateral raises": "lateral-raise",
  shrugs: "shrug",
  "single-arm cable lateral raise": "cable-lateral-raise",
  "reverse grip tricep pushdown": "tricep-pushdown",
  "triceps pushdown ( rope )": "rope-tricep-pushdown",
  "triceps pushdown ( straight bar )": "tricep-pushdown",
};

export const EXERCISE_MEDIA_CREDIT = {
  label: "Bryl Lim / Everkinetic",
  license: "CC BY-SA 4.0",
  url: "https://github.com/bryllim/workout-guide",
};

export const EXERCISE_MEDIA_FRAMES = 3;

/**
 * Frames for one exercise, or null when the library has no illustration
 * (two forearm-rotation movements have no equivalent pose).
 */
export function exerciseMedia(name) {
  const slug = MEDIA[String(name || "").trim().toLowerCase().replace(/\s+/g, " ")];
  if (!slug) return null;
  return {
    slug,
    frames: Array.from(
      { length: EXERCISE_MEDIA_FRAMES },
      (_, index) => `/exercises/${slug}/frame-${index + 1}.svg`
    ),
  };
}
