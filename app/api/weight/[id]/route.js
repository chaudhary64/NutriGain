import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// DELETE a specific weight entry
export async function DELETE(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const userData = await User.findById(auth.user.id);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the weight entry
    userData.weightEntries = userData.weightEntries.filter(
      (entry) => entry._id.toString() !== id
    );

    await userData.save();

    return NextResponse.json({
      message: 'Weight entry deleted successfully',
      weightEntries: userData.weightEntries.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete weight entry' },
      { status: 500 }
    );
  }
}
