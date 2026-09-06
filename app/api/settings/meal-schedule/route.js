import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { withAuth } from '@/lib/auth';
import { validateMealSchedule } from '@/lib/validation';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withAuth(async () => {
  await dbConnect();

  const mealSchedule = await Settings.findOne({ key: 'mealSchedule' });

  const defaultSchedule = ['Paneer', 'Chicken', 'Paneer', 'Chicken', 'Paneer', 'Chicken', 'Paneer'];

  return NextResponse.json(
    {
      mealDays: mealSchedule?.value || defaultSchedule,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
});

export const PUT = withAuth(
  async (request) => {
    const { mealDays } = await request.json().catch(() => ({}));

    const [validationErrors] = validateMealSchedule(mealDays);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    await dbConnect();

    const result = await Settings.findOneAndUpdate(
      { key: 'mealSchedule' },
      {
        key: 'mealSchedule',
        value: mealDays,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      mealDays: result.value,
    });
  },
  { admin: true }
);
