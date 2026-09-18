import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DailyLog from '@/models/DailyLog';
import UserSchedule from '@/models/UserSchedule';
import WorkoutTemplate, { toPlainDays } from '@/models/WorkoutTemplate';
import { withAuth } from '@/lib/auth';
import { calculateStreaks } from '@/lib/daily-log';
import { isValidObjectId } from '@/lib/validation';

// Admin only — user details with computed stats
export const GET = withAuth(
  async (request, user, { params }) => {
    await dbConnect();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    // Get user details
    const targetUser = await User.findById(id).select('-password');

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all daily logs for the user (entries already carry denormalized
    // mealName/macros, so a meals.meal populate is unnecessary).
    const dailyLogs = await DailyLog.find({ user: id }).sort({ date: -1 });

    // Calculate statistics
    const stats = {
      totalDaysLogged: dailyLogs.length,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFats: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    if (dailyLogs.length > 0) {
      // Calculate totals
      dailyLogs.forEach((log) => {
        stats.totalCalories += log.totalMacros?.calories || 0;
        stats.totalProtein += log.totalMacros?.protein || 0;
        stats.totalCarbs += log.totalMacros?.carbs || 0;
        stats.totalFats += log.totalMacros?.fats || 0;
      });

      // Calculate averages
      stats.averageCalories = Math.round(stats.totalCalories / dailyLogs.length);
      stats.averageProtein = Math.round(stats.totalProtein / dailyLogs.length);
      stats.averageCarbs = Math.round(stats.totalCarbs / dailyLogs.length);
      stats.averageFats = Math.round(stats.totalFats / dailyLogs.length);

      // Current streak = consecutive run ending today (or yesterday — an
      // unfinished today doesn't hide an active streak); longest = best run.
      const { currentStreak, longestStreak } = calculateStreaks(
        dailyLogs.map((log) => log.date)
      );
      stats.currentStreak = currentStreak;
      stats.longestStreak = longestStreak;
    }

    // Active training split (private fork created from an admin template or
    // edited by the user) — surfaced in the admin user drawer. Users without
    // a fork yet effectively follow the default template, same as the
    // schedule endpoint's lazy fork, so surface that instead of "none".
    const schedule = await UserSchedule.findOne({ user: id }).lean();

    let activeSplit = null;
    if (schedule) {
      activeSplit = {
        days: toPlainDays(schedule.days),
        sourceTemplateName: schedule.sourceTemplateName || "Custom edit",
        updatedAt: schedule.updatedAt,
      };
    } else {
      const defaultTemplate = await WorkoutTemplate.findOne({ isDefault: true })
        .sort({ updatedAt: -1 })
        .lean();
      if (defaultTemplate) {
        activeSplit = {
          days: toPlainDays(defaultTemplate.days),
          sourceTemplateName: `${defaultTemplate.name} (default)`,
          updatedAt: null,
        };
      }
    }

    return NextResponse.json({
      user: targetUser,
      dailyLogs,
      stats,
      activeSplit,
    });
  },
  { admin: true }
);
