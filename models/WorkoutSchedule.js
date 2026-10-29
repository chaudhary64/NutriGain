import mongoose from 'mongoose';
import { WEEKDAYS } from '../lib/constants.js';

const WorkoutScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Please provide a day'],
    enum: WEEKDAYS,
    unique: true,
  },
  muscleGroups: [{
    type: String,
    // Legacy vocabulary from before the library used granular groups. Left
    // narrow on purpose: nothing writes this model any more, it is only read
    // to seed the first workout template.
    enum: ['Chest', 'Back', 'Bicep', 'Tricep', 'Legs', 'Forearms', 'Shoulders', 'Rest Day'],
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

WorkoutScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.WorkoutSchedule || mongoose.model('WorkoutSchedule', WorkoutScheduleSchema);
