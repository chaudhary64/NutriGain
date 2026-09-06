import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DailyLog from '@/models/DailyLog';
import { verifyAuth } from '@/lib/auth';
import { calculateStreaks } from '@/lib/daily-log';
import { isValidObjectId } from '@/lib/validation';

export async function GET(request, { params }) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.authenticated || !authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    // Get user details
    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all daily logs for the user (entries already carry denormalized
    // mealName/macros, so the old meals.meal populate is unnecessary).
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

      // Streaks are computed over distinct logged dates: the current streak
      // is the consecutive run ending today (or yesterday — an unfinished
      // today doesn't hide an active streak), the longest is the best run
      // ever. The old implementation conflated the two counters.
      const { currentStreak, longestStreak } = calculateStreaks(
        dailyLogs.map((log) => log.date)
      );
      stats.currentStreak = currentStreak;
      stats.longestStreak = longestStreak;
    }

    return NextResponse.json({
      user,
      dailyLogs,
      stats,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
