import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import DailyLog from '@/models/DailyLog';
import { withAuth } from '@/lib/auth';

/**
 * Foods still without a micronutrient profile, ordered by how often they are
 * logged.
 *
 * The queue is ranked by damage rather than alphabetically: a staple with no
 * profile empties six cells on every day it is logged, while a rarely used
 * food costs almost nothing. Admin-only — the counts span every account.
 */
export const GET = withAuth(
  async () => {
    await dbConnect();

    const meals = await Meal.find({})
      .select('name servingSize category macros micros')
      .lean();

    const missing = meals.filter(
      (meal) => !Array.isArray(meal.micros?.values) || meal.micros.values.length === 0
    );

    // One pass over every logged entry: how many entries reference each food,
    // and the latest day it appeared. Dates are yyyy-MM-dd strings, so $max
    // is a chronological max.
    const usage = await DailyLog.aggregate([
      { $unwind: '$meals' },
      {
        $group: {
          _id: '$meals.meal',
          entries: { $sum: 1 },
          lastLogged: { $max: '$date' },
        },
      },
    ]);

    const byMeal = new Map(
      usage.map((row) => [String(row._id), row])
    );

    const queue = missing
      .map((meal) => {
        const row = byMeal.get(String(meal._id));
        return {
          meal,
          entries: row?.entries ?? 0,
          lastLogged: row?.lastLogged ?? null,
        };
      })
      .sort((a, b) => b.entries - a.entries || a.meal.name.localeCompare(b.meal.name));

    return NextResponse.json(
      {
        queue,
        totals: {
          meals: meals.length,
          missing: missing.length,
          entriesAffected: queue.reduce((sum, row) => sum + row.entries, 0),
        },
      },
      { status: 200 }
    );
  },
  { admin: true }
);
