"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";

/* ------------------------------------------------------------------ */
/* Meridian design system — same tokens as app/dashboard/meal.        */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.mrd{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--track:#efefec;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--red-soft:#fef2f2;--red-soft-b:#fecaca;--pro:#7c3aed;--car:#b45309;--green:#047857;color:var(--t1)}
html[data-theme="dark"] .mrd{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--track:#2e2e34;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--pro:#a78bfa;--car:#fbbf24;--green:#34d399}
.mrd{background:var(--paper)}
.mrd .m-card{background:var(--card);border:1px solid var(--line);border-radius:12px}
.mrd .m-card-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)}
.mrd .m-card-h h3{font-size:13px;font-weight:700;color:var(--t1)}
.mrd .m-h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.mrd .m-sub{color:var(--t3);font-size:13px;margin-top:4px}
.mrd .m-crumb{font-size:12px;color:var(--t3)}
.mrd .m-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
.mrd .m-chip-ac{background:var(--ac-soft);color:var(--ac)}
.mrd .m-num{font-variant-numeric:tabular-nums}
.mrd .m-ic{width:16px;height:16px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.mrd .m-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13px;border-radius:8px;padding:10px 16px;cursor:pointer;border:1px solid transparent;transition:.15s}
.mrd .m-btn-primary{background:var(--ac);color:var(--on-ac)}
.mrd .m-btn-primary:hover{background:var(--ach)}
.mrd .m-btn-primary:disabled{opacity:.6;cursor:wait}
.mrd .m-field{border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--t1);background:var(--card);transition:.15s}
.mrd .m-field:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 3px #4f46e51f}
.mrd .m-row{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--line);font-size:13px}
.mrd .m-row:last-child{border-bottom:0}
.mrd .m-row:hover{background:var(--paper)}
.mrd .m-rowicon{width:34px;height:34px;border-radius:9px;background:var(--sunken);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--t2);flex-shrink:0}
.mrd .m-lbl{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:5px}
@keyframes mrd-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.mrd .m-in{animation:mrd-in .45s cubic-bezier(.22,1,.36,1) both}
.mrd .m-in:nth-child(2){animation-delay:.06s}
.mrd .m-in:nth-child(3){animation-delay:.12s}
.mrd-toast{position:fixed;bottom:24px;right:24px;z-index:100;display:flex;flex-direction:column;gap:10px;width:calc(100% - 48px);max-width:380px}
.mrd-toast-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--card);box-shadow:0 16px 40px -12px rgba(0,0,0,.5)}
.mrd-toast-item.err{background:var(--red-soft);border-color:var(--red-soft-b)}
.mrd-toast-item p{font-size:13px;color:var(--t1);flex:1;line-height:1.45}
.mrd-toast-item.err p{color:#991b1b}
.mrd-toast-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex-shrink:0}
.mrd-toast-item.err .mrd-toast-dot{background:var(--red)}
.mrd-toast-x{flex-shrink:0;position:relative;color:var(--t3);background:none;border:0;cursor:pointer;padding:4px;border-radius:6px}
.mrd-toast-x::after{content:"";position:absolute;inset:-6px}
.mrd-toast-x:hover{color:var(--t1);background:var(--sunken)}
@media (max-width:900px){.mrd .prf-layout{grid-template-columns:1fr !important}}
`;

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  gear: <><path d="M10.3 3.9l.15-.89a1 1 0 0 1 1.1-.84h.9a1 1 0 0 1 1.1.85l.15.89c.07.42.38.76.78.93.4.16.86.14 1.2-.11l.74-.53a1 1 0 0 1 1.45.12l.77.77c.39.39.44 1 .12 1.45l-.53.74c-.25.35-.27.8-.1 1.2.16.4.5.71.93.78l.89.15a1 1 0 0 1 .94 1.11v1.09a1 1 0 0 1-.94 1.11l-.89.15a1.13 1.13 0 0 0-.93.78c-.17.4-.14.85.1 1.2l.53.74a1 1 0 0 1-.12 1.45l-.77.77a1 1 0 0 1-1.45.12l-.74-.53a1.13 1.13 0 0 0-1.2-.1c-.4.16-.71.5-.78.93l-.15.89a1 1 0 0 1-1.1.94h-1.1a1 1 0 0 1-1.1-.94l-.15-.89a1.13 1.13 0 0 0-.78-.93 1.13 1.13 0 0 0-1.2.1l-.74.53a1 1 0 0 1-1.45-.12l-.77-.77a1 1 0 0 1-.12-1.45l.53-.74c.24-.35.27-.8.1-1.2a1.13 1.13 0 0 0-.93-.78l-.89-.15A1 1 0 0 1 3 12.45v-1.1a1 1 0 0 1 .94-1.1l.89-.15c.42-.07.77-.38.93-.78.17-.4.15-.85-.1-1.2l-.53-.74a1 1 0 0 1 .12-1.45l.77-.77a1 1 0 0 1 1.45-.12l.74.53c.34.25.8.27 1.2.1.4-.16.71-.5.78-.92z" /><circle cx="12" cy="12" r="3" /></>,
  scroll: <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  user: <><circle cx="12" cy="8" r="3.75" /><path d="M4.5 20.1a7.5 7.5 0 0 1 15 0" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  logout: <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />,
  check: <path d="M5 13l4 4L19 7" />,
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  /* Food-source macro glyphs (shared with the meal page meters) */
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  drumstick: <><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.6 13.6 17.2 17.2" /><circle cx="19.4" cy="16.5" r="1.7" /><circle cx="16.5" cy="19.4" r="1.7" /></>,
  wheat: <><path d="M12 22v-7" /><path d="M8 15l4-3 4 3" /><path d="M8 11l4-3 4 3" /><path d="M8 7l4-3 4 3" /></>,
  avocado: <><path d="M12 3c3.2 3.2 6.5 7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10 8.8 6.2 12 3z" /><circle cx="12" cy="14.2" r="2.8" /></>,
};

let toastSeq = 0;

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="mrd-toast" aria-live="polite" role="status">
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

export default function ProfilePage() {
  const { user, logout, checkAuth } = useAuth();
  const [goalForm, setGoalForm] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, tone = "success", ttl = 4000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (!user) {
    return null;
  }

  const goals = user.macroGoals || { calories: 1900, protein: 120, carbs: 170, fats: 60 };

  const handleGoalChange = (field, value) => {
    setGoalForm((prev) => ({ ...(prev || goals), [field]: value }));
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    setGoalsMessage("");
    try {
      const current = goalForm || goals;
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ macroGoals: current }),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        setGoalForm(null);
        setEditingGoals(false);
        pushToast("Daily goals saved — your meal dashboard meters are updated.");
      } else {
        setGoalsMessage(data.error || "Failed to save goals");
      }
    } catch (error) {
      console.error("Error saving macro goals:", error);
      setGoalsMessage("Network error. Please try again.");
    } finally {
      setSavingGoals(false);
    }
  };

  const startEditGoals = () => {
    setGoalForm(goals);
    setGoalsMessage("");
    setEditingGoals(true);
    requestAnimationFrame(() => document.getElementById("goal-calories")?.focus());
  };

  const cancelEditGoals = () => {
    setGoalForm(null);
    setGoalsMessage("");
    setEditingGoals(false);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NG";

  const goalFields = [
    { field: "calories", label: "Calories", unit: "kcal", icon: "flame", dot: "var(--ac)" },
    { field: "protein", label: "Protein", unit: "g", icon: "drumstick", dot: "var(--pro)" },
    { field: "carbs", label: "Carbs", unit: "g", icon: "wheat", dot: "var(--car)" },
    { field: "fats", label: "Fats", unit: "g", icon: "avocado", dot: "var(--green)" },
  ];

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div className="m-h1">Profile</div>
            <div className="m-sub">Account details, daily targets, and session.</div>
          </div>

          <div className="prf-layout" style={{ display: "grid", gridTemplateColumns: "min(320px,100%) 1fr", gap: 24, alignItems: "start" }}>
            {/* Identity card */}
            <div className="m-card m-in" style={{ position: "sticky", top: 88 }}>
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
                <div className="m-crumb" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Meal dashboard meters</span>
                  <span className="m-num" style={{ fontWeight: 600, color: "var(--t2)" }}>
                    {(goalForm || goals).calories.toLocaleString()} kcal goal
                  </span>
                </div>
              </div>
            </div>

            {/* Settings stack */}
            <div style={{ display: "grid", gap: 20 }}>
              {/* Daily goals */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.target} /></span>
                    Daily goals
                  </h3>
                  {editingGoals ? (
                    <span className="m-chip m-chip-ac">EDITING</span>
                  ) : (
                    <button
                      onClick={startEditGoals}
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {goalFields.map((item) => (
                      <div key={item.field} className="m-field" style={{ display: "block", padding: "12px 14px", background: editingGoals ? "var(--card)" : "var(--sunken)" }}>
                        <label htmlFor={`goal-${item.field}`} className="m-lbl" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <Icon d={ICONS[item.icon]} className="m-ic" style={{ color: item.dot }} />
                          {item.label} ({item.unit})
                        </label>
                        {editingGoals ? (
                          <input
                            id={`goal-${item.field}`}
                            type="number"
                            min="1"
                            max="10000"
                            step="1"
                            value={(goalForm || goals)[item.field] ?? ""}
                            onChange={(e) => handleGoalChange(item.field, e.target.value)}
                            className="m-num"
                            style={{ width: "100%", border: 0, outline: "none", fontSize: 20, fontWeight: 700, color: "var(--t1)", background: "transparent", padding: 0 }}
                          />
                        ) : (
                          <p className="m-num" style={{ fontSize: 20, fontWeight: 700, color: "var(--t1)" }} aria-live="off">
                            {goals[item.field]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {goalsMessage && (
                    <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{goalsMessage}</p>
                  )}

                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <p className="m-crumb">
                      {editingGoals ? "Unsaved changes" : "All changes sync to your account"}
                    </p>
                    {editingGoals && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={cancelEditGoals}
                          disabled={savingGoals}
                          className="m-btn"
                          style={{ border: "1px solid var(--line)", color: "var(--t2)", background: "var(--card)" }}
                        >
                          Cancel
                        </button>
                        <button onClick={handleSaveGoals} disabled={savingGoals} className="m-btn m-btn-primary">
                          <Icon d={ICONS.check} className="w-4 h-4" />
                          {savingGoals ? "Saving…" : "Save goals"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--ac)" }}><Icon d={ICONS.user} /></span>
                    Account info
                  </h3>
                </div>
                <div className="m-row">
                  <span className="m-rowicon"><Icon d={ICONS.user} /></span>
                  <div style={{ flex: 1 }}>
                    <span className="m-lbl" style={{ marginBottom: 2 }}>Name</span>
                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                  </div>
                </div>
                <div className="m-row">
                  <span className="m-rowicon"><Icon d={ICONS.mail} /></span>
                  <div style={{ flex: 1 }}>
                    <span className="m-lbl" style={{ marginBottom: 2 }}>Email</span>
                    <p style={{ fontWeight: 600 }}>{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Session */}
              <div className="m-card m-in">
                <div className="m-card-h">
                  <h3>Session</h3>
                  <span className="m-crumb">sign out of this device</span>
                </div>
                <div style={{ padding: 16 }}>
                  <button
                    id="profile-logout-btn"
                    onClick={logout}
                    className="m-btn"
                    style={{ width: "100%", border: "1px solid var(--red-soft-b)", color: "var(--red)", background: "var(--card)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
                  >
                    <Icon d={ICONS.logout} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
