import mongoose from 'mongoose';

/**
 * A WorkoutSession is everything a user actually trained on one day:
 * date -> exercises -> numeric sets (weight + reps).
 *
 * It is the source of truth for the consistency heatmap, volume history,
 * and PR progression. Gym status (completed/partial/skipped) continues to
 * live on the per-day DailyLog; a session simply proves work was done.
 */
const SetSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true, min: 0, max: 1000 },
    reps: { type: Number, required: true, min: 0, max: 500 },
  },
  { _id: false }
);

const SessionExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Exercise is required'],
    },
    sets: {
      type: [SetSchema],
      validate: {
        validator: (sets) => Array.isArray(sets) && sets.length > 0,
        message: 'At least one set is required per exercise',
      },
    },
  },
  { _id: false }
);

const WorkoutSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  date: {
    type: String,
    required: [true, 'Date is required (yyyy-MM-dd)'],
  },
  exercises: {
    type: [SessionExerciseSchema],
    default: [],
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500,
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

// One session per user per calendar day.
WorkoutSessionSchema.index({ user: 1, date: 1 }, { unique: true });
// Fast lookups of an exercise's history across all sessions (PR series).
WorkoutSessionSchema.index({ user: 1, 'exercises.exercise': 1, date: 1 });

WorkoutSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.WorkoutSession ||
  mongoose.model('WorkoutSession', WorkoutSessionSchema);
