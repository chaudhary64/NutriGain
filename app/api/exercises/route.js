import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { withAuth } from "@/lib/auth";
import { validateExercise } from "@/lib/validation";

export const GET = withAuth(async (request, user) => {
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
      warmUpSets: data.warmUpSets || [],
      workingSets: data.workingSets || [],
      lastPR: data.lastPR,
      lastPRDate: data.lastPRDate,
      prWeight: data.prWeight ?? null,
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
});

// POST create exercise (admin only — exercises are a global library)
export const POST = withAuth(
  async (request) => {
    await dbConnect();

    const body = await request.json().catch(() => ({}));

    // Whitelist + validate — previously the raw JSON body was passed to create().
    const [validationErrors, whitelisted] = validateExercise(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
    }

    const exercise = await Exercise.create(whitelisted);
    return NextResponse.json(exercise, { status: 201 });
  },
  { admin: true }
);
