import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutSchedule from "@/models/WorkoutSchedule";
import { verifyAuth, requireAdmin } from "@/lib/auth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MUSCLE_GROUP_OPTIONS = ["Chest", "Back", "Bicep", "Tricep", "Legs", "Forearms", "Shoulders", "Arms", "Rest Day"];

// GET the weekly schedule (any authenticated user)
export async function GET(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();
    const schedules = await WorkoutSchedule.find({}).sort({ day: 1 });

    // If no schedules exist, return default schedule
    if (schedules.length === 0) {
      const defaultSchedule = [
        { day: "Monday", muscleGroups: ["Chest", "Tricep"] },
        { day: "Tuesday", muscleGroups: ["Back", "Bicep"] },
        { day: "Wednesday", muscleGroups: ["Shoulders", "Legs"] },
        { day: "Thursday", muscleGroups: ["Rest Day"] },
        { day: "Friday", muscleGroups: ["Chest", "Tricep"] },
        { day: "Saturday", muscleGroups: ["Back", "Bicep"] },
        { day: "Sunday", muscleGroups: ["Rest Day"] },
      ];

      // Create default schedules in DB
      await WorkoutSchedule.insertMany(defaultSchedule);
      return NextResponse.json(defaultSchedule);
    }

    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update one day of the schedule (admin only — the schedule is global)
export async function PUT(request) {
  try {
    requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const { day, muscleGroups } = body;

    if (!DAYS.includes(day)) {
      return NextResponse.json(
        { error: `day must be one of: ${DAYS.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(muscleGroups) ||
      muscleGroups.length === 0 ||
      muscleGroups.length > 4 ||
      !muscleGroups.every((mg) => MUSCLE_GROUP_OPTIONS.includes(mg))
    ) {
      return NextResponse.json(
        { error: `muscleGroups must be 1-4 entries from: ${MUSCLE_GROUP_OPTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    await dbConnect();

    const schedule = await WorkoutSchedule.findOneAndUpdate(
      { day },
      { muscleGroups, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    return NextResponse.json(schedule);
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
