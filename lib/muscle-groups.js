/**
 * Expansion of composite split groups into granular muscle groups.
 *
 * The exercise library tags each exercise with a granular muscle group
 * (Abs, Back, Bicep, Chest, Forearms, Legs, Shoulders, Tricep), while
 * workout-split templates also allow composite day names (Push, Pull,
 * Upper Body, Lower Body, Full Body, Rest Day). A day assigned a
 * composite name matches no exercise directly, so the gym page expands
 * it through this map before filtering.
 *
 * Client-safe: pure data, no server imports.
 */

export const COMPOSITE_GROUP_EXPANSIONS = {
  Push: ["Chest", "Shoulders", "Tricep"],
  Pull: ["Back", "Bicep", "Forearms"],
  "Upper Body": ["Chest", "Back", "Shoulders", "Bicep", "Tricep", "Forearms"],
  "Lower Body": ["Legs"],
  "Full Body": ["Abs", "Back", "Bicep", "Chest", "Forearms", "Legs", "Shoulders", "Tricep"],
  "Rest Day": [],
};

/**
 * Expand one day's group names into the set of granular muscle groups whose
 * exercises should render for that day. Unknown names pass through unchanged
 * (they may be granular tags like "Legs" themselves).
 */
export function expandMuscleGroups(groups) {
  const expanded = [];
  for (const group of groups || []) {
    const expansion = COMPOSITE_GROUP_EXPANSIONS[group];
    if (expansion) {
      for (const granular of expansion) {
        if (!expanded.includes(granular)) expanded.push(granular);
      }
    } else if (group && !expanded.includes(group)) {
      expanded.push(group);
    }
  }
  return expanded;
}
