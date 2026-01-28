import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Exercise from "@/models/Exercise";
import UserExerciseData from "@/models/UserExerciseData";
import { requireAuth } from "@/lib/auth";

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
    userExerciseData.forEach(data => {
      userDataMap.set(data.exerciseId.toString(), {
        warmUp: data.warmUp,
        working: data.working,
        lastPR: data.lastPR,
        lastPRDate: data.lastPRDate,
      });
    });
    
    // Merge exercise definitions with user-specific data
    const exercisesWithUserData = exercises.map(exercise => {
      const userData = userDataMap.get(exercise._id.toString()) || {
        warmUp: '',
        working: '',
        lastPR: '',
        lastPRDate: '',
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
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = requireAuth(request);
    await dbConnect();
    const exerciseData = await request.json();
    const exercise = await Exercise.create(exerciseData);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
