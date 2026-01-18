import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DailyLog from '@/models/DailyLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all non-admin users
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get daily logs for the user
        const dailyLogs = await DailyLog.find({ user: user._id }).sort({ date: -1 });

        // Calculate total days logged
        const daysLogged = dailyLogs.length;

        // Get latest log
        const latestLog = dailyLogs[0];

        // Calculate average macros
        let avgCalories = 0;
        let avgProtein = 0;
        let avgCarbs = 0;
        let avgFats = 0;

        if (daysLogged > 0) {
          const totals = dailyLogs.reduce(
            (acc, log) => {
              acc.calories += log.totalMacros?.calories || 0;
              acc.protein += log.totalMacros?.protein || 0;
              acc.carbs += log.totalMacros?.carbs || 0;
              acc.fats += log.totalMacros?.fats || 0;
              return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
          );

          avgCalories = Math.round(totals.calories / daysLogged);
          avgProtein = Math.round(totals.protein / daysLogged);
          avgCarbs = Math.round(totals.carbs / daysLogged);
          avgFats = Math.round(totals.fats / daysLogged);
        }

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          stats: {
            daysLogged,
            latestLogDate: latestLog?.date || null,
            latestMacros: latestLog?.totalMacros || null,
            averageMacros: {
              calories: avgCalories,
              protein: avgProtein,
              carbs: avgCarbs,
              fats: avgFats,
            },
          },
        };
      })
    );

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
