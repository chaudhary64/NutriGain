/**
 * Seeds an isolated preview account so the redesigned meal page can be
 * demoed with realistic data. Only touches documents owned by the preview
 * user — real accounts are never modified.
 *
 *   node scripts/seed-preview-user.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Minimal .env.local loader (same approach as seed-admin.js).
(function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const MONGODB_URI = process.env.MONGODB_URI;
const PREVIEW_EMAIL = 'preview.tester@nutrigain.local';
const PREVIEW_PASSWORD = 'preview1234';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set. Add it to .env.local first.');
  process.exit(1);
}

const round1 = (v) => Math.round(v * 10) / 10;

const MEALS = [
  { name: 'greek yogurt bowl', servingSize: '1 bowl', category: 'breakfast', macros: { calories: 130, protein: 15, carbs: 8, fats: 4 } },
  { name: 'masala omelette', servingSize: '2 eggs', category: 'breakfast', macros: { calories: 180, protein: 12, carbs: 2, fats: 9 } },
  { name: 'grilled chicken breast', servingSize: '100 g', category: 'general', macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 } },
  { name: 'brown rice', servingSize: '100 g cooked', category: 'lunch', macros: { calories: 112, protein: 2.6, carbs: 23, fats: 0.9 } },
  { name: 'whole wheat roti', servingSize: '1 roti', category: 'lunch', macros: { calories: 104, protein: 3, carbs: 20, fats: 1.2 } },
  { name: 'dal tadka', servingSize: '1 bowl', category: 'dinner', macros: { calories: 198, protein: 9, carbs: 24, fats: 7 } },
  { name: 'paneer tikka', servingSize: '100 g', category: 'general', macros: { calories: 265, protein: 18, carbs: 6, fats: 20 } },
  { name: 'chicken curry', servingSize: '1 bowl', category: 'dinner', macros: { calories: 245, protein: 22, carbs: 6, fats: 15 } },
];

// [mealName, quantity, mealType, hour, minute]
const ENTRIES = [
  ['masala omelette', 1, 'breakfast', 8, 30],
  ['grilled chicken breast', 1.5, 'lunch', 13, 15],
  ['brown rice', 1, 'lunch', 13, 20],
  ['whole wheat roti', 2, 'lunch', 13, 20],
  ['paneer tikka', 1, 'dinner', 20, 5],
];

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: 'nutrigain' });
  const User = mongoose.models.User || mongoose.model('User', require('../models/User').schema);
  const Meal = mongoose.models.Meal || mongoose.model('Meal', require('../models/Meal').schema);
  const DailyLog = mongoose.models.DailyLog || mongoose.model('DailyLog', require('../models/DailyLog').schema);

  // --- Preview user ---
  let user = await User.findOne({ email: PREVIEW_EMAIL });
  if (!user) {
    user = await User.create({
      email: PREVIEW_EMAIL,
      password: await bcrypt.hash(PREVIEW_PASSWORD, 10),
      name: 'Preview Tester',
      isAdmin: false,
    });
    console.log('Preview user created:', PREVIEW_EMAIL);
  } else {
    console.log('Preview user already exists:', PREVIEW_EMAIL);
  }
  if (!user.macroGoals?.calories) {
    user.macroGoals = { calories: 1900, protein: 120, carbs: 170, fats: 60 };
    await user.save();
  }
  // Preview account skips the onboarding wizard entirely.
  if (!user.onboardedAt) {
    user.onboardedAt = new Date();
    user.profile = { sex: 'other', age: 28, heightCm: 175, activityLevel: 'moderate', goal: 'maintain' };
    await user.save();
  }

  // --- Meals owned by the preview user ---
  const mealsByName = {};
  for (const def of MEALS) {
    const meal = await Meal.findOneAndUpdate(
      { name: def.name, createdBy: user._id },
      { $set: { ...def, createdBy: user._id } },
      { new: true, upsert: true }
    );
    mealsByName[def.name] = meal;
  }
  console.log(`Meals ready: ${Object.keys(mealsByName).length}`);

  // --- Today's daily log with a realistic mid-day state ---
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const meals = ENTRIES.map(([name, quantity, mealType, h, m]) => {
    const meal = mealsByName[name];
    const addedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    return {
      meal: meal._id,
      mealName: meal.name,
      quantity,
      mealType,
      macros: {
        calories: Math.round(meal.macros.calories * quantity),
        protein: round1(meal.macros.protein * quantity),
        carbs: round1(meal.macros.carbs * quantity),
        fats: round1(meal.macros.fats * quantity),
      },
      addedAt,
    };
  });

  const totals = meals.reduce(
    (acc, e) => ({
      calories: acc.calories + e.macros.calories,
      protein: round1(acc.protein + e.macros.protein),
      carbs: round1(acc.carbs + e.macros.carbs),
      fats: round1(acc.fats + e.macros.fats),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
  totals.calories = Math.round(totals.calories);

  await DailyLog.findOneAndUpdate(
    { user: user._id, date },
    { $set: { meals, totalMacros: totals, updatedAt: new Date() }, $setOnInsert: { user: user._id, date } },
    { new: true, upsert: true }
  );

  console.log(`Daily log for ${date}: ${totals.calories} kcal / ${totals.protein} P / ${totals.carbs} C / ${totals.fats} F (${meals.length} entries)`);
  console.log(`\nLogin for preview → email: ${PREVIEW_EMAIL}  password: ${PREVIEW_PASSWORD}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
