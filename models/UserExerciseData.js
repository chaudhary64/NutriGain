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
  // Numeric set templates. The pre-numeric `warmUp`/`working` strings were
  // migrated into these and removed from the schema — see
  // scripts/cleanup-legacy-exercise-fields.js.
  warmUpSets: {
    type: [{ weight: { type: Number, min: 0 }, reps: { type: Number, min: 0 } }],
    default: undefined,
  },
  workingSets: {
    type: [{ weight: { type: Number, min: 0 }, reps: { type: Number, min: 0 } }],
    default: undefined,
  },
  lastPRDate: {
    type: String,
    default: '',
  },
  // Heaviest working set ever logged, in kg.
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
