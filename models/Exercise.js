import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  muscleGroup: {
    type: String,
    required: [true, 'Please provide a muscle group'],
    enum: ['Chest', 'Back', 'Bicep', 'Tricep', 'Legs', 'Forearms', 'Shoulders', 'Arms'],
  },
  name: {
    type: String,
    required: [true, 'Please provide an exercise name'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please provide an exercise type'],
    enum: ['COMPOUND', 'ISOLATION'],
  },
  warmUp: {
    type: String,
    default: '',
  },
  working: {
    type: String,
    default: '',
  },
  lastPR: {
    type: String,
    default: '',
  },
  lastPRDate: {
    type: String,
    default: '',
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
