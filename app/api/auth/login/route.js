import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, tokenCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateLogin } from '@/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const [validationErrors, { email, password }] = validateLogin(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    // Rate limit by IP + email before touching bcrypt or the DB.
    const rateLimit = checkRateLimit(request, email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken(user);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, tokenCookieOptions());

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
