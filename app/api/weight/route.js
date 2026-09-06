import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';
import { validateTargetWeight, validateWeightEntry } from '@/lib/validation';

// GET all weight entries for the authenticated user
export const GET = withAuth(async (request, user) => {
  await dbConnect();

  const userData = await User.findById(user.id).select('weightEntries targetWeight');
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Sort weight entries by date
  const sortedEntries = (userData.weightEntries || []).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return NextResponse.json({
    weightEntries: sortedEntries,
    targetWeight: userData.targetWeight || 75,
  });
});

// POST - Add a new weight entry
export const POST = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));

  const [validationErrors, { weight, date }] = validateWeightEntry(body);
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
  }

  await dbConnect();

  const userData = await User.findById(user.id);
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if entry for this date already exists
  const existingEntry = userData.weightEntries.find(
    (entry) =>
      new Date(entry.date).toDateString() === new Date(date).toDateString()
  );

  if (existingEntry) {
    return NextResponse.json(
      { error: 'Weight entry for this date already exists' },
      { status: 400 }
    );
  }

  // Add new weight entry
  userData.weightEntries.push({
    weight,
    date: new Date(`${date}T00:00:00Z`),
  });

  await userData.save();

  return NextResponse.json({
    message: 'Weight entry added successfully',
    weightEntries: userData.weightEntries.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
  });
});

// PUT - Update target weight
export const PUT = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));

  const [validationErrors, targetWeight] = validateTargetWeight(body);
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
  }

  await dbConnect();

  const userData = await User.findByIdAndUpdate(
    user.id,
    { targetWeight },
    { new: true }
  );

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Target weight updated successfully',
    targetWeight: userData.targetWeight,
  });
});
