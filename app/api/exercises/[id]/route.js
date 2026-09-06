import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { withAuth } from "@/lib/auth";
import { isValidObjectId } from "@/lib/validation";

export const PUT = withAuth(async (request, user, { params }) => {
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

  /** Numeric set arrays: [{weight, reps}] — validated, capped at 20. */
  const parseSetArray = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return undefined;
    if (raw.length > 20) return undefined;
    const sets = [];
    for (const s of raw) {
      const weight = Number(s?.weight);
      const reps = Number(s?.reps);
      if (!Number.isFinite(weight) || weight < 0 || weight > 1000) return undefined;
      if (!Number.isInteger(reps) || reps < 0 || reps > 500) return undefined;
      sets.push({ weight: Math.round(weight * 100) / 100, reps });
    }
    return sets;
  };

  // Whitelist user-data fields — these belong to the caller only.
  const userDataFields = {
    warmUp: typeof body?.warmUp === "string" ? body.warmUp.slice(0, 200) : undefined,
    working: typeof body?.working === "string" ? body.working.slice(0, 200) : undefined,
    warmUpSets: parseSetArray(body?.warmUpSets),
    workingSets: parseSetArray(body?.workingSets),
    prWeight:
      body?.prWeight === null
        ? null
        : Number.isFinite(Number(body?.prWeight)) && Number(body?.prWeight) >= 0
          ? Number(body?.prWeight)
          : undefined,
    lastPR: typeof body?.lastPR === "string" ? body.lastPR.slice(0, 100) : undefined,
    lastPRDate: typeof body?.lastPRDate === "string" ? body.lastPRDate.slice(0, 40) : undefined,
    updatedAt: Date.now(),
  };

  // Update or create user-specific exercise data. Mongo ignores $set keys
  // whose value is `undefined`, so unset optional fields never clobber data.
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
    warmUpSets: userExerciseData.warmUpSets || [],
    workingSets: userExerciseData.workingSets || [],
    lastPR: userExerciseData.lastPR,
    lastPRDate: userExerciseData.lastPRDate,
    prWeight: userExerciseData.prWeight ?? null,
  });
});

export const DELETE = withAuth(async (request, user, { params }) => {
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
});
