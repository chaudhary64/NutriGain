import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';

// DELETE a specific weight entry
export const DELETE = withAuth(async (request, user, { params }) => {
  const { id } = await params;

  await dbConnect();

  const userData = await User.findById(user.id);
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
});
