"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { suggestMacroGoals, ACTIVITY_LEVELS, GOALS } from "@/lib/tdee";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as the auth pages.            */
/* ------------------------------------------------------------------ */

const ONB_CSS = `
.onb *{box-sizing:border-box}
.onb{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--on-ac:#fff;--ac-soft:#eef2ff;--red-soft:#fef2f2;--red-soft-b:#fecaca;--green:#047857;color:var(--t1);background:var(--paper);min-height:100vh;font-family:inherit}
html[data-theme="dark"] .onb{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--on-ac:#111113;--ac-soft:#232347;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--green:#34d399}
.onb-pane{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:48px 20px}
.onb-card{width:100%;max-width:640px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px;animation:onb-in .5s cubic-bezier(.22,1,.36,1) both}
@keyframes onb-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.onb-brandrow{display:flex;align-items:center;gap:10px;margin-bottom:22px}
.onb-mark{width:30px;height:30px;background:#4f46e5;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.onb-name{font-size:14px;font-weight:800;letter-spacing:-.01em;color:var(--t1)}
.onb-h1{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin:0 0 6px}
.onb-sub{font-size:13.5px;font-weight:500;color:var(--t2);margin:0 0 24px;line-height:1.5}
.onb-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.onb-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.onb-lbl{display:block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:6px}
.onb-in{width:100%;height:44px;padding:0 12px;background:var(--paper);border:1px solid var(--line);border-radius:10px;font:inherit;font-size:14px;font-weight:500;color:var(--t1);outline:none;transition:border-color .15s ease,box-shadow .15s ease}
.onb-in::placeholder{color:var(--t3);opacity:.7}
.onb-in:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac-soft)}
.onb-sec{margin-bottom:20px}
.onb-sec-t{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--t2);margin:0 0 10px}
.onb-opt{position:relative;display:flex;flex-direction:column;gap:2px;padding:11px 13px;background:var(--paper);border:1px solid var(--line);border-radius:10px;cursor:pointer;transition:border-color .15s ease,background .15s ease;font:inherit;text-align:left}
.onb-opt:hover{background:var(--sunken)}
.onb-opt.on{border-color:var(--ac);background:var(--ac-soft)}
.onb-opt b{font-size:13px;font-weight:700;color:var(--t1)}
.onb-opt.on b{color:var(--ac)}
.onb-opt span{font-size:11.5px;font-weight:500;color:var(--t3)}
.onb-opt:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.onb-result{display:flex;flex-wrap:wrap;align-items:center;gap:8px 22px;background:var(--sunken);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:4px 0 22px}
.onb-stat b{display:block;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.onb-stat span{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-top:2px}
.onb-note{width:100%;font-size:12px;font-weight:500;color:var(--t3);margin:2px 0 0}
.onb-err{display:flex;align-items:flex-start;gap:10px;background:var(--red-soft);border:1px solid var(--red-soft-b);color:var(--red);padding:11px 14px;border-radius:10px;font-size:13px;font-weight:500;margin-bottom:18px}
.onb-actions{display:flex;gap:12px;align-items:center}
.onb-btn{flex:1;height:46px;background:var(--ac);color:var(--on-ac);border:none;border-radius:10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s ease,transform .06s ease,opacity .15s ease}
.onb-btn:hover{background:var(--ach)}
.onb-btn:active{transform:translateY(1px)}
.onb-btn:disabled{opacity:.55;cursor:wait;transform:none}
.onb-btn:focus-visible,.onb-skip:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.onb-skip{background:none;border:none;font:inherit;font-size:13px;font-weight:600;color:var(--t3);cursor:pointer;padding:10px 12px;border-radius:8px;white-space:nowrap}
.onb-skip:hover{color:var(--t1);background:var(--sunken)}
.onb-toggle{position:fixed;top:18px;right:20px;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:none;border-radius:10px;background:transparent;color:var(--t2);cursor:pointer;transition:background .15s ease,color .15s ease}
.onb-toggle:hover{background:var(--sunken);color:var(--t1)}
.onb-toggle:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
@media(max-width:560px){.onb-grid{grid-template-columns:1fr}.onb-grid-3{grid-template-columns:1fr}.onb-card{padding:24px}}
@media(prefers-reduced-motion:reduce){.onb *{transition:none!important;animation:none!important}}
`;

export default function OnboardingPage() {
  const { user, loading: authLoading, completeOnboarding } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    sex: "",
    age: "",
    heightCm: "",
    currentWeightKg: "",
    targetWeightKg: "",
    activityLevel: "",
    goal: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Already onboarded (or signed out)? The proxy enforces this too — these
  // are just client-side fallbacks for stale sessions.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);
  useEffect(() => {
    if (user && user.isAdmin) router.replace("/admin");
    else if (user && user.onboardedAt) router.replace("/dashboard");
  }, [user, router]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Live suggestion — the exact same pure function the API recomputes.
  const suggestion = useMemo(
    () =>
      suggestMacroGoals({
        sex: form.sex,
        weightKg: parseFloat(form.currentWeightKg),
        heightCm: parseFloat(form.heightCm),
        age: parseInt(form.age, 10),
        activityLevel: form.activityLevel,
        goal: form.goal,
      }),
    [form]
  );

  const ready = Boolean(suggestion) && form.activityLevel && form.goal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!ready) {
      setError("Fill in your details, activity level, and goal first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          sex: form.sex,
          age: parseInt(form.age, 10),
          heightCm: parseFloat(form.heightCm),
          currentWeightKg: form.currentWeightKg ? parseFloat(form.currentWeightKg) : undefined,
          targetWeight: form.targetWeightKg ? parseFloat(form.targetWeightKg) : undefined,
          activityLevel: form.activityLevel,
          goal: form.goal,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Could not save your profile. Please try again.");
        setSaving(false);
        return;
      }

      completeOnboarding({ onboardedAt: new Date().toISOString(), macroGoals: data.user?.macroGoals });
      router.replace("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not skip onboarding. Please try again.");
        setSaving(false);
        return;
      }
      completeOnboarding({ onboardedAt: new Date().toISOString() });
      router.replace("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  if (authLoading || !user || user.isAdmin || user.onboardedAt) {
    return (
      <>
        <style>{ONB_CSS}</style>
        <Loader />
      </>
    );
  }

  return (
    <div className="onb">
      <style>{ONB_CSS}</style>
      <button
        onClick={toggleTheme}
        className="onb-toggle"
        role="switch"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-checked={theme === "dark"}
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>

      <div className="onb-pane">
        <div className="onb-card">
          <div className="onb-brandrow">
            <div className="onb-mark" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="onb-name">NutriGain</span>
          </div>

          <h1 className="onb-h1">Set your targets, {user.name?.split(" ")[0] || "athlete"}</h1>
          <p className="onb-sub">
            Two minutes now, so every macro meter and chart starts meaningful. You can change all of
            this later in your profile.
          </p>

          {error && (
            <div className="onb-err" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="17" height="17" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="onb-sec">
              <h2 className="onb-sec-t">About you</h2>
              <div className="onb-grid">
                <div>
                  <label htmlFor="onb-sex" className="onb-lbl">Sex</label>
                  <select
                    id="onb-sex"
                    className="onb-in"
                    value={form.sex}
                    onChange={(e) => set("sex")(e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="onb-age" className="onb-lbl">Age</label>
                  <input
                    id="onb-age"
                    type="number"
                    inputMode="numeric"
                    min="13"
                    max="100"
                    className="onb-in"
                    placeholder="24"
                    value={form.age}
                    onChange={(e) => set("age")(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-height" className="onb-lbl">Height (cm)</label>
                  <input
                    id="onb-height"
                    type="number"
                    inputMode="decimal"
                    min="100"
                    max="250"
                    step="0.5"
                    className="onb-in"
                    placeholder="175"
                    value={form.heightCm}
                    onChange={(e) => set("heightCm")(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-weight" className="onb-lbl">Current weight (kg)</label>
                  <input
                    id="onb-weight"
                    type="number"
                    inputMode="decimal"
                    min="20"
                    max="400"
                    step="0.1"
                    className="onb-in"
                    placeholder="72.5"
                    value={form.currentWeightKg}
                    onChange={(e) => set("currentWeightKg")(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="onb-target" className="onb-lbl">Target weight (kg) · optional</label>
                  <input
                    id="onb-target"
                    type="number"
                    inputMode="decimal"
                    min="20"
                    max="400"
                    step="0.1"
                    className="onb-in"
                    placeholder="78"
                    value={form.targetWeightKg}
                    onChange={(e) => set("targetWeightKg")(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="onb-sec">
              <h2 className="onb-sec-t">Activity level</h2>
              <div className="onb-grid-3" role="radiogroup" aria-label="Activity level">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    type="button"
                    key={level.value}
                    role="radio"
                    aria-checked={form.activityLevel === level.value}
                    className={`onb-opt ${form.activityLevel === level.value ? "on" : ""}`}
                    onClick={() => set("activityLevel")(level.value)}
                  >
                    <b>{level.label}</b>
                    <span>{level.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="onb-sec">
              <h2 className="onb-sec-t">Goal</h2>
              <div className="onb-grid-3" role="radiogroup" aria-label="Goal">
                {GOALS.map((goal) => (
                  <button
                    type="button"
                    key={goal.value}
                    role="radio"
                    aria-checked={form.goal === goal.value}
                    className={`onb-opt ${form.goal === goal.value ? "on" : ""}`}
                    onClick={() => set("goal")(goal.value)}
                  >
                    <b>{goal.label}</b>
                    <span>{goal.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {suggestion && (
              <div className="onb-result" aria-live="polite">
                <div className="onb-stat"><b>{suggestion.calories.toLocaleString()}</b><span>kcal / day</span></div>
                <div className="onb-stat"><b>{suggestion.protein} g</b><span>protein</span></div>
                <div className="onb-stat"><b>{suggestion.carbs} g</b><span>carbs</span></div>
                <div className="onb-stat"><b>{suggestion.fats} g</b><span>fats</span></div>
                <p className="onb-note">
                  Suggested from Mifflin-St Jeor (BMR {suggestion.bmr.toLocaleString()} kcal · TDEE{" "}
                  {suggestion.tdee.toLocaleString()} kcal). Adjust anytime in your profile.
                </p>
              </div>
            )}

            <div className="onb-actions">
              <button type="submit" className="onb-btn" disabled={saving || !ready}>
                {saving ? "Saving…" : "Start tracking"}
              </button>
              <button type="button" className="onb-skip" onClick={handleSkip} disabled={saving}>
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
