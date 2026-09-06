import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Meal from '@/models/Meal';
import { requireAuth } from '@/lib/auth';
import {
  calculateEntryMacros,
  createEmptyDailyLog,
  oneYearAgoDateString,
  recalculateTotals,
  todayDateString,
} from '@/lib/daily-log';
import { isValidDateString, validateDailyLogMeal, validateGymStatus } from '@/lib/validation';

// GET daily log (read-only — never creates documents or mutates data)
export async function GET(request) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || todayDateString();

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { error: 'date must be a valid yyyy-MM-dd string' },
        { status: 400 }
      );
    }

    await dbConnect();

    const dailyLog = await DailyLog.findOne({ user: user.id, date }).populate(
      'meals.meal'
    );

    // Return an ephemeral empty log instead of creating one — a log is only
    // persisted when the user actually adds a meal or marks their gym status.
    const dailyLogResponse = dailyLog || {
      ...createEmptyDailyLog(user.id, date),
      _id: null,
      createdAt: null,
      updatedAt: null,
    };

    // Gym history for the calendar (last 365 days) — lean projection.
    const gymHistory = await DailyLog.find({
      user: user.id,
      date: { $gte: oneYearAgoDateString() },
    })
      .sort({ date: 1 })
      .select('date gymStatus gymCompletedAt')
      .lean();

    return NextResponse.json(
      { dailyLog: dailyLogResponse, gymHistory },
      { status: 200 }
    );
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
    const body = await request.json().catch(() => ({}));

    const [validationErrors, normalized] = validateDailyLogMeal(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0], errors: validationErrors },
        { status: 400 }
      );
    }

    const { mealId, quantity, mealType, date } = normalized;

    await dbConnect();

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    const dailyLog = await DailyLog.findOneAndUpdate(
      { user: user.id, date },
      { $setOnInsert: createEmptyDailyLog(user.id, date) },
      { new: true, upsert: true }
    );

    // Add meal entry
    dailyLog.meals.push({
      meal: mealId,
      mealName: meal.name,
      quantity,
      mealType,
      macros: calculateEntryMacros(meal, quantity),
    });

    // Recompute totals from entries — no add/subtract drift.
    recalculateTotals(dailyLog);
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
    const body = await request.json().catch(() => ({}));

    const [validationErrors, normalized] = validateGymStatus(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0], errors: validationErrors },
        { status: 400 }
      );
    }

    const { gymStatus, date } = normalized;
    const logDate = date || todayDateString();

    await dbConnect();

    // Insert shape omits gymStatus/gymCompletedAt — they arrive via $set
    // below (a $setOnInsert/$set collision would make the upsert fail).
    const { gymStatus: _ignoredGymStatus, ...insertBase } = createEmptyDailyLog(
      user.id,
      logDate
    );

    const dailyLog = await DailyLog.findOneAndUpdate(
      { user: user.id, date: logDate },
      {
        $set: {
          gymStatus,
          gymCompletedAt: gymStatus !== 'not-completed' ? new Date() : null,
          updatedAt: new Date(),
        },
        $setOnInsert: insertBase,
      },
      { new: true, upsert: true }
    );

    // Gym history for the calendar (last 365 days) — lean projection.
    const gymHistory = await DailyLog.find({
      user: user.id,
      date: { $gte: oneYearAgoDateString() },
    })
      .sort({ date: 1 })
      .select('date gymStatus gymCompletedAt');

    return NextResponse.json(
      {
        dailyLog,
        gymHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error updating gym status:', error);
    return NextResponse.json({ error: 'Failed to update gym status' }, { status: 500 });
  }
}
