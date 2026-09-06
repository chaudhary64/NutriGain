import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { withAuth } from '@/lib/auth';
import { isValidObjectId, validateMeal } from '@/lib/validation';

// GET single meal (any authenticated user)
export const GET = withAuth(async (request, user, { params }) => {
  await dbConnect();
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid meal id' }, { status: 400 });
  }

  const meal = await Meal.findById(id);

  if (!meal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  return NextResponse.json({ meal }, { status: 200 });
});

// PUT update meal (admin only)
export const PUT = withAuth(
  async (request, user, { params }) => {
    const body = await request.json().catch(() => ({}));
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid meal id' }, { status: 400 });
    }

    // Whitelist + validate — previously the raw body was spread into the update.
    const flat = {
      name: body?.name,
      servingSize: body?.servingSize,
      category: body?.category,
      macros: body?.macros ?? {
        calories: body?.calories,
        protein: body?.protein,
        carbs: body?.carbs,
        fats: body?.fats,
      },
    };

    const [validationErrors, whitelisted] = validateMeal(flat);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    await dbConnect();

    const meal = await Meal.findByIdAndUpdate(id, whitelisted, { new: true, runValidators: true });

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ meal }, { status: 200 });
  },
  { admin: true }
);

// DELETE meal (admin only)
export const DELETE = withAuth(
  async (request, user, { params }) => {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid meal id' }, { status: 400 });
    }

    await dbConnect();

    const meal = await Meal.findByIdAndDelete(id);

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Meal deleted successfully' }, { status: 200 });
  },
  { admin: true }
);
