import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { withAuth } from '@/lib/auth';
import { isValidObjectId, validateMeal } from '@/lib/validation';

/**
 * Whether this caller may read or change a food.
 *
 * Admins own the shared library. A private food belongs to whoever created it,
 * so another user's entry is indistinguishable from one that does not exist.
 */
function canManage(user, meal) {
  if (user.isAdmin) return true;
  return Boolean(meal.isPrivate) && String(meal.createdBy) === String(user.id);
}

/** Whether this caller may read a food: shared ones are for everyone. */
function canRead(user, meal) {
  if (user.isAdmin || !meal.isPrivate) return true;
  return String(meal.createdBy) === String(user.id);
}

// GET single meal (library foods, or one the caller created)
export const GET = withAuth(async (request, user, { params }) => {
  await dbConnect();
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid meal id' }, { status: 400 });
  }

  const meal = await Meal.findById(id);

  if (!meal || !canRead(user, meal)) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  return NextResponse.json({ meal }, { status: 200 });
});

// PUT update meal (admins, or the creator of a private food)
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

    const existing = await Meal.findById(id);
    if (!existing || !canManage(user, existing)) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    const meal = await Meal.findByIdAndUpdate(id, whitelisted, { new: true, runValidators: true });

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ meal }, { status: 200 });
  }
);

// DELETE meal (admins, or the creator of a private food). Logged entries keep
// their own snapshot, so a past day is never rewritten by this.
export const DELETE = withAuth(async (request, user, { params }) => {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid meal id' }, { status: 400 });
  }

  await dbConnect();

  const meal = await Meal.findById(id);
  if (!meal || !canManage(user, meal)) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  await meal.deleteOne();

  return NextResponse.json({ message: 'Meal deleted successfully' }, { status: 200 });
});
