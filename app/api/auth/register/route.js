import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, tokenCookieOptions } from '@/lib/auth';
import { validateRegister } from '@/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Server-side validation — no longer trusts the client's checks.
    const [validationErrors, { email, name, password }] = validateRegister(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isAdmin: false,
    });

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
      { status: 201 }
    );

    response.cookies.set('token', token, tokenCookieOptions());

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
