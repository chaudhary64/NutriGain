import mongoose from 'mongoose';
import { MicroProfileSchema } from './Micros.js';
import { GYM_STATUSES, MEAL_TYPES } from '../lib/constants.js';

const MealEntrySchema = new mongoose.Schema({
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true,
  },
  mealName: String,
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  mealType: {
    type: String,
    enum: MEAL_TYPES,
    required: true,
  },
  macros: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  // Snapshot of the meal's micro profile at logging time, scaled by quantity —
  // the same way `macros` is snapshotted, so an edited meal never rewrites
  // what a past day recorded.
  micros: {
    type: MicroProfileSchema,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const DailyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  meals: [MealEntrySchema],
  totalMacros: {
    calories: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
  },
  gymStatus: {
    type: String,
    enum: GYM_STATUSES,
    default: 'not-completed',
  },
  gymCompletedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);
