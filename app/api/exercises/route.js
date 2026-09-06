import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { validateExercise } from "@/lib/validation";

export async function GET(request) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    // Get all exercises (shared across users)
    const exercises = await Exercise.find({}).sort({ muscleGroup: 1, name: 1 });

    // Get user-specific data for these exercises
    const userExerciseData = await UserExerciseData.find({ userId: user.id });

    // Create a map of exercise ID to user data
    const userDataMap = new Map();
    userExerciseData.forEach((data) => {
      userDataMap.set(data.exerciseId.toString(), {
        warmUp: data.warmUp,
        working: data.working,
        lastPR: data.lastPR,
        lastPRDate: data.lastPRDate,
      });
    });

    // Merge exercise definitions with user-specific data
    const exercisesWithUserData = exercises.map((exercise) => {
      const userData = userDataMap.get(exercise._id.toString()) || {
        warmUp: "",
        working: "",
        lastPR: "",
        lastPRDate: "",
      };

      return {
        _id: exercise._id,
        muscleGroup: exercise.muscleGroup,
        name: exercise.name,
        type: exercise.type,
        ...userData,
      };
    });

    return NextResponse.json(exercisesWithUserData);
  } catch (error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create exercise (admin only — exercises are a global library)
export async function POST(request) {
  try {
    requireAdmin(request);
    await dbConnect();

    const body = await request.json().catch(() => ({}));

    // Whitelist + validate — previously the raw JSON body was passed to create().
    const [validationErrors, whitelisted] = validateExercise(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    const exercise = await Exercise.create(whitelisted);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    if (error.message === "Admin privileges required" || error.message === "Authentication required") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Authentication required" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
