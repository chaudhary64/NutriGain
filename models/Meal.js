import mongoose from 'mongoose';
import { MicroProfileSchema } from './Micros.js';
import { MEAL_CATEGORIES } from '../lib/constants.js';

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a meal name'],
    trim: true,
  },
  servingSize: {
    type: String,
    required: true,
    default: '1 serving',
  },
  macros: {
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      required: true,
      default: 0,
    },
    carbs: {
      type: Number,
      required: true,
      default: 0,
    },
    fats: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  // Optional micronutrient profile. Absent means "not enriched yet" — it is
  // never an empty set standing in for zero intake.
  micros: {
    type: MicroProfileSchema,
  },
  category: {
    type: String,
    enum: MEAL_CATEGORIES,
    default: 'general',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Foods a signed-in user creates are private to them; the admin-curated
  // library stays shared. Missing on documents written before this field
  // existed, which reads as shared — so no backfill is needed.
  isPrivate: {
    type: Boolean,
    default: false,
  },
  // A one-off entry typed on the spot: it exists only so the day's entry has
  // a food to point at, and is excluded from search so it never clutters the
  // library.
  isQuickAdd: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// The log bar reads "shared foods plus mine, newest first, never quick-adds".
// Each branch of that $or gets its filter fields as an index prefix and shares
// the sort key, so lookups stay index-backed as the library grows instead of
// scanning the collection. Indexes are built by `pnpm run sync-indexes`.
MealSchema.index({ isQuickAdd: 1, isPrivate: 1, createdAt: -1 });
MealSchema.index({ isQuickAdd: 1, createdBy: 1, createdAt: -1 });

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);
