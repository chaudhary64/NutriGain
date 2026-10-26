import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { withAuth } from '@/lib/auth';
import { validateMeal } from '@/lib/validation';

// GET the caller's searchable foods: the shared library plus their own.
export const GET = withAuth(async (request, user) => {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const filter = {
    // One-off entries belong to a single day's log, not to search.
    isQuickAdd: { $ne: true },
    // A missing isPrivate on older documents reads as shared, so the whole
    // existing library stays visible without a migration.
    $or: [{ isPrivate: { $ne: true } }, { createdBy: user.id }],
    ...(category ? { category } : {}),
  };
  const meals = await Meal.find(filter).sort({ createdAt: -1 });

  return NextResponse.json({ meals }, { status: 200 });
});

// POST create a meal. Anyone signed in may create one; it is private to them
// unless an admin is writing to the shared library.
export const POST = withAuth(
  async (request, user) => {
    const body = await request.json().catch(() => ({}));

    // Whitelist + validate — the client sends flat macro fields, but the
    // Meal model stores them under a `macros` subdocument.
    const flat = {
      name: body?.name,
      servingSize: body?.servingSize,
      category: body?.category,
      micros: body?.micros,
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
      // Admin-created foods are the library everyone searches; a user's own
      // food is theirs alone.
      isPrivate: !user.isAdmin,
    });

    return NextResponse.json({ meal }, { status: 201 });
  }
);
