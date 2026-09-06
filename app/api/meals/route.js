import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { withAuth } from '@/lib/auth';
import { validateMeal } from '@/lib/validation';

// GET all meals (any authenticated user)
export const GET = withAuth(async (request) => {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const filter = category ? { category } : {};
  const meals = await Meal.find(filter).sort({ createdAt: -1 });

  return NextResponse.json({ meals }, { status: 200 });
});

// POST create new meal (admin only)
export const POST = withAuth(
  async (request, user) => {
    const body = await request.json().catch(() => ({}));

    // Whitelist + validate — the client sends flat macro fields, but the
    // Meal model stores them under a `macros` subdocument.
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

    const meal = await Meal.create({
      ...whitelisted,
      createdBy: user.id,
    });

    return NextResponse.json({ meal }, { status: 201 });
  },
  { admin: true }
);
