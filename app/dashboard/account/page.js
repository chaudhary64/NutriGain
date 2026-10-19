"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AppShell from "@/components/AppShell";
import SplitManager from "@/components/SplitManager";
import { suggestMacroGoals, ACTIVITY_LEVELS, GOALS } from "@/lib/tdee";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";

/* ------------------------------------------------------------------ */
/* Meridian design system — page-local rules only.                    */
/*                                                                    */
/* One account surface, one sticky section rail. Profile details,     */
/* training split, goals, appearance and security are sections of a   */
/* single page rather than two competing destinations.                */
/* ------------------------------------------------------------------ */

const ACCOUNT_CSS = `
/* Anchor jumps inside this page animate; scoped so no other surface
   inherits smooth scrolling from a dashboard. */
html:has(.acc-layout){scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html:has(.acc-layout){scroll-behavior:auto}}
/* Two-pane shell — same rail/column-rule convention as the gym page. */
.acc-layout{display:grid;grid-template-columns:min(216px,100%) minmax(0,1fr);gap:24px;align-items:start}
.acc-rail{position:sticky;top:24px;align-self:start}
.acc-rail-lbl{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.acc-rail-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.acc-rail-link{display:block;font-size:13px;font-weight:500;letter-spacing:-.01em;color:var(--t2);text-decoration:none;padding:7px 10px 7px 12px;border-left:2px solid transparent;border-radius:0 6px 6px 0;transition:color .15s,background .15s,border-color .15s}
.acc-rail-link:hover{color:var(--t1);background:var(--sunken)}
.acc-rail-link.on{color:var(--t1);font-weight:500;border-left-color:var(--t1);background:var(--sunken)}
.acc-rail-link:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.acc-body{min-width:0;max-width:860px}
/* Sections — hierarchy from type and spacing, not five borders. */
.acc-sec{padding-bottom:34px;scroll-margin-top:88px}
/* Legacy anchors from the old Settings page, kept so redirected deep links
   still land on the matching section. */
.acc-anchor{display:block;height:0;scroll-margin-top:88px}
.acc-sec+.acc-sec{border-top:1px solid var(--line);padding-top:34px}
.acc-sec:last-child{padding-bottom:8px}
.acc-sec-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.acc-sec-h h2{font-size:18px;font-weight:600;letter-spacing:-.02em;line-height:1.3;color:var(--t1);margin:0}
.acc-sec-sub{font-size:12.5px;font-weight:400;color:var(--t2);margin:5px 0 0;max-width:56ch;line-height:1.5}
.acc-sec-acts{display:flex;gap:8px;flex-shrink:0}
.acc-btn{border:1px solid var(--line);background:var(--card);color:var(--t1)}
.acc-btn:hover:not(:disabled){background:var(--sunken)}
.acc-btn-danger{border:1px solid var(--red-soft-b);background:var(--card);color:var(--red)}
.acc-btn-danger:hover{background:var(--red-soft)}
.acc-card-b{padding:18px}
/* Profile dossier — an identity plate on the left, the measured body on the
   right. One sheet, not two competing cards: the target is the output of the
   inputs beside it. */
.acc-dossier{display:grid;grid-template-columns:min(288px,100%) minmax(0,1fr);overflow:hidden}
.acc-dossier-id{display:flex;flex-direction:column;gap:16px;padding:22px;background:var(--card-2);border-right:1px solid var(--line)}
.acc-idline{display:flex;align-items:center;gap:13px;min-width:0}
.acc-avatar{width:54px;height:54px;border-radius:50%;background:var(--sunken);color:var(--t1);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;letter-spacing:-.02em;border:1px solid var(--line);flex-shrink:0}
.acc-name{font-size:16px;font-weight:600;letter-spacing:-.02em;color:var(--t1);margin:0;line-height:1.3;overflow-wrap:anywhere}
.acc-email{font-family:var(--font-mono);font-size:10.5px;font-weight:400;letter-spacing:-.01em;color:var(--t3);margin:10px 0 0;overflow-wrap:anywhere}
/* The target is the one number this plate owns. */
.acc-target{margin-top:auto;padding-top:18px;border-top:1px solid var(--line)}
.acc-target-k{display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.acc-target-v{display:flex;align-items:baseline;gap:7px;margin:6px 0 0;font-size:36px;font-weight:600;letter-spacing:-.045em;line-height:1;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-target-v small{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--t3)}
.acc-target-note{font-size:12px;font-weight:400;color:var(--t2);margin:7px 0 0;line-height:1.45}
.acc-target a{display:inline-block;margin-top:9px;font-size:12px;font-weight:500;color:var(--link);text-decoration:none}
.acc-target a:hover{text-decoration:underline}
.acc-dossier-b{display:flex;flex-direction:column;min-width:0}
.acc-dossier-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 22px;border-bottom:1px solid var(--line);min-height:52px}
.acc-eyebrow{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--t3)}
/* The body strip: five measurements sharing one rule, like a spec plate. */
.acc-facts{display:grid;grid-template-columns:.8fr .8fr .9fr 1.45fr .75fr;border-bottom:1px solid var(--line)}
.acc-fact{min-width:0;padding:15px 12px 17px 0}
.acc-fact+.acc-fact{border-left:1px solid var(--line);padding-left:14px}
.acc-fact-k{display:block;font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);white-space:nowrap}
.acc-fact-v{margin:6px 0 0;font-size:15.5px;font-weight:600;letter-spacing:-.02em;color:var(--t1);line-height:1.3}
.acc-fact-v.none{color:var(--t3);font-weight:500}
.acc-weight{padding:17px 22px 22px;display:flex;flex-direction:column;gap:13px;flex:1}
.acc-weight-h{display:flex;align-items:center;justify-content:space-between;gap:12px}
.acc-weight-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;max-width:520px}
.acc-weight-v{display:flex;align-items:baseline;gap:6px;margin:6px 0 0;font-size:26px;font-weight:600;letter-spacing:-.035em;line-height:1.05;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-weight-v small{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3)}
.acc-weight-v.empty{color:var(--t3)}
.acc-weight-note{font-size:12px;font-weight:400;color:var(--t3);margin:4px 0 0;line-height:1.45}
.acc-weight-hint{font-size:12px;font-weight:400;color:var(--t2);margin:0;max-width:56ch;line-height:1.5}
.acc-weight-err{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;font-weight:400;color:var(--red);margin:0}
.acc-weight-err button{border:0;background:none;padding:0;color:var(--red);font:inherit;font-weight:500;text-decoration:underline;cursor:pointer}
/* Body form — two columns on desktop, stacked on phones. */
.acc-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.acc-form-grid .acc-field-wide{grid-column:1/-1}
.acc-dossier-b .acc-card-b{padding:22px}
/* TDEE suggestion strip (mirrors the onboarding result) */
.acc-suggest{display:flex;flex-wrap:wrap;align-items:center;gap:10px 26px;background:var(--sunken);border:1px solid var(--line);border-radius:12px;padding:14px 18px}
.acc-suggest-stat b{display:block;font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--t1);font-variant-numeric:tabular-nums}
.acc-suggest-stat span{display:block;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:2px}
.acc-suggest-note{width:100%;font-size:12px;font-weight:400;color:var(--t3);margin:2px 0 0;line-height:1.5}
/* Goal tiles — sunken while reading, lift to a card + accent while editing. */
.acc-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.acc-tile{background:var(--sunken);border:1px solid var(--line);border-radius:12px;padding:12px 14px;transition:border-color .15s,background .15s}
.acc-tile.editing{background:var(--card);border-color:var(--t1)}
.acc-tile-k{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0}
.acc-tile-v{margin:6px 0 0;font-size:22px;font-weight:600;letter-spacing:-.03em;color:var(--t1);font-variant-numeric:tabular-nums;line-height:1.15}
.acc-tile-v small{font-size:12px;font-weight:400;color:var(--t3);letter-spacing:0;margin-left:3px}
.acc-tile-in{width:100%;margin-top:6px;padding:0;border:0;outline:none;background:transparent;font:inherit;font-size:22px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums;color:var(--t1)}
.acc-tile-in:focus-visible{outline:2px solid var(--link);outline-offset:3px;border-radius:6px}
.acc-status{font-size:12.5px;font-weight:400;color:var(--t3);margin:14px 0 0}
.acc-status.err{color:var(--red)}
/* Setting rows — label + description left, control or value right. */
.acc-rows{display:grid}
.acc-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 0;border-top:1px solid var(--line)}
.acc-row:first-child{border-top:0;padding-top:0}
.acc-row-t{min-width:0}
.acc-row-k{font-size:13px;font-weight:500;letter-spacing:-.01em;color:var(--t1)}
.acc-row-d{font-size:12.5px;font-weight:400;color:var(--t2);margin:3px 0 0;max-width:52ch}
.acc-row-v{font-size:13px;font-weight:500;color:var(--t1);text-align:right;word-break:break-all;font-variant-numeric:tabular-nums}
/* Theme segmented control */
.acc-seg{display:inline-flex;gap:2px;background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:3px;flex-shrink:0}
.acc-seg button{border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:500;color:var(--t2);padding:6px 14px;border-radius:6px;cursor:pointer;transition:background .15s,color .15s}
.acc-seg button:hover{color:var(--t1)}
.acc-seg button.on{background:var(--card);color:var(--t1);box-shadow:0 1px 1px rgba(0,0,0,.04)}
.acc-seg button:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* Security — password work on the left, the live session on the right. */
.acc-sub{font-size:14px;font-weight:600;letter-spacing:-.01em;color:var(--t1);margin:0}
.acc-sub-d{font-size:12.5px;font-weight:400;color:var(--t2);margin:4px 0 0;max-width:56ch;line-height:1.5}
.acc-security{display:grid;grid-template-columns:minmax(0,1fr) min(264px,100%);overflow:hidden}
.acc-pw{padding:22px;min-width:0}
.acc-pw-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px;margin-top:16px}
.acc-pw-full{grid-column:1/-1}
.acc-pw-field{display:grid;gap:4px;min-width:0}
.acc-pw-field .m-field{width:100%}
.acc-pw-field .m-lbl{margin:0}
.acc-pw-checks{list-style:none;margin:13px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:7px 20px}
.acc-pw-checks li{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:400;color:var(--t3)}
.acc-pw-checks li.ok{color:var(--green)}
.acc-pw-checks .m-ic{width:12px;height:12px;flex-shrink:0}
.acc-pw-actions{display:flex;justify-content:flex-end;margin-top:16px}
.acc-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);height:28px;width:28px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--t3);cursor:pointer;padding:0;border-radius:6px}
.acc-eye:hover{color:var(--t1);background:var(--sunken)}
.acc-err{margin:10px 0 0;font-size:13px;font-weight:400;color:var(--red)}
/* The session plate mirrors the identity plate in the dossier above. */
.acc-session{display:flex;flex-direction:column;gap:11px;padding:22px;background:var(--card-2);border-left:1px solid var(--line)}
.acc-session-dev{margin:0;font-size:16px;font-weight:600;letter-spacing:-.02em;color:var(--t1)}
.acc-session-state{display:flex;align-items:center;gap:6px;margin:0;font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3)}
.acc-session-state i{width:6px;height:6px;border-radius:50%;background:var(--t1);display:inline-block}
.acc-session-note{margin:2px 0 0;font-size:12px;font-weight:400;color:var(--t2);line-height:1.5}
.acc-session .m-btn{margin-top:auto;width:100%;justify-content:center}
.acc-session-fine{margin:0;font-size:11.5px;font-weight:400;color:var(--t3);line-height:1.45}
/* Mobile — the rail becomes a chip row above the body. */
@media (max-width:1024px){
  .acc-layout{grid-template-columns:minmax(0,1fr)}
  .acc-rail{position:static;border-bottom:1px solid var(--line);padding-bottom:16px}
  .acc-rail-list{display:flex;flex-wrap:wrap;gap:8px}
  .acc-rail-link{border:1px solid var(--line);border-left:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--card)}
  .acc-rail-link.on{border-color:var(--t1)}
  .acc-sec{scroll-margin-top:76px}
  .acc-dossier{grid-template-columns:minmax(0,1fr)}
  .acc-dossier-id{border-right:0;border-bottom:1px solid var(--line)}
  .acc-target{margin-top:0}
}
@media (min-width:1025px){
  .acc-layout{column-gap:36px}
  .acc-rail{border-right:1px solid var(--line);padding-right:32px}
}
@media (max-width:1024px){
  .acc-security{grid-template-columns:minmax(0,1fr)}
  .acc-session{border-left:0;border-top:1px solid var(--line)}
  .acc-session .m-btn{margin-top:4px}
}
@media (max-width:760px){
  .acc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .acc-fact{padding:12px 0}
  .acc-fact+.acc-fact{border-left:0;padding-left:0}
  .acc-fact:nth-child(even){border-left:1px solid var(--line);padding-left:14px}
  .acc-fact:nth-child(n+3){border-top:1px solid var(--line)}
  .acc-fact:nth-child(5){grid-column:1/-1;border-left:0;padding-left:0}
  .acc-dossier-h,.acc-weight{padding-left:18px;padding-right:18px}
  .acc-dossier-b .acc-card-b{padding:18px}
  .acc-form-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  .acc-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}
  .acc-sec-h{flex-direction:column;align-items:stretch}
  .acc-row{flex-wrap:wrap}
  .acc-pw,.acc-session{padding:18px}
  .acc-pw-grid{grid-template-columns:1fr}
  .acc-pw-full{grid-column:auto}
  .acc-pw-actions .m-btn{width:100%;justify-content:center}
}
`;

/* The reading line, in viewport px: a section counts as current once its heading
   has crossed it. Near the top rather than mid-viewport, so the first section is
   current when the page opens and the highlight follows the eye down the page.
   It also clears the sticky mobile bar and the rail's own top. */
const READ_LINE = 132;
/* Where a rail jump parks a section heading — the same offset the CSS
   scroll-margin uses, so clicks and redirected deep links land identically. */
const SCROLL_OFFSET = 88;

/* One source of truth for the rail, the scroll-spy, and the section ids. */
const SECTIONS = [
  { id: "acc-profile", label: "Profile" },
  { id: "acc-training", label: "Training split" },
  { id: "acc-goals", label: "Daily goals" },
  { id: "acc-appearance", label: "Appearance" },
  { id: "acc-security", label: "Security" },
];

const ACTIVITY_LABEL = Object.fromEntries(ACTIVITY_LEVELS.map((l) => [l.value, l.label]));
const GOAL_LABEL = Object.fromEntries(GOALS.map((g) => [g.value, g.label]));
const SEX_LABEL = { male: "Male", female: "Female", other: "Other / prefer not to say" };

const Icon = ({ d, className = "m-ic", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  logout: <><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  pencil: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="m2 2 20 20" /></>,
  scale: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>,
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

export default function AccountPage() {
  const { user, logout, checkAuth } = useAuth();
  const { theme, setTheme } = useTheme();

  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const lockRef = useRef(null);

  /* ------------------------- Body profile ------------------------- */
  const [profileForm, setProfileForm] = useState(null); // null = display mode
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [weightInfo, setWeightInfo] = useState({ entries: [], targetWeight: 75 });
  const [weightTick, setWeightTick] = useState(0);
  const [weightError, setWeightError] = useState("");

  /* --------------------------- Goals ------------------------------ */
  const [goalForm, setGoalForm] = useState(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState("");

  /* -------------------------- Password ---------------------------- */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

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

  // A rail click takes responsibility for the highlight, then shows the section
  // the reader asked for — even on a page too short to scroll a section up to
  // the reading line. The reader's own scrolling hands control back to the spy.
  // The scroll is explicit rather than left to the browser's fragment jump:
  // the hash update and the motion stay in sync, and the target is clamped so
  // the last section still lands as far up as the page can scroll.
  const pickSection = (id) => {
    lockRef.current = id;
    setActiveSection(id);
  };

  const jumpToSection = (event, id) => {
    const el = document.getElementById(id);
    if (!el) return; // let the browser handle a fragment this page does not own
    event.preventDefault();
    pickSection(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The first section sits under the page title, so its jump goes to the very
    // top of the page rather than cutting the title block in half.
    const isFirst = id === SECTIONS[0].id;
    window.scrollTo({
      top: isFirst
        ? 0
        : Math.max(
            0,
            Math.min(
              el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
              document.documentElement.scrollHeight - window.innerHeight
            )
          ),
      behavior: reduceMotion ? "auto" : "smooth",
    });
    history.pushState(null, "", `#${id}`);
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

  // Deep links that arrive with a hash (the old /dashboard/settings#anchors are
  // redirected here) race hydration, so honour the fragment once mounted.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(raf);
  }, []);

  // Live suggestion from the *saved* body profile. This is the only place the
  // account offers suggested targets; applying it fills the goals editor, and
  // the goals save is the single writer of macroGoals.
  const savedSuggestion = useMemo(() => {
    const p = user?.profile;
    if (!p) return null;
    const entries = weightInfo.entries;
    const latest = entries.length > 0 ? entries[entries.length - 1] : null;
    return suggestMacroGoals({
      sex: p.sex,
      weightKg: latest?.weight,
      heightCm: p.heightCm,
      age: p.age,
      activityLevel: p.activityLevel,
      goal: p.goal,
    });
  }, [user?.profile, weightInfo.entries]);

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

  const getLatestEntry = () => {
    const entries = weightInfo.entries;
    return entries.length > 0 ? entries[entries.length - 1] : null;
  };

  if (!user) {
    return null;
  }

  const goals = user.macroGoals || FALLBACK_MACRO_GOALS;
  const latestEntry = getLatestEntry();
  const profile = user.profile || null;

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

  const suggestionMatchesGoals =
    savedSuggestion &&
    ["calories", "protein", "carbs", "fats"].every(
      (key) => Number(goals[key]) === Number(savedSuggestion[key])
    );

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
    setProfileMessage("");
  };

  // "Log weight" is the empty state's action, so it opens the same body form
  // with the reading field already in hand rather than making the reader hunt
  // for it in a generic Edit.
  const startEditWeight = () => {
    startEditProfile();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById("prf-weight");
        el?.focus();
        el?.select?.();
      })
    );
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
        // Sending the current goals keeps the server from applying its
        // suggestion behind the user's back — Daily goals is the only writer.
        macroGoals: goals,
      };

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
        pushToast("Profile saved — your daily goals were left unchanged.");
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

  /* --------------------------- Daily goals ------------------------------ */

  const goalFields = [
    { field: "calories", label: "Calories", unit: "kcal", icon: "flame", dot: "var(--ac)" },
    { field: "protein", label: "Protein", unit: "g", icon: "drumstick", dot: "var(--pro)" },
    { field: "carbs", label: "Carbs", unit: "g", icon: "wheat", dot: "var(--car)" },
    { field: "fats", label: "Fats", unit: "g", icon: "avocado", dot: "var(--green)" },
  ];

  const handleGoalChange = (field, value) => {
    setGoalForm((prev) => ({ ...(prev || goals), [field]: value }));
  };

  const startEditGoals = () => {
    setGoalForm(goals);
    setGoalsMessage("");
    setEditingGoals(true);
  };

  const cancelEditGoals = () => {
    setGoalForm(null);
    setGoalsMessage("");
    setEditingGoals(false);
  };

  const applySuggestion = () => {
    if (!savedSuggestion) return;
    setGoalForm({
      calories: savedSuggestion.calories,
      protein: savedSuggestion.protein,
      carbs: savedSuggestion.carbs,
      fats: savedSuggestion.fats,
    });
    setGoalsMessage("");
    setEditingGoals(true);
    requestAnimationFrame(() => document.getElementById("goal-calories")?.focus());
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

  /* --------------------------- Password ------------------------------ */

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

  return (
    <>
      <style>{ACCOUNT_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — same title block as the rest of the app */}
          <div className="m-in" style={{ marginBottom: 28 }}>
            <p className="g-eyebrow" style={{ margin: "0 0 8px" }}>Account · Profile &amp; settings</p>
            <h1 className="m-h1" style={{ margin: 0 }}>Account</h1>
            <div className="m-sub">Your identity, training split, goals, and security in one place.</div>
          </div>

          <div className="acc-layout">
            {/* Section rail — the page's own map, sticky while you read. */}
            <nav className="acc-rail" aria-label="Account sections">
              <p className="acc-rail-lbl">On this page</p>
              <ul className="acc-rail-list">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => jumpToSection(e, s.id)}
                      className={"acc-rail-link" + (activeSection === s.id ? " on" : "")}
                      aria-current={activeSection === s.id ? "true" : undefined}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="acc-body">
              {/* Profile */}
              <section id="acc-profile" className="acc-sec" aria-labelledby="acc-profile-h">
                <span id="stg-account" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-profile-h">Profile</h2>
                    <p className="acc-sec-sub">The measurements your daily targets are calculated from.</p>
                  </div>
                </div>

                <div className="m-card acc-dossier">
                  {/* Identity plate */}
                  <aside className="acc-dossier-id">
                    <div className="acc-idline">
                      <div className="acc-avatar" aria-hidden="true">{initials}</div>
                      <p className="acc-name">{user.name}</p>
                    </div>
                    <p className="acc-email">{user.email}</p>

                    <div className="acc-target">
                      <span className="acc-target-k">Daily calorie goal</span>
                      <p className="acc-target-v">
                        {Number(goals.calories).toLocaleString()}
                        <small>kcal / day</small>
                      </p>
                      <p className="acc-target-note">
                        {profile?.goal && profile?.activityLevel
                          ? `${GOAL_LABEL[profile.goal]} plan · ${ACTIVITY_LABEL[profile.activityLevel].toLowerCase()}`
                          : "Add your body details to calibrate this target"}
                      </p>
                      <a href="#acc-goals" onClick={(e) => jumpToSection(e, "acc-goals")}>Edit in Daily goals →</a>
                    </div>
                  </aside>

                  <div className="acc-dossier-b">
                    <div className="acc-dossier-h">
                      <span className="acc-eyebrow">Body details</span>
                      {profileForm ? (
                        <span className="m-chip">Editing</span>
                      ) : (
                        <button
                          onClick={startEditProfile}
                          className="m-btn m-btn-ghost"
                          style={{ padding: "5px 10px", fontSize: 12, gap: 6 }}
                        >
                          <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="acc-card-b">
                      {profileForm ? (
                        <>
                          <div className="acc-form-grid">
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
                              <label htmlFor="prf-goal" className="m-lbl">Goal</label>
                              <select id="prf-goal" className="m-field" style={{ width: "100%" }} value={profileForm.goal} onChange={(e) => setProfileField("goal")(e.target.value)}>
                                <option value="">Select…</option>
                                {GOALS.map((goal) => (
                                  <option key={goal.value} value={goal.value}>{goal.label} — {goal.hint}</option>
                                ))}
                              </select>
                            </div>
                            <div className="acc-field-wide">
                              <label htmlFor="prf-activity" className="m-lbl">Activity level</label>
                              <select id="prf-activity" className="m-field" style={{ width: "100%" }} value={profileForm.activityLevel} onChange={(e) => setProfileField("activityLevel")(e.target.value)}>
                                <option value="">Select…</option>
                                {ACTIVITY_LEVELS.map((level) => (
                                  <option key={level.value} value={level.value}>{level.label} — {level.hint}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {profileSuggestion && (
                            <div className="acc-suggest" style={{ marginTop: 14 }} aria-live="polite">
                              <div className="acc-suggest-stat"><b>{profileSuggestion.calories.toLocaleString()}</b><span>kcal / day</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.protein} g</b><span>protein</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.carbs} g</b><span>carbs</span></div>
                              <div className="acc-suggest-stat"><b>{profileSuggestion.fats} g</b><span>fats</span></div>
                              <p className="acc-suggest-note">
                                Suggested from Mifflin-St Jeor (BMR {profileSuggestion.bmr.toLocaleString()} kcal · TDEE{" "}
                                {profileSuggestion.tdee.toLocaleString()} kcal). Saving your body profile keeps your current
                                goals; apply this suggestion from Daily goals.
                              </p>
                            </div>
                          )}

                          {profileMessage && (
                            <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "var(--red)" }}>{profileMessage}</p>
                          )}

                          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
                            <button onClick={cancelEditProfile} disabled={savingProfile} className="m-btn m-btn-ghost">
                              Cancel
                            </button>
                            <button onClick={handleSaveProfile} disabled={savingProfile || !profileReady} className="m-btn m-btn-primary" title={!profileReady ? "Fill in all fields (weight included) to save" : undefined}>
                              <Icon d={ICONS.check} className="w-4 h-4" />
                              {savingProfile ? "Saving…" : "Save profile"}
                            </button>
                          </div>
                          {!profileReady && (
                            <p className="m-crumb" style={{ marginTop: 10 }}>
                              Complete every field — including current weight — to save. Weight also seeds today&apos;s
                              entry on the Progress weight chart.
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Five body inputs on one measured strip. */}
                          <div className="acc-facts">
                            {profileTiles.map((tile) => (
                              <div key={tile.label} className="acc-fact">
                                <span className="acc-fact-k">{tile.label}</span>
                                <p className={"acc-fact-v" + (tile.value ? "" : " none")}>
                                  {tile.value || "Not set"}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="acc-weight">
                            <div className="acc-weight-h">
                              <span className="acc-eyebrow">Weight</span>
                              <button
                                type="button"
                                onClick={startEditWeight}
                                className="m-btn m-btn-ghost"
                                style={{ padding: "5px 10px", fontSize: 12, gap: 6 }}
                              >
                                <Icon d={ICONS.scale} className="w-3.5 h-3.5" />
                                Log weight
                              </button>
                            </div>

                            <div className="acc-weight-grid">
                              <div>
                                <span className="acc-fact-k">Current</span>
                                {latestEntry ? (
                                  <>
                                    <p className="acc-weight-v">{latestEntry.weight}<small>kg</small></p>
                                    <p className="acc-weight-note">
                                      Logged {new Date(latestEntry.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="acc-weight-v empty">—<small>kg</small></p>
                                    <p className="acc-weight-note">{weightError ? "Couldn't load history" : "No weigh-ins yet"}</p>
                                  </>
                                )}
                              </div>
                              <div>
                                <span className="acc-fact-k">Target</span>
                                <p className="acc-weight-v">{weightInfo.targetWeight}<small>kg</small></p>
                                <p className="acc-weight-note">Shown on the Progress chart</p>
                              </div>
                            </div>

                            {weightError ? (
                              <p className="acc-weight-err" role="alert">
                                Weight data unavailable — {weightError}.{" "}
                                <button type="button" onClick={() => setWeightTick((n) => n + 1)}>Try again</button>
                              </p>
                            ) : !latestEntry ? (
                              <p className="acc-weight-hint">
                                Saving your body profile also records today&apos;s weight. Log it now to start the chart.
                              </p>
                            ) : null}

                            {!profile && (
                              <p className="acc-weight-hint">
                                You skipped setup — add your body details to unlock TDEE-based goal suggestions.
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Training split — the manager's own card header is the section
                  heading, so this doesn't repeat the title twice. */}
              <section id="acc-training" className="acc-sec" aria-label="Training split">
                <SplitManager pushToast={pushToast} />
              </section>

              {/* Daily goals */}
              <section id="acc-goals" className="acc-sec" aria-labelledby="acc-goals-h">
                <span id="stg-goals" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-goals-h">Daily goals</h2>
                    <p className="acc-sec-sub">The targets every meter measures against — on Today, Meal, and Progress.</p>
                  </div>
                  <div className="acc-sec-acts">
                    {editingGoals ? (
                      <>
                        <button type="button" onClick={cancelEditGoals} disabled={savingGoals} className="m-btn acc-btn">
                          Cancel
                        </button>
                        <button type="button" onClick={handleSaveGoals} disabled={savingGoals} className="m-btn m-btn-primary">
                          <Icon d={ICONS.check} className="w-4 h-4" />
                          {savingGoals ? "Saving…" : "Save goals"}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={startEditGoals} className="m-btn acc-btn">
                        <Icon d={ICONS.pencil} className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {savedSuggestion && !suggestionMatchesGoals && !editingGoals && (
                  <div className="acc-suggest" style={{ marginBottom: 16 }}>
                    <div className="acc-suggest-stat">
                      <b>{savedSuggestion.calories.toLocaleString()} kcal</b>
                      <span>Suggested from your body profile</span>
                    </div>
                    <div className="acc-suggest-stat"><b>{savedSuggestion.protein} g</b><span>protein</span></div>
                    <div className="acc-suggest-stat"><b>{savedSuggestion.carbs} g</b><span>carbs</span></div>
                    <div className="acc-suggest-stat"><b>{savedSuggestion.fats} g</b><span>fats</span></div>
                    <button type="button" onClick={applySuggestion} className="m-btn acc-btn" style={{ marginLeft: "auto" }}>
                      Review suggestion
                    </button>
                  </div>
                )}

                <div className="acc-tiles">
                  {goalFields.map((item) => (
                    <div key={item.field} className={"acc-tile" + (editingGoals ? " editing" : "")}>
                      {editingGoals ? (
                        <label htmlFor={`goal-${item.field}`} className="acc-tile-k">
                          <Icon d={ICONS[item.icon]} className="m-ic" style={{ color: item.dot }} />
                          {item.label}
                        </label>
                      ) : (
                        <span className="acc-tile-k">
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
                          className="acc-tile-in"
                        />
                      ) : (
                        <p className="acc-tile-v">
                          {Number(goals[item.field]).toLocaleString()}
                          <small>{item.unit}</small>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {goalsMessage ? (
                  <p className="acc-status err" role="alert">{goalsMessage}</p>
                ) : (
                  <p className="acc-status">
                    {editingGoals ? "Unsaved changes" : "All changes sync to your account"}
                  </p>
                )}
              </section>

              {/* Appearance */}
              <section id="acc-appearance" className="acc-sec" aria-labelledby="acc-appearance-h">
                <span id="stg-appearance" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-appearance-h">Appearance</h2>
                    <p className="acc-sec-sub">How NutriGain looks on this device.</p>
                  </div>
                </div>
                <div className="acc-rows">
                  <div className="acc-row">
                    <div className="acc-row-t">
                      <p className="acc-row-k">Theme</p>
                      <p className="acc-row-d">Saved to your account and this device.</p>
                    </div>
                    <div className="acc-seg" role="radiogroup" aria-label="Color theme">
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

              {/* Security */}
              <section id="acc-security" className="acc-sec" aria-labelledby="acc-security-h">
                <span id="stg-password" className="acc-anchor" aria-hidden="true" />
                <div className="acc-sec-h">
                  <div>
                    <h2 id="acc-security-h">Security</h2>
                    <p className="acc-sec-sub">Password and session for this account.</p>
                  </div>
                </div>

                <div className="m-card acc-security">
                  <div className="acc-pw">
                    <h3 className="acc-sub">Password</h3>
                    <p className="acc-sub-d">Changing it signs out every other device you are signed in on.</p>

                    <form onSubmit={handlePasswordChange}>
                      <div className="acc-pw-grid">
                        {[
                          { key: "current", label: "Current password", autoComplete: "current-password", full: true },
                          { key: "next", label: "New password", autoComplete: "new-password" },
                          { key: "confirm", label: "Confirm new password", autoComplete: "new-password" },
                        ].map(({ key, label, autoComplete, full }) => (
                          <div key={key} className={"acc-pw-field" + (full ? " acc-pw-full" : "")}>
                            <label htmlFor={`pw-${key}`} className="m-lbl">{label}</label>
                            <div style={{ position: "relative" }}>
                              <input
                                id={`pw-${key}`}
                                type={pwShow[key] ? "text" : "password"}
                                autoComplete={autoComplete}
                                value={pwForm[key]}
                                onChange={(e) => setPwForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                aria-describedby={key === "current" ? undefined : "pw-reqs"}
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
                                className="acc-eye"
                              >
                                <Icon d={pwShow[key] ? ICONS.eyeOff : ICONS.eye} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <ul id="pw-reqs" className="acc-pw-checks" aria-live="polite">
                        {pwChecks.map(({ ok, label: checkLabel }) => (
                          <li key={checkLabel} className={ok ? "ok" : ""}>
                            <Icon d={ok ? ICONS.check : ICONS.x} />
                            {checkLabel}
                          </li>
                        ))}
                      </ul>

                      {pwMessage && <p className="acc-err" role="alert">{pwMessage}</p>}

                      <div className="acc-pw-actions">
                        <button type="submit" disabled={savingPw} className="m-btn m-btn-primary">
                          <Icon d={ICONS.check} className="w-4 h-4" />
                          {savingPw ? "Updating…" : "Update password"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <aside className="acc-session" aria-labelledby="acc-session-h">
                    <span id="stg-session" className="acc-anchor" aria-hidden="true" />
                    <h3 id="acc-session-h" className="acc-sub">Session</h3>
                    <p className="acc-session-dev">This browser</p>
                    <p className="acc-session-state"><i aria-hidden="true" /> Signed in</p>
                    <p className="acc-session-note">
                      Signing out ends this browser&apos;s session. Your meals, workouts, and goals stay on your
                      account.
                    </p>
                    <button id="account-logout-btn" type="button" onClick={logout} className="m-btn acc-btn-danger">
                      <Icon d={ICONS.logout} />
                      Sign out
                    </button>
                    <p className="acc-session-fine">You&apos;ll need your email and password to sign back in.</p>
                  </aside>
                </div>
              </section>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
