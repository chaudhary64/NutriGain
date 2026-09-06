import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { requireAuth } from "@/lib/auth";
import { isValidObjectId } from "@/lib/validation";

export async function PUT(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid exercise id" }, { status: 400 });
    }

    await dbConnect();

    // Verify exercise exists
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));

    // Whitelist user-data fields — these strings belong to the caller only.
    const userDataFields = {
      warmUp: typeof body?.warmUp === "string" ? body.warmUp.slice(0, 200) : undefined,
      working: typeof body?.working === "string" ? body.working.slice(0, 200) : undefined,
      lastPR: typeof body?.lastPR === "string" ? body.lastPR.slice(0, 100) : undefined,
      lastPRDate: typeof body?.lastPRDate === "string" ? body.lastPRDate.slice(0, 40) : undefined,
      updatedAt: Date.now(),
    };

    // Update or create user-specific exercise data
    const userExerciseData = await UserExerciseData.findOneAndUpdate(
      { userId: user.id, exerciseId: id },
      { $set: userDataFields },
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
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid exercise id" }, { status: 400 });
    }

    await dbConnect();

    // Verify exercise exists
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    if (user.isAdmin) {
      // Admin: delete the exercise itself and all associated user data
      await Exercise.findByIdAndDelete(id);
      await UserExerciseData.deleteMany({ exerciseId: id });
      return NextResponse.json({ message: "Exercise deleted successfully" });
    }

    // Regular user: just delete their data for this exercise
    await UserExerciseData.findOneAndDelete({ userId: user.id, exerciseId: id });
    return NextResponse.json({ message: "Exercise data deleted successfully" });
  } catch (error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
