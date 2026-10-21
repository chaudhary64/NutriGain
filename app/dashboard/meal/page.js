"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format, isToday } from "date-fns";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import { FALLBACK_MACRO_GOALS } from "@/lib/goals";
import { calculateEntryMacros } from "@/lib/daily-log";
import { MEAL_TYPES } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Geist design system — ink on canvas, hairline chrome, mono eyebrows. */
/* Canvas #fafafa · cards #fff · hairline #ebebeb · ink #171717          */
/* ------------------------------------------------------------------ */

const MERIDIAN_CSS = `
.mrd{color:var(--t1);background:var(--paper)}
/* ---- page head ---- */
.ml-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}
.ml-kicker{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
.ml-title{font-size:28px;font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:0;color:var(--t1)}
.ml-sub{font-size:13px;font-weight:400;color:var(--t3);margin:8px 0 0}
.ml-sub b{font-weight:500;color:var(--t2);font-variant-numeric:tabular-nums}
/* ---- day navigator ---- */
.ml-nav{display:flex;align-items:center;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:5px}
.ml-nav-btn{width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--t2);background:none;border:0;cursor:pointer;transition:.15s}
.ml-nav-btn:hover{background:var(--sunken);color:var(--t1)}
.ml-nav-btn:focus-visible,.ml-nav-today:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
.ml-date{display:flex;align-items:center;gap:8px;padding:0 10px;min-width:166px;justify-content:center}
.ml-status{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.ml-status i{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.ml-status.is-today{color:var(--t2)}
.ml-status.is-today i{background:var(--link)}
.ml-datestr{font-size:12.5px;font-weight:500;color:var(--t1);white-space:nowrap}
.ml-datewrap{position:relative;display:flex;align-items:center;color:var(--t3);cursor:pointer}
.ml-datewrap input[type="date"]{position:absolute;inset:-8px;opacity:0;cursor:pointer;width:calc(100% + 16px)}
.ml-nav-today{font-size:12px;font-weight:500;color:var(--t1);background:var(--sunken);border:0;border-radius:6px;padding:8px 11px;cursor:pointer}
.ml-nav-today:hover{background:var(--ac-soft-b)}
/* ---- daily targets ---- */
.ml-targets{margin-top:22px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.ml-targets-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line)}
.ml-eyebrow{font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.ml-seg{display:inline-flex;gap:2px;background:var(--sunken);border:1px solid var(--line);border-radius:6px;padding:2px}
.ml-seg button{border:0;background:transparent;font:inherit;font-size:11px;font-weight:500;color:var(--t3);padding:4px 11px;border-radius:4px;cursor:pointer;transition:.15s}
.ml-seg button:hover{color:var(--t1)}
.ml-seg button.on{background:var(--card);color:var(--t1)}
.ml-seg button:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
.ml-cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr}
.ml-col{padding:16px 18px 18px;border-right:1px solid var(--line);min-width:0}
.ml-col:last-child{border-right:0}
.ml-col-lbl{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:var(--t2)}
.ml-col-lbl svg{width:14px;height:14px;flex:none}
.ml-val{font-size:24px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.1;margin-top:10px;color:var(--t1)}
.ml-col.is-cal .ml-val{font-size:30px;letter-spacing:-.04em}
.ml-val small{font-size:12px;font-weight:400;letter-spacing:0;color:var(--t3);margin-left:5px}
.ml-bar{height:4px;border-radius:999px;background:var(--track);margin-top:12px;overflow:hidden;position:relative}
.ml-bar i{display:block;height:100%;border-radius:999px;background:var(--ac);transform-origin:left center;transition:transform .6s cubic-bezier(.22,1,.36,1)}
.ml-bar i.is-ghost{position:absolute;inset:0;border-radius:999px}
.ml-bar i.b-cal{background:var(--ac)}
.ml-bar i.b-pro{background:var(--pro)}
.ml-bar i.b-car{background:var(--car)}
.ml-bar i.b-fat{background:var(--green)}
.ml-bar i.is-over{background:var(--red)!important}
.ml-note{font-size:11.5px;font-weight:400;color:var(--t3);margin-top:9px;font-variant-numeric:tabular-nums}
.ml-note.is-over{color:var(--red)}
/* Macro colour lives on icons and bars only — never on chrome. */
.mrd .i-cal{color:var(--ac)}
.mrd .i-pro{color:var(--pro)}
.mrd .i-car{color:var(--car)}
.mrd .i-fat{color:var(--green)}
/* ---- log bar ---- */
.ml-log{margin-top:16px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px 18px}
.ml-log.m-dd-open{position:relative;z-index:var(--pop-z-dropdown,70)}
.ml-log-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.ml-hint{font-family:var(--font-mono);font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.ml-form{display:grid;grid-template-columns:minmax(0,1fr) 108px 126px auto;gap:8px;align-items:center}
.ml-search{position:relative;min-width:0}
.ml-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--t3);display:flex;pointer-events:none}
.ml-search-ico svg{width:15px;height:15px}
.ml-search input{width:100%;height:42px;border:1px solid var(--line);border-radius:6px;background:var(--card);padding:0 40px 0 34px;font-size:13px;color:var(--t1);outline:none;transition:border-color .15s,box-shadow .15s}
.ml-search input::placeholder{color:var(--faint)}
.ml-search input:focus{border-color:var(--t1);box-shadow:0 0 0 3px rgba(0,112,243,.16)}
.ml-kbd{position:absolute;right:9px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:10px;font-weight:500;color:var(--t3);background:var(--sunken);border:1px solid var(--line);border-radius:4px;padding:1px 5px;pointer-events:none}
.ml-qty{display:flex;align-items:center;justify-content:space-between;height:42px;border:1px solid var(--line);border-radius:6px;background:var(--card);padding:0 1px}
.ml-qty button{width:28px;height:34px;border:0;background:none;border-radius:4px;color:var(--t2);font-size:15px;line-height:1;cursor:pointer}
.ml-qty button:hover{background:var(--sunken);color:var(--t1)}
.ml-qty button:focus-visible{outline:2px solid var(--t1);outline-offset:-2px}
.ml-qty input{width:40px;border:0;background:none;text-align:center;font-size:13px;font-weight:500;color:var(--t1);outline:none;font-variant-numeric:tabular-nums;-moz-appearance:textfield}
.ml-qty input::-webkit-outer-spin-button,.ml-qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.ml-slotwrap{position:relative}
.ml-slotwrap select{width:100%;height:42px;border:1px solid var(--line);border-radius:6px;background:var(--card);padding:0 30px 0 11px;font-size:12.5px;font-weight:500;color:var(--t1);appearance:none;outline:none;cursor:pointer}
.ml-slotwrap select:focus{border-color:var(--t1);box-shadow:0 0 0 3px rgba(0,112,243,.16)}
.ml-selchev{position:absolute;right:9px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none;display:flex}
.ml-addwrap{display:flex}
.ml-addwrap .m-btn{height:42px;padding:0 18px;white-space:nowrap}
.ml-picked{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;background:var(--sunken);border-radius:6px;padding:9px 12px;font-size:12px}
.ml-picked b{font-weight:500;color:var(--t1)}
.ml-picked-x{color:var(--t3);font-variant-numeric:tabular-nums}
.ml-chips{display:flex;gap:4px;flex-wrap:wrap}
.ml-chips span{font-family:var(--font-mono);font-size:10.5px;font-weight:500;color:var(--t2);background:var(--card);border:1px solid var(--line);border-radius:4px;padding:2px 6px;font-variant-numeric:tabular-nums}
.ml-per{margin-left:auto;border:0;background:none;font:inherit;font-size:11.5px;font-weight:500;color:var(--t3);cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line);padding:2px}
.ml-per:hover{color:var(--t1)}
.ml-stats{margin-top:10px;border:1px solid var(--line);border-radius:6px;padding:12px 14px}
.ml-stats-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.ml-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ml-stats-cell{background:var(--sunken);border-radius:6px;padding:9px 10px}
.ml-stats-cell span{display:block;font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.ml-stats-cell b{display:block;font-size:15px;font-weight:600;margin-top:2px;font-variant-numeric:tabular-nums;color:var(--t1)}
.ml-iconbtn{width:30px;height:30px;border-radius:6px;border:1px solid transparent;background:none;color:var(--t3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;flex:none}
.ml-iconbtn:hover{background:var(--sunken);color:var(--red);border-color:var(--line)}
.ml-iconbtn:focus-visible{outline:2px solid var(--t1);outline-offset:2px}
/* ---- food dropdown ---- */
.mrd .m-dd{position:absolute;z-index:var(--pop-z-dropdown,70);width:100%;min-width:300px;margin-top:6px;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:var(--ng-shadow-2);max-height:320px;overflow:auto;padding:6px}
.mrd .m-dd-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 10px;cursor:pointer;font-size:13px;border-radius:6px;border:0}
.mrd .m-dd-item:hover,.mrd .m-dd-item.is-active{background:var(--sunken)}
.mrd .m-dd-item.is-picked{background:var(--sunken)}
.mrd .m-dd-main{min-width:0}
.mrd .m-dd-name{display:block;font-weight:500;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mrd .m-dd-sub{display:block;font-size:11px;color:var(--t3);font-weight:400;margin-top:2px;font-variant-numeric:tabular-nums}
.mrd .m-dd-kcal{flex:none;font-size:12px;font-weight:500;color:var(--t1);background:var(--sunken);border-radius:6px;padding:4px 8px;font-variant-numeric:tabular-nums}
.mrd .m-dd-item:hover .m-dd-kcal,.mrd .m-dd-item.is-active .m-dd-kcal{background:var(--card)}
.mrd .m-dd-recent{flex:none;font-family:var(--font-mono);font-size:9.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);background:var(--card);border:1px solid var(--line);border-radius:4px;padding:2px 6px}
.mrd .m-dd-empty{padding:22px;text-align:center;color:var(--t3);font-size:12.5px}
/* ---- day ledger ---- */
.ml-ledger{margin-top:22px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.ml-ledger-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line)}
.ml-ledger-meta{font-size:12px;color:var(--t3);font-variant-numeric:tabular-nums}
.ml-slot{border-bottom:1px solid var(--line)}
.ml-slot:last-child{border-bottom:0}
.ml-slot-head{display:flex;align-items:center;gap:6px;padding:0 12px 0 10px;transition:background .15s}
.ml-slot-head:hover{background:var(--paper)}
.ml-slot-toggle{flex:1;display:grid;grid-template-columns:16px 26px minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 2px;background:none;border:0;cursor:pointer;text-align:left;font:inherit;min-width:0}
.ml-slot-toggle:focus-visible,.ml-slot-add:focus-visible{outline:2px solid var(--t1);outline-offset:-1px;border-radius:6px}
.ml-chev{display:flex;color:var(--t3);transition:transform .18s ease}
.ml-slot.is-open .ml-chev{transform:rotate(90deg)}
.ml-slot.is-empty .ml-chev{opacity:0}
.ml-slot-ico{width:26px;height:26px;border-radius:6px;background:var(--sunken);display:flex;align-items:center;justify-content:center;color:var(--t2)}
.ml-slot-ico svg{width:14px;height:14px}
.ml-slot-id{display:flex;align-items:baseline;gap:9px;min-width:0}
.ml-slot-name{font-size:13.5px;font-weight:500;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-slot-count{flex:none;font-size:11.5px;color:var(--t3);white-space:nowrap}
/* Right side of the header: macro values, their calorie split, then kcal. */
.ml-slot-nums{display:flex;align-items:center;gap:16px;min-width:0}
.ml-slot-macros{display:flex;align-items:baseline;gap:12px;white-space:nowrap}
.ml-macro{display:inline-flex;align-items:baseline;gap:4px;font-family:var(--font-mono);font-size:10.5px;font-weight:500}
.ml-macro i{font-style:normal;font-weight:600;letter-spacing:.02em}
.ml-macro.is-p i{color:var(--pro)}
.ml-macro.is-c i{color:var(--car)}
.ml-macro.is-f i{color:var(--green)}
.ml-macro b{font-weight:500;color:var(--t1);font-variant-numeric:tabular-nums}
.ml-slot-split{display:flex;gap:2px;width:64px;height:6px;flex:none;border-radius:3px;overflow:hidden;background:var(--line)}
.ml-slot-split i{flex-basis:0;height:100%}
.ml-slot-split .seg-p{background:var(--pro)}
.ml-slot-split .seg-c{background:var(--car)}
.ml-slot-split .seg-f{background:var(--green)}
.ml-slot-split .seg-o{background:var(--t3);opacity:.35}
.ml-slot-kcal{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap;font-variant-numeric:tabular-nums}
.ml-slot-kcal b{font-size:13.5px;font-weight:600;letter-spacing:-.01em;color:var(--t1)}
.ml-slot-kcal small{font-family:var(--font-mono);font-size:9px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--t3)}
.ml-slot.is-empty .ml-slot-name{color:var(--t2)}
.ml-slot.is-empty .ml-slot-kcal b{font-weight:400;color:var(--t3)}
.ml-slot-add{width:28px;height:28px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;flex:none}
.ml-slot-add svg{width:14px;height:14px}
.ml-slot-add:hover{background:var(--t1);border-color:var(--t1);color:var(--on-ac)}
.ml-entries{border-top:1px solid var(--line)}
.ml-entry{display:grid;grid-template-columns:minmax(0,1fr) auto auto 84px 30px;align-items:center;gap:14px;padding:10px 18px 10px 46px;border-top:1px solid var(--line);font-size:13px;transition:background .12s}
.ml-entry:first-child{border-top:0}
.ml-entry:hover{background:var(--paper)}
.ml-entry-name{min-width:0;font-weight:500;color:var(--t1);line-height:1.3;overflow-wrap:anywhere}
.ml-serving{display:block;font-size:11.5px;font-weight:400;color:var(--t3);margin-top:2px}
.ml-step{display:flex;align-items:center;border:1px solid var(--line);border-radius:6px;padding:1px;background:var(--card)}
.ml-step button{width:26px;height:26px;border:0;background:none;color:var(--t2);border-radius:4px;cursor:pointer;font-size:13px;line-height:1}
.ml-step button:hover{background:var(--sunken);color:var(--t1)}
.ml-step button:focus-visible{outline:2px solid var(--t1);outline-offset:-2px}
.ml-step input{width:34px;border:0;background:none;text-align:center;font-size:12.5px;font-weight:500;color:var(--t1);outline:none;font-variant-numeric:tabular-nums;-moz-appearance:textfield}
.ml-step input::-webkit-outer-spin-button,.ml-step input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.ml-kcal{text-align:right;font-weight:500;color:var(--t1);font-variant-numeric:tabular-nums;white-space:nowrap}
.ml-kcal small{font-size:10.5px;font-weight:400;color:var(--t3);margin-left:3px}
/* ---- responsive ---- */
@media(max-width:900px){
  .ml-cols{grid-template-columns:1fr 1fr}
  .ml-col{border-right:0;border-top:1px solid var(--line)}
  .ml-col:nth-child(1),.ml-col:nth-child(2){border-top:0}
  .ml-col:nth-child(odd){border-right:1px solid var(--line)}
  .ml-form{grid-template-columns:108px minmax(0,1fr) auto}
  .ml-search{grid-column:1/-1;grid-row:1}
  .ml-slot-split{display:none}
}
@media(max-width:640px){
  /* Two rows in the log bar: search, then quantity + slot, then a full-width
     Add so the slot name never truncates. */
  /* 100px keeps the stepper intact at 320px and leaves the slot name its
     full width plus the chevron gutter. */
  .ml-form{grid-template-columns:100px minmax(0,1fr);gap:8px}
  .ml-search{grid-column:1/-1}
  .ml-addwrap{grid-column:1/-1}
  .ml-addwrap .m-btn{width:100%}
  .ml-val small{display:block;margin:4px 0 0;font-size:11.5px}
  .ml-col.is-cal .ml-val{font-size:26px}
  /* The shortcut hint needs the full row; the board stays legible without it. */
  .ml-hint{display:none}
  /* Slot rows: chevron, glyph, name, kcal. The spacer and the macros are
     hidden so nothing can push the row wider than the card. */
  .ml-slot-toggle{grid-template-columns:16px 24px minmax(0,1fr) auto;gap:8px}
  .ml-slot-count,.ml-slot-spacer{display:none}
  .ml-slotwrap select{padding-right:26px}
  .ml-slot-id{grid-column:3;min-width:0}
  .ml-slot-nums{gap:9px}
  .ml-slot-macros{gap:7px}
  .ml-macro{font-size:10px;gap:3px}
  .ml-slot-kcal{grid-column:4}
  .ml-entry{grid-template-columns:minmax(0,1fr) auto 30px;grid-template-areas:"name kcal del" "chips chips chips" "step step step";row-gap:8px;padding-left:18px}
  .ml-entry-name{grid-area:name}
  .ml-chips{grid-area:chips}
  .ml-step{grid-area:step;justify-self:start}
  .ml-kcal{grid-area:kcal}
  .ml-del{grid-area:del}
  .ml-stats-grid{grid-template-columns:1fr 1fr}
  .ml-title{font-size:24px}
  .ml-date{min-width:0}
  .ml-nav{width:100%;justify-content:space-between}
  .ml-nav-today{margin-left:2px}
}
/* Below ~380px the empty-state label has no room beside the add button; the
   button's label already says what it does. */
@media(max-width:380px){
  .ml-slot-toggle{grid-template-columns:16px 24px minmax(0,1fr) auto}
  .ml-slot-head{padding:0 10px 0 8px}
}
@media(prefers-reduced-motion:reduce){.mrd *{animation:none!important;transition:none!important}}
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
/* TargetCol — one column of the day's target strip.                  */
/* ------------------------------------------------------------------ */

function TargetCol({ label, macroKey, value, goal, preview = 0, mode }) {
  const meta = MACRO_META[macroKey];
  const unit = macroKey === "calories" ? "kcal" : "g";

  // Solid segment is food already logged; the ghost segment is the
  // picked-but-unsaved entry, so the strip previews without lying.
  const eaten = value + preview;
  const isOver = value > goal;
  const remaining = goal - eaten;
  const committedPct = Math.min((value / goal) * 100, 100);
  const projectedPct = Math.min((eaten / goal) * 100, 100);
  const ghostPct = Math.max(projectedPct - committedPct, 0);

  const shown = mode === "remaining" ? Math.max(remaining, 0) : eaten;
  const shownText = macroKey === "calories" ? Math.round(shown).toLocaleString() : fmtMacro(shown);
  // The note always carries the complementary fact, never a repeat of the
  // headline: "Left" reports progress, "Eaten" reports the remainder.
  const note =
    mode === "remaining"
      ? `${Math.round((eaten / goal) * 100)}% eaten`
      : remaining < 0
        ? `${Math.abs(Math.round(remaining)).toLocaleString()} ${unit} over`
        : `${Math.round(remaining).toLocaleString()} ${unit} left`;

  return (
    <div className={`ml-col${macroKey === "calories" ? " is-cal" : ""}`}>
      <div className="ml-col-lbl">
        <Icon d={meta.icon} className={`m-ic ${meta.iconCls}`} />
        {label}
      </div>
      <div className="ml-val m-num">
        {shownText}
        <small>of {goal.toLocaleString()} {unit}</small>
      </div>
      <div className="ml-bar">
        <i
          className={`${meta.barCls}${isOver ? " is-over" : ""}`}
          style={{ transform: `scaleX(${committedPct / 100})` }}
        />
        {ghostPct > 0 && (
          <i
            aria-hidden="true"
            className={`${meta.barCls} is-ghost`}
            style={{ opacity: 0.4, transform: `translateX(${committedPct}%) scaleX(${ghostPct / 100})` }}
          />
        )}
      </div>
      <div className={`ml-note${mode === "consumed" && remaining < 0 ? " is-over" : ""}`}>{note}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EntryRow — one logged food inside a slot.                          */
/* ------------------------------------------------------------------ */

function EntryRow({ entry, onUpdateQuantity, onDelete }) {
  const q = parseFloat(entry.quantity) || 0;
  const m = entry.meal?.macros || {};
  const tP = (m.protein || 0) * q;
  const tC = (m.carbs || 0) * q;
  const tF = (m.fats || 0) * q;
  const tK = Math.round((m.calories || 0) * q);

  return (
    <div className="ml-entry">
      <span className="ml-entry-name">
        {toTitleCase(entry.mealName)}
        <span className="ml-serving">
          {q} × {entry.meal?.servingSize || "1 serving"} · {m.calories || 0} kcal each
        </span>
      </span>

      <span className="ml-chips" title={`Total for ×${q}`}>
        <span>{fmtMacro(tP)}P</span>
        <span>{fmtMacro(tC)}C</span>
        <span>{fmtMacro(tF)}F</span>
      </span>

      <div className="ml-step">
        <button
          type="button"
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
          type="button"
          onClick={() => onUpdateQuantity(entry._id, q + 0.5)}
          aria-label={`Increase quantity of ${toTitleCase(entry.mealName)}`}
        >
          +
        </button>
      </div>

      <span className="ml-kcal">
        {tK.toLocaleString()}
        <small>kcal</small>
      </span>

      <button
        type="button"
        onClick={() => onDelete(entry._id)}
        aria-label={`Delete ${toTitleCase(entry.mealName)}`}
        className="ml-iconbtn ml-del"
        title="Delete entry"
      >
        <Icon d={ICONS.trash} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LedgerSection — one collapsible meal slot of the day log.          */
/* ------------------------------------------------------------------ */

const SLOT_ICONS = {
  breakfast: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  lunch: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  dinner: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
};

function LedgerSection({ slot, label, entries, open, onToggle, onAdd, onUpdateQuantity, onDelete }) {
  const qtyOf = (e) => parseFloat(e.quantity) || 0;
  const totals = entries.reduce(
    (acc, e) => {
      const m = e.meal?.macros || {};
      const q = qtyOf(e);
      acc.kcal += (m.calories || 0) * q;
      acc.p += (m.protein || 0) * q;
      acc.c += (m.carbs || 0) * q;
      acc.f += (m.fats || 0) * q;
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
  const has = entries.length > 0;
  const expanded = has && open;
  // Share of the meal's calories from each macro: 4/4/9 kcal per gram.
  // Stored food calories don't always equal that sum, so anything left over
  // gets a neutral "other" slice instead of being folded into the macros.
  const macroCals = totals.p * 4 + totals.c * 4 + totals.f * 9;
  const otherKcal = Math.max(0, totals.kcal - macroCals);
  const splitTitle = [
    `P ${Math.round(totals.p * 4)} kcal`,
    `C ${Math.round(totals.c * 4)} kcal`,
    `F ${Math.round(totals.f * 9)} kcal`,
    otherKcal >= 1 ? `Unaccounted ${Math.round(otherKcal)} kcal` : null,
    macroCals > totals.kcal + 1
      ? `Macros imply ${Math.round(macroCals)} kcal vs ${Math.round(totals.kcal)} stored`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={`ml-slot${has ? "" : " is-empty"}${expanded ? " is-open" : ""}`}>
      <div className="ml-slot-head">
        <button
          type="button"
          className="ml-slot-toggle"
          aria-expanded={has ? expanded : undefined}
          aria-controls={has ? `slot-${slot}` : undefined}
          onClick={has ? onToggle : onAdd}
        >
          <span className="ml-chev" aria-hidden="true">
            <Icon d={ICONS.chevR} />
          </span>
          <span className="ml-slot-ico" aria-hidden="true">
            <Icon d={SLOT_ICONS[slot]} />
          </span>
          <span className="ml-slot-id">
            <span className="ml-slot-name">{label}</span>
            {has && (
              <span className="ml-slot-count">
                {entries.length} {entries.length === 1 ? "item" : "items"}
              </span>
            )}
          </span>
          <span className="ml-slot-nums">
            {has && (
              <span
                className="ml-slot-macros"
                title="Protein · carbohydrates · fats, in grams"
                aria-label={`Protein ${fmtMacro(totals.p)} grams, carbohydrates ${fmtMacro(totals.c)} grams, fats ${fmtMacro(totals.f)} grams${otherKcal >= 1 ? `, ${Math.round(otherKcal)} calories unaccounted` : ""}`}
              >
                <span className="ml-macro is-p"><i>P</i><b>{fmtMacro(totals.p)}</b></span>
                <span className="ml-macro is-c"><i>C</i><b>{fmtMacro(totals.c)}</b></span>
                <span className="ml-macro is-f"><i>F</i><b>{fmtMacro(totals.f)}</b></span>
              </span>
            )}
            {has && (macroCals > 0 || totals.kcal > 0) && (
              <span className="ml-slot-split" aria-hidden="true" title={splitTitle}>
                {totals.p > 0 && <i className="seg-p" style={{ flexGrow: totals.p * 4 }} />}
                {totals.c > 0 && <i className="seg-c" style={{ flexGrow: totals.c * 4 }} />}
                {totals.f > 0 && <i className="seg-f" style={{ flexGrow: totals.f * 9 }} />}
                {otherKcal >= 1 && <i className="seg-o" style={{ flexGrow: otherKcal }} />}
              </span>
            )}
            <span className="ml-slot-kcal">
              <b>{has ? Math.round(totals.kcal).toLocaleString() : "—"}</b>
              <small>kcal</small>
            </span>
          </span>
        </button>
        <button
          type="button"
          className="ml-slot-add"
          onClick={onAdd}
          aria-label={`Add food to ${label}`}
          title={`Add to ${label}`}
        >
          <Icon d={ICONS.plus} />
        </button>
      </div>

      {expanded && (
        <div className="ml-entries" id={`slot-${slot}`}>
          {entries.map((entry) => (
            <EntryRow
              key={entry._id}
              entry={entry}
              onUpdateQuantity={onUpdateQuantity}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
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
  // Search-first logging: the slot is a default, not a prerequisite. It is
  // suggested from the clock and stays editable in the log bar.
  const [selectedMealType, setSelectedMealType] = useState(() => {
    // A link from Today names the slot it wants filled (?slot=dinner);
    // otherwise the clock suggests one. The value stays editable either way.
    const requested =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("slot");
    if (MEAL_TYPES.includes(requested)) return requested;
    const hour = new Date().getHours();
    return hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";
  });
  const [selectedMeal, setSelectedMeal] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showMealStats, setShowMealStats] = useState(false);
  const [openSlots, setOpenSlots] = useState({ breakfast: true, lunch: true, dinner: true });
  const [mealSearch, setMealSearch] = useState("");
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  // Research-backed: MacroFactor-style Consumed ↔ Remaining toggle —
  // remaining is the default because it helps plan the rest of the day.
  const [macroView, setMacroView] = useState("remaining");
  // Recently logged foods float to the top of search (persisted locally).
  const [recentIds, setRecentIds] = useState(() => {
    try {
      if (typeof localStorage === "undefined") return [];
      const raw = JSON.parse(localStorage.getItem("ng-recent-meals") || "[]");
      return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  });
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
      if (showMealDropdown && !event.target.closest(".ml-dd-anchor")) {
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
        const addedId = selectedMeal;
        setSelectedMeal("");
        setRecentIds((prev) => {
          const next = [addedId, ...prev.filter((id) => id !== addedId)].slice(0, 8);
          try {
            localStorage.setItem("ng-recent-meals", JSON.stringify(next));
          } catch {
            /* private mode — recency just won't persist */
          }
          return next;
        });
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
  const toggleSlot = (slot) =>
    setOpenSlots((prev) => ({ ...prev, [slot]: !prev[slot] }));
  const quickAdd = (type) => {
    setSelectedMealType(type);
    setShowMealDropdown(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const recentSet = new Set(recentIds);
  // Personal history first (recent picks, in recency order), then A–Z —
  // returning users can re-log a familiar food without full-db hunting.
  const orderedMeals = (() => {
    const q = mealSearch.toLowerCase();
    const hit = meals.filter((meal) => meal.name.toLowerCase().includes(q));
    const rank = new Map(recentIds.map((id, i) => [id, i]));
    return [...hit].sort((a, b) => {
      const ra = rank.has(a._id) ? rank.get(a._id) : Infinity;
      const rb = rank.has(b._id) ? rank.get(b._id) : Infinity;
      return ra - rb;
    });
  })();
  const filteredMeals = orderedMeals;

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
        <div
          className="mrd ng-container"
          style={{ padding: "32px var(--layout-gutter) 56px" }}
        >
          {/* Page head — title block left, day navigator right */}
          <div className="ml-head m-in">
            <div style={{ minWidth: 0 }}>
              <p className="ml-kicker">Nutrition · Meal log</p>
              <h1 className="ml-title">Meals</h1>
              <p className="ml-sub">
                {selectedIsToday ? "Today" : format(selDate, "EEEE, MMMM d")} ·{" "}
                <b>{daySummary}</b>
                {previewing && (
                  <>
                    {" "}· <b>{Math.round(previewOf("calories")).toLocaleString()} kcal preview</b>
                  </>
                )}
              </p>
            </div>

            <div className="ml-nav" role="group" aria-label="Change day">
              <button
                type="button"
                className="ml-nav-btn"
                onClick={() => shiftDay(-1)}
                aria-label="Previous day"
                title="Previous day"
              >
                <Icon d={ICONS.chevL} />
              </button>

              <div className="ml-date">
                <span className={`ml-status${selectedIsToday ? " is-today" : ""}`}>
                  <i aria-hidden="true" />
                  {selectedIsToday ? "Today" : "Viewing"}
                </span>
                <span className="ml-datestr">{format(selDate, "EEE, MMM d")}</span>
                <span className="ml-datewrap">
                  <Icon d={ICONS.calendar} className="m-ic" />
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
                    aria-label="Select date"
                  />
                </span>
              </div>

              <button
                type="button"
                className="ml-nav-btn"
                onClick={() => shiftDay(1)}
                aria-label="Next day"
                title="Next day"
              >
                <Icon d={ICONS.chevR} />
              </button>

              {!selectedIsToday && (
                <button
                  type="button"
                  className="ml-nav-today"
                  onClick={() => setCurrentDate(format(new Date(), "yyyy-MM-dd"))}
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {/* Targets — one strip, four columns. The only place the numbers live. */}
          <section className="ml-targets m-in" aria-label="Daily targets">
            <div className="ml-targets-h">
              <span className="ml-eyebrow">Daily targets</span>
              <div className="ml-seg" role="group" aria-label="Macro breakdown view">
                {["consumed", "remaining"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={macroView === v}
                    className={macroView === v ? "on" : ""}
                    onClick={() => setMacroView(v)}
                  >
                    {v === "consumed" ? "Eaten" : "Left"}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-cols">
              <TargetCol
                label="Calories"
                macroKey="calories"
                value={totalMacros.calories}
                goal={goals.calories}
                preview={previewOf("calories")}
                mode={macroView}
              />
              <TargetCol
                label="Protein"
                macroKey="protein"
                value={totalMacros.protein}
                goal={goals.protein}
                preview={previewOf("protein")}
                mode={macroView}
              />
              <TargetCol
                label="Carbs"
                macroKey="carbs"
                value={totalMacros.carbs}
                goal={goals.carbs}
                preview={previewOf("carbs")}
                mode={macroView}
              />
              <TargetCol
                label="Fats"
                macroKey="fats"
                value={totalMacros.fats}
                goal={goals.fats}
                preview={previewOf("fats")}
                mode={macroView}
              />
            </div>
          </section>

          {/* Log bar — search first, slot assigned before it is logged. */}
          <section className={`ml-log m-in${showMealDropdown ? " m-dd-open" : ""}`} aria-label="Log food">
            <div className="ml-log-h">
              <span className="ml-eyebrow">Log food</span>
              <span className="ml-hint">↑↓ to browse · Enter to add</span>
            </div>

            <form onSubmit={handleAddMeal}>
              <div className="ml-form">
                <div className="ml-dd-anchor ml-search">
                  <span className="ml-search-ico" aria-hidden="true">
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
                      const list = orderedMeals;
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
                    placeholder="Search foods…"
                    aria-label="Search foods"
                    required={!selectedMeal}
                  />
                  <span className="ml-kbd" aria-hidden="true">/</span>

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
                            <span className="m-dd-sub">
                              {meal.servingSize} · {meal.macros?.protein || 0}P · {meal.macros?.carbs || 0}C · {meal.macros?.fats || 0}F
                            </span>
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
                            {recentSet.has(meal._id) && <span className="m-dd-recent">Recent</span>}
                            <span className="m-dd-kcal m-num">{meal.macros?.calories || 0} kcal</span>
                          </span>
                        </div>
                      ))}
                      {filteredMeals.length === 0 && (
                        <div className="m-dd-empty">No matching foods — try a shorter search.</div>
                      )}
                      {filteredMeals.length > 30 && (
                        <div className="m-dd-empty" style={{ padding: "10px" }}>
                          Showing 30 of {filteredMeals.length} — keep typing to narrow.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-qty">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(0.5, (parseFloat(q) || 0) - 0.5))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => (parseFloat(q) || 0) + 0.5)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="ml-slotwrap">
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
                    aria-label="Meal slot"
                    title="Meal slot"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  <span className="ml-selchev" aria-hidden="true">
                    <Icon d={ICONS.chevD} />
                  </span>
                </div>

                <div className="ml-addwrap">
                  <button type="submit" ref={submitRef} disabled={submitting} className="m-btn m-btn-primary">
                    <Icon d={ICONS.plus} />
                    {submitting ? "Adding…" : "Add entry"}
                  </button>
                </div>
              </div>

              {/* Live pick summary — always visible once a food is chosen */}
              {previewMeal && previewMacros && (
                <div className="ml-picked">
                  <b>{toTitleCase(previewMeal.name)}</b>
                  <span className="ml-picked-x">
                    × {previewQty} → {Math.round(previewMacros.calories).toLocaleString()} kcal
                  </span>
                  <span className="ml-chips">
                    <span>{fmtMacro(previewMacros.protein)}P</span>
                    <span>{fmtMacro(previewMacros.carbs)}C</span>
                    <span>{fmtMacro(previewMacros.fats)}F</span>
                  </span>
                  <button
                    type="button"
                    className="ml-per"
                    onClick={() => setShowMealStats((v) => !v)}
                    aria-expanded={showMealStats}
                  >
                    {showMealStats ? "Hide per serving" : "Per serving"}
                  </button>
                </div>
              )}

              {/* Per-serving stats panel */}
              {showMealStats && selectedMeal && (() => {
                const meal = meals.find((m) => m._id === selectedMeal);
                if (!meal) return null;
                return (
                  <div className="ml-stats">
                    <div className="ml-stats-h">
                      <span className="ml-eyebrow">Per serving · {meal.servingSize || "1 serving"}</span>
                      <button
                        type="button"
                        onClick={() => setShowMealStats(false)}
                        className="ml-iconbtn"
                        aria-label="Close nutrition info"
                      >
                        <Icon d={ICONS.x} />
                      </button>
                    </div>
                    <div className="ml-stats-grid">
                      {[
                        { k: "Calories", v: meal.macros?.calories || 0 },
                        { k: "Protein", v: `${meal.macros?.protein || 0} g` },
                        { k: "Carbs", v: `${meal.macros?.carbs || 0} g` },
                        { k: "Fats", v: `${meal.macros?.fats || 0} g` },
                      ].map((s) => (
                        <div key={s.k} className="ml-stats-cell">
                          <span>{s.k}</span>
                          <b>{s.v}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </form>
          </section>

          {/* Day log — one slot per meal, collapsible rows */}
          <section className="ml-ledger m-in" aria-label="Food logged for this day">
            <div className="ml-ledger-h">
              <span className="ml-eyebrow">Day log</span>
              <span className="ml-ledger-meta">
                {mealCount} {mealCount === 1 ? "entry" : "entries"} ·{" "}
                {Math.round(totalMacros.calories).toLocaleString()} kcal
              </span>
            </div>

            {[
              { key: "breakfast", label: "Breakfast" },
              { key: "lunch", label: "Lunch" },
              { key: "dinner", label: "Dinner" },
            ].map((s) => (
              <LedgerSection
                key={s.key}
                slot={s.key}
                label={s.label}
                entries={getMealsByType(s.key)}
                open={openSlots[s.key]}
                onToggle={() => toggleSlot(s.key)}
                onAdd={() => quickAdd(s.key)}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDeleteEntry}
              />
            ))}
          </section>
        </div>
      </AppShell>
    </>
  );
}

