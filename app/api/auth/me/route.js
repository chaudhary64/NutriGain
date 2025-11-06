import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    console.log('[AUTH ME] Token exists:', !!token);
    console.log('[AUTH ME] JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json(
      {
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          isAdmin: decoded.isAdmin,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AUTH ME] Error:', error.message);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
