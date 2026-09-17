/**
 * One-time cleanup for the removed Chicken/Paneer meal-schedule feature:
 *   1. Deletes the `settings` doc with key 'mealSchedule' (global schedule).
 *   2. Unsets the dead `mealDays` field from every user document.
 *
 * Nothing reads either anymore (route, model field, and validation were all
 * removed), so this is pure hygiene — but it's still destructive, hence
 * dry-run by default. Run with --write to persist:
 *   pnpm run cleanup-schedule -- --write
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';

// --- env loading (no dotenv dependency; mirrors scripts/migrate-sets.js) ---
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const WRITE = process.argv.includes('--write');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nutrigain' });
  const db = mongoose.connection.db;

  // Raw collections on purpose: independent of current model definitions,
  // so the script keeps working even if schemas change again.
  const settings = db.collection('settings');
  const users = db.collection('users');

  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to persist)'}`);

  // 1. Global meal-schedule doc in `settings`
  const scheduleDoc = await settings.findOne({ key: 'mealSchedule' });
  if (scheduleDoc) {
    console.log(`settings: found mealSchedule doc (value: ${JSON.stringify(scheduleDoc.value)})`);
    if (WRITE) {
      const { deletedCount } = await settings.deleteMany({ key: 'mealSchedule' });
      console.log(`settings: deleted ${deletedCount} doc(s).`);
    } else {
      console.log('settings: would delete 1 doc.');
    }
  } else {
    console.log('settings: no mealSchedule doc found — already clean.');
  }

  // 2. Dead `mealDays` field on users
  const withMealDays = await users.countDocuments({ mealDays: { $exists: true } });
  if (withMealDays > 0) {
    console.log(`users: ${withMealDays} document(s) still carry a mealDays field.`);
    if (WRITE) {
      const { modifiedCount } = await users.updateMany(
        { mealDays: { $exists: true } },
        { $unset: { mealDays: '' } },
      );
      console.log(`users: unset mealDays on ${modifiedCount} document(s).`);
    } else {
      console.log(`users: would unset mealDays on ${withMealDays} document(s).`);
    }
  } else {
    console.log('users: no mealDays fields found — already clean.');
  }

  await mongoose.disconnect();
  console.log(WRITE ? 'Cleanup complete.' : 'Dry run complete — no changes written.');
}

main().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
