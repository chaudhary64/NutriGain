"use client";

import { useEffect, useRef, useState } from "react";
import { COMPOSITE_GROUP_EXPANSIONS } from "@/lib/muscle-groups";
import { MUSCLE_GROUP_OPTIONS, WEEKDAYS } from "@/lib/constants";

/**
 * Training-split manager, rendered on the Account page. Owns the schedule API
 * calls (GET on mount, PUT to apply a template or save custom days); the gym
 * page only reads the schedule to build today's session, so editing lives here
 * and nowhere else.
 *
 * The week is one ruled strip rather than seven boxes: a schedule reads best as
 * a timetable. Editing keeps that strip and swaps it to a day selector, so you
 * assign groups for the day you picked instead of scrolling seven chip walls.
 */

const SPLIT_DAYS = WEEKDAYS;
const SPLIT_GROUPS = MUSCLE_GROUP_OPTIONS;

/** { Monday: [id, ...] } from the API, with every id stringified. */
function normalizePicks(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [day, ids] of Object.entries(raw)) {
    if (Array.isArray(ids)) out[day] = ids.map(String);
  }
  return out;
}

/* Sizes read the Account page's type scale when it is in scope, with the same
   values as fallbacks so the component survives being placed elsewhere. */
const SPLIT_CSS = `
.splitmgr{color:var(--t1)}
/* Section header — same rhythm as every other section on the page. */
.sm-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.sm-h h2{font-size:var(--acc-h2,18px);font-weight:600;letter-spacing:-.02em;line-height:1.3;color:var(--t1);margin:0}
.sm-sub{font-size:var(--acc-body,13px);font-weight:400;color:var(--t2);margin:5px 0 0;max-width:56ch;line-height:1.5}
.sm-acts{display:flex;gap:8px;flex-shrink:0}
.sm-btn{appearance:none;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:var(--acc-body,13px);font-weight:500;letter-spacing:-.01em;line-height:20px;padding:6px 12px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t1);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.sm-btn:hover:not(:disabled){background:var(--sunken)}
.sm-btn:disabled{opacity:.5;cursor:default}
.sm-btn-primary{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.sm-btn-primary:hover:not(:disabled){background:var(--ach);border-color:var(--ach)}
.sm-btn:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* The sheet holds every mode: week, editor, or template list. */
.sm-sheet{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
/* --- Week strip --------------------------------------------------------- */
.sm-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.sm-day{appearance:none;text-align:left;font:inherit;background:var(--card);border:0;border-left:1px solid var(--line);padding:12px 12px 14px;display:grid;gap:4px;align-content:start;min-width:0}
.sm-day:first-child{border-left:0}
.sm-day b{display:flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.sm-day b i{display:none;width:4px;height:4px;background:var(--t1);flex-shrink:0}
.sm-day span{font-size:var(--acc-body,13px);font-weight:500;color:var(--t1);line-height:1.35;overflow-wrap:anywhere}
.sm-day.rest span{color:var(--t3);font-weight:400}
/* Today is the stop you are standing on: tinted, inked, and dotted. */
.sm-day.today{background:var(--sunken)}
.sm-day.today b{color:var(--t1)}
.sm-day.today b i{display:block}
button.sm-day{cursor:pointer;transition:background .15s,box-shadow .15s}
button.sm-day:hover{background:var(--sunken)}
button.sm-day[aria-pressed="true"]{background:var(--sunken);box-shadow:inset 0 0 0 1px var(--t1)}
button.sm-day:focus-visible{outline:2px solid var(--link);outline-offset:-2px}
/* Provenance sits under the strip as a footnote, not a second card. */
.sm-source{margin:0;padding:11px 18px;border-top:1px solid var(--line);font-size:var(--acc-small,12px);font-weight:400;color:var(--t3);line-height:1.45}
.sm-source b{font-weight:500;color:var(--t2)}
/* --- Day editor --------------------------------------------------------- */
.sm-editor{border-top:1px solid var(--line);background:var(--card-2);padding:13px 18px 16px}
.sm-editor-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.sm-editor-k{font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t1)}
.sm-editor-n{font-size:var(--acc-small,12px);color:var(--t3)}
.sm-chips{display:flex;flex-wrap:wrap;gap:6px}
.sm-chip{appearance:none;font-family:inherit;font-size:var(--acc-body,13px);font-weight:500;letter-spacing:-.01em;padding:6px 11px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t2);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.sm-chip:hover{border-color:var(--t1);color:var(--t1)}
.sm-chip[aria-pressed="true"]{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.sm-chip:focus-visible{outline:2px solid var(--link);outline-offset:2px}
/* --- Day exercises ------------------------------------------------------ */
.sm-ex-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:16px 0 8px}
.sm-ex{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.sm-ex-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)}
.sm-ex-n{min-width:0;font-size:var(--acc-body,13px);font-weight:500;letter-spacing:-.01em;color:var(--t1);overflow-wrap:anywhere}
.sm-ex-g{margin-left:auto;flex-shrink:0;font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.sm-ex-x{appearance:none;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid var(--line);border-radius:5px;background:var(--card);color:var(--t3);font:inherit;font-size:14px;line-height:1;cursor:pointer;transition:color .15s,border-color .15s}
.sm-ex-x:hover{color:var(--red);border-color:var(--red-soft-b)}
.sm-ex-x:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.sm-ex-empty{margin:0;padding:9px 0;border-bottom:1px solid var(--line);font-size:var(--acc-small,12px);font-weight:400;color:var(--t3)}
.sm-ex-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}
.sm-ex-note{margin:0;font-size:var(--acc-small,12px);font-weight:400;color:var(--t3);line-height:1.45}
.sm-pick{margin-top:10px;border:1px solid var(--line);border-radius:8px;background:var(--card);overflow:hidden}
.sm-pick-in{display:block;width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;padding:9px 12px;font:inherit;font-size:var(--acc-body,13px);font-weight:400;color:var(--t1);outline:none}
.sm-pick-in::placeholder{color:var(--faint)}
.sm-pick-in:focus{border-bottom-color:var(--t1)}
.sm-pick-list{max-height:220px;overflow:auto}
.sm-pick-row{display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;border:0;border-bottom:1px solid var(--line);background:transparent;font:inherit;text-align:left;cursor:pointer}
.sm-pick-row:last-child{border-bottom:0}
.sm-pick-row:hover{background:var(--sunken)}
.sm-pick-row:focus-visible{outline:2px solid var(--link);outline-offset:-2px}
.sm-pick-add{flex-shrink:0;font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t2)}
.sm-pick-row:hover .sm-pick-add{color:var(--t1)}
.sm-pick-empty{margin:0;padding:12px;font-size:var(--acc-small,12px);font-weight:400;color:var(--t3)}
/* --- Template gallery --------------------------------------------------- */
.sm-tpls{display:grid}
.sm-tpls-k{margin:0;padding:12px 18px 10px;font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);border-bottom:1px solid var(--line)}
.sm-tpl{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 18px;border-bottom:1px solid var(--line)}
.sm-tpl:last-child{border-bottom:0}
.sm-tpl-t{min-width:0}
.sm-tpl b{display:flex;align-items:center;gap:8px;font-size:var(--acc-body,13px);font-weight:600;letter-spacing:-.01em;color:var(--t1)}
.sm-tag{font-family:var(--font-mono);font-size:var(--acc-micro,10.5px);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t2);border:1px solid var(--line);border-radius:4px;padding:1px 5px}
.sm-tpl p{margin:3px 0 0;font-size:var(--acc-small,12px);font-weight:400;color:var(--t2);line-height:1.45;overflow-wrap:anywhere}
.sm-empty{margin:0;padding:14px 18px;font-size:var(--acc-small,12px);color:var(--t3)}
@media (max-width:760px){
  .sm-h{flex-direction:column;align-items:stretch;gap:12px}
  .sm-acts{justify-content:flex-end}
  .sm-week{grid-template-columns:repeat(4,minmax(0,1fr))}
  .sm-day{padding:10px 10px 12px}
  .sm-day:nth-child(4n+1){border-left:0}
  .sm-day:nth-child(n+5){border-top:1px solid var(--line)}
  .sm-editor{padding:12px 18px 14px}
}
`;

export default function SplitManager({ pushToast }) {
  const [days, setDays] = useState(null); // null = still loading
  const [source, setSource] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesFetched, setTemplatesFetched] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  // Per-day exercise picks from the server: only days the athlete curated,
  // { Monday: [id, ...] }. A day absent falls back to its muscle groups.
  const [picks, setPicks] = useState({});
  const [draftPicks, setDraftPicks] = useState({});
  const [library, setLibrary] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const selfFetched = useRef(false);

  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
  const todayName = SPLIT_DAYS[todayIdx];
  const activeDay = selectedDay || todayName;

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/workout-schedule");
      if (!res.ok) return;
      const data = await res.json();
      setDays(data.days || {});
      setSource(data.sourceTemplateName || null);
      setPicks(normalizePicks(data.exercises));
    } catch {
      /* host page surfaces connection issues elsewhere */
    }
  };

  /* The exercise library is only needed once the athlete starts editing, so it
     is fetched then — a read-only split view costs no extra request. */
  const fetchLibrary = async () => {
    if (library.length > 0) return;
    try {
      const res = await fetch("/api/exercises");
      if (!res.ok) return;
      const list = await res.json();
      if (Array.isArray(list)) {
        setLibrary(
          list.map((ex) => ({ id: String(ex._id), name: ex.name, group: ex.muscleGroup }))
        );
      }
    } catch {
      /* the day's exercise list simply stays empty */
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/workout-templates");
      if (res.ok) setTemplates(await res.json());
    } catch {
      /* gallery is optional chrome — stale list is fine */
    }
    setTemplatesFetched(true);
  };

  useEffect(() => {
    if (selfFetched.current) return;
    selfFetched.current = true;
    fetchSchedule();
  }, []);

  const commit = (nextDays, nextSource, message) => {
    setDays(nextDays);
    setSource(nextSource);
    pushToast?.(message);
  };

  const handleApplyTemplate = async (templateId) => {
    setSaving(true);
    try {
      const res = await fetch("/api/workout-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyTemplateId: templateId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushToast?.(data.error || "Couldn't apply that template.", "error");
        return;
      }
      const nextDays = data.days || {};
      setShowGallery(false);
      setPicks(normalizePicks(data.exercises)); // a new split starts with no picks
      commit(nextDays, data.sourceTemplateName || null, `Switched to the ${data.sourceTemplateName} split.`);
    } catch {
      pushToast?.("Couldn't apply that template. Check your connection and retry.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/workout-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: draft, exercises: draftPicks }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushToast?.(data.error || "Couldn't save your split.", "error");
        return;
      }
      setEditing(false);
      setPicks(normalizePicks(data.exercises));
      commit(data.days || {}, null, "Training split saved.");
    } catch {
      pushToast?.("Couldn't save your split. Check your connection and retry.", "error");
    } finally {
      setSaving(false);
    }
  };

  const openGallery = async () => {
    const next = !showGallery;
    setShowGallery(next);
    if (next && !templatesFetched) await fetchTemplates();
  };

  const startEditing = () => {
    setDraft({ ...(days || {}) });
    setDraftPicks({ ...picks });
    setSelectedDay(todayName);
    setPickerOpen(false);
    setPickerQuery("");
    setEditing(true);
    setShowGallery(false);
    fetchLibrary();
  };

  /* One rule for assigning groups, wherever it is triggered from: a day always
     keeps at least one entry, never more than four, and Rest Day clears the rest. */
  const toggleGroup = (day, group) => {
    setDraft((prev) => {
      const current = prev[day] || [];
      const selected = current.includes(group);
      let next;
      if (selected) {
        next = current.filter((g) => g !== group);
        if (next.length === 0) next = ["Rest Day"];
      } else {
        next = [...current.filter((g) => g !== "Rest Day"), group].slice(0, 4);
      }
      return { ...prev, [day]: next };
    });
    /* A curated exercise list is expressed against the old groups, so it is
       dropped here and the day falls back to the new groups' exercises. */
    setDraftPicks((prev) => {
      if (!(day in prev)) return prev;
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  /* ---- Day exercises ------------------------------------------------- */

  const groupsFor = (day) => {
    const groups = (editing ? draft[day] : viewDays[day]) || ["Rest Day"];
    return groups.includes("Rest Day") ? [] : groups;
  };

  /* Composite day names (Push, Pull, …) expand into the granular groups the
     library tags, exactly as the gym page does when it builds a session. */
  const expandDay = (day) => [
    ...new Set(groupsFor(day).flatMap((g) => COMPOSITE_GROUP_EXPANSIONS[g] || [g])),
  ];

  const derivedIds = (day) => {
    const groups = expandDay(day);
    return library.filter((ex) => groups.includes(ex.group)).map((ex) => ex.id);
  };

  /* What the day's list shows right now: the athlete's own picks once they
     have made any, otherwise every exercise their muscle groups pull in. */
  const listForDay = (day) =>
    Array.isArray(draftPicks[day]) ? draftPicks[day] : derivedIds(day);

  const removeExercise = (day, id) => {
    setDraftPicks((prev) => ({
      ...prev,
      [day]: listForDay(day).filter((x) => x !== id),
    }));
  };

  const addExercise = (day, id) => {
    setDraftPicks((prev) => {
      const base = Array.isArray(prev[day]) ? prev[day] : derivedIds(day);
      return base.includes(id) ? prev : { ...prev, [day]: [...base, id] };
    });
  };

  const togglePicker = () => {
    const next = !pickerOpen;
    setPickerOpen(next);
    if (next) {
      setPickerQuery("");
      fetchLibrary();
    }
  };

  const viewDays = days || {};

  /* Add-exercise results: never what the day already has, matching the search
     on either the movement or its muscle, and led by the day's own groups so
     the common case needs no typing. */
  const pickerOptions = (() => {
    if (library.length === 0) return [];
    const chosen = new Set(listForDay(activeDay));
    const own = new Set(expandDay(activeDay));
    const q = pickerQuery.trim().toLowerCase();
    const ownRank = (ex) => (own.has(ex.group) ? 0 : 1);

    return library
      .filter((ex) => !chosen.has(ex.id))
      .filter(
        (ex) =>
          !q || ex.name.toLowerCase().includes(q) || ex.group.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          ownRank(a) - ownRank(b) ||
          a.group.localeCompare(b.group) ||
          a.name.localeCompare(b.name)
      )
      .slice(0, 40);
  })();

  const subline = editing
    ? "Pick a day, set its muscle groups, then add or remove its exercises."
    : showGallery
      ? "Start from a published split — you can edit it afterwards."
      : "The weekly pattern your gym sessions follow.";

  return (
    <div className="splitmgr">
      <style>{SPLIT_CSS}</style>

      <div className="sm-h">
        <div>
          <h2 id="acc-training-h">Training split</h2>
          <p className="sm-sub">{subline}</p>
        </div>
        <div className="sm-acts">
          {editing ? (
            <>
              <button type="button" onClick={() => setEditing(false)} disabled={saving} className="sm-btn">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="sm-btn sm-btn-primary">
                {saving ? "Saving…" : "Save split"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={openGallery} aria-expanded={showGallery} className="sm-btn">
                {showGallery ? "Close" : "Templates"}
              </button>
              <button type="button" onClick={startEditing} className="sm-btn">
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sm-sheet">
        {showGallery && !editing ? (
          <div className="sm-tpls">
            <p className="sm-tpls-k">Published templates</p>
            {templates.length === 0 ? (
              <p className="sm-empty">No templates published yet.</p>
            ) : (
              templates.map((tpl) => (
                <div key={tpl._id} className="sm-tpl">
                  <div className="sm-tpl-t">
                    <b>
                      {tpl.name}
                      {tpl.isDefault && <span className="sm-tag">Default</span>}
                    </b>
                    <p>
                      {tpl.description ||
                        SPLIT_DAYS.map((d) => {
                          const g = tpl.days?.[d] || [];
                          return g.length > 0 ? `${d.slice(0, 3)} ${g.join("/")}` : null;
                        })
                          .filter(Boolean)
                          .join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl._id)}
                    disabled={saving}
                    className="sm-btn"
                  >
                    Use
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="sm-week" role={editing ? "group" : "list"} aria-label="Weekly training split">
              {SPLIT_DAYS.map((day) => {
                const groups = (editing ? draft[day] : viewDays[day]) || ["Rest Day"];
                const isRest = groups.includes("Rest Day");
                const isToday = day === todayName;
                const className =
                  "sm-day" + (isRest ? " rest" : "") + (isToday ? " today" : "");
                const label = `${day}: ${isRest ? "Rest" : groups.join(" and ")}`;
                const body = (
                  <>
                    <b>
                      <i aria-hidden="true" />
                      {day.slice(0, 3)}
                    </b>
                    <span>{isRest ? "Rest" : groups.join(" & ")}</span>
                  </>
                );

                if (editing) {
                  return (
                    <button
                      key={day}
                      type="button"
                      className={className}
                      aria-pressed={activeDay === day}
                      aria-label={label}
                      onClick={() => {
                        setSelectedDay(day);
                        setPickerOpen(false);
                        setPickerQuery("");
                      }}
                    >
                      {body}
                    </button>
                  );
                }
                return (
                  <div key={day} className={className} role="listitem" aria-label={label}>
                    {body}
                  </div>
                );
              })}
            </div>

            {editing && (
              <div className="sm-editor">
                <div className="sm-editor-h">
                  <span className="sm-editor-k">{activeDay}</span>
                  <span className="sm-editor-n">Up to four groups</span>
                </div>
                <div className="sm-chips">
                  {SPLIT_GROUPS.map((group) => {
                    const selected = (draft[activeDay] || []).includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        className="sm-chip"
                        aria-pressed={selected}
                        onClick={() => toggleGroup(activeDay, group)}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>

                <div className="sm-ex-h">
                  <span className="sm-editor-k">Exercises</span>
                  <span className="sm-editor-n">
                    {listForDay(activeDay).length} on this day
                  </span>
                </div>

                {library.length === 0 ? (
                  <p className="sm-ex-empty">Loading the exercise library…</p>
                ) : (
                  <>
                    <ul className="sm-ex">
                      {listForDay(activeDay).map((id) => {
                        const exercise = library.find((ex) => ex.id === id);
                        if (!exercise) return null;
                        return (
                          <li key={id} className="sm-ex-row">
                            <span className="sm-ex-n">{exercise.name}</span>
                            <span className="sm-ex-g">{exercise.group}</span>
                            <button
                              type="button"
                              className="sm-ex-x"
                              onClick={() => removeExercise(activeDay, id)}
                              aria-label={`Remove ${exercise.name} from ${activeDay}`}
                            >
                              ×
                            </button>
                          </li>
                        );
                      })}
                      {listForDay(activeDay).length === 0 && (
                        <li className="sm-ex-empty">
                          Nothing on this day yet — add an exercise below.
                        </li>
                      )}
                    </ul>

                    <div className="sm-ex-foot">
                      <button
                        type="button"
                        className="sm-btn"
                        onClick={togglePicker}
                        aria-expanded={pickerOpen}
                      >
                        {pickerOpen ? "Close library" : "Add exercise"}
                      </button>
                      {Array.isArray(draftPicks[activeDay]) && (
                        <p className="sm-ex-note">
                          Custom list · changing muscle groups resets it
                        </p>
                      )}
                    </div>

                    {pickerOpen && (
                      <div className="sm-pick">
                        <input
                          className="sm-pick-in"
                          type="search"
                          placeholder="Search exercises"
                          value={pickerQuery}
                          onChange={(e) => setPickerQuery(e.target.value)}
                          aria-label="Search exercises"
                          autoFocus
                        />
                        <div className="sm-pick-list">
                          {pickerOptions.length === 0 ? (
                            <p className="sm-pick-empty">
                              {pickerQuery
                                ? "No exercise matches that search."
                                : "Every exercise here is already on this day."}
                            </p>
                          ) : (
                            pickerOptions.map((exercise) => (
                              <button
                                key={exercise.id}
                                type="button"
                                className="sm-pick-row"
                                onClick={() => addExercise(activeDay, exercise.id)}
                              >
                                <span className="sm-ex-n">{exercise.name}</span>
                                <span className="sm-ex-g">{exercise.group}</span>
                                <span className="sm-pick-add">Add</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {!editing && source && (
              <p className="sm-source">
                Based on <b>{source}</b>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
