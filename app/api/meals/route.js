import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { requireAdmin, verifyAuth } from '@/lib/auth';
import { validateMeal } from '@/lib/validation';

// GET all meals (any authenticated user)
export async function GET(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filter = category ? { category } : {};
    const meals = await Meal.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ meals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

// POST create new meal (admin only)
export async function POST(request) {
  try {
    const user = requireAdmin(request);

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
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 403 });
    }
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}
