import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutSchedule from "@/models/WorkoutSchedule";
import WorkoutTemplate, { TEMPLATE_DAY_KEYS, toPlainDays } from "@/models/WorkoutTemplate";
import UserSchedule, { toPlainDayExercises } from "@/models/UserSchedule";
import Exercise from "@/models/Exercise";
import { withAuth } from "@/lib/auth";
import { isValidObjectId } from "@/lib/validation";
import { MUSCLE_GROUP_OPTIONS } from "@/lib/constants";

const MAX_DAY_EXERCISES = 20;

/**
 * Validate the optional per-day exercise picks: { Monday: [id, id], ... }.
 * Returns [error, clean] — an absent payload means "leave the picks alone".
 */
function validateDayExercises(raw) {
  if (raw === undefined) return [null, null];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return ["exercises must be an object keyed by weekday", null];
  }

  const clean = {};
  for (const [day, ids] of Object.entries(raw)) {
    if (!TEMPLATE_DAY_KEYS.includes(day)) {
      return [`Unknown weekday: ${day}`, null];
    }
    if (!Array.isArray(ids)) {
      return [`${day} exercises must be an array`, null];
    }
    if (ids.length > MAX_DAY_EXERCISES) {
      return [`At most ${MAX_DAY_EXERCISES} exercises per day`, null];
    }
    const unique = new Set();
    for (const id of ids) {
      if (!isValidObjectId(id)) {
        return [`${day} has an invalid exercise id`, null];
      }
      unique.add(String(id));
    }
    clean[day] = [...unique];
  }
  return [null, clean];
}

function defaultDaysMap() {
  return {
    Monday: ["Chest", "Tricep"],
    Tuesday: ["Back", "Bicep"],
    Wednesday: ["Shoulders", "Legs"],
    Thursday: ["Rest Day"],
    Friday: ["Chest", "Tricep"],
    Saturday: ["Back", "Bicep"],
    Sunday: ["Rest Day"],
  };
}

async function migrateGlobalScheduleToTemplate(adminUserId) {
  // Seed a default template from the legacy global schedule if the gallery is empty.
  const templateCount = await WorkoutTemplate.estimatedDocumentCount();
  if (templateCount > 0) return;

  const global = await WorkoutSchedule.find({}).lean();
  const byDay = new Map(global.map((s) => [s.day, s.muscleGroups]));
  const days = {};
  for (const day of TEMPLATE_DAY_KEYS) {
    days[day] = byDay.get(day)?.length ? byDay.get(day).filter((g) => MUSCLE_GROUP_OPTIONS.includes(g)) : ["Rest Day"];
  }

  await WorkoutTemplate.create({
    name: "Classic Split",
    description: "The original NutriGain weekly split, migrated from the global schedule.",
    days,
    isDefault: true,
    createdBy: adminUserId,
  });
}

// GET — the current user's private training split. Ensures one exists: the
// highest-priority default template if any, else a fresh fork of the legacy
// global schedule, else the classic default.
export const GET = withAuth(async (request, user) => {
  await dbConnect();

  let schedule = await UserSchedule.findOne({ user: user.id });
  if (!schedule) {
    await migrateGlobalScheduleToTemplate(user.id);

    const defaultTemplate = await WorkoutTemplate.findOne({ isDefault: true }).sort({ updatedAt: -1 });
    const template = defaultTemplate || (await WorkoutTemplate.findOne({}).sort({ createdAt: 1 }));

    schedule = await UserSchedule.create({
      user: user.id,
      days: template ? toPlainDays(template.days) : defaultDaysMap(),
      sourceTemplateId: template?._id || null,
      sourceTemplateName: template?.name || null,
    });
  }

  return NextResponse.json({
    days: toPlainDays(schedule.days),
    sourceTemplateName: schedule.sourceTemplateName,
    exercises: toPlainDayExercises(schedule.exercises),
  });
});

// PUT — update days of the user's private split. Optionally re-fork from a
// template via { applyTemplateId } (user-initiated "use this template").
export const PUT = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));

  await dbConnect();

  if (body.applyTemplateId !== undefined) {
    if (!body.applyTemplateId || typeof body.applyTemplateId !== "string") {
      return NextResponse.json({ error: "applyTemplateId must be a template id" }, { status: 400 });
    }
    const template = await WorkoutTemplate.findById(body.applyTemplateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const schedule = await UserSchedule.findOneAndUpdate(
      { user: user.id },
      {
        $set: {
          days: toPlainDays(template.days),
          sourceTemplateId: template._id,
          sourceTemplateName: template.name,
          // A different split means different days; per-day picks from the
          // previous one would be stale, so the new split starts clean.
          exercises: {},
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      days: toPlainDays(schedule.days),
      sourceTemplateName: schedule.sourceTemplateName,
      exercises: toPlainDayExercises(schedule.exercises),
    });
  }

  if (body.days === undefined) {
    return NextResponse.json({ error: "Provide days or applyTemplateId" }, { status: 400 });
  }

  const days = body.days;
  if (!days || typeof days !== "object" || Array.isArray(days)) {
    return NextResponse.json({ error: "days must be an object keyed by weekday" }, { status: 400 });
  }
  for (const day of TEMPLATE_DAY_KEYS) {
    const groups = days[day];
    if (
      !Array.isArray(groups) ||
      groups.length === 0 ||
      groups.length > 4 ||
      !groups.every((g) => MUSCLE_GROUP_OPTIONS.includes(g))
    ) {
      return NextResponse.json(
        { error: `each day needs 1-4 muscle groups from: ${MUSCLE_GROUP_OPTIONS.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Per-day exercise picks ride along with the groups. They are optional, so
  // a client that only edits the week keeps the picks it never touched.
  const [exerciseError, dayExercises] = validateDayExercises(body.exercises);
  if (exerciseError) {
    return NextResponse.json({ error: exerciseError }, { status: 400 });
  }

  if (dayExercises) {
    const ids = [...new Set(Object.values(dayExercises).flat())];
    if (ids.length > 0) {
      const existing = await Exercise.countDocuments({ _id: { $in: ids } });
      if (existing !== ids.length) {
        return NextResponse.json(
          { error: "One or more picked exercises no longer exist in the library" },
          { status: 400 }
        );
      }
    }
  }

  const update = { $set: { days, sourceTemplateId: null, sourceTemplateName: null } };
  if (dayExercises) update.$set.exercises = dayExercises;

  const schedule = await UserSchedule.findOneAndUpdate(
    { user: user.id },
    update,
    { new: true, upsert: true }
  );

  return NextResponse.json({
    days: toPlainDays(schedule.days),
    sourceTemplateName: schedule.sourceTemplateName,
    exercises: toPlainDayExercises(schedule.exercises),
  });
});
