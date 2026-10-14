"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import SplitManager from "@/components/SplitManager";
import { suggestMacroGoals, ACTIVITY_LEVELS, GOALS } from "@/lib/tdee";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as app/dashboard/meal.        */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.mrd{color:var(--t1)}
.mrd{background:var(--paper)}
.mrd .m-row{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--line);font-size:13px}
.mrd .m-row:last-child{border-bottom:0}
.mrd .m-row:hover{background:var(--paper)}
.mrd .m-rowicon{width:34px;height:34px;border-radius:9px;background:var(--sunken);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--t2);flex-shrink:0}
/* TDEE suggestion strip (mirrors the onboarding result) */
.prf-suggest{display:flex;flex-wrap:wrap;align-items:center;gap:10px 26px;background:var(--sunken);border:1px solid var(--line);border-radius:12px;padding:14px 18px}
.prf-stat b{display:block;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.prf-stat span{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-top:2px}
.prf-note{width:100%;font-size:12px;font-weight:500;color:var(--t3);margin:2px 0 0}
.prf-check{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--t2);cursor:pointer}
.prf-check input{accent-color:var(--ac);width:15px;height:15px;cursor:pointer}
@media (max-width:900px){.mrd .prf-layout{grid-template-columns:1fr !important}}
`;

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  /* Canonical balance scale (Lucide) — "scale" had two spellings across the
     app; this is now the one the gym page and stats page share. */
  scale: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
};

let toastSeq = 0;

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="mrd mrd-toast" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`mrd-toast-item ${t.tone === "error" ? "err" : ""}`}>
          <span className="mrd-toast-dot"></span>
          <p>{t.message}</p>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="mrd-toast-x">
            <Icon d={ICONS.x} className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

const ACTIVITY_LABEL = Object.fromEntries(ACTIVITY_LEVELS.map((l) => [l.value, l.label]));
const GOAL_LABEL = Object.fromEntries(GOALS.map((g) => [g.value, g.label]));
const SEX_LABEL = { male: "Male", female: "Female", other: "Other / prefer not to say" };

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [toasts, setToasts] = useState([]);

  // Body profile & targets (saved through POST /api/onboarding, which
  // recomputes macro goals server-side from the TDEE suggestion).
  const [profileForm, setProfileForm] = useState(null); // null = display mode
  const [applySuggested, setApplySuggested] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [weightInfo, setWeightInfo] = useState({ entries: [], targetWeight: 75 });
  const [weightTick, setWeightTick] = useState(0);
  const [weightError, setWeightError] = useState("");

  const pushToast = (message, tone = "success", ttl = 4000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Weight entries + target weight (prefills the profile form and the
  // "current weight" display; refreshed after a profile save).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/weight")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!cancelled && data) {
          setWeightInfo({ entries: data.weightEntries || [], targetWeight: data.targetWeight || 75 });
          setWeightError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setWeightError(err?.message || "Network error");
      });
    return () => {
      cancelled = true;
    };
  }, [user, weightTick]);

  // Live suggestion — the exact same pure function the API recomputes.
  // Null while not editing (profileForm is null) or inputs incomplete.
  const profileSuggestion = useMemo(
    () =>
      suggestMacroGoals({
        sex: profileForm?.sex,
        weightKg: parseFloat(profileForm?.currentWeightKg),
        heightCm: parseFloat(profileForm?.heightCm),
        age: parseInt(profileForm?.age, 10),
        activityLevel: profileForm?.activityLevel,
        goal: profileForm?.goal,
      }),
    [profileForm]
  );

  if (!user) {
    return null;
  }

  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;
  const latestEntry = weightInfo.entries.length > 0 ? weightInfo.entries[weightInfo.entries.length - 1] : null;
  const profile = user.profile || null;

  /* ---------------- Body profile: edit + TDEE suggestion ---------------- */

  const startEditProfile = () => {
    setProfileForm({
      sex: profile?.sex || "",
      age: profile?.age ?? "",
      heightCm: profile?.heightCm ?? "",
      currentWeightKg: latestEntry ? String(latestEntry.weight) : "",
      targetWeightKg: weightInfo.targetWeight ? String(weightInfo.targetWeight) : "",
      activityLevel: profile?.activityLevel || "",
      goal: profile?.goal || "",
    });
    setApplySuggested(true);
    setProfileMessage("");
  };

  const cancelEditProfile = () => {
    setProfileForm(null);
    setProfileMessage("");
  };

  const setProfileField = (key) => (value) => setProfileForm((prev) => ({ ...prev, [key]: value }));

  const profileReady = Boolean(profileSuggestion) && profileForm?.activityLevel && profileForm?.goal;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const payload = {
        action: "apply",
        sex: profileForm.sex,
        age: parseInt(profileForm.age, 10),
        heightCm: parseFloat(profileForm.heightCm),
        currentWeightKg: profileForm.currentWeightKg ? parseFloat(profileForm.currentWeightKg) : undefined,
        targetWeight: profileForm.targetWeightKg ? parseFloat(profileForm.targetWeightKg) : undefined,
        activityLevel: profileForm.activityLevel,
        goal: profileForm.goal,
      };
      // Omitting macroGoals makes the server apply the TDEE suggestion;
      // sending the current ones keeps them untouched.
      if (!applySuggested) payload.macroGoals = goals;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        setProfileForm(null);
        setWeightTick((n) => n + 1); // today's weight entry may have been upserted
        pushToast(
          applySuggested && profileSuggestion
            ? "Profile saved — daily goals recalculated from your TDEE."
            : "Profile saved — your daily goals were left unchanged."
        );
      } else {
        setProfileMessage(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileMessage("Network error. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NG";

  const profileTiles = [
    { label: "Sex", value: profile?.sex ? SEX_LABEL[profile.sex] : null },
    { label: "Age", value: profile?.age ? `${profile.age} yrs` : null },
    { label: "Height", value: profile?.heightCm ? `${profile.heightCm} cm` : null },
    { label: "Activity", value: profile?.activityLevel ? ACTIVITY_LABEL[profile.activityLevel] : null },
    { label: "Goal", value: profile?.goal ? GOAL_LABEL[profile.goal] : null },
  ];

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — SaaS title block, matching meal/gym */}
          <div className="m-in" style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ac)", margin: "0 0 8px" }}>Account · Profile</p>
            <div className="m-h1">Profile</div>
            <div className="m-sub">Identity, body profile, targets, and your training split.</div>
          </div>

          <div className="prf-layout" style={{ display: "grid", gridTemplateColumns: "min(320px,100%) 1fr", gap: 24, alignItems: "start" }}>
            {/* Identity card */}
            <div className="m-card m-in" style={{ position: "sticky", top: 24 }}>
              <div style={{ padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, borderBottom: "1px solid var(--line)" }}>
                <div
                  style={{
                    width: 96, height: 96, borderRadius: "50%", background: "var(--ac-soft)", color: "var(--ac)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, fontWeight: 700, letterSpacing: "-.02em",
                    border: "1px solid var(--ac-soft-b)",
                  }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>{user.name}</p>
                  <p className="m-crumb" style={{ marginTop: 3, wordBreak: "break-all" }}>{user.email}</p>
                </div>
                <span className="m-chip m-chip-ac">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ac)" }}></span>
                  MEMBER
                </span>
              </div>
              <div style={{ padding: "14px 18px" }}>
                <div className="m-crumb" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>Meal dashboard meters</span>
                  <span className="m-num" style={{ fontWeight: 600, color: "var(--t2)" }}>
                    {goals.calories.toLocaleString()} kcal goal
                  </span>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="m-crumb"
                  style={{ display: "inline-block", marginTop: 8, color: "var(--ac)", fontWeight: 700 }}
                >
                  Change goals in Settings →
                </Link>
              </div>
            </div>

            {/* Settings stack */}
            <div style={{ display: "grid", gap: 20 }}>

              {/* Training split — shared manager (template gallery + custom editor) */}
              <SplitManager pushToast={pushToast} />

              {/* Body profile & targets */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.scale} /></span>
                    Body profile &amp; targets
                  </h3>
                  {profileForm ? (
                    <span className="m-chip m-chip-ac">EDITING</span>
                  ) : (
                    <button
                      onClick={startEditProfile}
                      className="m-btn"
                      style={{ padding: "6px 12px", fontSize: 12, border: "1px solid var(--line)", color: "var(--t1)", background: "var(--card)", gap: 6 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
                    >
                      <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  {profileForm ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label htmlFor="prf-sex" className="m-lbl">Sex</label>
                          <select id="prf-sex" className="m-field" style={{ width: "100%" }} value={profileForm.sex} onChange={(e) => setProfileField("sex")(e.target.value)}>
                            <option value="">Select…</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other / prefer not to say</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="prf-age" className="m-lbl">Age</label>
                          <input id="prf-age" type="number" inputMode="numeric" min="13" max="100" className="m-field m-num" style={{ width: "100%" }} placeholder="24" value={profileForm.age} onChange={(e) => setProfileField("age")(e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="prf-height" className="m-lbl">Height (cm)</label>
                          <input id="prf-height" type="number" inputMode="decimal" min="100" max="250" step="0.5" className="m-field m-num" style={{ width: "100%" }} placeholder="175" value={profileForm.heightCm} onChange={(e) => setProfileField("heightCm")(e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="prf-weight" className="m-lbl">Current weight (kg)</label>
                          <input id="prf-weight" type="number" inputMode="decimal" min="20" max="400" step="0.1" className="m-field m-num" style={{ width: "100%" }} placeholder="72.5" value={profileForm.currentWeightKg} onChange={(e) => setProfileField("currentWeightKg")(e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="prf-target" className="m-lbl">Target weight (kg) · optional</label>
                          <input id="prf-target" type="number" inputMode="decimal" min="20" max="400" step="0.1" className="m-field m-num" style={{ width: "100%" }} placeholder="78" value={profileForm.targetWeightKg} onChange={(e) => setProfileField("targetWeightKg")(e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="prf-activity" className="m-lbl">Activity level</label>
                          <select id="prf-activity" className="m-field" style={{ width: "100%" }} value={profileForm.activityLevel} onChange={(e) => setProfileField("activityLevel")(e.target.value)}>
                            <option value="">Select…</option>
                            {ACTIVITY_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>{level.label} — {level.hint}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="prf-goal" className="m-lbl">Goal</label>
                          <select id="prf-goal" className="m-field" style={{ width: "100%" }} value={profileForm.goal} onChange={(e) => setProfileField("goal")(e.target.value)}>
                            <option value="">Select…</option>
                            {GOALS.map((goal) => (
                              <option key={goal.value} value={goal.value}>{goal.label} — {goal.hint}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {profileSuggestion && (
                        <div className="prf-suggest" style={{ marginTop: 14 }} aria-live="polite">
                          <div className="prf-stat"><b>{profileSuggestion.calories.toLocaleString()}</b><span>kcal / day</span></div>
                          <div className="prf-stat"><b>{profileSuggestion.protein} g</b><span>protein</span></div>
                          <div className="prf-stat"><b>{profileSuggestion.carbs} g</b><span>carbs</span></div>
                          <div className="prf-stat"><b>{profileSuggestion.fats} g</b><span>fats</span></div>
                          <p className="prf-note">
                            Suggested from Mifflin-St Jeor (BMR {profileSuggestion.bmr.toLocaleString()} kcal · TDEE{" "}
                            {profileSuggestion.tdee.toLocaleString()} kcal). The server recomputes these on save —
                            client numbers are never trusted.
                          </p>
                        </div>
                      )}

                      {profileMessage && (
                        <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{profileMessage}</p>
                      )}

                      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <label className="prf-check">
                          <input type="checkbox" checked={applySuggested} onChange={(e) => setApplySuggested(e.target.checked)} />
                          Apply suggested goals on save
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={cancelEditProfile} disabled={savingProfile} className="m-btn" style={{ border: "1px solid var(--line)", color: "var(--t2)", background: "var(--card)" }}>
                            Cancel
                          </button>
                          <button onClick={handleSaveProfile} disabled={savingProfile || !profileReady} className="m-btn m-btn-primary" title={!profileReady ? "Fill in all fields (weight included) to save" : undefined}>
                            <Icon d={ICONS.check} className="w-4 h-4" />
                            {savingProfile ? "Saving…" : "Save profile"}
                          </button>
                        </div>
                      </div>
                      {!profileReady && (
                        <p className="m-crumb" style={{ marginTop: 10 }}>
                          Complete every field — including current weight — to save. Weight also seeds today&apos;s
                          entry on the gym weight chart.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                        {profileTiles.map((tile) => (
                          <div key={tile.label} className="m-field" style={{ display: "block", padding: "12px 14px", background: "var(--sunken)" }}>
                            <span className="m-lbl">{tile.label}</span>
                            <p style={{ fontSize: 14, fontWeight: 700, color: tile.value ? "var(--t1)" : "var(--t3)" }}>
                              {tile.value || "Not set"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <div className="m-row" style={{ padding: "12px 2px" }}>
                          <span className="m-rowicon"><Icon d={ICONS.scale} /></span>
                          <div style={{ flex: 1 }}>
                            <span className="m-lbl" style={{ marginBottom: 2 }}>Current weight</span>
                            <p style={{ fontWeight: 600 }} className="m-num">
                              {latestEntry ? (
                                <>
                                  {latestEntry.weight} kg
                                  <span className="m-crumb" style={{ fontWeight: 500 }}>
                                    {" "}· logged {new Date(latestEntry.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                                  </span>
                                  {weightError && (
                                    <span className="m-crumb" role="alert" style={{ color: "var(--red)", fontWeight: 600 }}>
                                      {" "}· refresh failed
                                    </span>
                                  )}
                                </>
                              ) : weightError ? (
                                <span className="m-crumb" role="alert" style={{ fontWeight: 500, color: "var(--red)" }}>
                                  Couldn&apos;t load weight data — {weightError}.{" "}
                                  <button
                                    type="button"
                                    onClick={() => setWeightTick((n) => n + 1)}
                                    style={{ background: "none", border: "none", padding: 0, color: "var(--red)", fontWeight: 700, textDecoration: "underline", cursor: "pointer", font: "inherit" }}
                                  >
                                    Try again
                                  </button>
                                </span>
                              ) : (
                                <span className="m-crumb" style={{ fontWeight: 500 }}>No entries yet — save your profile to seed today&apos;s weight</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="m-row" style={{ padding: "12px 2px" }}>
                          <span className="m-rowicon"><Icon d={ICONS.target} /></span>
                          <div style={{ flex: 1 }}>
                            <span className="m-lbl" style={{ marginBottom: 2 }}>Target weight</span>
                            <p style={{ fontWeight: 600 }} className="m-num">{weightInfo.targetWeight} kg</p>
                          </div>
                          <span className="m-crumb">drawn on the gym weight chart</span>
                        </div>
                      </div>

                      {!profile && (
                        <p className="m-crumb" style={{ marginTop: 10 }}>
                          You skipped setup — add your details to unlock TDEE-based goal suggestions.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
