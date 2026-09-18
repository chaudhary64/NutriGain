import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, signToken, tokenCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Disable caching for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 *
 * Verifies the current password, bumps the user's tokenVersion (revoking
 * sessions signed before the change — i.e. other devices), and re-issues a
 * fresh cookie for the device that made the change.
 */
export const POST = withAuth(async (request, authUser) => {
  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword) {
    return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
  }
  if (newPassword.length < 6 || newPassword.length > 128) {
    return NextResponse.json(
      { error: 'New password must be between 6 and 128 characters' },
      { status: 400 }
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: 'New password must be different from your current password' },
      { status: 400 }
    );
  }

  // Throttle brute-force attempts against the current-password check.
  const rateLimit = checkRateLimit(request, `pw:${authUser.id}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  await dbConnect();

  const user = await User.findById(authUser.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  // Fresh cookie for THIS device (signed with the new tokenVersion).
  const token = signToken(user);
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('token', token, tokenCookieOptions());
  return response;
});
