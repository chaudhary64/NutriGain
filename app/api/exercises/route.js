import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";

export async function GET() {
  try {
    await dbConnect();
    const exercises = await Exercise.find({}).sort({ muscleGroup: 1, name: 1 });
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const exerciseData = await request.json();
    const exercise = await Exercise.create(exerciseData);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
