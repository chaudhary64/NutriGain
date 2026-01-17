import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutSchedule from "@/models/WorkoutSchedule";

export async function GET() {
  try {
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

export async function PUT(request) {
  try {
    await dbConnect();
    const { day, muscleGroups } = await request.json();
    
    const schedule = await WorkoutSchedule.findOneAndUpdate(
      { day },
      { muscleGroups, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
