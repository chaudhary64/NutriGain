"use client";

import { useEffect, useRef, useState } from "react";

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

const SPLIT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPLIT_GROUPS = [
  "Abs", "Back", "Bicep", "Chest", "Forearms", "Legs", "Shoulders", "Tricep",
  "Push", "Pull", "Upper Body", "Lower Body", "Full Body", "Rest Day",
];

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
    } catch {
      /* host page surfaces connection issues elsewhere */
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
        body: JSON.stringify({ days: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushToast?.(data.error || "Couldn't save your split.", "error");
        return;
      }
      setEditing(false);
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
    setSelectedDay(todayName);
    setEditing(true);
    setShowGallery(false);
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
  };

  const viewDays = days || {};
  const subline = editing
    ? "Pick a day on the strip, then assign its muscle groups."
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
                      onClick={() => setSelectedDay(day)}
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
