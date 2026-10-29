import mongoose from 'mongoose';
import { EXERCISE_TYPES, MUSCLE_GROUPS } from '../lib/constants.js';

const ExerciseSchema = new mongoose.Schema({
  muscleGroup: {
    type: String,
    required: [true, 'Please provide a muscle group'],
    enum: MUSCLE_GROUPS,
  },
  name: {
    type: String,
    required: [true, 'Please provide an exercise name'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please provide an exercise type'],
    enum: EXERCISE_TYPES,
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

ExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
