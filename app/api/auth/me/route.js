import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';
import { getDefaultMacroGoals } from '@/lib/goals';
import { validateMacroGoals } from '@/lib/validation';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withAuth(async (request, user) => {
  await dbConnect();

  const userData = await User.findById(user.id).select('-password');

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // One-time per-user seed: migrate the old env-based goals into the user
  // document so every user gets editable, personal macro targets.
  if (!userData.macroGoals) {
    userData.macroGoals = getDefaultMacroGoals();
    await userData.save();
  }

  return NextResponse.json(
    {
      user: {
        id: userData._id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin,
        theme: userData.theme || null,
        macroGoals: userData.macroGoals,
        profile: userData.profile || null,
        onboardedAt: userData.onboardedAt || null,
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
});

export const PUT = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));
  const { macroGoals, theme } = body;

  const updateFields = {};

  if (theme !== undefined) {
    if (theme !== "light" && theme !== "dark" && theme !== "") {
      return NextResponse.json({ error: "theme must be light, dark, or empty" }, { status: 400 });
    }
    updateFields.theme = theme;
  }

  if (macroGoals !== undefined) {
    const [validationErrors, validatedGoals] = validateMacroGoals(macroGoals);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }
    updateFields.macroGoals = validatedGoals;
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await dbConnect();

  const userData = await User.findByIdAndUpdate(user.id, { $set: updateFields }, { new: true })
    .select('-password');

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: userData._id,
      email: userData.email,
      name: userData.name,
      isAdmin: userData.isAdmin,
      theme: userData.theme || null,
      macroGoals: userData.macroGoals,
    },
  });
});
