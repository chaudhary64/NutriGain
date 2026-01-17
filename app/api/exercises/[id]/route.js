import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const exerciseData = await request.json();
    
    const exercise = await Exercise.findByIdAndUpdate(
      id,
      { ...exerciseData, updatedAt: Date.now() },
      { new: true, runValidators: false }
    );
    
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    return NextResponse.json(exercise);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const exercise = await Exercise.findByIdAndDelete(id);
    
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
