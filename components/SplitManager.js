"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Training-split manager, rendered on the profile page. Renders the current
 * week view, a template gallery (admin-curated, one-click fork), and a
 * day-by-group custom editor. The gym page only reads the schedule to build
 * today's session, so editing lives here and nowhere else.
 *
 * Data flow: the component owns the schedule API calls (GET on mount, PUT to
 * apply a template or save custom days).
 */

const SPLIT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPLIT_GROUPS = [
  "Abs", "Back", "Bicep", "Chest", "Forearms", "Legs", "Shoulders", "Tricep",
  "Push", "Pull", "Upper Body", "Lower Body", "Full Body", "Rest Day",
];

const SPLIT_CSS = `
.splitmgr{color:var(--t1)}
.splitmgr .sm-card{background:var(--card);border:1px solid var(--line);border-radius:12px}
.splitmgr .sm-card-h{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap}
.splitmgr .sm-card-h :is(h2,h3){font-size:13px;font-weight:600;letter-spacing:-.01em;color:var(--t1);display:flex;align-items:center;gap:10px;margin:0}
.splitmgr .sm-btn{appearance:none;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:500;letter-spacing:-.01em;line-height:20px;padding:6px 12px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t1);cursor:pointer;transition:background .15s ease,color .15s ease,border-color .15s ease}
.splitmgr .sm-btn:hover{background:var(--sunken)}
.splitmgr .sm-btn:disabled{opacity:.5;cursor:default}
.splitmgr .sm-btn-primary{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.splitmgr .sm-btn-primary:hover{background:var(--ach);border-color:var(--ach)}
.splitmgr .sm-body{padding:18px}
.splitmgr .sm-provenance{margin:0 0 10px;font-size:12px;color:var(--t2)}
.splitmgr .sm-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
@media (max-width:640px){.splitmgr .sm-grid{grid-template-columns:repeat(4,1fr)}}
.splitmgr .sm-day{display:flex;flex-direction:column;gap:3px;padding:9px 8px;border:1px solid var(--line);border-radius:6px;background:var(--card)}
.splitmgr .sm-day b{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.splitmgr .sm-day span{font-size:12px;font-weight:500;color:var(--t1);line-height:1.35}
.splitmgr .sm-day.rest span{color:var(--t3)}
.splitmgr .sm-day.today{border-color:var(--t1);background:var(--sunken)}
.splitmgr .sm-day.today b{color:var(--t1)}
.splitmgr .sm-edit-grid{display:flex;flex-direction:column;gap:10px}
.splitmgr .sm-edit-row{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:center}
.splitmgr .sm-edit-row>b{font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)}
.splitmgr .sm-chips{display:flex;flex-wrap:wrap;gap:6px}
.splitmgr .sm-chip{appearance:none;font-family:inherit;font-size:12px;font-weight:500;padding:5px 10px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--t2);cursor:pointer;transition:background .15s ease,color .15s ease,border-color .15s ease}
.splitmgr .sm-chip:hover{border-color:var(--t1);color:var(--t1)}
.splitmgr .sm-chip[aria-pressed="true"]{background:var(--ac);border-color:var(--ac);color:var(--on-ac)}
.splitmgr .sm-gallery{margin-top:14px;display:grid;gap:10px;border-top:1px solid var(--line);padding-top:14px}
.splitmgr .sm-tpl{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.splitmgr .sm-tpl b{display:block;font-size:13px;font-weight:600;letter-spacing:-.01em;color:var(--t1)}
.splitmgr .sm-tpl p{font-size:12px;font-weight:400;color:var(--t2);margin:2px 0 0}
.splitmgr .sm-ic{width:16px;height:16px;flex-shrink:0}
`;

const SmIcon = ({ d }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="sm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const DUMBBELL = <><path d="M6.5 6.5v11" /><path d="M17.5 6.5v11" /><path d="M3 9v6" /><path d="M21 9v6" /><path d="M6.5 12h11" /></>;
const LAYOUT = <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>;

export default function SplitManager({ pushToast }) {
  const [days, setDays] = useState(null); // null = still loading
  const [source, setSource] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesFetched, setTemplatesFetched] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const selfFetched = useRef(false);

  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

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
    setEditing(true);
    setShowGallery(false);
  };

  const viewDays = days || {};

  return (
    <div className="splitmgr">
      <style>{SPLIT_CSS}</style>
      <div className="sm-card">
        <div className="sm-card-h">
          <h3>
            <span style={{ color: "var(--ac)" }}><SmIcon d={DUMBBELL} /></span>
            Training split
          </h3>
          {editing ? (
            <span style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditing(false)} disabled={saving} className="sm-btn" type="button">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="sm-btn sm-btn-primary" type="button">
                {saving ? "Saving…" : "Save"}
              </button>
            </span>
          ) : (
            <span style={{ display: "flex", gap: 8 }}>
              <button onClick={openGallery} className="sm-btn" type="button">
                <SmIcon d={LAYOUT} />
                Templates
              </button>
              <button onClick={startEditing} className="sm-btn" type="button">
                Edit
              </button>
            </span>
          )}
        </div>
        <div className="sm-body">
          {source && !editing && (
            <p className="sm-provenance">
              Based on <b style={{ color: "var(--t2)", fontWeight: 500 }}>{source}</b> — edit freely, it&apos;s yours now.
            </p>
          )}
          {!editing ? (
            <div className="sm-grid">
              {SPLIT_DAYS.map((day) => {
                const groups = viewDays[day] || ["Rest Day"];
                const isRest = groups.includes("Rest Day");
                return (
                  <div key={day} className={`sm-day${isRest ? " rest" : ""}${day === SPLIT_DAYS[todayIdx] ? " today" : ""}`}>
                    <b>{day.slice(0, 3)}</b>
                    <span>{isRest ? "Rest" : groups.join(" & ")}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sm-edit-grid">
              {SPLIT_DAYS.map((day) => (
                <div key={day} className="sm-edit-row">
                  <b>{day.slice(0, 3)}</b>
                  <div className="sm-chips">
                    {SPLIT_GROUPS.map((group) => {
                      const selected = (draft[day] || []).includes(group);
                      return (
                        <button
                          key={group}
                          type="button"
                          className="sm-chip"
                          aria-pressed={selected}
                          onClick={() => {
                            setDraft((prev) => {
                              const current = prev[day] || [];
                              let next;
                              if (selected) {
                                next = current.filter((g) => g !== group);
                                if (next.length === 0) next = ["Rest Day"];
                              } else {
                                next = [...current.filter((g) => g !== "Rest Day"), group].slice(0, 4);
                              }
                              return { ...prev, [day]: next };
                            });
                          }}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showGallery && !editing && (
            <div className="sm-gallery">
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--t3)" }}>
                Start from a template
              </p>
              {templates.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--t2)" }}>No templates published yet.</p>
              ) : (
                templates.map((tpl) => (
                  <div key={tpl._id} className="sm-tpl">
                    <div style={{ minWidth: 0 }}>
                      <b>
                        {tpl.name}
                        {tpl.isDefault ? " · default" : ""}
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
                      onClick={() => handleApplyTemplate(tpl._id)}
                      disabled={saving}
                      className="sm-btn sm-btn-primary"
                      style={{ padding: "7px 14px", flexShrink: 0 }}
                      type="button"
                    >
                      Use
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
