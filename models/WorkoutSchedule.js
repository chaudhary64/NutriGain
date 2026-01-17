import mongoose from 'mongoose';

const WorkoutScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Please provide a day'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    unique: true,
  },
  muscleGroups: [{
    type: String,
    enum: ['Chest', 'Back', 'Bicep', 'Tricep', 'Legs', 'Forearms', 'Shoulders', 'Arms', 'Rest Day'],
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
