import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { verifyAuth } from '@/lib/auth';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();
    
    const mealSchedule = await Settings.findOne({ key: 'mealSchedule' });
    
    const defaultSchedule = ["Paneer", "Chicken", "Paneer", "Chicken", "Paneer", "Chicken", "Paneer"];
    
    return NextResponse.json({
      mealDays: mealSchedule?.value || defaultSchedule
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('[SETTINGS GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { mealDays } = await request.json();

    console.log('[SETTINGS UPDATE] New mealDays:', mealDays);

    if (!mealDays || !Array.isArray(mealDays) || mealDays.length !== 7) {
      return NextResponse.json({ error: 'Invalid meal days' }, { status: 400 });
    }

    await dbConnect();

    const result = await Settings.findOneAndUpdate(
      { key: 'mealSchedule' },
      { 
        key: 'mealSchedule',
        value: mealDays,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('[SETTINGS UPDATE] Updated successfully:', result.value);

    return NextResponse.json({
      success: true,
      mealDays: result.value
    });

  } catch (error) {
    console.error('[SETTINGS UPDATE] Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
