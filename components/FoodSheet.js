"use client";

import { useEffect, useRef, useState } from "react";
import { MICRO_KEYS, MICRO_NUTRIENTS } from "@/lib/micros";
import { MEAL_TYPES } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/* FoodSheet — one sheet for the three ways a food enters the log.     */
/*                                                                     */
/*   create  a food saved to the user's own library (private), with     */
/*           "Save & log" and "Save" as separate outcomes               */
/*   edit    the same form, for a food the user created                 */
/*   quick   a one-off: the numbers are typed, nothing is saved         */
/*                                                                     */
/* A native <dialog> does the work a hand-rolled modal gets wrong:      */
/* focus containment, Escape, inert background, focus back to the       */
/* trigger. Bottom sheet on a phone, centred card on a desk — the same  */
/* rules the nutrition label already uses.                             */
/* ------------------------------------------------------------------ */

const SHEET_CSS = `
.ml-fs{margin:auto;width:min(470px,calc(100vw - 32px));max-height:min(88vh,760px);padding:0;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--t1);box-shadow:var(--ng-shadow-2)}
/* margin:auto is set here because the project reset zeroes it, and a dialog
   without it lands in the top-left corner instead of the middle. */
.ml-fs[open]{display:flex;flex-direction:column;animation:ml-fs-in .18s ease}
.ml-fs::backdrop{background:rgba(9,9,9,.34);-webkit-backdrop-filter:blur(8px) saturate(.85);backdrop-filter:blur(8px) saturate(.85)}
.ml-fs-h{display:flex;align-items:flex-start;gap:12px;padding:17px 16px 14px 18px;border-bottom:1px solid var(--line)}
.ml-fs-h>div{min-width:0}
.ml-fs-eyebrow{font-family:var(--font-mono);font-size:9px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)}
.ml-fs-title{margin:3px 0 0;font-size:17px;font-weight:600;letter-spacing:-.01em;line-height:1.25;overflow-wrap:break-word;outline:none}
.ml-fs-sub{margin:3px 0 0;font-size:11.5px;line-height:1.5;color:var(--t3)}
.ml-fs-x{flex:none;width:28px;height:28px;margin:-3px -4px 0 auto;display:flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:6px;background:none;color:var(--t3);cursor:pointer;transition:.15s}
.ml-fs-x:hover{color:var(--t1);background:var(--sunken);border-color:var(--line)}
.ml-fs-x:focus-visible{outline:2px solid var(--t1);outline-offset:1px}
.ml-fs-body{flex:1;min-height:0;overflow:auto;padding:16px 18px 18px}
.ml-fs-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:10px}
.ml-fs-lbl{display:block;font-size:11px;font-weight:500;color:var(--t2);margin-bottom:5px}
.ml-fs-in{width:100%;height:38px;border:1px solid var(--line);border-radius:6px;background:var(--card);padding:0 10px;font-family:inherit;font-size:13px;color:var(--t1);outline:none;transition:border-color .15s,box-shadow .15s}
.ml-fs-in::placeholder{color:var(--faint)}
.ml-fs-in:focus{border-color:var(--t1);box-shadow:0 0 0 3px rgba(0,112,243,.16)}
.ml-fs-macros{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}
.ml-fs-suffix{position:relative}
.ml-fs-suffix .ml-fs-in{padding-right:24px;-moz-appearance:textfield}
.ml-fs-suffix .ml-fs-in::-webkit-outer-spin-button,.ml-fs-suffix .ml-fs-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.ml-fs-suffix span{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:9.5px;color:var(--t3);pointer-events:none}
/* A soft check, never a gate: labels round, fibre is excluded from 4/4/9 and
   food-specific energy factors differ, so a mismatch is information. */
.ml-fs-note{margin:9px 0 0;font-size:10.5px;line-height:1.5;color:var(--t3);font-variant-numeric:tabular-nums}
.ml-fs-more{margin-top:15px;border-top:1px solid var(--line);padding-top:13px}
/* The day sits beside the slot because "Save & log" writes to whatever day the
   page is showing — on a back-dated page that has to be visible, not assumed. */
.ml-fs-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.ml-fs-row .ml-fs-lbl{margin-bottom:0}
.ml-fs-when{font-family:var(--font-mono);font-size:10px;color:var(--t3);white-space:nowrap}
.ml-fs-when.is-past{color:var(--t2)}
.ml-fs-toggle{display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:0;font-family:inherit;font-size:11.5px;font-weight:500;color:var(--t2);cursor:pointer}
.ml-fs-toggle:hover{color:var(--t1)}
.ml-fs-toggle:focus-visible{outline:2px solid var(--t1);outline-offset:2px;border-radius:3px}
.ml-fs-toggle svg{width:12px;height:12px;transition:transform .18s ease}
.ml-fs-toggle[aria-expanded="true"] svg{transform:rotate(180deg)}
.ml-fs-micros{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
.ml-fs-micros .ml-fs-lbl{font-size:10.5px;color:var(--t3)}
.ml-fs-slots{display:flex;gap:4px;margin-top:10px}
/* Four slots share one row; the label shrinks before the target does. */
.ml-fs-slot{flex:1;min-width:0;height:34px;padding:0 4px;border:1px solid var(--line);border-radius:6px;background:var(--card);font-family:inherit;font-size:11.5px;font-weight:500;color:var(--t3);cursor:pointer;transition:.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-fs-slot:hover{color:var(--t1)}
.ml-fs-slot.on{border-color:var(--t1);background:var(--sunken);color:var(--t1)}
.ml-fs-slot:focus-visible{outline:2px solid var(--t1);outline-offset:1px}
.ml-fs-err{margin:11px 0 0;font-size:11.5px;line-height:1.5;color:var(--red)}
.ml-fs-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:13px 18px calc(13px + env(safe-area-inset-bottom));border-top:1px solid var(--line)}
.ml-fs-btn{height:38px;padding:0 15px;border-radius:6px;border:1px solid var(--line);background:var(--card);font-family:inherit;font-size:12.5px;font-weight:500;color:var(--t1);cursor:pointer;transition:.15s;white-space:nowrap}
.ml-fs-btn:hover{background:var(--sunken)}
.ml-fs-btn:focus-visible{outline:2px solid var(--t1);outline-offset:1px}
.ml-fs-btn:disabled{opacity:.5;cursor:default}
.ml-fs-btn.is-primary{border-color:var(--ac);background:var(--ac);color:var(--on-ac)}
.ml-fs-btn.is-primary:hover{background:var(--ach)}
.ml-fs-btn.is-danger{margin-right:auto;border-color:transparent;background:none;color:var(--red);padding-left:0}
.ml-fs-btn.is-danger:hover{background:none;text-decoration:underline}
.ml-fs-gap{margin-left:auto}
@keyframes ml-fs-in{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}
@media(max-width:640px){
  .ml-fs{width:100%;max-width:none;margin:auto 0 0;border-radius:14px 14px 0 0;border-bottom:0;max-height:90vh}
  .ml-fs[open]{animation:ml-fs-up .22s cubic-bezier(.2,.8,.2,1)}
  .ml-fs-macros{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ml-fs-foot .ml-fs-btn{flex:1;justify-content:center}
  .ml-fs-btn.is-danger{flex:none}
}
@keyframes ml-fs-up{from{opacity:.5;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.ml-fs[open]{animation:none}}
body:has(.ml-fs[open]){overflow:hidden}
`;

const SLOT_LABEL = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
const UNIT_LABEL = { mg: "mg", ug: "µg", iu: "IU" };

const ChevronDown = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** Blank-string state for a field, so an empty box stays empty rather than "0". */
const fieldValue = (value) => (value === 0 || value ? String(value) : "");

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function FoodSheet({
  mode = "create",
  meal = null,
  initialName = "",
  date,
  dateLabel = "today",
  mealType = "lunch",
  onClose,
  onDone,
}) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  const [name, setName] = useState(meal?.name ? meal.name : initialName);
  const [serving, setServing] = useState(meal?.servingSize || "1 serving");
  const [calories, setCalories] = useState(fieldValue(meal?.macros?.calories));
  const [protein, setProtein] = useState(fieldValue(meal?.macros?.protein));
  const [carbs, setCarbs] = useState(fieldValue(meal?.macros?.carbs));
  const [fats, setFats] = useState(fieldValue(meal?.macros?.fats));
  const [micros, setMicros] = useState(() => {
    const stored = new Map(
      (Array.isArray(meal?.micros?.values) ? meal.micros.values : []).map((v) => [v.key, v.amount])
    );
    return Object.fromEntries(MICRO_KEYS.map((key) => [key, fieldValue(stored.get(key))]));
  });
  const [showMicros, setShowMicros] = useState(
    Boolean(Array.isArray(meal?.micros?.values) && meal.micros.values.length)
  );
  const [slot, setSlot] = useState(MEAL_TYPES.includes(mealType) ? mealType : "lunch");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The sheet unmounts when it closes, so this runs once per open. `close` is
  // listened for natively: Escape, the backdrop and the form all end in that
  // one event, and a dismissed dialog that stays mounted would swallow the
  // next open.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return undefined;
    if (!el.open) el.showModal();
    // A name carried in from the search box is the start of an answer, not
    // something to overwrite: the caret goes to the end, so typing continues
    // the name instead of silently replacing it (and no selection block
    // flashes across a field on a phone).
    const nameEl = nameRef.current;
    nameEl?.focus();
    const end = nameEl?.value.length ?? 0;
    nameEl?.setSelectionRange(end, end);

    const handleClose = () => onCloseRef.current?.();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, []);

  const isQuick = mode === "quick";
  const isEdit = mode === "edit";

  // Close through the dialog, never by simply dropping it from the tree: an
  // open modal that is removed leaves focus on <body>, and the next Tab starts
  // from the top of the page. Closing first lets the browser hand focus back to
  // the field that opened the sheet.
  const dismiss = () => {
    const el = dialogRef.current;
    if (el?.open) el.close();
    else onClose();
  };

  const finish = (result) => {
    const el = dialogRef.current;
    if (el?.open) el.close();
    onDone(result);
  };

  const heading = isQuick ? "Log a one-off" : isEdit ? "Edit food" : "Create a food";
  const eyebrow = isQuick ? "Quick add" : isEdit ? "Your food" : "New food";
  const subtitle = isQuick
    ? `Counted once — ${dateLabel} only. It stays out of your search.`
    : isEdit
      ? "Only you can see this food. Past days keep the numbers they were logged with."
      : "Saved to your foods, visible only to you.";

  const macroPayload = {
    calories: toNumber(calories),
    protein: toNumber(protein),
    carbs: toNumber(carbs),
    fats: toNumber(fats),
  };

  const fromMacros = macroPayload.protein * 4 + macroPayload.carbs * 4 + macroPayload.fats * 9;
  const labelKcal = macroPayload.calories;
  const showMacroCheck =
    labelKcal > 0 &&
    fromMacros > 0 &&
    Math.abs(fromMacros - labelKcal) / labelKcal > 0.05;

  const microValues = MICRO_KEYS.filter((key) => {
    const raw = micros[key];
    return raw !== "" && raw != null && Number.isFinite(Number(raw));
  }).map((key) => ({
    key,
    amount: Number(micros[key]),
    unit: MICRO_NUTRIENTS[key].unit,
  }));

  const submit = async (event, { log = false } = {}) => {
    event?.preventDefault();
    if (busy) return;

    if (!name.trim()) {
      setError("Give the food a name.");
      nameRef.current?.focus();
      return;
    }
    if (macroPayload.calories <= 0) {
      setError("Calories have to be above 0.");
      // Send the caret to the field that failed, not the first one.
      document.getElementById("ml-fs-cal")?.focus();
      return;
    }
    setError("");

    const payload = {
      name: name.trim(),
      servingSize: serving.trim() || "1 serving",
      macros: macroPayload,
      ...(microValues.length
        ? {
            micros: {
              values: microValues,
              source: "user",
              basis: "serving",
              verified: false,
            },
          }
        : // Omitting the field leaves a stored profile alone, so clearing every
          // box on an edit has to say "clear" explicitly.
          isEdit && meal?.micros?.values?.length
          ? { micros: null }
          : {}),
    };

    try {
      if (isQuick) {
        setBusy("log");
        const res = await fetch("/api/daily-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quick: { name: payload.name, macros: macroPayload, mealType: slot, date },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Couldn't log that entry.");
        finish({ logged: true, name: payload.name, slot, dailyLog: data.dailyLog });
        return;
      }

      setBusy(log ? "save-log" : "save");
      const res = await fetch(isEdit ? `/api/meals/${meal._id}` : "/api/meals", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save that food.");

      if (log && !isEdit) {
        const logRes = await fetch("/api/daily-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealId: data.meal._id,
            quantity: 1,
            mealType: slot,
            date,
          }),
        });
        const logData = await logRes.json();
        if (!logRes.ok) {
          finish({ meal: data.meal, name: data.meal.name, logged: false, dailyLog: null });
          return;
        }
        finish({
          meal: data.meal,
          name: data.meal.name,
          logged: true,
          slot,
          dailyLog: logData.dailyLog,
        });
        return;
      }

      finish({ meal: data.meal, name: data.meal.name, logged: false, edited: isEdit });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setBusy(null);
    }
  };

  const remove = async () => {
    if (busy) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy("delete");
    setError("");
    try {
      const res = await fetch(`/api/meals/${meal._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't delete that food.");
      finish({ deleted: true, name: meal.name, mealId: meal._id });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setBusy(null);
    }
  };

  return (
    <>
      <style>{SHEET_CSS}</style>
      <dialog
        ref={dialogRef}
        className="ml-fs"
        aria-labelledby="ml-fs-title"
        aria-describedby="ml-fs-sub"
        onClick={(event) => {
          if (event.target === dialogRef.current) dismiss();
        }}
      >
        <form
          noValidate
          onSubmit={(event) => submit(event, { log: !isEdit && !isQuick })}
        >
          <div className="ml-fs-h">
            <div>
              <div className="ml-fs-eyebrow">{eyebrow}</div>
              <h2 id="ml-fs-title" className="ml-fs-title" tabIndex={-1}>
                {heading}
              </h2>
              <p className="ml-fs-sub" id="ml-fs-sub">
                {subtitle}
              </p>
            </div>
            <button type="button" className="ml-fs-x" onClick={dismiss} aria-label="Close">
              {CloseIcon}
            </button>
          </div>

          <div className="ml-fs-body">
            <div className="ml-fs-grid">
              <div>
                <label className="ml-fs-lbl" htmlFor="ml-fs-name">
                  Food
                </label>
                <input
                  id="ml-fs-name"
                  ref={nameRef}
                  className="ml-fs-in"
                  type="text"
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paneer bhurji"
                  autoComplete="off"
                />
              </div>
              {!isQuick && (
                <div>
                  <label className="ml-fs-lbl" htmlFor="ml-fs-serving">
                    One serving
                  </label>
                  <input
                    id="ml-fs-serving"
                    className="ml-fs-in"
                    type="text"
                    maxLength={100}
                    value={serving}
                    onChange={(e) => setServing(e.target.value)}
                    placeholder="e.g. 1 bowl, 150 g"
                  />
                </div>
              )}
            </div>

            <div className="ml-fs-macros">
              {[
                ["Calories", calories, setCalories, "kcal", "ml-fs-cal"],
                ["Protein", protein, setProtein, "g", "ml-fs-pro"],
                ["Carbs", carbs, setCarbs, "g", "ml-fs-car"],
                ["Fat", fats, setFats, "g", "ml-fs-fat"],
              ].map(([label, value, setValue, unit, id]) => (
                <div key={id}>
                  <label className="ml-fs-lbl" htmlFor={id}>
                    {label}
                  </label>
                  <div className="ml-fs-suffix">
                    <input
                      id={id}
                      className="ml-fs-in"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      max="10000"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0"
                    />
                    <span>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {showMacroCheck && (
              <p className="ml-fs-note">
                {macroPayload.protein}P + {macroPayload.carbs}C + {macroPayload.fats}F works out
                to ≈ {Math.round(fromMacros)} kcal. Labels round, so both are kept as entered.
              </p>
            )}

            {!isEdit && (
              <div className="ml-fs-more">
                <div className="ml-fs-row">
                  <span className="ml-fs-lbl" id="ml-fs-slot-lbl">
                    {isQuick ? "Meal" : "Log to"}
                  </span>
                  <span className={`ml-fs-when${dateLabel === "today" ? "" : " is-past"}`}>
                    {dateLabel}
                  </span>
                </div>
                <div className="ml-fs-slots" role="group" aria-labelledby="ml-fs-slot-lbl">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`ml-fs-slot${slot === type ? " on" : ""}`}
                      aria-pressed={slot === type}
                      onClick={() => setSlot(type)}
                    >
                      {SLOT_LABEL[type]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isQuick && (
              <div className="ml-fs-more">
                <button
                  type="button"
                  className="ml-fs-toggle"
                  aria-expanded={showMicros}
                  aria-controls="ml-fs-micros"
                  onClick={() => setShowMicros((open) => !open)}
                >
                  Micronutrients
                  <span style={{ color: "var(--t3)", fontWeight: 400 }}>
                    {microValues.length ? `· ${microValues.length} added` : "· optional"}
                  </span>
                  {ChevronDown}
                </button>
                {showMicros && (
                  <div className="ml-fs-micros" id="ml-fs-micros">
                    {MICRO_KEYS.map((key) => {
                      const meta = MICRO_NUTRIENTS[key];
                      return (
                        <div key={key}>
                          <label className="ml-fs-lbl" htmlFor={`ml-fs-micro-${key}`}>
                            {meta.label}
                          </label>
                          <div className="ml-fs-suffix">
                            <input
                              id={`ml-fs-micro-${key}`}
                              className="ml-fs-in"
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              value={micros[key]}
                              onChange={(e) =>
                                setMicros((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              placeholder="—"
                            />
                            <span>{UNIT_LABEL[meta.unit] || meta.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                    <p className="ml-fs-note" style={{ gridColumn: "1 / -1" }}>
                      Leave a field empty if the label doesn&apos;t list it — empty is not zero.
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="ml-fs-err" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="ml-fs-foot">
            {isEdit && (
              <button type="button" className="ml-fs-btn is-danger" onClick={remove} disabled={Boolean(busy)}>
                {confirmDelete ? "Delete permanently" : "Delete"}
              </button>
            )}
            {isQuick ? (
              <button type="submit" className="ml-fs-btn is-primary ml-fs-gap" disabled={Boolean(busy)}>
                {busy ? "Logging…" : "Log it"}
              </button>
            ) : isEdit ? (
              <button type="submit" className="ml-fs-btn is-primary ml-fs-gap" disabled={Boolean(busy)}>
                {busy ? "Saving…" : "Save changes"}
              </button>
            ) : (
              <>
                <span className="ml-fs-gap" />
                <button
                  type="button"
                  className="ml-fs-btn"
                  disabled={Boolean(busy)}
                  onClick={(event) => submit(event, { log: false })}
                >
                  {busy === "save" ? "Saving…" : "Save"}
                </button>
                <button type="submit" className="ml-fs-btn is-primary" disabled={Boolean(busy)}>
                  {busy === "save-log" ? "Saving…" : "Save & log"}
                </button>
              </>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}
