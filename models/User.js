import mongoose from 'mongoose';

const WeightEntrySchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  weightEntries: [WeightEntrySchema],
  targetWeight: {
    type: Number,
    default: 75,
  },
  theme: {
    type: String,
    enum: ["light", "dark", ""],
    default: "", // empty = follow OS on first visit
  },
  macroGoals: {
    calories: { type: Number, default: 1900 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 170 },
    fats: { type: Number, default: 60 },
  },
  // Onboarding profile (optional — only set once the wizard is completed).
  profile: {
    sex: { type: String, enum: ['male', 'female', 'other', ''] , default: '' },
    age: { type: Number, min: 13, max: 100 },
    heightCm: { type: Number, min: 100, max: 250 },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'athlete', ''], default: '' },
    goal: { type: String, enum: ['cut', 'maintain', 'bulk', ''], default: '' },
  },
  // Set once onboarding (or its skip) completes. Null = not onboarded —
  // the dashboard layout gates on this; profile-editable via /api/onboarding.
  onboardedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Force complete model recompilation in development to ensure schema changes are recognized
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete mongoose.models.User;
  delete mongoose.connection.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
