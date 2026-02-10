import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const defaultSchedule = ["Paneer", "Chicken", "Paneer", "Chicken", "Paneer", "Chicken", "Paneer"];

    // Find all users without mealDays field
    const users = await User.find({
      $or: [
        { mealDays: { $exists: false } },
        { mealDays: null }
      ]
    });

    console.log(`[MIGRATION] Found ${users.length} users without mealDays`);

    // Update each user
    const results = [];
    for (const user of users) {
      const result = await User.updateOne(
        { _id: user._id },
        { $set: { mealDays: defaultSchedule } }
      );
      
      console.log(`[MIGRATION] Updated user ${user._id}:`, result);
      results.push({
        userId: user._id,
        email: user.email,
        updated: result.modifiedCount > 0
      });
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${users.length} users`,
      results
    });

  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
