"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AppShell from "@/components/AppShell";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Meridian design system — page-local rules only.                    */
/*                                                                    */
/* Cards, type, chips, buttons, fields, entrance motion and the toast  */
/* host all live in the shared stylesheet (app/meridian.css). What is  */
/* left here is the two-pane settings layout: a sticky section rail    */
/* split from the body by a newspaper column rule, and de-boxed        */
/* sections separated by hairlines instead of five equal cards.        */
/* ------------------------------------------------------------------ */

const SETTINGS_CSS = `
/* Anchor jumps inside this page animate; scoped so no other surface
   inherits smooth scrolling from a dashboard. */
html:has(.stg-layout){scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html:has(.stg-layout){scroll-behavior:auto}}
/* Two-pane shell — same rail/column-rule convention as the gym page. */
.stg-layout{display:grid;grid-template-columns:min(216px,100%) minmax(0,1fr);gap:24px;align-items:start}
.stg-rail{position:sticky;top:24px;align-self:start}
.stg-rail-lbl{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.stg-rail-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.stg-rail-link{display:block;font-size:13px;font-weight:600;color:var(--t3);text-decoration:none;padding:7px 10px 7px 12px;border-left:2px solid transparent;border-radius:0 7px 7px 0;transition:color .15s,background .15s,border-color .15s}
.stg-rail-link:hover{color:var(--t1);background:var(--sunken)}
.stg-rail-link.on{color:var(--ac);font-weight:700;border-left-color:var(--ac);background:var(--ac-soft)}
.stg-rail-link:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.stg-body{min-width:0;max-width:860px}
/* Sections — hierarchy from type and spacing, not five borders. */
.stg-sec{padding-bottom:34px;scroll-margin-top:88px}
.stg-sec+.stg-sec{border-top:1px solid var(--line);padding-top:34px}
.stg-sec:last-child{padding-bottom:8px}
.stg-sec-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.stg-sec-h h2{font-size:16px;font-weight:700;letter-spacing:-.01em;color:var(--t1);margin:0}
.stg-sec-sub{font-size:12.5px;font-weight:500;color:var(--t3);margin:5px 0 0;max-width:56ch;line-height:1.5}
.stg-sec-acts{display:flex;gap:8px;flex-shrink:0}
.stg-btn{border:1px solid var(--line);background:var(--card);color:var(--t1)}
.stg-btn:hover:not(:disabled){background:var(--sunken)}
.stg-btn-danger{border:1px solid var(--red-soft-b);background:var(--card);color:var(--red)}
.stg-btn-danger:hover{background:var(--red-soft)}
/* Goal tiles — sunken while reading, lift to a card + accent while editing. */
.stg-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.stg-tile{background:var(--sunken);border:1px solid var(--line);border-radius:10px;padding:12px 14px;transition:border-color .15s,background .15s}
.stg-tile.editing{background:var(--card);border-color:var(--ac)}
.stg-tile-k{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin:0}
.stg-tile-v{margin:6px 0 0;font-size:22px;font-weight:800;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums;line-height:1.15}
.stg-tile-v small{font-size:12px;font-weight:600;color:var(--t3);letter-spacing:0;margin-left:3px}
.stg-tile-in{width:100%;margin-top:6px;padding:0;border:0;outline:none;background:transparent;font:inherit;font-size:22px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--t1)}
.stg-tile-in:focus-visible{outline:2px solid var(--ac);outline-offset:3px;border-radius:4px}
.stg-status{font-size:12.5px;font-weight:600;color:var(--t3);margin:14px 0 0}
.stg-status.err{color:var(--red)}
/* Setting rows — label + description left, control or value right. */
.stg-rows{display:grid}
.stg-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 0;border-top:1px solid var(--line)}
.stg-row:first-child{border-top:0;padding-top:0}
.stg-row-t{min-width:0}
.stg-row-k{font-size:13px;font-weight:600;color:var(--t1)}
.stg-row-d{font-size:12.5px;font-weight:500;color:var(--t3);margin:3px 0 0;max-width:52ch}
.stg-row-v{font-size:13px;font-weight:600;color:var(--t1);text-align:right;word-break:break-all;font-variant-numeric:tabular-nums}
/* Theme segmented control */
.stg-seg{display:inline-flex;gap:4px;background:var(--sunken);border:1px solid var(--line);border-radius:10px;padding:4px;flex-shrink:0}
.stg-seg button{border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:700;color:var(--t2);padding:7px 16px;border-radius:7px;cursor:pointer;transition:background .15s,color .15s}
.stg-seg button:hover{color:var(--t1)}
.stg-seg button.on{background:var(--card);color:var(--ac);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.stg-seg button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
/* Password — one narrow column so inputs never stretch the full canvas. */
.stg-form{display:grid;gap:12px;max-width:420px}
.stg-form input.m-field{width:100%}
.stg-reqs{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:3px}
.stg-reqs li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600}
.stg-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);height:28px;width:28px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--t3);cursor:pointer;padding:0;border-radius:7px}
.stg-eye:hover{color:var(--t1)}
.stg-err{margin:0;font-size:13px;font-weight:600;color:var(--red)}
/* Mobile — the rail becomes a chip row above the body. */
@media (max-width:1024px){
  .stg-layout{grid-template-columns:minmax(0,1fr)}
  .stg-rail{position:static;border-bottom:1px solid var(--line);padding-bottom:16px}
  .stg-rail-list{display:flex;flex-wrap:wrap;gap:8px}
  .stg-rail-link{border:1px solid var(--line);border-left:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--card)}
  .stg-rail-link.on{border-color:var(--ac)}
  .stg-sec{scroll-margin-top:76px}
}
@media (min-width:1025px){
  .stg-layout{column-gap:36px}
  .stg-rail{border-right:1px solid var(--line);padding-right:32px}
}
@media (max-width:640px){
  .stg-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}
  .stg-sec-h{flex-direction:column;align-items:stretch}
}
`;

/* The reading line, in viewport px: a section counts as current once its heading
   has crossed it. Near the top rather than mid-viewport, so the first section is
   current when the page opens and the highlight follows the eye down the page.
   It also clears the sticky mobile bar and the rail's own top. */
const READ_LINE = 132;

/* One source of truth for the rail, the scroll-spy, and the section ids. */
const SECTIONS = [
  { id: "stg-goals", label: "Daily goals" },
  { id: "stg-appearance", label: "Appearance" },
  { id: "stg-account", label: "Account" },
  { id: "stg-password", label: "Password" },
  { id: "stg-session", label: "Session" },
];

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  user: <><circle cx="12" cy="8" r="3.75" /><path d="M4.5 20.1a7.5 7.5 0 0 1 15 0" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  /* Same log-out geometry as the shell (Lucide/Feather) — this page and the
     sidebar used to ship two different spellings of the same icon. */
  logout: <><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="m2 2 20 20" /></>,
  /* Food-source macro glyphs (shared with the meal page meters) */
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  drumstick: <><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.6 13.6 17.2 17.2" /><circle cx="19.4" cy="16.5" r="1.7" /><circle cx="16.5" cy="19.4" r="1.7" /></>,
  wheat: <><path d="M12 22v-7" /><path d="M8 15l4-3 4 3" /><path d="M8 11l4-3 4 3" /><path d="M8 7l4-3 4 3" /></>,
  avocado: <><path d="M12 3c3.2 3.2 6.5 7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10 8.8 6.2 12 3z" /><circle cx="12" cy="14.2" r="2.8" /></>,
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

export default function SettingsPage() {
  const { user, logout, checkAuth } = useAuth();
  const { theme, setTheme } = useTheme();

  const [goalForm, setGoalForm] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState("");
  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const lockRef = useRef(null);

  // Password change (revokes sessions on other devices via tokenVersion).
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  // A rail click takes responsibility for the highlight, then shows the section
  // the reader asked for — even on a page too short to scroll a section up to
  // the reading line. The reader's own scrolling hands control back to the spy.
  const pickSection = (id) => {
    lockRef.current = id;
    setActiveSection(id);
  };

  // Section rail scroll-spy: the last section whose heading has crossed the
  // reading line is the one being read, and the end of the page hands the
  // highlight to the final section.
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);

    const onScroll = () => {
      // A rail click owns the highlight until the reader scrolls themselves.
      if (lockRef.current) return;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= READ_LINE) current = id;
      }
      // The end of the page is a position of its own: the last section keeps the
      // highlight even on a page too short to lift it up to the reading line.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) current = ids[ids.length - 1];
      setActiveSection(current);
    };
    const release = () => {
      lockRef.current = null;
    };

    // First pass runs after layout settles — deferred rather than synchronous so
    // it never cascades a render out of the effect body.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", release, { passive: true });
      window.removeEventListener("touchmove", release, { passive: true });
      window.removeEventListener("keydown", release);
    };
  }, []);

  const pushToast = (message, tone = "success", ttl = 4000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Live requirement checks for the new-password fields.
  const pwChecks = [
    { ok: pwForm.next.length >= 6, label: "At least 6 characters" },
    { ok: pwForm.next.length > 0 && pwForm.next === pwForm.confirm, label: "Both new fields match" },
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage("");
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage("New passwords don't match.");
      return;
    }
    if (pwForm.next.length < 6 || pwForm.next.length > 128) {
      setPwMessage("New password must be between 6 and 128 characters.");
      return;
    }
    if (pwForm.next === pwForm.current) {
      setPwMessage("New password must be different from your current password.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMessage(data.error || "Couldn't change your password. Try again.");
        return;
      }
      setPwForm({ current: "", next: "", confirm: "" });
      pushToast("Password changed. Other devices have been signed out.");
    } catch {
      setPwMessage("Couldn't change your password. Check your connection and retry.");
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) {
    return null;
  }

  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;

  /* ---------------------------- Daily goals ----------------------------- */

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

  const goalFields = [
    { field: "calories", label: "Calories", unit: "kcal", icon: "flame", dot: "var(--ac)" },
    { field: "protein", label: "Protein", unit: "g", icon: "drumstick", dot: "var(--pro)" },
    { field: "carbs", label: "Carbs", unit: "g", icon: "wheat", dot: "var(--car)" },
    { field: "fats", label: "Fats", unit: "g", icon: "avocado", dot: "var(--green)" },
  ];

  return (
    <>
      <style>{SETTINGS_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — SaaS title block, matching meal/gym */}
          <div className="m-in" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ac)", margin: "0 0 8px" }}>Workspace · Settings</p>
            <h1 className="m-h1" style={{ margin: 0 }}>Settings</h1>
            <div className="m-sub">Daily goals, appearance, account, and session.</div>
          </div>

          <div className="stg-layout">
            {/* Section rail — the page's own map, sticky while you read. */}
            <nav className="stg-rail" aria-label="Settings sections">
              <p className="stg-rail-lbl">On this page</p>
              <ul className="stg-rail-list">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => pickSection(s.id)}
                      className={"stg-rail-link" + (activeSection === s.id ? " on" : "")}
                      aria-current={activeSection === s.id ? "true" : undefined}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="stg-body">
              {/* Daily goals */}
              <section id="stg-goals" className="stg-sec" aria-labelledby="stg-goals-h">
                <div className="stg-sec-h">
                  <div>
                    <h2 id="stg-goals-h">Daily goals</h2>
                    <p className="stg-sec-sub">The targets every meter measures against — on Today, Meal, and Progress.</p>
                  </div>
                  <div className="stg-sec-acts">
                    {editingGoals ? (
                      <>
                        <button type="button" onClick={cancelEditGoals} disabled={savingGoals} className="m-btn stg-btn">
                          Cancel
                        </button>
                        <button type="button" onClick={handleSaveGoals} disabled={savingGoals} className="m-btn m-btn-primary">
                          <Icon d={ICONS.check} className="w-4 h-4" />
                          {savingGoals ? "Saving…" : "Save goals"}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={startEditGoals} className="m-btn stg-btn">
                        <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="stg-tiles">
                  {goalFields.map((item) => (
                    <div key={item.field} className={"stg-tile" + (editingGoals ? " editing" : "")}>
                      {editingGoals ? (
                        <label htmlFor={`goal-${item.field}`} className="stg-tile-k">
                          <Icon d={ICONS[item.icon]} className="m-ic" style={{ color: item.dot }} />
                          {item.label}
                        </label>
                      ) : (
                        <span className="stg-tile-k">
                          <Icon d={ICONS[item.icon]} className="m-ic" style={{ color: item.dot }} />
                          {item.label}
                        </span>
                      )}
                      {editingGoals ? (
                        <input
                          id={`goal-${item.field}`}
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          value={(goalForm || goals)[item.field] ?? ""}
                          onChange={(e) => handleGoalChange(item.field, e.target.value)}
                          className="stg-tile-in"
                        />
                      ) : (
                        <p className="stg-tile-v">
                          {Number(goals[item.field]).toLocaleString()}
                          <small>{item.unit}</small>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {goalsMessage ? (
                  <p className="stg-status err" role="alert">{goalsMessage}</p>
                ) : (
                  <p className="stg-status">
                    {editingGoals ? "Unsaved changes" : "All changes sync to your account"}
                  </p>
                )}
              </section>

              {/* Appearance */}
              <section id="stg-appearance" className="stg-sec" aria-labelledby="stg-appearance-h">
                <div className="stg-sec-h">
                  <div>
                    <h2 id="stg-appearance-h">Appearance</h2>
                    <p className="stg-sec-sub">How NutriGain looks on this device.</p>
                  </div>
                </div>
                <div className="stg-rows">
                  <div className="stg-row">
                    <div className="stg-row-t">
                      <p className="stg-row-k">Theme</p>
                      <p className="stg-row-d">Saved to your account and this device.</p>
                    </div>
                    <div className="stg-seg" role="radiogroup" aria-label="Color theme">
                      <button type="button" role="radio" aria-checked={theme === "light"} className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>
                        Light
                      </button>
                      <button type="button" role="radio" aria-checked={theme === "dark"} className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account */}
              <section id="stg-account" className="stg-sec" aria-labelledby="stg-account-h">
                <div className="stg-sec-h">
                  <div>
                    <h2 id="stg-account-h">Account</h2>
                    <p className="stg-sec-sub">The identity your logs and targets are stored against.</p>
                  </div>
                </div>
                <div className="stg-rows">
                  <div className="stg-row">
                    <div className="stg-row-t">
                      <p className="stg-row-k">Name</p>
                    </div>
                    <p className="stg-row-v">{user.name}</p>
                  </div>
                  <div className="stg-row">
                    <div className="stg-row-t">
                      <p className="stg-row-k">Email</p>
                    </div>
                    <p className="stg-row-v">{user.email}</p>
                  </div>
                </div>
              </section>

              {/* Password */}
              <section id="stg-password" className="stg-sec" aria-labelledby="stg-password-h">
                <div className="stg-sec-h">
                  <div>
                    <h2 id="stg-password-h">Password</h2>
                    <p className="stg-sec-sub">Changing it signs out every other device you are signed in on.</p>
                  </div>
                </div>
                <form onSubmit={handlePasswordChange} className="stg-form">
                  {[
                    { key: "current", label: "Current password", autoComplete: "current-password" },
                    { key: "next", label: "New password", autoComplete: "new-password" },
                    { key: "confirm", label: "Confirm new password", autoComplete: "new-password" },
                  ].map(({ key, label, autoComplete }) => (
                    <div key={key} style={{ display: "grid", gap: 4 }}>
                      <label htmlFor={`pw-${key}`} className="m-lbl">{label}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          id={`pw-${key}`}
                          type={pwShow[key] ? "text" : "password"}
                          autoComplete={autoComplete}
                          value={pwForm[key]}
                          onChange={(e) => setPwForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="m-field"
                          style={{ paddingRight: 40 }}
                          required
                          minLength={key === "current" ? undefined : 6}
                          maxLength={128}
                        />
                        <button
                          type="button"
                          onClick={() => setPwShow((prev) => ({ ...prev, [key]: !prev[key] }))}
                          aria-label={pwShow[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                          aria-pressed={pwShow[key]}
                          title={pwShow[key] ? "Hide password" : "Show password"}
                          className="stg-eye"
                        >
                          <Icon d={pwShow[key] ? ICONS.eyeOff : ICONS.eye} />
                        </button>
                      </div>
                      {key === "confirm" && pwMessage && (
                        <p className="stg-err" role="alert">{pwMessage}</p>
                      )}
                      {key === "next" && (
                        <ul className="stg-reqs">
                          {pwChecks.map(({ ok, label: checkLabel }) => (
                            <li key={checkLabel} style={{ color: ok ? "var(--green)" : "var(--t3)" }}>
                              <span style={{ display: "inline-flex", color: ok ? "var(--green)" : "var(--t3)" }}>
                                <Icon d={ok ? ICONS.check : ICONS.x} />
                              </span>
                              {checkLabel}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={savingPw}
                    className="m-btn m-btn-primary"
                    style={{ justifyContent: "center", marginTop: 4 }}
                  >
                    <Icon d={ICONS.check} className="w-4 h-4" />
                    {savingPw ? "Updating…" : "Update password"}
                  </button>
                </form>
              </section>

              {/* Session */}
              <section id="stg-session" className="stg-sec" aria-labelledby="stg-session-h">
                <div className="stg-sec-h">
                  <div>
                    <h2 id="stg-session-h">Session</h2>
                    <p className="stg-sec-sub">End this browser&apos;s session. Your logs stay on your account.</p>
                  </div>
                </div>
                <div className="stg-rows">
                  <div className="stg-row">
                    <div className="stg-row-t">
                      <p className="stg-row-k">Sign out</p>
                      <p className="stg-row-d">You will need your email and password to get back in.</p>
                    </div>
                    <button
                      id="settings-logout-btn"
                      type="button"
                      onClick={logout}
                      className="m-btn stg-btn-danger"
                    >
                      <Icon d={ICONS.logout} />
                      Sign out
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
