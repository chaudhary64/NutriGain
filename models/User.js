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
  mealDays: {
    type: [String],
    default: ["Paneer", "Chicken", "Paneer", "Chicken", "Paneer", "Chicken", "Paneer"], // 0=Sun, 1=Mon, ...
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
