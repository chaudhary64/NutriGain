import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutSchedule from "@/models/WorkoutSchedule";
import WorkoutTemplate, { TEMPLATE_DAY_KEYS, toPlainDays } from "@/models/WorkoutTemplate";
import UserSchedule from "@/models/UserSchedule";
import { withAuth } from "@/lib/auth";

const MUSCLE_GROUP_OPTIONS = [
  "Abs", "Back", "Bicep", "Chest", "Forearms", "Legs", "Shoulders", "Tricep",
  "Push", "Pull", "Upper Body", "Lower Body", "Full Body", "Rest Day",
];

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

  return NextResponse.json({ days: toPlainDays(schedule.days), sourceTemplateName: schedule.sourceTemplateName });
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
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ days: toPlainDays(schedule.days), sourceTemplateName: schedule.sourceTemplateName });
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

  const schedule = await UserSchedule.findOneAndUpdate(
    { user: user.id },
    { $set: { days, sourceTemplateId: null, sourceTemplateName: null } },
    { new: true, upsert: true }
  );

  return NextResponse.json({ days: toPlainDays(schedule.days), sourceTemplateName: schedule.sourceTemplateName });
});
