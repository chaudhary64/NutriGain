import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DailyLog from '@/models/DailyLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    // Get user details
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all daily logs for the user
    const dailyLogs = await DailyLog.find({ user: id })
      .populate('meals.meal')
      .sort({ date: -1 });

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
      dailyLogs.forEach(log => {
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

      // Calculate streaks
      const sortedLogs = [...dailyLogs].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      sortedLogs.forEach((log, index) => {
        const logDate = new Date(log.date);
        
        if (index === 0) {
          currentStreak = 1;
          tempStreak = 1;
          lastDate = logDate;
        } else {
          const dayDiff = Math.floor((lastDate - logDate) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
            if (index === sortedLogs.length - 1 || tempStreak > currentStreak) {
              currentStreak = tempStreak;
            }
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 1;
          }
          
          lastDate = logDate;
        }
      });

      stats.currentStreak = currentStreak;
      stats.longestStreak = Math.max(longestStreak, currentStreak);
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
