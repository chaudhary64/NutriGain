import mongoose from 'mongoose';

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
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'general'],
    default: 'general',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);
