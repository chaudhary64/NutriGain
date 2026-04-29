import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    await dbConnect();
    
    // Force direct query without cache - use lean() for raw data
    const user = await User.findById(decoded.userId).select('-password').lean();
    
    if (!user) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
    }

    console.log('[AUTH ME GET] Fetched user mealDays:', user.mealDays);

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          mealDays: user.mealDays || ["Paneer", "Chicken", "Paneer", "Chicken", "Paneer", "Chicken", "Paneer"],
          smoothScroll: user.smoothScroll !== undefined ? user.smoothScroll : true,
        },
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    console.error('[AUTH ME] Error:', error.message);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log('[AUTH ME UPDATE] ===== PUT REQUEST RECEIVED =====');
    const token = request.cookies.get('token')?.value;

    if (!token) {
      console.log('[AUTH ME UPDATE] No token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const body = await request.json();
    console.log('[AUTH ME UPDATE] Request body:', JSON.stringify(body, null, 2));
    
    const { mealDays, smoothScroll } = body;

    console.log('[AUTH ME UPDATE] Request received');
    console.log('[AUTH ME UPDATE] User ID:', decoded.userId);
    console.log('[AUTH ME UPDATE] New mealDays:', mealDays);
    console.log('[AUTH ME UPDATE] New smoothScroll:', smoothScroll);

    const updateFields = {};

    if (mealDays !== undefined) {
      if (!Array.isArray(mealDays) || mealDays.length !== 7) {
        console.log('[AUTH ME UPDATE] Invalid mealDays format');
        return NextResponse.json({ error: 'Invalid meal days' }, { status: 400 });
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
    console.log('[AUTH ME UPDATE] DB connected');
    
    // First, get the current user to see old value
    const oldUser = await User.findById(decoded.userId).select('mealDays smoothScroll');
    console.log('[AUTH ME UPDATE] Old values from DB:', { mealDays: oldUser?.mealDays, smoothScroll: oldUser?.smoothScroll });

    // Update with explicit $set
    const updateResult = await User.updateOne(
        { _id: decoded.userId },
        { $set: updateFields }
    );
    
    console.log('[AUTH ME UPDATE] MongoDB updateOne result:', updateResult);

    const user = await User.findById(decoded.userId).select('-password').lean();
    
    console.log('[AUTH ME UPDATE] Updated user mealDays from DB:', user?.mealDays);
    
    // Verify the update by fetching again
    const verifyUser = await User.findById(decoded.userId).select('mealDays').lean();
    console.log('[AUTH ME UPDATE] Verification fetch mealDays:', verifyUser?.mealDays);
    console.log('[AUTH ME UPDATE] Update successful');

    if (!user) {
      console.log('[AUTH ME UPDATE] User not found');
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
        } 
    });

  } catch (error) {
    console.error('[AUTH ME UPDATE] Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
