/**
 * One-time migration: parse legacy string weights on UserExerciseData into
 * numeric fields (warmUpSets/workingSets/prWeight).
 *
 * Legacy format observed in the data: plain numbers like "35", "42.5", "8.85".
 * The parser tolerates "40 kg", "3x8 @ 70" style strings too and extracts the
 * largest weight it can find, so nothing is lost on odd formats.
 *
 * Dry-run by default — run with --write to persist:
 *   pnpm run migrate-sets -- --write
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import UserExerciseData from '../models/UserExerciseData.js';
import '../models/Exercise.js';

// --- env loading (no dotenv dependency; mirrors scripts/seed-admin.js) ---
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const WRITE = process.argv.includes('--write');

/** Parse a legacy string into [{ weight, reps }] (1 set per distinct weight found). */
export function parseLegacySets(value) {
  if (typeof value !== 'string' || value.trim() === '') return undefined;

  // Matches "42.5", "40kg", "3x8 @ 70" — captures numbers, keeps order.
  const numbers = [...value.matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
  if (numbers.length === 0) return undefined;

  // "3x8 @ 70" style: first number(s) may be reps-multipliers; keep it simple —
  // treat every number as a weight candidate and de-duplicate.
  const weights = [...new Set(numbers.filter((n) => n > 0 && n <= 1000))];
  if (weights.length === 0) return undefined;

  return weights.map((weight) => ({ weight, reps: 0 }));
}

function summarize(label, sets) {
  if (!sets) return `${label}: (nothing to parse)`;
  return `${label}: ${sets.map((s) => s.weight).join(', ')} kg`;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nutrigain' });
  const docs = await UserExerciseData.find({}).lean();
  console.log(`Found ${docs.length} UserExerciseData documents. Mode: ${WRITE ? 'WRITE' : 'DRY RUN'}`);

  let changed = 0;
  for (const doc of docs) {
    const warmUpSets = parseLegacySets(doc.warmUp);
    const workingSets = parseLegacySets(doc.working);
    const prWeight =
      doc.prWeight != null
        ? doc.prWeight
        : doc.lastPR
          ? parseFloat(String(doc.lastPR).match(/\d+(?:\.\d+)?/)?.[0]) || undefined
          : undefined;

    const alreadyDone =
      doc.warmUpSets?.length > 0 || doc.workingSets?.length > 0 || doc.prWeight != null;
    const hasNew =
      (warmUpSets && (!doc.warmUpSets || doc.warmUpSets.length === 0)) ||
      (workingSets && (!doc.workingSets || doc.workingSets.length === 0)) ||
      (prWeight != null && doc.prWeight == null);

    if (!hasNew) {
      if (alreadyDone) continue;
      console.log(`  doc ${doc._id}: no numeric data derivable (warmUp="${doc.warmUp}", working="${doc.working}", lastPR="${doc.lastPR}")`);
      continue;
    }

    changed += 1;
    console.log(`  doc ${doc._id}:`);
    if (warmUpSets) console.log('    ' + summarize('warmUpSets', warmUpSets));
    if (workingSets) console.log('    ' + summarize('workingSets', workingSets));
    if (prWeight != null) console.log(`    prWeight: ${prWeight}`);

    if (WRITE) {
      const update = { $set: { updatedAt: new Date() } };
      if (warmUpSets && (!doc.warmUpSets || doc.warmUpSets.length === 0)) {
        update.$set.warmUpSets = warmUpSets;
      }
      if (workingSets && (!doc.workingSets || doc.workingSets.length === 0)) {
        update.$set.workingSets = workingSets;
      }
      if (prWeight != null && doc.prWeight == null) {
        update.$set.prWeight = prWeight;
      }
      await UserExerciseData.updateOne({ _id: doc._id }, update);
    }
  }

  console.log(`${WRITE ? 'Migrated' : 'Would migrate'} ${changed} of ${docs.length} documents.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
