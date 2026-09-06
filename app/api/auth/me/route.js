import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { validateMealSchedule } from '@/lib/validation';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_MEAL_DAYS = ['Paneer', 'Chicken', 'Paneer', 'Chicken', 'Paneer', 'Chicken', 'Paneer'];

export async function GET(request) {
  try {
    const auth = verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(auth.user.id).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          mealDays: user.mealDays || DEFAULT_MEAL_DAYS,
          smoothScroll: user.smoothScroll !== undefined ? user.smoothScroll : true,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[AUTH ME] Error:', error.message);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function PUT(request) {
  try {
    const auth = verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { mealDays, smoothScroll } = body;

    const updateFields = {};

    if (mealDays !== undefined) {
      const [validationErrors] = validateMealSchedule(mealDays);
      if (validationErrors.length > 0) {
        return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
      }
      updateFields.mealDays = mealDays;
    }

    if (smoothScroll !== undefined) {
      updateFields.smoothScroll = Boolean(smoothScroll);
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(auth.user.id, { $set: updateFields }, { new: true })
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        mealDays: user.mealDays,
        smoothScroll: user.smoothScroll !== undefined ? user.smoothScroll : true,
      },
    });
  } catch (error) {
    console.error('[AUTH ME UPDATE] Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
