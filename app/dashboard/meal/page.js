"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format, isToday } from "date-fns";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";
import { calculateEntryMacros } from "@/lib/daily-log";

/* ------------------------------------------------------------------ */
/* Meridian design system — restrained SaaS.                          */
/* Paper #fafaf9 · cards #fff · hairline #e7e7e3 · accent #4f46e5     */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.mrd{color:var(--t1)}
.mrd{background:var(--paper)}
.mrd .m-chip-p{background:var(--pro-soft);color:var(--pro)}
.mrd .m-chip-c{background:var(--car-soft);color:var(--car)}
.mrd .m-chip-f{background:var(--green-soft);color:var(--green)}
.mrd .m-iconbtn{color:var(--t3);padding:9px;border-radius:7px;cursor:pointer;transition:.15s;border:1px solid transparent;background:none}
.mrd .m-iconbtn:hover{background:var(--sunken);color:var(--red);border-color:var(--line)}
.mrd .m-iconbtn:focus-visible,.mrd .m-step button:focus-visible,.mrd .m-daynav button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
/* page header */
.mrd .m-kicker{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ac);margin:0 0 8px}
.mrd .m-title{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:0}
.mrd .m-totals{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.mrd .m-total-pill{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--t2);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 12px}
.mrd .m-total-pill b{color:var(--t1);font-variant-numeric:tabular-nums}
.mrd .m-total-pill .m-ic{width:14px;height:14px}
/* day navigator */
.mrd .m-daynav{display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px}
.mrd .m-daynav button{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--t2);background:none;border:0;cursor:pointer;transition:.15s}
.mrd .m-daynav button:hover{background:var(--sunken);color:var(--t1)}
.mrd .m-datepill{display:flex;align-items:center;gap:8px;border:0;border-radius:8px;padding:6px 8px;font-size:12px;font-weight:600;color:var(--t2);background:transparent;min-width:172px;justify-content:center}
.mrd .m-datepill .m-live{display:flex;align-items:center;gap:6px;color:var(--ac);text-transform:uppercase;letter-spacing:.05em;font-size:11px;font-weight:800}
.mrd .m-datepill .m-live .m-dot{width:6px;height:6px;border-radius:50%;background:var(--ac)}
.mrd .m-datepill .m-viewing{display:flex;align-items:center;gap:6px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;font-size:11px;font-weight:800}
.mrd .m-datepill .m-viewing .m-dot{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.mrd .m-datepill .m-datestr{color:var(--t1);font-weight:700;text-transform:none;letter-spacing:0}
.mrd .m-datewrap{position:relative;display:flex;align-items:center;color:var(--t3)}
.mrd .m-datewrap input[type="date"]{position:absolute;inset:-6px;opacity:0;cursor:pointer;width:calc(100% + 12px)}
.mrd .m-todaybtn{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ac);background:var(--ac-soft);border:0;border-radius:7px;padding:8px 10px;cursor:pointer}
.mrd .m-todaybtn:hover{background:var(--ac-soft-b)}
/* calorie hero */
.mrd .m-hero{padding:18px;border-bottom:1px solid var(--line)}
.mrd .m-hero-top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px}
.mrd .m-hero-num{font-size:32px;font-weight:800;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.mrd .m-hero-num small{font-size:13px;font-weight:600;color:var(--t3);letter-spacing:0}
.mrd .m-hero-sub{font-size:12px;color:var(--t3);font-weight:600;margin-top:5px}
.mrd .m-hero-track{height:10px;border-radius:999px;background:var(--track);overflow:hidden;position:relative}
.mrd .m-hero-track i{display:block;height:100%;border-radius:999px;background:var(--ac);transform-origin:left center;transition:transform .7s cubic-bezier(.22,1,.36,1)}
.mrd .m-hero-track i.m-overbar{background:var(--red)!important}
.mrd .m-hero-track .m-ghost{position:absolute;inset:0;opacity:.45}
.mrd .m-hero-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12px;font-weight:600;color:var(--t2)}
/* meters */
.mrd .m-meter{padding:14px 18px;border-bottom:1px solid var(--line)}
.mrd .m-meter:last-child{border-bottom:0}
.mrd .m-meter-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px}
.mrd .m-meter-name{font-weight:600;display:flex;gap:8px;align-items:center;color:var(--name)}
.mrd .m-meter-val{font-weight:700;font-variant-numeric:tabular-nums}
.mrd .m-meter-goal{color:var(--t3);font-weight:500}
.mrd .m-bar{height:6px;border-radius:999px;overflow:hidden;position:relative;background:var(--track)}
.mrd .m-bar i{display:block;height:100%;width:100%;transform-origin:left center;border-radius:999px;transition:transform .7s cubic-bezier(.22,1,.36,1)}
.mrd .i-cal{color:var(--ac)}.mrd .i-pro{color:var(--pro)}.mrd .i-car{color:var(--car)}.mrd .i-fat{color:var(--green)}
.mrd .b-cal{background:var(--ac)}.mrd .b-pro{background:var(--pro)}.mrd .b-car{background:var(--car)}.mrd .b-fat{background:var(--green)}
.mrd .m-bar i.m-overbar{background:var(--red)!important}
.mrd .m-over{color:var(--red)!important}
.mrd .m-prev{color:var(--ac)}
.mrd .m-prev-delta{font-size:11px;font-weight:700;color:var(--ac);background:var(--ac-soft);border-radius:5px;padding:1px 5px;margin-left:4px}
.mrd .m-bar .m-ghost{position:absolute;inset:0;opacity:.45;transition:transform .7s cubic-bezier(.22,1,.36,1),opacity .3s ease}
.mrd .m-bar .m-ghost.m-ghost-off{opacity:0}
.mrd .m-rem-prev{color:var(--ac)!important}
/* entries */
.mrd .m-sec-badge{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--ac-soft);color:var(--ac)}
.mrd .m-sec-count{font-size:11px;font-weight:700;color:var(--t3);background:var(--sunken);border-radius:999px;padding:3px 9px}
.mrd .m-sec-kcal{font-size:13px;font-weight:800;font-variant-numeric:tabular-nums}
.mrd .m-entry{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid var(--line);font-size:13px;flex-wrap:wrap}
.mrd .m-entry:last-child{border-bottom:0}
.mrd .m-entry:hover{background:var(--paper)}
.mrd .m-entry .m-name{font-weight:650;flex:1;min-width:170px;line-height:1.35}
.mrd .m-entry .m-serving{display:block;font-size:11.5px;color:var(--t3);font-weight:500;margin-top:3px}
.mrd .m-chiprow{display:flex;gap:6px;flex-wrap:wrap}
.mrd .m-kc{min-width:76px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.2}
.mrd .m-kc small{display:block;font-size:10.5px;font-weight:500;color:var(--t3)}
/* steppers */
.mrd .m-step{display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:9px;padding:2px;background:var(--card)}
.mrd .m-step button{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--t2);cursor:pointer;transition:.15s;background:none;border:0;font-size:14px}
.mrd .m-step button:hover{background:var(--sunken);color:var(--t1)}
.mrd .m-step input{width:40px;text-align:center;font-size:13px;font-weight:700;color:var(--t1);background:none;border:0;outline:none;font-variant-numeric:tabular-nums}
.mrd .m-step input:focus-visible{outline:2px solid var(--ac);outline-offset:1px;border-radius:4px}
/* fields */
.mrd .m-field{border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-size:13px;color:var(--t2);background:var(--card);display:flex;align-items:center;gap:8px;transition:.15s}
.mrd .m-field:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px #4f46e51f}
.mrd select.m-field,.mrd input.m-field{width:100%;outline:none;color:var(--t1);font-weight:500;appearance:none;height:42px}
.mrd input.m-field::placeholder{color:var(--t3)}
.mrd .m-selwrap{position:relative}
.mrd .m-selwrap .m-chev{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--t3);display:flex}
/* dropdown */
/* .m-in's entrance animation makes every card its own stacking context, so a
   dropdown anchored inside one is painted beneath later sibling cards (the
   meal sections). Lift the hosting card while its dropdown is open. */
.mrd .m-card.m-dd-open{position:relative;z-index:var(--pop-z-dropdown, 70)}
.mrd .m-dd{position:absolute;z-index:var(--pop-z-dropdown, 70);width:100%;min-width:280px;margin-top:6px;background:color-mix(in srgb, var(--card) 92%, transparent);-webkit-backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));backdrop-filter:var(--pop-blur, blur(16px) saturate(1.4));border:1px solid var(--line);border-radius:12px;box-shadow:0 20px 44px -12px rgba(0,0,0,.4);max-height:300px;overflow:auto;padding:6px}
.mrd .m-dd-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 11px;cursor:pointer;font-size:13px;border-radius:8px;border:0}
.mrd .m-dd-item:hover,.mrd .m-dd-item.is-active{background:var(--ac-soft)}
.mrd .m-dd-item.is-picked{background:var(--sunken)}
.mrd .m-dd-main{min-width:0}
.mrd .m-dd-item .m-dd-name{font-weight:650;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mrd .m-dd-item .m-dd-sub{font-size:11px;color:var(--t3);font-weight:500;margin-top:2px;font-variant-numeric:tabular-nums}
.mrd .m-dd-kcal{flex:none;font-size:12px;font-weight:800;color:var(--t1);background:var(--sunken);border-radius:7px;padding:5px 9px;font-variant-numeric:tabular-nums}
.mrd .m-dd-item:hover .m-dd-kcal,.mrd .m-dd-item.is-active .m-dd-kcal{background:var(--card)}
.mrd .m-dd-empty{padding:26px;text-align:center;color:var(--t3);font-size:13px}
/* selected-meal strip */
.mrd .m-picked{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;background:var(--ac-soft);border:1px solid var(--ac-soft-b);border-radius:10px;padding:10px 12px;font-size:12px}
.mrd .m-picked b{color:var(--ac)}
.mrd .m-picked .m-picked-macros{display:flex;gap:6px;flex-wrap:wrap}
.mrd .m-picked .m-picked-macros span{background:var(--card);border-radius:6px;padding:3px 8px;font-weight:700;font-variant-numeric:tabular-nums}
/* remaining */
.mrd .m-rem{padding:16px 18px;border-top:1px solid var(--line)}
.mrd .m-rem-h{font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--t3);margin-bottom:8px}
.mrd .m-rem-row{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;padding:5px 0}
.mrd .m-rem-row span{color:var(--t2)}
.mrd .m-rem-row b{font-variant-numeric:tabular-nums}
/* date pill (legacy hook kept) */
/* empty state */
.mrd .m-empty{text-align:center;padding:28px 18px;border-radius:10px;background:var(--sunken);color:var(--t3);font-weight:600;font-size:13px;line-height:1.5}
.mrd .m-empty .m-btn{margin-top:12px}
/* responsive */
@media (max-width:1023px){.mrd .mrd-layout{grid-template-columns:1fr !important}.mrd .mrd-layout>div:first-child{position:static !important}}
@media (max-width:860px){.mrd .m-addgrid{grid-template-columns:1fr 1fr !important}.mrd .m-addgrid>div:nth-child(2){grid-column:1 / -1;order:-1}.mrd .m-addgrid>div:nth-child(4){grid-column:1 / -1;order:4}}
@media (max-width:560px){.mrd .m-addgrid{grid-template-columns:1fr !important}.mrd .m-entry{gap:10px}.mrd .m-chiprow{order:5;width:100%}.mrd .m-daynav{width:100%;justify-content:space-between}}
@media (prefers-reduced-motion:reduce){.mrd *{animation:none!important;transition:none!important}}
`;

/* Shared drawn icons — one stroke weight, no emoji. */
const Icon = ({ d, className = "m-ic" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  /* Food-source macro glyphs, drawn to match the system stroke style */
  drumstick: <><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.6 13.6 17.2 17.2" /><circle cx="19.4" cy="16.5" r="1.7" /><circle cx="16.5" cy="19.4" r="1.7" /></>,
  wheat: <><path d="M12 22v-7" /><path d="M8 15l4-3 4 3" /><path d="M8 11l4-3 4 3" /><path d="M8 7l4-3 4 3" /></>,
  avocado: <><path d="M12 3c3.2 3.2 6.5 7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10 8.8 6.2 12 3z" /><circle cx="12" cy="14.2" r="2.8" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  /* The gym page's trash can (Feather trash-2): the two pages drew the same
     icon as two different shapes. */
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  /* Byte-identical to the shell nav's progress glyph (and to the gym page's
     trend), so the same chart draws everywhere. */
  trend: <><path d="M3 3v18h18" /><path d="M6.5 15.5 10 11l3 2.7L18.7 8" /></>,
  chevL: <path d="m15 18-6-6 6-6" />,
  chevR: <path d="m9 18 6-6-6-6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
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

/* Trim float noise (0.1 + 0.2) and drop a trailing ".0" for display. */
const fmtMacro = (value) => {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
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

function MacroMeter({ label, value, max, macroKey, preview = 0 }) {
  const meta = MACRO_META[macroKey];
  const unit = macroKey === "calories" ? "" : " g";

  // A picked-but-unsaved entry previews on top of what's committed: the solid
  // segment is fact, the translucent ghost segment is intent.
  const hasPreview = preview > 0;
  const projected = value + preview;
  const committedPct = Math.min((value / max) * 100, 100);
  const projectedPct = Math.min((projected / max) * 100, 100);
  const ghostPct = Math.max(projectedPct - committedPct, 0);
  const isOverLimit = value > max;
  const willExceed = hasPreview && projected > max;

  let valCls = "";
  if (hasPreview) valCls = willExceed ? "m-over" : "m-prev";
  else if (isOverLimit) valCls = "m-over";

  return (
    <div className="m-meter">
      <div className="m-meter-row">
        <span className="m-meter-name">
          <Icon d={meta.icon} className={`m-ic ${meta.iconCls}`} />
          {label}
        </span>
        <span className={`m-meter-val m-num ${valCls}`}>
          {fmtMacro(hasPreview ? projected : value)}
          {hasPreview && <span className="m-prev-delta m-num">+{fmtMacro(preview)}</span>}
          {" "}
          <span className="m-meter-goal m-num">/ {max}{unit}</span>
        </span>
      </div>
      <div className="m-bar">
        <i className={`${meta.barCls}${isOverLimit ? " m-overbar" : ""}`} style={{ transform: `scaleX(${committedPct / 100})` }}></i>
        <i
          aria-hidden="true"
          className={`m-ghost ${meta.barCls}${hasPreview ? "" : " m-ghost-off"}${willExceed ? " m-overbar" : ""}`}
          style={{ transform: `translateX(${committedPct}%) scaleX(${ghostPct / 100})` }}
        ></i>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MealSection — breakfast / lunch / dinner card.                     */
/* ------------------------------------------------------------------ */

function MealSection({ title, meals, onUpdateQuantity, onDelete, onQuickAdd }) {
  const mealIcon = title.toLowerCase() === "breakfast" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>
    : title.toLowerCase() === "lunch" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>
    : <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />;

  const qtyOf = (e) => parseFloat(e.quantity) || 0;
  const subtotal = meals.reduce(
    (sum, e) => sum + (e.meal?.macros?.calories || 0) * qtyOf(e),
    0,
  );
  const subP = meals.reduce((s, e) => s + (e.meal?.macros?.protein || 0) * qtyOf(e), 0);
  const subC = meals.reduce((s, e) => s + (e.meal?.macros?.carbs || 0) * qtyOf(e), 0);
  const subF = meals.reduce((s, e) => s + (e.meal?.macros?.fats || 0) * qtyOf(e), 0);

  return (
    <div className="m-card m-in" style={{ marginTop: 20 }}>
      <div className="m-card-h">
        <h3 style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span className="m-sec-badge"><Icon d={mealIcon} /></span>
          {title}
          <span className="m-sec-count">{meals.length} {meals.length === 1 ? "item" : "items"}</span>
        </h3>
        {meals.length > 0 ? (
          <span className="m-sec-kcal m-num" title={`${fmtMacro(subP)}g protein · ${fmtMacro(subC)}g carbs · ${fmtMacro(subF)}g fats`}>
            {Math.round(subtotal).toLocaleString()} kcal
          </span>
        ) : (
          <span className="m-crumb">Nothing logged yet</span>
        )}
      </div>

      {meals.length === 0 ? (
        <div style={{ padding: "16px 18px" }}>
          <div className="m-empty">
            No {title.toLowerCase()} logged for this day.
            <br />
            <button type="button" className="m-btn m-btn-primary" onClick={onQuickAdd} style={{ padding: "9px 14px" }}>
              <Icon d={ICONS.plus} /> Log {title.toLowerCase()} item
            </button>
          </div>
        </div>
      ) : (
        <div>
          {meals.map((entry) => {
            const q = qtyOf(entry);
            const tP = (entry.meal?.macros?.protein || 0) * q;
            const tC = (entry.meal?.macros?.carbs || 0) * q;
            const tF = (entry.meal?.macros?.fats || 0) * q;
            const tK = Math.round((entry.meal?.macros?.calories || 0) * q);
            return (
            <div key={entry._id} className="m-entry">
              <span className="m-name">
                {toTitleCase(entry.mealName)}
                <span className="m-serving">
                  {q} × {entry.meal?.servingSize || "1 serving"} · {entry.meal?.macros?.calories || 0} kcal each
                </span>
              </span>
              <span className="m-chiprow" title={`Total for ×${q}` }>
                <span className={`m-chip ${MACRO_CHIP.protein}`}>{fmtMacro(tP)}g P</span>
                <span className={`m-chip ${MACRO_CHIP.carbs}`}>{fmtMacro(tC)}g C</span>
                <span className={`m-chip ${MACRO_CHIP.fats}`}>{fmtMacro(tF)}g F</span>
              </span>
              <div className="m-step">
                <button
                  onClick={() => onUpdateQuantity(entry._id, Math.max(0.5, q - 0.5))}
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
                  onClick={() => onUpdateQuantity(entry._id, q + 0.5)}
                  aria-label={`Increase quantity of ${toTitleCase(entry.mealName)}`}
                >
                  +
                </button>
              </div>
              <span className="m-kc m-num">
                {tK.toLocaleString()}
                <small>kcal total</small>
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
            );
          })}
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const searchInputRef = useRef(null);
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
  const goals = user?.macroGoals || FALLBACK_MACRO_GOALS;

  // Selected-date info
  const [selY, selM, selD] = currentDate.split("-").map(Number);
  const selDate = new Date(selY, selM - 1, selD);
  const selectedIsToday = isToday(selDate);

  const mealCount = dailyLog?.meals?.length || 0;
  const daySummary = `${mealCount} ${mealCount === 1 ? "entry" : "entries"} logged`;
  const shiftDay = (delta) => {
    const base = new Date(selY, selM - 1, selD);
    base.setDate(base.getDate() + delta);
    setCurrentDate(format(base, "yyyy-MM-dd"));
  };
  const quickAdd = (type) => {
    setSelectedMealType(type);
    setShowMealDropdown(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(mealSearch.toLowerCase()),
  );

  // Live preview of the picked-but-unsaved entry. It only tints the Daily
  // targets rail — the log below stays committed until "Add entry" succeeds.
  const previewQty = parseFloat(quantity);
  const previewMeal = selectedMeal
    ? meals.find((meal) => meal._id === selectedMeal)
    : null;
  const previewMacros =
    previewMeal?.macros && previewQty > 0
      ? calculateEntryMacros(previewMeal, previewQty)
      : null;
  const previewing = Boolean(previewMacros);
  const previewOf = (key) => previewMacros?.[key] || 0;
  const displayedCalories = totalMacros.calories + previewOf("calories");

  return (
    <>
      <style>{MERIDIAN_CSS}</style>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <AppShell>
        <div className="mrd ng-container" style={{ padding: "32px var(--layout-gutter) 56px" }}>
          {/* Page header — SaaS title block left, day navigator right */}
          <div className="m-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p className="m-kicker">Nutrition · Meal log</p>
              <h1 className="m-title">{selectedIsToday ? "Today" : format(selDate, "EEEE, MMMM d")}</h1>
              <div className="m-totals">
                <span className="m-total-pill"><Icon d={ICONS.flame} className="m-ic i-cal" /><b>{Math.round(displayedCalories).toLocaleString()}</b> kcal{previewing ? " incl. preview" : ""}</span>
                <span className="m-total-pill"><Icon d={ICONS.drumstick} className="m-ic i-pro" /><b>{fmtMacro(totalMacros.protein + previewOf("protein"))}g</b> protein</span>
                <span className="m-total-pill">{daySummary}</span>
              </div>
            </div>
            <div className="m-daynav" role="group" aria-label="Change day">
              <button type="button" onClick={() => shiftDay(-1)} aria-label="Previous day" title="Previous day">
                <Icon d={ICONS.chevL} />
              </button>
              <div className="m-datepill">
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
                    onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
                    aria-label="Select date"
                  />
                </div>
              </div>
              <button type="button" onClick={() => shiftDay(1)} aria-label="Next day" title="Next day">
                <Icon d={ICONS.chevR} />
              </button>
              {!selectedIsToday && (
                <button type="button" className="m-todaybtn" onClick={() => setCurrentDate(format(new Date(), "yyyy-MM-dd"))}>
                  Today
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "min(340px,100%) 1fr", gap: 24, marginTop: 24 }} className="mrd-layout">
            {/* Targets rail */}
            <div className="m-card m-in" style={{ alignSelf: "start", position: "sticky", top: 24 }}>
              <div className="m-card-h">
                <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--ac)" }}><Icon d={ICONS.trend} /></span>
                  Daily targets
                </h3>
                <span className="m-chip m-chip-ac m-num" title={previewing ? "Includes the meal you're previewing" : "Share of calorie goal"}>
                  {Math.min(Math.round((displayedCalories / goals.calories) * 100), 999)}%
                </span>
              </div>

              {(() => {
                const calPct = Math.min((displayedCalories / goals.calories) * 100, 100);
                const committedPct = Math.min((totalMacros.calories / goals.calories) * 100, 100);
                const ghostPct = Math.max(calPct - committedPct, 0);
                const calRem = goals.calories - displayedCalories;
                const over = calRem < 0;
                return (
                  <div className="m-hero">
                    <div className="m-hero-top">
                      <div>
                        <div className="m-hero-num m-num">
                          {Math.round(displayedCalories).toLocaleString()} <small>/ {goals.calories.toLocaleString()} kcal</small>
                        </div>
                        <div className="m-hero-sub">{previewing ? "Live preview includes your unsaved pick" : daySummary + " · on this day"}</div>
                      </div>
                    </div>
                    <div className="m-hero-track">
                      <i style={{ transform: `scaleX(${committedPct / 100})` }} className={totalMacros.calories > goals.calories ? "m-overbar" : ""} />
                      <i aria-hidden="true" className={`m-ghost${previewing ? "" : " m-ghost-off"}${over ? " m-overbar" : ""}`} style={{ transform: `translateX(${committedPct}%) scaleX(${ghostPct / 100})` }} />
                    </div>
                    <div className="m-hero-foot">
                      <span className={over ? "m-over" : previewing ? "m-rem-prev" : ""}>
                        {over ? `${Math.abs(Math.round(calRem)).toLocaleString()} kcal over` : `${Math.round(calRem).toLocaleString()} kcal left`}
                      </span>
                      <span>{Math.round(calPct)}% of goal</span>
                    </div>
                  </div>
                );
              })()}

              <MacroMeter label="Calories" macroKey="calories" value={totalMacros.calories} max={goals.calories} preview={previewOf("calories")} />
              <MacroMeter label="Protein" macroKey="protein" value={totalMacros.protein} max={goals.protein} preview={previewOf("protein")} />
              <MacroMeter label="Carbs" macroKey="carbs" value={totalMacros.carbs} max={goals.carbs} preview={previewOf("carbs")} />
              <MacroMeter label="Fats" macroKey="fats" value={totalMacros.fats} max={goals.fats} preview={previewOf("fats")} />

              {/* Remaining */}
              <div className="m-rem">
                <div className="m-rem-h">
                  REMAINING
                </div>
                {[
                  { label: "Calories", key: "calories", unit: "kcal", digits: 0 },
                  { label: "Protein", key: "protein", unit: "g", digits: 1 },
                  { label: "Carbs", key: "carbs", unit: "g", digits: 1 },
                  { label: "Fats", key: "fats", unit: "g", digits: 1 },
                ].map((item) => {
                  const remaining =
                    goals[item.key] - (totalMacros[item.key] + previewOf(item.key));
                  const isExceeded = remaining < 0;
                  const text = isExceeded
                    ? `+${Math.abs(remaining).toFixed(item.digits)} ${item.unit} over`
                    : `${remaining.toFixed(item.digits)} ${item.unit} left`;
                  return (
                    <div key={item.label} className="m-rem-row">
                      <span>{item.label}</span>
                      <b className={`m-num ${isExceeded ? "m-over" : previewing ? "m-rem-prev" : ""}`}>
                        {text}
                      </b>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feed column */}
            <div>
              {/* Add meal card */}
              <div className={`m-card m-in${showMealDropdown ? " m-dd-open" : ""}`}>
                <div className="m-card-h">
                  <h3>Add a meal</h3>
                  <span className="m-crumb">Macros scale with quantity · <b style={{ color: "var(--ac)" }}>/</b> focuses search</span>
                </div>
                <form onSubmit={handleAddMeal} style={{ padding: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 92px auto", gap: 10, alignItems: "end" }} className="m-addgrid">
                    <div>
                      <label htmlFor="m-type" className="m-lbl">Meal type</label>
                      <div className="m-selwrap">
                        <select
                          id="m-type"
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
                        <span className="m-chev"><Icon d={ICONS.chevD} /></span>
                      </div>
                    </div>

                    <div className="m-dd-anchor" style={{ position: "relative" }}>
                      <label htmlFor="m-search" className="m-lbl">
                        Search foods <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500, color: "var(--t3)" }}>· ↑↓ + ⏎</span>
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
                            value={mealSearch}
                            onChange={(e) => {
                              // Editing the text means searching again — drop any
                              // picked meal so the input is a single source of truth.
                              setSelectedMeal("");
                              setMealSearch(e.target.value);
                              setShowMealDropdown(true);
                              setActiveIdx(0);
                            }}
                            onFocus={(e) => {
                              setShowMealDropdown(true);
                              // Revisiting a picked meal: select-all so typing or one
                              // backspace replaces it cleanly.
                              if (selectedMeal) e.target.select();
                            }}
                            onKeyDown={(e) => {
                              const list = meals.filter((meal) =>
                                meal.name.toLowerCase().includes(mealSearch.toLowerCase()),
                              );
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                if (!showMealDropdown) setShowMealDropdown(true);
                                else setActiveIdx((i) => Math.min(i + 1, Math.max(list.length - 1, 0)));
                                return;
                              }
                              if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setActiveIdx((i) => Math.max(i - 1, 0));
                                return;
                              }
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const pick = list[activeIdx] || list[0];
                                if (list.length === 1 || pick) {
                                  const target = list.length === 1 ? list[0] : pick;
                                  if (target) {
                                    setSelectedMeal(target._id);
                                    setMealSearch(toTitleCase(target.name));
                                    setShowMealDropdown(false);
                                    qtyInputRef.current?.focus();
                                  }
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
                            <div className="m-dd" data-lenis-prevent="true" role="listbox" aria-label="Matching foods">
                              {filteredMeals.slice(0, 30).map((meal, idx) => (
                                <div
                                  key={meal._id}
                                  role="option"
                                  aria-selected={selectedMeal === meal._id || activeIdx === idx}
                                  tabIndex={-1}
                                  onMouseEnter={() => setActiveIdx(idx)}
                                  onClick={() => {
                                    setSelectedMeal(meal._id);
                                    setMealSearch(toTitleCase(meal.name));
                                    setShowMealDropdown(false);
                                    setShowMealStats(false);
                                    qtyInputRef.current?.focus();
                                  }}
                                  className={`m-dd-item${activeIdx === idx ? " is-active" : ""}${selectedMeal === meal._id ? " is-picked" : ""}`}
                                >
                                  <span className="m-dd-main">
                                    <span className="m-dd-name">{toTitleCase(meal.name)}</span>
                                    <span className="m-dd-sub" style={{ display: "block" }}>{meal.servingSize} · {meal.macros?.protein || 0}P · {meal.macros?.carbs || 0}C · {meal.macros?.fats || 0}F</span>
                                  </span>
                                  <span className="m-dd-kcal m-num">{meal.macros?.calories || 0} kcal</span>
                                </div>
                              ))}
                              {filteredMeals.length === 0 && (
                                <div className="m-dd-empty">No matching foods — try a shorter search.</div>
                              )}
                              {filteredMeals.length > 30 && (
                                <div className="m-dd-empty" style={{ padding: "10px" }}>Showing 30 of {filteredMeals.length} — keep typing to narrow.</div>
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
                      <label htmlFor="m-qty" className="m-lbl">
                        Qty <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500, color: "var(--t3)" }}>· ⏎ adds</span>
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

                  {/* Live pick summary — always visible once a food is chosen */}
                  {previewMeal && previewMacros && (
                    <div className="m-picked">
                      <b>{toTitleCase(previewMeal.name)}</b>
                      <span style={{ color: "var(--t2)", fontWeight: 600 }}>× {previewQty} → {Math.round(previewMacros.calories).toLocaleString()} kcal</span>
                      <span className="m-picked-macros">
                        <span className="m-chip-p">{fmtMacro(previewMacros.protein)}g P</span>
                        <span className="m-chip-c">{fmtMacro(previewMacros.carbs)}g C</span>
                        <span className="m-chip-f">{fmtMacro(previewMacros.fats)}g F</span>
                      </span>
                    </div>
                  )}

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
              <MealSection title="Breakfast" meals={getMealsByType("breakfast")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} onQuickAdd={() => quickAdd("breakfast")} />
              <MealSection title="Lunch" meals={getMealsByType("lunch")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} onQuickAdd={() => quickAdd("lunch")} />
              <MealSection title="Dinner" meals={getMealsByType("dinner")} onUpdateQuantity={handleUpdateQuantity} onDelete={handleDeleteEntry} onQuickAdd={() => quickAdd("dinner")} />
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
