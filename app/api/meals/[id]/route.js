import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meal from '@/models/Meal';
import { requireAdmin } from '@/lib/auth';

// GET single meal
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
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
    const body = await request.json();
    const { id } = await params;

    await dbConnect();

    const meal = await Meal.findByIdAndUpdate(
      id,
      {
        ...body,
        macros: {
          calories: body.macros?.calories || 0,
          protein: body.macros?.protein || 0,
          carbs: body.macros?.carbs || 0,
          fats: body.macros?.fats || 0,
        },
      },
      { new: true, runValidators: true }
    );

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ meal }, { status: 200 });
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
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

    await dbConnect();

    const meal = await Meal.findByIdAndDelete(id);

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Meal deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error.message === 'Admin privileges required' || error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
