"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { useRouter, useParams } from "next/navigation";
import Loader from "@/components/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ============ Meridian Admin — theme tokens (mirror of the dashboard systems) ============ */
const ADM_CSS = `
.adm *{box-sizing:border-box}
.adm{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--track:#efefec;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--green:#047857;--green-soft:#ecfdf5;--red-soft:#fef2f2;--red-soft-b:#fecaca;--pro:#7c3aed;--pro-soft:#f5f3ff;--car:#b45309;--car-soft:#fffbeb;color:var(--t1);font-family:inherit}
html[data-theme="dark"] .adm{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--track:#2e2e34;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--green:#34d399;--green-soft:#0d2a22;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--pro:#a78bfa;--pro-soft:#2b2140;--car:#fbbf24;--car-soft:#3a2d10}
.adm-head{margin-bottom:28px}
.adm-crumb{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--t3);text-transform:uppercase;margin-bottom:6px}
.adm-h1{font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin:0}
.adm-sub{font-size:13px;font-weight:500;color:var(--t2);margin-top:4px}
.adm-ava{width:56px;height:56px;border-radius:14px;background:var(--ac-soft);color:var(--ac);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;flex-shrink:0}
.adm-grid{display:grid;grid-template-columns:1fr;gap:16px}
@media(min-width:768px){.adm-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.adm-grid{grid-template-columns:repeat(4,1fr)}}
.adm-stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.adm-stat-lbl{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3)}
.adm-stat-lbl svg{color:var(--t2)}
.adm-stat b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin-top:10px;font-variant-numeric:tabular-nums}
.adm-stat small{display:block;font-size:11px;font-weight:600;color:var(--t3);margin-top:4px}
.adm-card{background:var(--card);border:1px solid var(--line);border-radius:14px}
.adm-sec{padding:20px}
.adm-sec h3{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--t1);margin:0 0 16px}
.adm-m4{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:768px){.adm-m4{grid-template-columns:repeat(4,1fr)}}
.adm-metric{text-align:center;padding:16px 12px;background:var(--sunken);border-radius:11px}
.adm-metric span{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)}
.adm-metric b{display:block;font-size:22px;font-weight:800;color:var(--t1);margin-top:5px;font-variant-numeric:tabular-nums}
.adm-metric b.cal{color:var(--car)}
.adm-metric b.pro{color:var(--pro)}
.adm-metric b.car{color:var(--car)}
.adm-metric b.fat{color:var(--green)}
.adm-logs{display:flex;flex-direction:column;gap:12px}
.adm-log{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;cursor:pointer;transition:border-color .15s ease}
.adm-log:hover{border-color:var(--ac-soft-b)}
.adm-log-date{font-size:14px;font-weight:700;color:var(--t1);margin:0}
.adm-log-sub{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--t3);margin-top:3px}
.adm-log-grid{display:grid;grid-template-columns:repeat(4,auto);gap:22px}
.adm-log-grid span{display:block;font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--t3)}
.adm-log-grid b{display:block;font-size:15px;font-weight:800;color:var(--t1);font-variant-numeric:tabular-nums;margin-top:2px}
.adm-log-grid b.cal{color:var(--car)}
.adm-log-grid b.pro{color:var(--pro)}
.adm-log-grid b.car{color:var(--car)}
.adm-log-grid b.fat{color:var(--green)}
.adm-meal{display:flex;justify-content:space-between;align-items:center;gap:14px;background:var(--sunken);padding:13px 15px;border-radius:11px;margin-bottom:8px}
.adm-meal b{font-size:13px;font-weight:700;color:var(--t1)}
.adm-meal p{font-size:12px;font-weight:500;color:var(--t3);margin:2px 0 0}
.adm-meal-v{display:flex;gap:14px;font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}
.adm-meal-v .cal{color:var(--car)}
.adm-meal-v .pro{color:var(--pro)}
.adm-meal-v .car{color:var(--car)}
.adm-meal-v .fat{color:var(--green)}
.adm-empty{padding:34px 16px;text-align:center;font-size:13px;font-weight:500;color:var(--t3);background:var(--sunken);border-radius:12px}
@media(prefers-reduced-motion:reduce){.adm *{transition:none!important;animation:none!important}}
`;

/* Meridian stroke icons */
const I = {
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
  ),
  flame: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
  ),
  bolt: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
  ),
  dumbbell: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  ),
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
  ),
};

/* Meridian theme-aware chart chrome (resolved client-side only) */
const useChartChrome = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => setDark(document.documentElement.dataset.theme === "dark");
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return {
    grid: dark ? "#26262b" : "#e7e7e3",
    axis: dark ? "#3a3a42" : "#c5c5c0",
    tick: dark ? "#8b8b96" : "#6b6b76",
    tooltipBg: dark ? "#1c1c1f" : "#ffffff",
    tooltipBorder: dark ? "#2a2a30" : "#e7e7e3",
    tooltipText: dark ? "#f0f0f2" : "#1a1a1e",
    cal: dark ? "#fbbf24" : "#b45309",
    pro: dark ? "#a78bfa" : "#7c3aed",
    car: dark ? "#fbbf24" : "#b45309",
    fat: dark ? "#34d399" : "#047857",
  };
};

export default function UserDetailPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  const chrome = useChartChrome();

  const [userData, setUserData] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeSplit, setActiveSplit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      
      if (res.ok) {
        setUserData(data.user);
        setDailyLogs(data.dailyLogs);
        setStats(data.stats);
        setActiveSplit(data.activeSplit);
      } else {
        alert("Failed to fetch user data");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to fetch user data");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (authUser && authUser.isAdmin && userId) {
      fetchUserData();
    }
  }, [authUser, userId, fetchUserData]);

  const getChartData = () => {
    return dailyLogs
      .slice(0, 30)
      .reverse()
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calories: log.totalMacros?.calories || 0,
        protein: log.totalMacros?.protein || 0,
        carbs: log.totalMacros?.carbs || 0,
        fats: log.totalMacros?.fats || 0,
      }));
  };

  if (loading) {
    return <Loader />;
  }

  if (!userData) {
    return null;
  }

  return (
    <AppShell
      variant="admin"
      navSlot={
        <button
          onClick={() => router.push("/admin")}
          className="adm-ghost"
          style={{ height: 36, padding: "0 14px" }}
        >
          {I.arrow} Dashboard
        </button>
      }
    >
      <style>{ADM_CSS}</style>

      <div className="adm ng-container py-8">
        {/* User info card */}
        <div className="adm-card adm-form" style={{ marginBottom: 28 }}>
          <div className="flex items-center gap-5">
            <div className="adm-ava">{userData.name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <h1 className="adm-h1" style={{ fontSize: 22 }}>{userData.name}</h1>
              <p className="adm-sub">{userData.email}</p>
              <p className="adm-log-sub" style={{ marginTop: 6 }}>
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics grid */}
        <div className="adm-grid" style={{ marginBottom: 28 }}>
          <div className="adm-stat">
            <div className="adm-stat-lbl">{I.calendar} Days logged</div>
            <b>{stats.totalDaysLogged}</b>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-lbl">{I.flame} Current streak</div>
            <b>{stats.currentStreak}</b>
            <small>Longest: {stats.longestStreak} days</small>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-lbl">{I.bolt} Avg calories</div>
            <b>{stats.averageCalories}</b>
            <small>per day</small>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-lbl">{I.dumbbell} Avg protein</div>
            <b>{stats.averageProtein}g</b>
            <small>per day</small>
          </div>
        </div>

        {/* Average daily macros */}
        <div className="adm-card adm-sec" style={{ marginBottom: 28 }}>
          <h3>Average daily macros</h3>
          <div className="adm-m4">
            <div className="adm-metric"><span>Calories</span><b className="cal">{stats.averageCalories}</b></div>
            <div className="adm-metric"><span>Protein</span><b className="pro">{stats.averageProtein}g</b></div>
            <div className="adm-metric"><span>Carbs</span><b className="car">{stats.averageCarbs}g</b></div>
            <div className="adm-metric"><span>Fats</span><b className="fat">{stats.averageFats}g</b></div>
          </div>
        </div>

        {/* Training split & goals */}
        <div className="adm-card adm-sec" style={{ marginBottom: 28 }}>
          <h3>Training split &amp; goals</h3>
          <div className="adm-m4">
            <div className="adm-metric">
              <span>Active split</span>
              <b>{activeSplit?.sourceTemplateName || (activeSplit ? "Custom" : "None selected")}</b>
            </div>
            <div className="adm-metric"><span>Calorie goal</span><b className="cal">{userData.macroGoals?.calories ?? "—"}</b></div>
            <div className="adm-metric"><span>Protein goal</span><b className="pro">{userData.macroGoals?.protein != null ? `${userData.macroGoals.protein}g` : "—"}</b></div>
            <div className="adm-metric"><span>Target weight</span><b>{userData.targetWeight != null ? `${userData.targetWeight} kg` : "—"}</b></div>
          </div>
          {activeSplit && (
            <p className="adm-sub" style={{ marginTop: 10 }}>
              {Object.entries(activeSplit.days)
                .map(([day, groups]) => `${day}: ${groups.length === 1 && groups[0] === "Rest Day" ? "Rest" : groups.join(" / ")}`)
                .join(" · ")}
            </p>
          )}
        </div>

        {/* Charts */}
        {dailyLogs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: 28 }}>
            {/* Calories chart */}
            <div className="adm-card adm-sec">
              <h3>Calorie trend (30 days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: chrome.tick }} stroke={chrome.axis} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: chrome.tick }} stroke={chrome.axis} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chrome.tooltipBg,
                      borderColor: chrome.tooltipBorder,
                      color: chrome.tooltipText,
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Line type="monotone" dataKey="calories" stroke={chrome.cal} strokeWidth={2.5} dot={{ fill: chrome.cal, strokeWidth: 0, r: 3 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macros chart */}
            <div className="adm-card adm-sec">
              <h3>Macros distribution (30 days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: chrome.tick }} stroke={chrome.axis} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: chrome.tick }} stroke={chrome.axis} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chrome.tooltipBg,
                      borderColor: chrome.tooltipBorder,
                      color: chrome.tooltipText,
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12 }} />
                  <Bar dataKey="protein" fill={chrome.pro} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" fill={chrome.car} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fats" fill={chrome.fat} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Daily logs history */}
        <div className="adm-card adm-sec">
          <h3>Daily logs history</h3>

          {dailyLogs.length === 0 ? (
            <div className="adm-empty">
              {I.note} No logs yet for this user.
            </div>
          ) : (
            <div className="adm-logs">
              {dailyLogs.map((log) => (
                <div
                  key={log._id}
                  className="adm-log"
                  onClick={() =>
                    setSelectedLog(selectedLog?._id === log._id ? null : log)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedLog(selectedLog?._id === log._id ? null : log);
                    }
                  }}
                  aria-expanded={selectedLog?._id === log._id}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <p className="adm-log-date">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="adm-log-sub">{log.meals.length} meals logged</p>
                    </div>
                    <div className="adm-log-grid">
                      <div><span>Cals</span><b className="cal">{log.totalMacros?.calories || 0}</b></div>
                      <div><span>Pro</span><b className="pro">{log.totalMacros?.protein || 0}g</b></div>
                      <div><span>Carbs</span><b className="car">{log.totalMacros?.carbs || 0}g</b></div>
                      <div><span>Fats</span><b className="fat">{log.totalMacros?.fats || 0}g</b></div>
                    </div>
                  </div>

                  {/* Expanded meal details */}
                  {selectedLog?._id === log._id && (
                    <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--line)" }}>
                      <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--t3)", margin: "0 0 12px" }}>
                        Meals breakdown
                      </h4>
                      <div>
                        {log.meals.map((mealEntry, idx) => (
                          <div key={idx} className="adm-meal">
                            <div>
                              <b>{mealEntry.mealName || mealEntry.meal?.name}</b>
                              <p>
                                {mealEntry.mealType.charAt(0).toUpperCase() +
                                  mealEntry.mealType.slice(1)}{" "}
                                • Quantity: {mealEntry.quantity}
                              </p>
                            </div>
                            <div className="adm-meal-v">
                              <span className="cal">{mealEntry.macros?.calories || 0} cal</span>
                              <span className="pro">{mealEntry.macros?.protein || 0}g P</span>
                              <span className="car">{mealEntry.macros?.carbs || 0}g C</span>
                              <span className="fat">{mealEntry.macros?.fats || 0}g F</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
