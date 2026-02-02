import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  muscleGroup: {
    type: String,
    required: [true, 'Please provide a muscle group'],
    enum: ['Abs', 'Arms', 'Back', 'Bicep', 'Chest', 'Forearms', 'Legs', 'Shoulders', 'Tricep'],
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
