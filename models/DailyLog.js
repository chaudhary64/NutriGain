import mongoose from 'mongoose';

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
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true,
  },
  macros: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
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
