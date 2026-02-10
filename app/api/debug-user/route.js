import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    
    // Use lean() to get raw MongoDB document
    const userRaw = await User.findById(decoded.userId).lean();
    
    console.log('[DEBUG USER] Raw MongoDB document:', JSON.stringify(userRaw, null, 2));
    
    // Also get with Mongoose model
    const userModel = await User.findById(decoded.userId);
    
    console.log('[DEBUG USER] Mongoose model mealDays:', userModel?.mealDays);
    console.log('[DEBUG USER] Mongoose model toObject:', userModel?.toObject());

    return NextResponse.json({
      rawDocument: userRaw,
      modelData: userModel?.toObject(),
      mealDaysFromRaw: userRaw?.mealDays,
      mealDaysFromModel: userModel?.mealDays
    });

  } catch (error) {
    console.error('[DEBUG USER] Error:', error);
    return NextResponse.json(
      { error: 'Debug failed' },
      { status: 500 }
    );
  }
}
