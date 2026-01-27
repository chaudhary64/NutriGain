import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Meal from '@/models/Meal';
import { requireAuth } from '@/lib/auth';
import { format } from 'date-fns';

// GET daily log
export async function GET(request) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    await dbConnect();

    let dailyLog = await DailyLog.findOne({
      user: user.id,
      date,
    }).populate('meals.meal');

    if (!dailyLog) {
      dailyLog = await DailyLog.create({
        user: user.id,
        date,
        meals: [],
        totalMacros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        },
        gymStatus: 'not-completed',
      });
    }

    // Fetch all gym logs for streak calculation (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const allGymLogs = await DailyLog.find({
      user: user.id,
      date: { $gte: format(oneYearAgo, 'yyyy-MM-dd') },
    }).sort({ date: 1 });

    // Bulk migrate all documents with old gymCompleted field
    const docsToMigrate = allGymLogs.filter(log => log.gymCompleted !== undefined);
    if (docsToMigrate.length > 0) {
      await Promise.all(
        docsToMigrate.map(async (log) => {
          const newStatus = log.gymCompleted ? 'completed' : 'not-completed';
          await DailyLog.updateOne(
            { _id: log._id },
            {
              $set: { gymStatus: newStatus },
              $unset: { gymCompleted: "" }
            }
          );
        })
      );
      // Re-fetch after migration
      const updatedLogs = await DailyLog.find({
        user: user.id,
        date: { $gte: format(oneYearAgo, 'yyyy-MM-dd') },
      }).sort({ date: 1 });
      allGymLogs.splice(0, allGymLogs.length, ...updatedLogs);
    }

    // Also migrate the current dailyLog if it has old field
    if (dailyLog && dailyLog.gymCompleted !== undefined) {
      const newStatus = dailyLog.gymCompleted ? 'completed' : 'not-completed';
      await DailyLog.updateOne(
        { _id: dailyLog._id },
        { 
          $set: { gymStatus: newStatus },
          $unset: { gymCompleted: "" }
        }
      );
      // Refresh to get updated document
      dailyLog = await DailyLog.findById(dailyLog._id).populate('meals.meal');
    }

    // Map gym logs - all should now have gymStatus after migration
    const mappedGymHistory = allGymLogs.map(log => ({
      _id: log._id,
      date: log.date,
      gymStatus: log.gymStatus || 'not-completed',
      gymCompletedAt: log.gymCompletedAt,
    }));

    return NextResponse.json({ 
      dailyLog,
      gymHistory: mappedGymHistory,
    }, { status: 200 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error fetching daily log:', error);
    return NextResponse.json({ error: 'Failed to fetch daily log' }, { status: 500 });
  }
}

// POST add meal to daily log
export async function POST(request) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { mealId, quantity, mealType, date } = body;

    if (!mealId || !quantity || !mealType) {
      return NextResponse.json(
        { error: 'Meal ID, quantity, and meal type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    const logDate = date || format(new Date(), 'yyyy-MM-dd');

    // Calculate macros based on quantity
    const calculatedMacros = {
      calories: Math.round(meal.macros.calories * quantity),
      protein: Math.round(meal.macros.protein * quantity * 10) / 10,
      carbs: Math.round(meal.macros.carbs * quantity * 10) / 10,
      fats: Math.round(meal.macros.fats * quantity * 10) / 10,
    };

    let dailyLog = await DailyLog.findOne({
      user: user.id,
      date: logDate,
    });

    if (!dailyLog) {
      dailyLog = await DailyLog.create({
        user: user.id,
        date: logDate,
        meals: [],
        totalMacros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        },
        gymStatus: 'not-completed',
      });
    }

    // Add meal entry
    dailyLog.meals.push({
      meal: mealId,
      mealName: meal.name,
      quantity,
      mealType,
      macros: calculatedMacros,
    });

    // Update total macros
    dailyLog.totalMacros.calories += calculatedMacros.calories;
    dailyLog.totalMacros.protein = Math.round((dailyLog.totalMacros.protein + calculatedMacros.protein) * 10) / 10;
    dailyLog.totalMacros.carbs = Math.round((dailyLog.totalMacros.carbs + calculatedMacros.carbs) * 10) / 10;
    dailyLog.totalMacros.fats = Math.round((dailyLog.totalMacros.fats + calculatedMacros.fats) * 10) / 10;

    dailyLog.updatedAt = new Date();
    await dailyLog.save();

    await dailyLog.populate('meals.meal');

    return NextResponse.json({ dailyLog }, { status: 200 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error adding meal to log:', error);
    return NextResponse.json({ error: 'Failed to add meal to log' }, { status: 500 });
  }
}

// PATCH mark gym status
export async function PATCH(request) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { date, gymStatus } = body;

    if (!gymStatus || !['not-completed', 'partially-completed', 'completed'].includes(gymStatus)) {
      return NextResponse.json(
        { error: 'Valid gymStatus is required (not-completed, partially-completed, or completed)' },
        { status: 400 }
      );
    }

    await dbConnect();

    const logDate = date || format(new Date(), 'yyyy-MM-dd');

    let dailyLog = await DailyLog.findOne({
      user: user.id,
      date: logDate,
    });

    if (!dailyLog) {
      dailyLog = await DailyLog.create({
        user: user.id,
        date: logDate,
        meals: [],
        totalMacros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        },
        gymStatus,
        gymCompletedAt: gymStatus !== 'not-completed' ? new Date() : null,
      });
    } else {
      // Migrate old field if it exists and update status
      const updateFields = {
        gymStatus,
        gymCompletedAt: gymStatus !== 'not-completed' ? new Date() : null,
        updatedAt: new Date()
      };
      
      if (dailyLog.gymCompleted !== undefined) {
        await DailyLog.updateOne(
          { _id: dailyLog._id },
          { 
            $set: updateFields,
            $unset: { gymCompleted: "" }
          }
        );
      } else {
        dailyLog.gymStatus = gymStatus;
        dailyLog.gymCompletedAt = gymStatus !== 'not-completed' ? new Date() : null;
        dailyLog.updatedAt = new Date();
        await dailyLog.save();
      }
      
      // Refresh the document
      dailyLog = await DailyLog.findById(dailyLog._id);
    }

    // Fetch all gym logs for calendar display (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const allLogs = await DailyLog.find({
      user: user.id,
      date: { $gte: format(oneYearAgo, 'yyyy-MM-dd') },
    }).sort({ date: 1 }).select('date gymStatus gymCompletedAt');

    return NextResponse.json({ 
      dailyLog,
      gymHistory: allLogs,
    }, { status: 200 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error updating gym status:', error);
    return NextResponse.json({ error: 'Failed to update gym status' }, { status: 500 });
  }
}
