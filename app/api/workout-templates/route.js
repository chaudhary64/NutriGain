import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutTemplate, { TEMPLATE_DAY_KEYS, TEMPLATE_MUSCLE_GROUP_OPTIONS } from "@/models/WorkoutTemplate";
import { withAuth } from "@/lib/auth";

function validateTemplateBody(body) {
  const errors = [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (name.length < 2 || name.length > 40) {
    errors.push("name must be 2-40 characters");
  }
  if (description.length > 140) {
    errors.push("description must be at most 140 characters");
  }

  let days = null;
  const raw = body.days;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    days = {};
    let daysValid = true;
    for (const day of TEMPLATE_DAY_KEYS) {
      const groups = raw[day];
      if (
        !Array.isArray(groups) ||
        groups.length === 0 ||
        groups.length > 4 ||
        !groups.every((g) => TEMPLATE_MUSCLE_GROUP_OPTIONS.includes(g))
      ) {
        daysValid = false;
        break;
      }
      days[day] = groups;
    }
    if (!daysValid) {
      errors.push(`each day needs 1-4 muscle groups from: ${TEMPLATE_MUSCLE_GROUP_OPTIONS.join(", ")}`);
      days = null;
    }
  } else {
    errors.push("days must be an object keyed by all seven weekdays");
  }

  return { name, description, days, errors };
}

// GET — list templates (any authenticated user; the gym page gallery reads this)
export const GET = withAuth(async () => {
  await dbConnect();
  const templates = await WorkoutTemplate.find({})
    .select("name description days isDefault createdAt updatedAt")
    .sort({ isDefault: -1, name: 1 })
    .lean();

  return NextResponse.json(
    templates.map((t) => ({ ...t, days: Object.fromEntries(t.days instanceof Map ? t.days : []) }))
  );
});

// POST — create a template (admin only)
export const POST = withAuth(
  async (request, user) => {
    const body = await request.json().catch(() => ({}));
    const { name, description, days, errors } = validateTemplateBody(body);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    await dbConnect();

    const duplicate = await WorkoutTemplate.findOne({ name });
    if (duplicate) {
      return NextResponse.json({ error: `A template named "${name}" already exists` }, { status: 409 });
    }

    const template = await WorkoutTemplate.create({
      name,
      description,
      days,
      isDefault: body.isDefault === true,
      createdBy: user.id,
    });

    if (template.isDefault) {
      await WorkoutTemplate.updateMany({ _id: { $ne: template._id } }, { $set: { isDefault: false } });
    }

    return NextResponse.json(
      { ...template.toObject(), days: Object.fromEntries(template.days) },
      { status: 201 }
    );
  },
  { admin: true }
);
