import mongoose from 'mongoose';

const TEMPLATE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TEMPLATE_MUSCLE_GROUPS = ['Abs', 'Arms', 'Back', 'Bicep', 'Chest', 'Forearms', 'Legs', 'Shoulders', 'Tricep', 'Push', 'Pull', 'Upper Body', 'Lower Body', 'Full Body', 'Rest Day'];

const WorkoutTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a template name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [40, 'Name must be at most 40 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [140, 'Description must be at most 140 characters'],
    default: '',
  },
  days: {
    type: Map,
    of: [String],
    required: true,
    validate: {
      validator: (days) => days instanceof Map && TEMPLATE_DAYS.every((d) => days.has(d)),
      message: 'days must cover all seven weekdays',
    },
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WorkoutTemplateSchema.index({ name: 1 }, { unique: true });

WorkoutTemplateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const TEMPLATE_DAY_KEYS = TEMPLATE_DAYS;
export const TEMPLATE_MUSCLE_GROUP_OPTIONS = TEMPLATE_MUSCLE_GROUPS;

export default mongoose.models.WorkoutTemplate || mongoose.model('WorkoutTemplate', WorkoutTemplateSchema);
