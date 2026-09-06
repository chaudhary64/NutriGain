import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { requireAdmin, verifyAuth } from '@/lib/auth';
import { isValidObjectId, validateMeal } from '@/lib/validation';

// GET single meal (any authenticated user)
export async function GET(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
  } catch (error) {
    console.error('Error fetching meal:', error);
    return NextResponse.json({ error: 'Failed to fetch meal' }, { status: 500 });
  }
}

// PUT update meal (admin only)
export async function PUT(request, { params }) {
  try {
    requireAdmin(request);

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
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 403 });
    }
    console.error('Error updating meal:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}

// DELETE meal (admin only)
export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
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
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 403 });
    }
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
