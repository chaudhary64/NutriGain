import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { requireAdmin, verifyAuth } from '@/lib/auth';

// GET all meals
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
    const body = await request.json();

    const { name, description, servingSize, macros, category } = body;

    if (!name || !macros) {
      return NextResponse.json(
        { error: 'Name and macros are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const meal = await Meal.create({
      name,
      description,
      servingSize,
      macros: {
        calories: macros.calories || 0,
        protein: macros.protein || 0,
        carbs: macros.carbs || 0,
        fats: macros.fats || 0,
      },
      category: category || 'general',
      createdBy: user.id,
    });

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}
