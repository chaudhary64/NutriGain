/**
 * Canonical micronutrient catalogue — the one place a nutrient key is declared.
 *
 * Client-safe: plain data, no model imports, so both the admin form and the
 * API validators can read it. Adding a nutrient here is the whole job; the
 * model, validator and form all pick it up.
 *
 * `unit` is canonical per nutrient, not per record: iron is always mg and
 * vitamin D always µg, so a value can never arrive in the wrong scale.
 */

export const MICRO_UNITS = ['mg', 'ug', 'iu'];

/**
 * Where a profile's numbers came from. `estimate` is for values derived from a
 * recipe or a portion guess rather than a composition table.
 */
export const MICRO_SOURCES = ['usda', 'indb', 'ifct', 'off', 'user', 'estimate'];

/** What the amounts describe: one serving as stored, or 100 g of the food. */
export const MICRO_BASES = ['serving', '100g'];

/**
 * The six nutrients worth tracking first — the ones commonly short in India.
 * `short` is the column heading used where the full label does not fit.
 */
export const MICRO_NUTRIENTS = {
  vitamin_d: { label: 'Vitamin D', short: 'Vit D', unit: 'ug' },
  b12: { label: 'Vitamin B12', short: 'B12', unit: 'ug' },
  folate: { label: 'Folate', short: 'Folate', unit: 'ug' },
  iron: { label: 'Iron', short: 'Iron', unit: 'mg' },
  calcium: { label: 'Calcium', short: 'Calcium', unit: 'mg' },
  zinc: { label: 'Zinc', short: 'Zinc', unit: 'mg' },
};

/**
 * ICMR-NIN 2020 recommended dietary allowances for adults, in the catalogue's
 * canonical units.
 *
 * This is the standard the app's India-first food tables were built against;
 * the values are the report's RDAs for the reference adult, not an EAR. Where
 * the report separates men and women the table keeps both — the folate and
 * iron gap is real and large. `older` is the 60+ figure, set only where the
 * report publishes one: its elderly iron row contradicts the note that only
 * energy, vitamin D and calcium change with age, so iron stays at the adult
 * value rather than picking a side.
 *
 * Ages under 19 are outside this table. The app's onboarding floor is 13, but
 * the teen RDAs are a different set; using the adult figure for a young teen
 * understates their requirement, and inventing the teen table would be worse.
 */
export const MICRO_RDI = {
  vitamin_d: { male: 15, female: 15, older: 20 }, // 600 IU, 800 IU at 60+
  b12: { male: 2.2, female: 2.2 },
  folate: { male: 300, female: 220 },
  iron: { male: 19, female: 29 },
  calcium: { male: 1000, female: 1000, older: 1200 },
  zinc: { male: 17, female: 13 },
};

/** Short attribution for the target shown beside a nutrient. */
export const MICRO_RDI_SOURCE = 'ICMR-NIN 2020';

/**
 * The day's target for one nutrient, or null when the key is unknown.
 *
 * Sex comes from the onboarding profile; when it is unset (or "other") the
 * higher of the two requirements is used, so the board never reports a
 * shortfall that may not be one. Age only matters from 60, where the report
 * raises vitamin D and calcium.
 */
export function microTarget(key, profile) {
  const rdi = MICRO_RDI[key];
  if (!rdi) return null;

  const age = Number(profile?.age);
  if (Number.isFinite(age) && age >= 60 && rdi.older) return rdi.older;

  if (profile?.sex === 'male' || profile?.sex === 'female') return rdi[profile.sex];
  return Math.max(rdi.male, rdi.female);
}

export const MICRO_KEYS = Object.keys(MICRO_NUTRIENTS);

/** Canonical unit for a nutrient key, or null when the key is unknown. */
export function canonicalUnit(key) {
  return MICRO_NUTRIENTS[key]?.unit ?? null;
}

/** Human label for a nutrient key — falls back to the raw key. */
export function microLabel(key) {
  return MICRO_NUTRIENTS[key]?.label ?? key;
}

/**
 * Gram weight of one serving, parsed from a freeform serving size such as
 * "100 g cooked", "250g" or "1 serving (50 g)".
 *
 * Returns null when the text states no weight — a cup, a bowl or "1 roti"
 * cannot be converted, and guessing a weight would silently move every number
 * in the day's totals. The first `N g` in the string wins, which is the
 * serving's own weight in every serving-size format the app stores.
 */
export function servingGrams(servingSize) {
  if (typeof servingSize !== 'string') return null;
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*g(?:m|rams?)?\b/i);
  if (!match) return null;
  const grams = Number(match[1].replace(',', '.'));
  return Number.isFinite(grams) && grams > 0 ? grams : null;
}
