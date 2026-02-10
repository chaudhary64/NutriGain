import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Force recompilation in development
if (process.env.NODE_ENV !== 'production' && mongoose.models.Settings) {
  delete mongoose.models.Settings;
  delete mongoose.connection.models.Settings;
}

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
