import mongoose from 'mongoose';

const SCHEDULE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SCHEDULE_MUSCLE_GROUPS = ['Abs', 'Back', 'Bicep', 'Chest', 'Forearms', 'Legs', 'Shoulders', 'Tricep', 'Push', 'Pull', 'Upper Body', 'Lower Body', 'Full Body', 'Rest Day'];

const UserScheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  days: {
    type: Map,
    of: [String],
    required: true,
    validate: {
      validator: (days) => days instanceof Map && SCHEDULE_DAYS.every((d) => days.has(d)),
      message: 'days must cover all seven weekdays',
    },
  },
  sourceTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', default: null },
  sourceTemplateName: { type: String, default: null, trim: true, maxlength: 40 },
  updatedAt: { type: Date, default: Date.now },
});

UserScheduleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const USER_SCHEDULE_DAYS = SCHEDULE_DAYS;
export const USER_SCHEDULE_MUSCLE_GROUPS = SCHEDULE_MUSCLE_GROUPS;

export default mongoose.models.UserSchedule || mongoose.model('UserSchedule', UserScheduleSchema);
