"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format, isToday } from "date-fns";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";

/* ------------------------------------------------------------------ */
/* Meridian design system — restrained SaaS.                          */
/* Paper #fafaf9 · cards #fff · hairline #e7e7e3 · accent #4f46e5     */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.mrd{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--track:#efefec;--name:#3a3a42;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--green:#047857;--green-soft:#ecfdf5;--red-soft:#fef2f2;--red-soft-b:#fecaca;--pro:#7c3aed;--pro-soft:#f5f3ff;--car:#b45309;--car-soft:#fffbeb;color:var(--t1)}
html[data-theme="dark"] .mrd{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--track:#2e2e34;--name:#d4d4da;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--green:#34d399;--green-soft:#0d2a22;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--pro:#a78bfa;--pro-soft:#2b2140;--car:#fbbf24;--car-soft:#3a2d10}
.mrd{background:var(--paper)}
.mrd .m-card{background:var(--card);border:1px solid var(--line);border-radius:12px}
.mrd .m-card-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)}
.mrd .m-card-h h3{font-size:13px;font-weight:700;color:var(--t1)}
.mrd .m-h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.mrd .m-sub{color:var(--t3);font-size:13px;margin-top:4px}
.mrd .m-crumb{font-size:12px;color:var(--t3)}
.mrd .m-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px}
.mrd .m-chip-ac{background:var(--ac-soft);color:var(--ac)}
.mrd .m-chip-p{background:var(--pro-soft);color:var(--pro)}
.mrd .m-chip-c{background:var(--car-soft);color:var(--car)}
.mrd .m-chip-f{background:var(--green-soft);color:var(--green)}
.mrd .m-num{font-variant-numeric:tabular-nums}
.mrd .m-iconbtn{color:var(--t3);padding:9px;border-radius:7px;cursor:pointer;transition:.15s}
.mrd .m-iconbtn:hover{background:var(--sunken);color:var(--red)}
/* meters */
.mrd .m-meter{padding:14px 18px;border-bottom:1px solid var(--line)}
.mrd .m-meter:last-child{border-bottom:0}
.mrd .m-meter-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px}
.mrd .m-meter-name{font-weight:600;display:flex;gap:8px;align-items:center;color:var(--name)}
.mrd .m-meter-val{font-weight:600}
.mrd .m-meter-goal{color:var(--t3);font-weight:500}
.mrd .m-bar{height:6px;border-radius:999px;overflow:hidden;position:relative;background:var(--track)}
.mrd .m-bar i{display:block;height:100%;width:100%;transform-origin:left center;border-radius:999px;transition:transform .7s cubic-bezier(.22,1,.36,1)}
.mrd .i-cal{color:var(--ac)}.mrd .i-pro{color:var(--pro)}.mrd .i-car{color:var(--car)}.mrd .i-fat{color:var(--green)}
/* The <i> element itself carries the bar class; over-limit bars turn red. */
.mrd .b-cal{background:var(--ac)}.mrd .b-pro{background:var(--pro)}.mrd .b-car{background:var(--car)}.mrd .b-fat{background:var(--green)}
.mrd .m-bar i.m-overbar{background:var(--red)!important}
.mrd .m-over{color:var(--red)!important}
/* banner */
/* entries */
.mrd .m-entry{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--line);font-size:13px;flex-wrap:wrap}
.mrd .m-entry:last-child{border-bottom:0}
.mrd .m-entry:hover{background:var(--paper)}
.mrd .m-entry .m-name{font-weight:600;flex:1;min-width:150px}
.mrd .m-entry .m-serving{display:block;font-size:11px;color:var(--t3);font-weight:500;margin-top:2px}
.mrd .m-chiprow{display:flex;gap:6px}
.mrd .m-kc{min-width:64px;text-align:right;font-weight:600}
/* steppers */
.mrd .m-step{display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:8px;padding:2px}
.mrd .m-step button{width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--t2);cursor:pointer;transition:.15s;background:none;border:0;font-size:14px}
.mrd .m-step button:hover{background:var(--sunken);color:var(--t1)}
.mrd .m-step input{width:36px;text-align:center;font-size:13px;font-weight:600;color:var(--t1);background:none;border:0;outline:none}
/* fields */
.mrd .m-field{border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--t2);background:var(--card);display:flex;align-items:center;gap:8px;transition:.15s}
.mrd .m-field:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px #4f46e51f}
.mrd select.m-field,.mrd input.m-field{width:100%;outline:none;color:var(--t1);font-weight:500;appearance:none}
.mrd input.m-field::placeholder{color:var(--t3)}
.mrd .m-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13px;border-radius:8px;padding:10px 16px;cursor:pointer;border:1px solid transparent;transition:.15s}
.mrd .m-btn-primary{background:var(--ac);color:var(--on-ac)}
.mrd .m-btn-primary:hover{background:var(--ach)}
.mrd .m-btn-primary:disabled{opacity:.6;cursor:wait}
/* dropdown */
.mrd .m-dd{position:absolute;z-index:var(--pop-z-dropdown, 70);width:100%;margin-top:6px;background:color-mix(in srgb, var(--card) 88%, transparent);-webkit-backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));border:1px solid var(--line);border-radius:10px;box-shadow:0 16px 40px -12px rgba(0,0,0,.45);max-height:240px;overflow:auto}
.mrd .m-dd-item{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--line)}
.mrd .m-dd-item:last-child{border-bottom:0}
.mrd .m-dd-item:hover{background:var(--paper)}
.mrd .m-dd-item .m-dd-name{font-weight:600;color:var(--t1)}
.mrd .m-dd-empty{padding:26px;text-align:center;color:var(--t3);font-size:13px}
/* remaining */
.mrd .m-rem-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0}
.mrd .m-rem-row span{color:var(--t2)}
/* toasts */
.mrd-toast{position:fixed;bottom:24px;right:24px;z-index:var(--pop-z-toast, 80);display:flex;flex-direction:column;gap:10px;width:calc(100% - 48px);max-width:380px}
.mrd-toast-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:color-mix(in srgb, var(--card) 88%, transparent);-webkit-backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));box-shadow:0 16px 40px -12px rgba(0,0,0,.5)}
.mrd-toast-item.err{background:color-mix(in srgb, var(--red-soft) 88%, transparent);border-color:var(--red-soft-b)}
.mrd-toast-item p{font-size:13px;color:var(--t1);flex:1;line-height:1.45}
.mrd-toast-item.err p{color:#991b1b}
.mrd-toast-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex-shrink:0}
.mrd-toast-item.err .mrd-toast-dot{background:var(--red)}
.mrd-toast-act{flex-shrink:0;background:var(--ac);color:var(--on-ac);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border:0;border-radius:7px;padding:7px 12px;cursor:pointer}
.mrd-toast-act:hover{background:var(--ach)}
.mrd-toast-x{flex-shrink:0;position:relative;color:var(--t3);background:none;border:0;cursor:pointer;padding:4px;border-radius:6px}
.mrd-toast-x::after{content:"";position:absolute;inset:-6px}
.mrd-toast-x:hover{color:var(--t1);background:var(--sunken)}
/* svg icon default */
.mrd .m-ic{width:16px;height:16px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
/* date pill (nav slot) */
.mrd .m-datepill{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:8px;padding:7px 11px;font-size:12px;font-weight:600;color:var(--t2);background:var(--card)}
.mrd .m-datepill .m-live{display:flex;align-items:center;gap:6px;color:var(--ac);text-transform:uppercase;letter-spacing:.05em;font-size:11px;font-weight:700}
.mrd .m-datepill .m-live .m-dot{width:6px;height:6px;border-radius:50%;background:var(--ac)}
.mrd .m-datepill .m-viewing{display:flex;align-items:center;gap:6px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;font-size:11px;font-weight:700}
.mrd .m-datepill .m-viewing .m-dot{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.mrd .m-datepill .m-datestr{color:var(--t3);font-weight:500;text-transform:none;letter-spacing:0}
.mrd .m-datewrap{position:relative}
.mrd .m-datewrap input[type="date"]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
/* empty state */
.mrd .m-empty{text-align:center;padding:34px 18px;border-radius:10px;background:var(--sunken);color:var(--t3);font-weight:600;font-size:13px}
/* responsive */
@media (max-width:1023px){.mrd .mrd-layout{grid-template-columns:1fr !important}.mrd .mrd-layout>div:first-child{position:static !important}}
@media (max-width:860px){.mrd .m-addgrid{grid-template-columns:1fr 1fr !important}.mrd .m-addgrid>div:nth-child(2){grid-column:1 / -1;order:3}.mrd .m-addgrid>div:nth-child(4){grid-column:1 / -1;order:4}}
@media (max-width:560px){.mrd .m-addgrid{grid-template-columns:1fr !important}.mrd .m-entry{gap:10px}.mrd .m-chiprow{order:5;width:100%}}
`;

/* Shared drawn icons — one stroke weight, no emoji. */
const Icon = ({ d, className = "m-ic", viewBox = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  layers: <path d="M12 2 3 7l9 5 9-5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />,
  gauge: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 9 9h-9z" /></>,
  heart: <path d="M12 21C7 17 3 13 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 4.5-4 8.5-9 12.5z" />,
  /* Food-source macro glyphs, drawn to match the system stroke style */
  drumstick: <><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.6 13.6 17.2 17.2" /><circle cx="19.4" cy="16.5" r="1.7" /><circle cx="16.5" cy="19.4" r="1.7" /></>,
  wheat: <><path d="M12 22v-7" /><path d="M8 15l4-3 4 3" /><path d="M8 11l4-3 4 3" /><path d="M8 7l4-3 4 3" /></>,
  avocado: <><path d="M12 3c3.2 3.2 6.5 7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10 8.8 6.2 12 3z" /><circle cx="12" cy="14.2" r="2.8" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />,
  minus: <path d="M5 12h14" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  trend: <><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></>,
};

/* Semantic macro metadata — accent icon class + bar class per macro. */
const MACRO_META = {
  calories: { icon: ICONS.flame, iconCls: "i-cal", barCls: "b-cal" },
  protein: { icon: ICONS.drumstick, iconCls: "i-pro", barCls: "b-pro" },
  carbs: { icon: ICONS.wheat, iconCls: "i-car", barCls: "b-car" },
  fats: { icon: ICONS.avocado, iconCls: "i-fat", barCls: "b-fat" },
};

const MACRO_CHIP = {
  protein: "m-chip-p",
  carbs: "m-chip-c",
  fats: "m-chip-f",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ------------------------------------------------------------------ */
/* ToastHost — designed feedback replacing native alert()/confirm().  */
/* ------------------------------------------------------------------ */

let toastSeq = 0;

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="mrd mrd-toast" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`mrd-toast-item ${t.tone === "error" ? "err" : ""}`}>
          <span className="mrd-toast-dot"></span>
          <p>{t.message}</p>
          {t.actionLabel && (
            <button
              onClick={() => {
                t.onAction?.();
                onDismiss(t.id);
              }}
              className="mrd-toast-act"
            >
              {t.actionLabel}
            </button>
          )}
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="mrd-toast-x">
            <Icon d={ICONS.x} className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MacroMeter — Meridian row + bar.                                   */
/* ------------------------------------------------------------------ */

function MacroMeter({ label, value, max, macroKey }) {
  const meta = MACRO_META[macroKey];
  const percentage = Math.min((value / max) * 100, 100);
  const isOverLimit = value > max;

  return (
    <div className="m-meter">
      <div className="m-meter-row">
        <span className="m-meter-name">
          <Icon d={meta.icon} className={`m-ic ${meta.iconCls}`} />
          {label}
        </span>
        <span className={`m-meter-val m-num ${isOverLimit ? "m-over" : ""}`}>
          {value} <span className="m-meter-goal m-num">/ {max}{macroKey === "calories" ? "" : " g"}</span>
        </span>
      </div>
      <div className="m-bar">
        <i className={`${meta.barCls}${isOverLimit ? " m-overbar" : ""}`} style={{ transform: `scaleX(${percentage / 100})` }}></i>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MealSection — breakfast / lunch / dinner card.                     */
/* ------------------------------------------------------------------ */

function MealSection({ title, meals, onUpdateQuantity, onDelete }) {
  const mealIcon = title.toLowerCase() === "breakfast" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>
    : title.toLowerCase() === "lunch" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>
    : <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />;

  const subtotal = meals.reduce(
    (sum, e) => sum + (e.meal?.macros?.calories || 0) * (parseFloat(e.quantity) || 0),
    0,
  );

  return (
    <div className="m-card" style={{ marginTop: 20 }}>
      <div className="m-card-h">
        <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--t3)" }}><Icon d={mealIcon} /></span>
          {title}
          <span className="m-crumb" style={{ fontWeight: 500 }}>· {meals.length} {meals.length === 1 ? "item" : "items"}</span>
        </h3>
        {meals.length > 0 ? (
          <b className="m-num" style={{ fontSize: 14 }}>{Math.round(subtotal).toLocaleString()} kcal</b>
        ) : (
          <span className="m-crumb">Nothing logged yet</span>
        )}
      </div>

      {meals.length === 0 ? (
        <div style={{ padding: "16px 18px" }}>
          <div className="m-empty">No meals logged — use the form above to add one.</div>
        </div>
      ) : (
        <div>
          {meals.map((entry) => (
            <div key={entry._id} className="m-entry">
              <span className="m-name">
                {toTitleCase(entry.mealName)}
                <span className="m-serving">
                  {entry.meal?.servingSize || "1 unit"} · {entry.meal?.macros?.calories || 0} kcal per serving
                </span>
              </span>
              <span className="m-chiprow">
                <span className={`m-chip ${MACRO_CHIP.protein}`}>{entry.meal?.macros?.protein || 0}g P</span>
                <span className={`m-chip ${MACRO_CHIP.carbs}`}>{entry.meal?.macros?.carbs || 0}g C</span>
                <span className={`m-chip ${MACRO_CHIP.fats}`}>{entry.meal?.macros?.fats || 0}g F</span>
              </span>
              <div className="m-step">
                <button
                  onClick={() => onUpdateQuantity(entry._id, Math.max(0.5, parseFloat(entry.quantity) - 0.5))}
                  aria-label={`Decrease quantity of ${toTitleCase(entry.mealName)}`}
                >
                  −
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={entry.quantity}
                  onChange={(e) => onUpdateQuantity(entry._id, parseFloat(e.target.value))}
                  aria-label={`Quantity of ${toTitleCase(entry.mealName)}`}
                />
                <button
                  onClick={() => onUpdateQuantity(entry._id, parseFloat(entry.quantity) + 0.5)}
                  aria-label={`Increase quantity of ${toTitleCase(entry.mealName)}`}
                >
                  +
                </button>
              </div>
              <span className="m-kc m-num">
                {Math.round((entry.meal?.macros?.calories || 0) * (parseFloat(entry.quantity) || 0))}
              </span>
              <button
                onClick={() => onDelete(entry._id)}
                aria-label={`Delete ${toTitleCase(entry.mealName)}`}
                className="m-iconbtn"
                title="Delete entry"
              >
                <Icon d={ICONS.trash} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function MealTrackingPage() {
  const { user, checkAuth } = useAuth();
  const [dailyLog, setDailyLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showMealStats, setShowMealStats] = useState(false);
  const [mealSearch, setMealSearch] = useState("");
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const searchInputRef = useRef(null);
  const typeSelectRef = useRef(null);
  const qtyInputRef = useRef(null);
  const submitRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  // Designed feedback — replaces native alert()/confirm() everywhere.
  const pushToast = (message, tone = "success", action = null, ttl = 5000) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, tone, ...action }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ttl);
    }
  };
  const dismissToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));


  // Refresh user data when component mounts or becomes visible
  useEffect(() => {
    checkAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMealDropdown && !event.target.closest(".m-dd-anchor")) {
        setShowMealDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showMealDropdown]);

  // Keyboard accelerators: "/" or Ctrl/Cmd+K focuses search, Esc steps back out.
  useEffect(() => {
    const handleShortcuts = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement;

      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        if (showMealDropdown) {
          setShowMealDropdown(false);
          searchInputRef.current?.focus();
        } else if (document.activeElement === qtyInputRef.current) {
          searchInputRef.current?.focus();
        } else if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [showMealDropdown]);

  const fetchDailyLog = async () => {
    try {
      const res = await fetch(`/api/daily-log?date=${currentDate}`);
      const data = await res.json();
      setDailyLog(data.dailyLog);
    } catch (error) {
      console.error("Error fetching daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      const data = await res.json();
      // Sort meals alphabetically by name
      const sortedMeals = data.meals.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setMeals(sortedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDailyLog();
      fetchMeals();
    }
  }, [user, currentDate]);

  const handleAddMeal = async (e) => {
    e.preventDefault();

    if (!selectedMeal || !(parseFloat(quantity) > 0)) {
      pushToast("Pick a meal from the search list and set a quantity above 0.", "error");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId: selectedMeal,
          quantity: parseFloat(quantity),
          mealType: selectedMealType,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLog(data.dailyLog);
        const addedName = meals.find((m) => m._id === selectedMeal)?.name;
        setSelectedMeal("");
        setQuantity(1);
        setMealSearch("");
        setShowMealDropdown(false);
        pushToast(
          `${toTitleCase(addedName || "Meal")} added to ${selectedMealType}.`,
          "success",
        );
        searchInputRef.current?.focus();
      } else {
        const data = await res.json();
        pushToast(data.error || "Couldn't add that meal. Try again.", "error");
      }
    } catch (error) {
      console.error("Error adding meal:", error);
      pushToast("Couldn't reach the server. Check your connection and retry.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuantity = async (entryId, newQuantity) => {
    const qty = parseFloat(newQuantity);

    if (isNaN(qty) || qty <= 0) {
      pushToast("Quantity has to be at least 0.5. Adjusted back for you.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/daily-log/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: qty,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLog(data.dailyLog);
      } else {
        const data = await res.json();
        console.error("Update failed:", data);
        pushToast(data.error || "Couldn't update that entry. Try again.", "error");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      pushToast("Couldn't reach the server. Check your connection and retry.", "error");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const snapshot = dailyLog;
    const entry = dailyLog?.meals?.find((m) => m._id === entryId);
    if (!entry) return;

    // Optimistic remove — the Undo toast is the safety net, not a dialog.
    setDailyLog({
      ...dailyLog,
      meals: dailyLog.meals.filter((m) => m._id !== entryId),
    });

    try {
      const res = await fetch(`/api/daily-log/${entryId}?date=${currentDate}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLog(data.dailyLog);
        pushToast(
          `${toTitleCase(entry.mealName)} removed.`,
          "success",
          {
            actionLabel: "Undo",
            onAction: () => {
              const restore = async () => {
                try {
                  const res = await fetch("/api/daily-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mealId: entry.meal?._id || entry.meal,
                      quantity: entry.quantity,
                      mealType: entry.mealType,
                      date: currentDate,
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setDailyLog(data.dailyLog);
                  } else {
                    setDailyLog(snapshot);
                    pushToast("Couldn't restore it. Your log is back as it was.", "error");
                  }
                } catch (error) {
                  console.error("Error restoring entry:", error);
                  setDailyLog(snapshot);
                  pushToast("Couldn't reach the server. Your log is back as it was.", "error");
                }
              };
              restore();
            },
          },
        );
      } else {
        const data = await res.json();
        console.error("Delete failed:", data);
        setDailyLog(snapshot);
        pushToast(data.error || "Couldn't remove that entry. Try again.", "error");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      setDailyLog(snapshot);
      pushToast("Couldn't reach the server. Nothing was deleted.", "error");
    }
  };

  const getMealsByType = (type) => {
    if (!dailyLog) return [];
    return dailyLog.meals.filter((entry) => entry.mealType === type);
  };

  if (loading) {
    return <Loader />;
  }

  const totalMacros = dailyLog?.totalMacros || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  // Per-user daily goals (editable on the profile page)
  const goals = user?.macroGoals || {
    calories: 1900,
    protein: 120,
    carbs: 170,
    fats: 60,
  };

  // Selected-date info
  const [selY, selM, selD] = currentDate.split("-").map(Number);
  const selDate = new Date(selY, selM - 1, selD);
  const selectedIsToday = isToday(selDate);

  const daySummary = `${dailyLog?.meals?.length || 0} ${
    (dailyLog?.meals?.length || 0) === 1 ? "meal" : "meals"
  } logged`;

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(mealSearch.toLowerCase()),
  );

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — title left, functional date picker right
              (moved out of the nav; this replaces the old static pill) */}          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="m-h1">{selectedIsToday ? "Today" : format(selDate, "EEEE, MMMM d")}</div>
              <div className="m-sub">{daySummary}</div>
            </div>
            <div className="m-datepill" style={{ cursor: "pointer" }}>
              {selectedIsToday ? (
                <span className="m-live"><span className="m-dot"></span>Today</span>
              ) : (
                <span className="m-viewing"><span className="m-dot"></span>Viewing</span>
              )}
              <span className="m-datestr">{format(selDate, "EEE, MMM d")}</span>
              <div className="m-datewrap">
                <Icon d={ICONS.calendar} className="m-ic" />
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  aria-label="Select date"
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "min(340px,100%) 1fr", gap: 24, marginTop: 24 }} className="mrd-layout">
            {/* Targets rail */}
            <div className="m-card" style={{ alignSelf: "start", position: "sticky", top: 96 }}>
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.trend} /></span>
                  Daily targets
                </h3>
                <span className="m-chip m-chip-ac m-num">
                  {Math.min(Math.round((totalMacros.calories / goals.calories) * 100), 999)}%
                </span>
              </div>

              <MacroMeter label="Calories" macroKey="calories" value={totalMacros.calories} max={goals.calories} />
              <MacroMeter label="Protein" macroKey="protein" value={totalMacros.protein} max={goals.protein} />
              <MacroMeter label="Carbs" macroKey="carbs" value={totalMacros.carbs} max={goals.carbs} />
              <MacroMeter label="Fats" macroKey="fats" value={totalMacros.fats} max={goals.fats} />

              {/* Remaining */}
              <div style={{ padding: "16px 18px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "var(--t3)", marginBottom: 8 }}>
                  REMAINING
                </div>
                {[
                  { label: "Protein", val: (goals.protein - totalMacros.protein).toFixed(1), unit: "g" },
                  { label: "Carbs", val: (goals.carbs - totalMacros.carbs).toFixed(1), unit: "g" },
                  { label: "Fats", val: (goals.fats - totalMacros.fats).toFixed(1), unit: "g" },
                ].map((item) => {
                  const valNum = parseFloat(item.val);
                  const isExceeded = valNum < 0;
                  return (
                    <div key={item.label} className="m-rem-row">
                      <span>{item.label}</span>
                      <b className={`m-num ${isExceeded ? "m-over" : ""}`}>
                        {isExceeded ? `+${Math.abs(valNum).toFixed(1)} ${item.unit} over` : `${item.val} ${item.unit}`}
                      </b>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feed column */}
            <div>
              {/* Add meal card */}
              <div className="m-card">
                <div className="m-card-h">
                  <h3>Add a meal</h3>
                  <span className="m-crumb">per-serving macros auto-calculated</span>
                </div>
                <form onSubmit={handleAddMeal} style={{ padding: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 84px auto", gap: 10 }} className="m-addgrid">
                    <div>
                      <label htmlFor="m-type" className="m-crumb" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5, textTransform: "uppercase" }}>Type</label>
                      <div style={{ position: "relative" }}>
                        <select
                          id="m-type"
                          ref={typeSelectRef}
                          value={selectedMealType}
                          onChange={(e) => setSelectedMealType(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              searchInputRef.current?.focus();
                            }
                          }}
                          className="m-field"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                        </select>
                        <svg className="m-ic" viewBox="0 0 24 24" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--t3)" }}>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    <div className="m-dd-anchor" style={{ position: "relative" }}>
                      <label htmlFor="m-search" className="m-crumb" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5, textTransform: "uppercase" }}>
                        Item <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>· press ⏎</span>
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", pointerEvents: "none" }}>
                            <Icon d={ICONS.search} />
                          </span>
                          <input
                            id="m-search"
                            type="text"
                            ref={searchInputRef}
                            autoComplete="off"
                            value={
                              mealSearch ||
                              (selectedMeal
                                ? meals.find((m) => m._id === selectedMeal)?.name
                                  ? toTitleCase(meals.find((m) => m._id === selectedMeal).name)
                                  : ""
                                : "")
                            }
                            onChange={(e) => {
                              setMealSearch(e.target.value);
                              setShowMealDropdown(true);
                            }}
                            onFocus={() => setShowMealDropdown(true)}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown" && !showMealDropdown) {
                                setShowMealDropdown(true);
                                return;
                              }
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const list = meals.filter((meal) =>
                                  meal.name.toLowerCase().includes(mealSearch.toLowerCase()),
                                );
                                if (list.length === 1) {
                                  setSelectedMeal(list[0]._id);
                                  setMealSearch("");
                                  setShowMealDropdown(false);
                                  qtyInputRef.current?.focus();
                                } else if (list.length > 1) {
                                  setShowMealDropdown(true);
                                }
                              }
                            }}
                            className="m-field"
                            style={{ paddingLeft: 34 }}
                            placeholder="Search the database…"
                            required={!selectedMeal}
                          />
                          {showMealDropdown && (
                            <div className="m-dd" data-lenis-prevent="true" role="listbox">
                              {filteredMeals.map((meal) => (
                                <div
                                  key={meal._id}
                                  role="option"
                                  aria-selected={selectedMeal === meal._id}
                                  tabIndex={-1}
                                  onClick={() => {
                                    setSelectedMeal(meal._id);
                                    setMealSearch("");
                                    setShowMealDropdown(false);
                                    qtyInputRef.current?.focus();
                                  }}
                                  className="m-dd-item"
                                >
                                  <span className="m-dd-name">{toTitleCase(meal.name)}</span>
                                  <span className="m-chip" style={{ background: "var(--sunken)", color: "var(--t2)" }}>{meal.servingSize}</span>
                                </div>
                              ))}
                              {filteredMeals.length === 0 && (
                                <div className="m-dd-empty">No matching meals found</div>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMealStats(!showMealStats)}
                          disabled={!selectedMeal}
                          title="Show per-serving info"
                          aria-label="Show per-serving info"
                          className="m-iconbtn"
                          style={{ border: "1px solid var(--line)", height: 41, width: 41, display: "flex", alignItems: "center", justifyContent: "center", opacity: selectedMeal ? 1 : 0.35 }}
                        >
                          <Icon d={ICONS.info} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="m-qty" className="m-crumb" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5, textTransform: "uppercase" }}>
                        Qty <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>· ⏎ adds</span>
                      </label>
                      <input
                        id="m-qty"
                        type="number"
                        ref={qtyInputRef}
                        step="0.5"
                        min="0.5"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitRef.current?.click();
                          }
                        }}
                        aria-label="Quantity"
                        className="m-field m-num"
                        style={{ textAlign: "center" }}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button ref={submitRef} type="submit" disabled={submitting} className="m-btn m-btn-primary" style={{ width: "100%" }}>
                        <Icon d={ICONS.plus} />
                        {submitting ? "Adding…" : "Add entry"}
                      </button>
                    </div>
                  </div>

                  {/* Per-serving stats panel */}
                  {showMealStats && selectedMeal && (
                    <div className="m-card" style={{ marginTop: 14, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--t2)" }}>
                          Nutritional data · per serving
                        </h3>
                        <button onClick={() => setShowMealStats(false)} className="m-iconbtn" aria-label="Close nutrition info">
                          <Icon d={ICONS.x} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {(() => {
                        const meal = meals.find((m) => m._id === selectedMeal);
                        if (!meal) return null;
                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                            {[
                              { k: "Cal", v: meal.macros.calories, cls: "" },
                              { k: "Protein", v: meal.macros.protein, cls: "m-chip-p" },
                              { k: "Carbs", v: meal.macros.carbs, cls: "m-chip-c" },
                              { k: "Fats", v: meal.macros.fats, cls: "m-chip-f" },
                            ].map((s) => (
                              <div key={s.k} style={{ background: "var(--sunken)", borderRadius: 9, padding: "10px 12px", textAlign: "center" }}>
                                <span className="m-crumb" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 3 }}>{s.k}</span>
                                <b className="m-num" style={{ fontSize: 16 }}>{s.v}</b>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </form>
              </div>

              {/* Meal sections */}
              <MealSection title="Breakfast" meals={getMealsByType("breakfast")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} />
              <MealSection title="Lunch" meals={getMealsByType("lunch")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} />
              <MealSection title="Dinner" meals={getMealsByType("dinner")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} />
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
