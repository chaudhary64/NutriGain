import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WorkoutTemplate, { TEMPLATE_DAY_KEYS, TEMPLATE_MUSCLE_GROUP_OPTIONS } from "@/models/WorkoutTemplate";
import UserSchedule from "@/models/UserSchedule";
import { withAuth } from "@/lib/auth";
import { isValidObjectId } from "@/lib/validation";

function validateDaysUpdate(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const days = {};
  for (const day of TEMPLATE_DAY_KEYS) {
    const groups = raw[day];
    if (
      !Array.isArray(groups) ||
      groups.length === 0 ||
      groups.length > 4 ||
      !groups.every((g) => TEMPLATE_MUSCLE_GROUP_OPTIONS.includes(g))
    ) {
      return null;
    }
    days[day] = groups;
  }
  return days;
}

// GET one template
export const GET = withAuth(
  async (request, user, { params }) => {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
    }

    await dbConnect();
    const template = await WorkoutTemplate.findById(id).lean();
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ ...template, days: Object.fromEntries(template.days instanceof Map ? template.days : []) });
  }
);

// PUT — update a template (admin only). Users who forked it keep their copy;
// their sourceTemplateName persists as provenance only.
export const PUT = withAuth(
  async (request, user, { params }) => {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const update = {};
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 40) {
        return NextResponse.json({ error: "name must be 2-40 characters" }, { status: 400 });
      }
      update.name = name;
    }
    if (body.description !== undefined) {
      const description = typeof body.description === "string" ? body.description.trim() : "";
      if (description.length > 140) {
        return NextResponse.json({ error: "description must be at most 140 characters" }, { status: 400 });
      }
      update.description = description;
    }
    if (body.days !== undefined) {
      const days = validateDaysUpdate(body.days);
      if (!days) {
        return NextResponse.json(
          { error: "each day needs 1-4 muscle groups from the allowed list" },
          { status: 400 }
        );
      }
      update.days = days;
    }
    if (body.isDefault !== undefined) {
      update.isDefault = body.isDefault === true;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await dbConnect();

    if (update.name) {
      const duplicate = await WorkoutTemplate.findOne({ name: update.name, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json({ error: `A template named "${update.name}" already exists` }, { status: 409 });
      }
    }

    const template = await WorkoutTemplate.findByIdAndUpdate(id, update, { new: true });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (update.isDefault === true) {
      await WorkoutTemplate.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } });
    }

    return NextResponse.json({ ...template.toObject(), days: Object.fromEntries(template.days) });
  },
  { admin: true }
);

// DELETE — remove a template (admin only). Forked user schedules keep their
// copied days but lose the source reference (marked "Custom" thereafter).
export const DELETE = withAuth(
  async (request, user, { params }) => {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
    }

    await dbConnect();

    const template = await WorkoutTemplate.findByIdAndDelete(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await UserSchedule.updateMany(
      { sourceTemplateId: id },
      { $set: { sourceTemplateId: null, sourceTemplateName: null } }
    );

    return NextResponse.json({ ok: true });
  },
  { admin: true }
);
