import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { requireAuth } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const user = requireAuth(request);
    await dbConnect();
    const { id } = await params;
    const exerciseData = await request.json();
    
    // Verify exercise exists
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    // Update or create user-specific exercise data
    const userDataFields = {
      warmUp: exerciseData.warmUp,
      working: exerciseData.working,
      lastPR: exerciseData.lastPR,
      lastPRDate: exerciseData.lastPRDate,
      updatedAt: Date.now(),
    };
    
    const userExerciseData = await UserExerciseData.findOneAndUpdate(
      { userId: user.id, exerciseId: id },
      userDataFields,
      { new: true, upsert: true }
    );
    
    // Return exercise with updated user data
    return NextResponse.json({
      _id: exercise._id,
      muscleGroup: exercise.muscleGroup,
      name: exercise.name,
      type: exercise.type,
      warmUp: userExerciseData.warmUp,
      working: userExerciseData.working,
      lastPR: userExerciseData.lastPR,
      lastPRDate: userExerciseData.lastPRDate,
    });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    await dbConnect();
    const { id } = await params;
    
    // Verify exercise exists
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    // Only admins can delete exercise definitions
    if (user.isAdmin) {
      // Admin: delete the exercise itself and all associated user data
      await Exercise.findByIdAndDelete(id);
      await UserExerciseData.deleteMany({ exerciseId: id });
      return NextResponse.json({ message: "Exercise deleted successfully" });
    } else {
      // Regular user: just delete their data for this exercise
      await UserExerciseData.findOneAndDelete({ userId: user.id, exerciseId: id });
      return NextResponse.json({ message: "Exercise data deleted successfully" });
    }
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
