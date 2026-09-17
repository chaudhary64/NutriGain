import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/auth';
import { validateOnboarding } from '@/lib/validation';
import { suggestMacroGoals } from '@/lib/tdee';

/**
 * POST /api/onboarding — completes onboarding for the signed-in user.
 *
 * Body: { action: 'apply', sex, age, heightCm, activityLevel, goal,
 *         targetWeight?, macroGoals? }
 *   or { action: 'skip' }
 *
 * 'apply' stores the profile, upserts today's weight entry (idempotent —
 * re-submitting the same day updates it) and sets targets: the caller's
 * macroGoals when provided, otherwise the server-computed TDEE suggestion.
 * 'skip' only stamps onboardedAt so the dashboard stops gating.
 *
 * The whole completion is one user-document save, so onboardedAt and the
 * profile can never disagree.
 */
export const POST = withAuth(async (request, user) => {
  const body = await request.json().catch(() => ({}));

  const [validationErrors, normalized] = validateOnboarding(body);
  if (validationErrors) {
    return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 400 });
  }

  await dbConnect();

  const userData = await User.findById(user.id);
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (normalized.action === 'skip') {
    if (!userData.onboardedAt) userData.onboardedAt = new Date();
    await userData.save();
    return NextResponse.json({ success: true, skipped: true });
  }

  // Server-computed suggestion — used when the client didn't send explicit goals.
  const suggestion = suggestMacroGoals({
    sex: normalized.profile.sex,
    weightKg: normalized.currentWeightKg ?? undefined,
    heightCm: normalized.profile.heightCm,
    age: normalized.profile.age,
    activityLevel: normalized.profile.activityLevel,
    goal: normalized.profile.goal,
  });

  userData.profile = {
    sex: normalized.profile.sex,
    age: normalized.profile.age,
    heightCm: normalized.profile.heightCm,
    activityLevel: normalized.profile.activityLevel,
    goal: normalized.profile.goal,
  };

  if (normalized.targetWeight != null) {
    userData.targetWeight = normalized.targetWeight;
  }

  if (normalized.macroGoals) {
    userData.macroGoals = normalized.macroGoals;
  } else if (suggestion) {
    userData.macroGoals = {
      calories: suggestion.calories,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fats: suggestion.fats,
    };
  } else {
    return NextResponse.json(
      { error: 'Could not compute macro goals from the provided profile' },
      { status: 400 }
    );
  }

  if (!userData.onboardedAt) userData.onboardedAt = new Date();
  await userData.save();

  // Seed the weight chart with the profile's current weight (if given).
  // Upsert-by-day so re-submitting onboarding never duplicates an entry.
  let weightEntryAdded = false;
  if (normalized.currentWeightKg != null) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const existing = (userData.weightEntries || []).find(
      (entry) => new Date(entry.date).toDateString() === today.toDateString()
    );
    if (existing) {
      existing.weight = normalized.currentWeightKg;
    } else {
      userData.weightEntries.push({ weight: normalized.currentWeightKg, date: new Date(`${dateStr}T00:00:00Z`) });
      weightEntryAdded = true;
    }
    await userData.save();
  }

  return NextResponse.json({
    success: true,
    skipped: false,
    weightEntryAdded,
    suggested: suggestion,
    user: {
      id: userData._id,
      email: userData.email,
      name: userData.name,
      isAdmin: userData.isAdmin,
      macroGoals: userData.macroGoals,
      profile: userData.profile,
      onboardedAt: userData.onboardedAt,
    },
  });
});
