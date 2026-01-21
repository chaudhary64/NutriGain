import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET all weight entries for the authenticated user
export async function GET(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userData = await User.findById(auth.user.id).select('weightEntries targetWeight');
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
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight entries' },
      { status: 500 }
    );
  }
}

// POST - Add a new weight entry
export async function POST(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weight, date } = body;

    if (!weight || !date) {
      return NextResponse.json(
        { error: 'Weight and date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const userData = await User.findById(auth.user.id);
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
      weight: parseFloat(weight),
      date: new Date(date),
    });

    await userData.save();

    return NextResponse.json({
      message: 'Weight entry added successfully',
      weightEntries: userData.weightEntries.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    return NextResponse.json(
      { error: 'Failed to add weight entry' },
      { status: 500 }
    );
  }
}

// PUT - Update target weight
export async function PUT(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetWeight } = body;

    if (!targetWeight) {
      return NextResponse.json(
        { error: 'Target weight is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const userData = await User.findByIdAndUpdate(
      auth.user.id,
      { targetWeight: parseFloat(targetWeight) },
      { new: true }
    );

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Target weight updated successfully',
      targetWeight: userData.targetWeight,
    });
  } catch (error) {
    console.error('Error updating target weight:', error);
    return NextResponse.json(
      { error: 'Failed to update target weight' },
      { status: 500 }
    );
  }
}
