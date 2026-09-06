import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DailyLog from '@/models/DailyLog';
import { withAuth } from '@/lib/auth';

// Admin only — list users with aggregated log stats
export const GET = withAuth(
  async () => {
    await dbConnect();

    // One aggregation computes per-user log stats; the old version fetched
    // every user's full log history in a separate query per user (N+1).
    const logStats = await DailyLog.aggregate([
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$user',
          daysLogged: { $sum: 1 },
          latestLogDate: { $first: '$date' },
          latestMacros: { $first: '$totalMacros' },
          totalCalories: { $sum: '$totalMacros.calories' },
          totalProtein: { $sum: '$totalMacros.protein' },
          totalCarbs: { $sum: '$totalMacros.carbs' },
          totalFats: { $sum: '$totalMacros.fats' },
        },
      },
      {
        $addFields: {
          avgCalories: { $round: [{ $divide: ['$totalCalories', '$daysLogged'] }, 0] },
          avgProtein: { $round: [{ $divide: ['$totalProtein', '$daysLogged'] }, 0] },
          avgCarbs: { $round: [{ $divide: ['$totalCarbs', '$daysLogged'] }, 0] },
          avgFats: { $round: [{ $divide: ['$totalFats', '$daysLogged'] }, 0] },
        },
      },
    ]);

    const statsByUser = new Map(
      logStats.map((stats) => [stats._id.toString(), stats])
    );

    const users = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const usersWithStats = users.map((user) => {
      const stats = statsByUser.get(user._id.toString());

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        stats: {
          daysLogged: stats?.daysLogged || 0,
          latestLogDate: stats?.latestLogDate || null,
          latestMacros: stats?.latestMacros || null,
          averageMacros: {
            calories: stats?.avgCalories || 0,
            protein: stats?.avgProtein || 0,
            carbs: stats?.avgCarbs || 0,
            fats: stats?.avgFats || 0,
          },
        },
      };
    });

    return NextResponse.json(usersWithStats);
  },
  { admin: true }
);
