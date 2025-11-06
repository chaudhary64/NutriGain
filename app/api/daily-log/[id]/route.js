import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Meal from '@/models/Meal';
import { requireAuth } from '@/lib/auth';

// PUT update meal entry quantity
export async function PUT(request, { params }) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { quantity, date } = body;
    const { id: entryId } = await params;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
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

    console.log('PUT - Looking for entry:', entryId);
    console.log('PUT - Available meals:', dailyLog.meals.map(m => ({ id: m._id.toString(), name: m.mealName })));

    const mealEntry = dailyLog.meals.id(entryId);
    if (!mealEntry) {
      return NextResponse.json({ error: 'Meal entry not found' }, { status: 404 });
    }

    // Get the meal to recalculate macros
    const meal = await Meal.findById(mealEntry.meal);
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // Subtract old macros from total
    dailyLog.totalMacros.calories -= mealEntry.macros.calories;
    dailyLog.totalMacros.protein -= mealEntry.macros.protein;
    dailyLog.totalMacros.carbs -= mealEntry.macros.carbs;
    dailyLog.totalMacros.fats -= mealEntry.macros.fats;

    // Calculate new macros
    const newMacros = {
      calories: Math.round(meal.macros.calories * quantity),
      protein: Math.round(meal.macros.protein * quantity * 10) / 10,
      carbs: Math.round(meal.macros.carbs * quantity * 10) / 10,
      fats: Math.round(meal.macros.fats * quantity * 10) / 10,
    };

    // Update entry
    mealEntry.quantity = quantity;
    mealEntry.macros = newMacros;

    // Add new macros to total
    dailyLog.totalMacros.calories += newMacros.calories;
    dailyLog.totalMacros.protein = Math.round((dailyLog.totalMacros.protein + newMacros.protein) * 10) / 10;
    dailyLog.totalMacros.carbs = Math.round((dailyLog.totalMacros.carbs + newMacros.carbs) * 10) / 10;
    dailyLog.totalMacros.fats = Math.round((dailyLog.totalMacros.fats + newMacros.fats) * 10) / 10;

    dailyLog.updatedAt = new Date();
    await dailyLog.save();

    await dailyLog.populate('meals.meal');

    return NextResponse.json({ dailyLog }, { status: 200 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error updating meal entry:', error);
    return NextResponse.json({ error: 'Failed to update meal entry' }, { status: 500 });
  }
}

// DELETE remove meal entry
export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const { id: entryId } = await params;

    await dbConnect();

    const dailyLog = await DailyLog.findOne({
      user: user.id,
      date,
    });

    if (!dailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    console.log('DELETE - Looking for entry:', entryId);
    console.log('DELETE - Available meals:', dailyLog.meals.map(m => ({ id: m._id.toString(), name: m.mealName })));

    const mealEntry = dailyLog.meals.id(entryId);
    if (!mealEntry) {
      return NextResponse.json({ error: 'Meal entry not found' }, { status: 404 });
    }

    // Subtract macros from total
    dailyLog.totalMacros.calories -= mealEntry.macros.calories;
    dailyLog.totalMacros.protein = Math.round((dailyLog.totalMacros.protein - mealEntry.macros.protein) * 10) / 10;
    dailyLog.totalMacros.carbs = Math.round((dailyLog.totalMacros.carbs - mealEntry.macros.carbs) * 10) / 10;
    dailyLog.totalMacros.fats = Math.round((dailyLog.totalMacros.fats - mealEntry.macros.fats) * 10) / 10;

    // Remove entry
    mealEntry.deleteOne();

    dailyLog.updatedAt = new Date();
    await dailyLog.save();

    await dailyLog.populate('meals.meal');

    return NextResponse.json({ dailyLog }, { status: 200 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Error deleting meal entry:', error);
    return NextResponse.json({ error: 'Failed to delete meal entry' }, { status: 500 });
  }
}
