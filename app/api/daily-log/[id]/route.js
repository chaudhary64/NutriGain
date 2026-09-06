import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Meal from '@/models/Meal';
import { withAuth } from '@/lib/auth';
import { calculateEntryMacros, recalculateTotals } from '@/lib/daily-log';
import { isValidObjectId, isValidDateString } from '@/lib/validation';

// PUT update meal entry quantity
export const PUT = withAuth(async (request, user, { params }) => {
  const body = await request.json().catch(() => ({}));
  const { quantity, date } = body;
  const { id: entryId } = await params;

  if (!isValidObjectId(entryId)) {
    return NextResponse.json(
      { error: 'Invalid meal entry id' },
      { status: 400 }
    );
  }

  if (!isValidDateString(date)) {
    return NextResponse.json(
      { error: 'date must be a valid yyyy-MM-dd string' },
      { status: 400 }
    );
  }

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0 || qty > 1000) {
    return NextResponse.json(
      { error: 'Valid quantity is required (positive number, max 1000)' },
      { status: 400 }
    );
  }

  await dbConnect();

  const dailyLog = await DailyLog.findOne({
    user: user.id,
    date,
  });

  if (!dailyLog) {
    return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
  }

  const mealEntry = dailyLog.meals.id(entryId);
  if (!mealEntry) {
    return NextResponse.json({ error: 'Meal entry not found' }, { status: 404 });
  }

  // Get the meal to recalculate this entry's macros
  const meal = await Meal.findById(mealEntry.meal);
  if (!meal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  // Update entry, then recompute totals from all entries
  mealEntry.quantity = qty;
  mealEntry.macros = calculateEntryMacros(meal, qty);

  recalculateTotals(dailyLog);
  dailyLog.updatedAt = new Date();
  await dailyLog.save();

  await dailyLog.populate('meals.meal');

  return NextResponse.json({ dailyLog }, { status: 200 });
});

// DELETE remove meal entry
export const DELETE = withAuth(async (request, user, { params }) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const { id: entryId } = await params;

  if (!isValidDateString(date)) {
    return NextResponse.json(
      { error: 'date must be a valid yyyy-MM-dd string' },
      { status: 400 }
    );
  }

  if (!isValidObjectId(entryId)) {
    return NextResponse.json(
      { error: 'Invalid meal entry id' },
      { status: 400 }
    );
  }

  await dbConnect();

  const dailyLog = await DailyLog.findOne({
    user: user.id,
    date,
  });

  if (!dailyLog) {
    return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
  }

  const mealEntry = dailyLog.meals.id(entryId);
  if (!mealEntry) {
    return NextResponse.json({ error: 'Meal entry not found' }, { status: 404 });
  }

  // Remove entry, then recompute totals from all entries
  mealEntry.deleteOne();

  recalculateTotals(dailyLog);
  dailyLog.updatedAt = new Date();
  await dailyLog.save();

  await dailyLog.populate('meals.meal');

  return NextResponse.json({ dailyLog }, { status: 200 });
});
