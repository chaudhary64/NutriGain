import mongoose from 'mongoose';

const UserExerciseDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: [true, 'Exercise ID is required'],
  },
  warmUp: {
    type: String,
    default: '',
  },
  working: {
    type: String,
    default: '',
  },
  // Numeric set templates (legacy `warmUp`/`working` strings stay for
  // backwards compatibility; the migration copies parsed values here).
  warmUpSets: {
    type: [{ weight: { type: Number, min: 0 }, reps: { type: Number, min: 0 } }],
    default: undefined,
  },
  workingSets: {
    type: [{ weight: { type: Number, min: 0 }, reps: { type: Number, min: 0 } }],
    default: undefined,
  },
  lastPR: {
    type: String,
    default: '',
  },
  lastPRDate: {
    type: String,
    default: '',
  },
  // Numeric PR (legacy `lastPR` string stays for backwards compatibility).
  prWeight: {
    type: Number,
    min: 0,
    default: undefined,
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

// Create a compound index to ensure one record per user per exercise
UserExerciseDataSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

UserExerciseDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.UserExerciseData || mongoose.model('UserExerciseData', UserExerciseDataSchema);
