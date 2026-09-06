"use client";

import { useEffect, useState, cloneElement } from "react";
import { useAuth } from "@/context/AuthContext";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { format, parseISO, startOfYear } from "date-fns";
import { mergeSessionsIntoHeatmap } from "@/lib/heatmap";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Helper for title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function GymTrackingPage() {
  const { user, checkAuth } = useAuth();

  // Data State
  const [exercises, setExercises] = useState([]);
  const [workoutSchedule, setWorkoutSchedule] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [gymHistory, setGymHistory] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [todaySession, setTodaySession] = useState(null);
  const [yearSessions, setYearSessions] = useState([]); // lean sessions feeding the heatmap
  const [setDrafts, setSetDrafts] = useState({}); // exerciseId -> [{weight, reps}]
  const [savingExercise, setSavingExercise] = useState(null); // exerciseId being saved
  const [savedExercises, setSavedExercises] = useState({}); // exerciseId -> true (flash)
  const [newPRs, setNewPRs] = useState({}); // exerciseId -> { newPR, previousPR }
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [activeTab, setActiveTab] = useState("exercises");

  // Stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayGymStatus, setTodayGymStatus] = useState("not-completed");
  const [targetWeight, setTargetWeight] = useState(75);

  // Forms
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [prExercise, setPrExercise] = useState(null); // exerciseId whose PR chart is open
  const [prSeries, setPrSeries] = useState([]);

  // Initial Fetch Setup
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchData();
    }
  }, [user]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
        if (user && !user.isAdmin) {
          fetchData();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const fetchData = async () => {
    // Only set loading on initial mount
    if (loading) setLoading(true);

    await Promise.all([fetchGymData(), fetchWeightData(), fetchGymHistory(), fetchSession(), fetchYearSessions()]);

    setLoading(false);
  };

  const fetchGymHistory = async () => {
    try {
      const res = await fetch(`/api/daily-log?date=${currentDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data.gymHistory) {
          setGymHistory(data.gymHistory);
          calculateStreaks(data.gymHistory);
        }
        if (data.dailyLog) {
          setTodayGymStatus(data.dailyLog.gymStatus || "not-completed");
        }
      }
    } catch (error) {
      console.error("Error fetching gym history:", error);
    }
  };

  const fetchGymData = async () => {
    try {
      const [exercisesRes, scheduleRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/workout-schedule"),
      ]);

      const exercisesData = await exercisesRes.json();
      const scheduleData = await scheduleRes.json();

      if (Array.isArray(exercisesData)) setExercises(exercisesData);

      if (Array.isArray(scheduleData)) {
        const validMuscleGroups = [
          "Abs",
          "Back",
          "Bicep",
          "Chest",
          "Forearms",
          "Legs",
          "Rest Day",
          "Shoulders",
          "Tricep",
        ];
        const dayOrder = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const filteredSchedule = scheduleData
          .map((s) => ({
            ...s,
            muscleGroups: (s.muscleGroups || []).filter((g) =>
              validMuscleGroups.includes(g),
            ),
          }))
          .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        setWorkoutSchedule(filteredSchedule);
      }
    } catch (error) {
      console.error("Error fetching gym data:", error);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/workout-sessions?date=${currentDate}`);
      if (res.ok) {
        const data = await res.json();
        setTodaySession(data.session || null);
      }
    } catch (error) {
      console.error("Error fetching workout session:", error);
    }
  };

  const fetchYearSessions = async () => {
    try {
      const from = format(startOfYear(new Date()), "yyyy-MM-dd");
      const to = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(`/api/workout-sessions?from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setYearSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching year sessions:", error);
    }
  };

  const fetchWeightData = async () => {
    try {
      const res = await fetch("/api/weight");
      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
        setTargetWeight(data.targetWeight || 75);
      }
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };

  const calculateStreaks = (history) => {
    if (!history || history.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const completedDates = new Set(
      history
        .filter(
          (log) =>
            log.gymStatus === "completed" ||
            log.gymStatus === "partially-completed",
        )
        .map((log) => log.date),
    );

    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = format(checkDate, "yyyy-MM-dd");

      if (completedDates.has(dateStr)) {
        current++;
      } else if (i > 0) {
        break;
      }
    }

    let longest = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(completedDates).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round(
          (currDate - prevDate) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longest = Math.max(longest, tempStreak);

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const handleGymStatusUpdate = async (status) => {
    try {
      const res = await fetch("/api/daily-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymStatus: status,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayGymStatus(status);
        setShowStatusDropdown(false);
        if (data.gymHistory) {
          setGymHistory(data.gymHistory);
          calculateStreaks(data.gymHistory);
        }
      }
    } catch (error) {
      console.error("Error updating gym status:", error);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || !newWeightDate) return;

    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          date: newWeightDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
        setNewWeight("");
      }
    } catch (error) {
      console.error("Error adding weight:", error);
    }
  };

  const handleDeleteWeight = async (entryId) => {
    if (!confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`/api/weight/${entryId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- Workout sessions (numeric sets) ----------

  const getSetsFor = (exerciseId) => {
    if (setDrafts[exerciseId] !== undefined) return setDrafts[exerciseId];
    const logged = (todaySession?.exercises || []).find(
      (e) => e.exercise === exerciseId || e.exercise?.toString() === exerciseId,
    );
    return logged?.sets?.length ? [...logged.sets] : [{ weight: "", reps: "" }];
  };

  const updateSet = (exerciseId, index, field, value) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      const sets = base.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, [exerciseId]: sets };
    });
  };

  const addSetRow = (exerciseId) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      return { ...prev, [exerciseId]: [...base, { weight: "", reps: "" }] };
    });
  };

  const removeSetRow = (exerciseId, index) => {
    setSetDrafts((prev) => {
      const base = prev[exerciseId] !== undefined ? prev[exerciseId] : getSetsFor(exerciseId);
      const sets = base.filter((_, i) => i !== index);
      return { ...prev, [exerciseId]: sets.length > 0 ? sets : [{ weight: "", reps: "" }] };
    });
  };

  const handleSaveSessionSets = async (exerciseId) => {
    setSavingExercise(exerciseId);
    try {
      const draft = setDrafts[exerciseId] ?? getSetsFor(exerciseId);
      const sets = draft
        .map((s) => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps, 10) }))
        .filter(
          (s) =>
            Number.isFinite(s.weight) && s.weight >= 0 && Number.isInteger(s.reps) && s.reps >= 0,
        );

      if (sets.length === 0) {
        alert("Add at least one set with a valid weight and reps.");
        return;
      }

      const res = await fetch("/api/workout-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: currentDate,
          mode: "replace",
          exercises: [{ exercise: exerciseId, sets }],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTodaySession(data.session || null);
        setSetDrafts((prev) => {
          const next = { ...prev };
          delete next[exerciseId];
          return next;
        });
        setSavedExercises((prev) => ({ ...prev, [exerciseId]: true }));
        setTimeout(() => setSavedExercises((prev) => ({ ...prev, [exerciseId]: false })), 2500);

        if (data.prs && data.prs.length > 0) {
          const pr = data.prs.find((p) => p.exerciseId === exerciseId);
          if (pr) setNewPRs((prev) => ({ ...prev, [exerciseId]: pr }));
          // Refresh plan/PR data and the heatmap so the new PR shows everywhere.
          fetchGymData();
          fetchGymHistory();
        }
        fetchYearSessions();
      } else {
        alert(data.error || "Failed to save sets");
      }
    } catch (error) {
      console.error("Error saving sets:", error);
      alert("Network error. Please try again.");
    } finally {
      setSavingExercise(null);
    }
  };

  const handleClearSession = async () => {
    if (!confirm("Clear all logged sets for this day?")) return;
    try {
      const res = await fetch(`/api/workout-sessions?date=${currentDate}`, { method: "DELETE" });
      if (res.ok) {
        setTodaySession(null);
        setSetDrafts({});
        setNewPRs({});
        fetchGymHistory();
        fetchYearSessions();
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const handleOpenPRChart = async (exerciseId) => {
    if (prExercise === exerciseId) {
      setPrExercise(null);
      return;
    }
    setPrExercise(exerciseId);
    try {
      const res = await fetch(`/api/workout-sessions?exerciseId=${exerciseId}&months=6`);
      if (res.ok) {
        const data = await res.json();
        setPrSeries(data.series || []);
      }
    } catch (error) {
      console.error("Error fetching PR series:", error);
      setPrSeries([]);
    }
  };

  /** "2× 60kg · 50kg" style summary of a numeric sets array. */
  const formatSetsDisplay = (sets) => {
    if (!sets || sets.length === 0) return "";
    const grouped = {};
    for (const s of sets) {
      const key = `${s.weight}kg`;
      grouped[key] = (grouped[key] || 0) + 1;
    }
    return Object.entries(grouped)
      .map(([weight, count]) => (count > 1 ? `${count}× ${weight}` : weight))
      .join(" · ");
  };

  if (loading) {
    return <Loader />;
  }

  // Render Helpers
  const renderCalendar = () => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Real training data (sessions with numeric sets) merged under the
    // self-reported gym status — sessions only ever raise a day's level.
    const merged = mergeSessionsIntoHeatmap(gymHistory, yearSessions);
    const statusMap = new Map(merged.map((day) => [day.date, day]));

    const data = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      const dateStr = format(curr, "yyyy-MM-dd");
      const day = statusMap.get(dateStr);
      data.push({
        date: dateStr,
        count: day?.level || 0,
        level: day?.level || 0,
        volume: day?.volume || 0,
        hasSession: Boolean(day?.hasSession),
        gymStatus: day?.gymStatus || "not-completed",
      });
      curr.setDate(curr.getDate() + 1);
    }

    return (
      <>
        <ActivityCalendar
          data={data}
          theme={{
            light: ["#262626", "#3f6212", "#4d7c0f", "#65a30d", "#84cc16"], // neutral-800 to lime-500
            dark: ["#262626", "#3f6212", "#4d7c0f", "#65a30d", "#84cc16"],
          }}
          blockSize={10}
          blockMargin={4}
          colorScheme="dark"
          hideTotalCount
          hideColorLegend
          showWeekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          style={{ width: "100%", minWidth: "800px" }}
          renderBlock={(block, activity) =>
            cloneElement(block, {
              "data-tooltip-id": "react-tooltip",
              "data-tooltip-content": `${format(parseISO(activity.date), "d MMMM yyyy")} • ${
                activity.hasSession && activity.volume > 0
                  ? `${activity.volume.toLocaleString()} kg volume`
                  : activity.level === 4
                    ? "Completed"
                    : activity.level === 2
                      ? "Partially Completed"
                      : activity.level >= 1
                        ? "Trained"
                        : "No Activity"
              }`,
            })
          }
        />
        <ReactTooltip id="react-tooltip" />
      </>
    );
  };

  const getTodayMuscleGroups = () => {
    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todaySchedule = workoutSchedule.find((s) => s.day === dayName);
    return todaySchedule ? todaySchedule.muscleGroups : ["Rest Day"];
  };

  const muscleGroups = getTodayMuscleGroups();

  return (
    <AppShell
      navSlot={
        <>
        {/* Today's Status */}
        <div className="bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Today's Status
          </span>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                todayGymStatus === "completed"
                  ? "bg-lime-500 text-black shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                  : todayGymStatus === "partially-completed"
                    ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                    : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {todayGymStatus === "completed"
                ? "Completed"
                : todayGymStatus === "partially-completed"
                  ? "Partial"
                  : "Pending"}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-20">
                {[
                  {
                    val: "completed",
                    label: "Completed",
                    color: "text-lime-500",
                  },
                  {
                    val: "partially-completed",
                    label: "Partial",
                    color: "text-amber-500",
                  },
                  {
                    val: "not-completed",
                    label: "Not Done",
                    color: "text-neutral-400",
                  },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleGymStatusUpdate(opt.val)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      }
      mobileSlot={
        <>
        {/* Mobile Status Controls */}
        <div className="px-2 mb-6">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
            Today's Status
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                val: "completed",
                label: "Done",
                colors: "bg-lime-500 text-black border-lime-500",
              },
              {
                val: "partially-completed",
                label: "Part",
                colors: "bg-amber-500 text-black border-amber-500",
              },
              {
                val: "not-completed",
                label: "No",
                colors:
                  "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white",
              },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleGymStatusUpdate(opt.val)}
                className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  todayGymStatus === opt.val
                    ? opt.colors
                    : "bg-neutral-900/50 text-neutral-600 border-neutral-800 hover:bg-neutral-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        </>
      }
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Calendar */}
          <div className="lg:col-span-1 space-y-6 h-fit">
            {/* Stats Card */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-lime-500/10 p-2 rounded-lg text-lime-500 border border-lime-500/20">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                    Consistency
                  </h2>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                    Yearly Progress
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center">
                  <p className="text-3xl font-black text-white">
                    {currentStreak}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Current Streak
                  </p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center">
                  <p className="text-3xl font-black text-lime-500">
                    {longestStreak}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Longest Streak
                  </p>
                </div>
              </div>

              {(() => {
                const yearVolume = yearSessions.reduce(
                  (total, s) =>
                    total +
                    (s.exercises || []).reduce(
                      (t, ex) =>
                        t + (ex.sets || []).reduce((sum, set) => sum + set.weight * set.reps, 0),
                      0,
                    ),
                  0,
                );
                const trainedDays = yearSessions.length;
                if (trainedDays === 0) return null;
                return (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center">
                      <p className="text-3xl font-black text-white">
                        {trainedDays}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        Trained Days
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center">
                      <p className="text-3xl font-black text-lime-500">
                        {Math.round(yearVolume).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        Kg Lifted
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="overflow-x-auto pb-2">{renderCalendar()}</div>
            </div>

            {/* Weight Tracker Card */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 border border-blue-500/20">
                    <span className="text-xl">⚖️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                      Body Weight
                    </h2>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                      Target: {targetWeight}kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart
                    data={[...weightEntries].sort(
                      (a, b) => new Date(a.date) - new Date(b.date),
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#525252", fontSize: 10 }}
                      tickFormatter={(str) => format(parseISO(str), "MMM d")}
                    />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tick={{ fill: "#525252", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        border: "1px solid #262626",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#84cc16" }}
                      labelStyle={{ color: "#a3a3a3" }}
                      labelFormatter={(label) =>
                        format(parseISO(label), "MMMM d, yyyy")
                      }
                    />
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#84cc16"
                      strokeWidth={2}
                      dot={{
                        fill: "#171717",
                        stroke: "#84cc16",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <form onSubmit={handleAddWeight} className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Weight (kg)"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm"
                />
                <button
                  type="submit"
                  className="h-12 w-12 bg-lime-500 rounded-xl flex items-center justify-center text-black hover:bg-lime-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </form>

              {/* Recent Entries */}
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {[...weightEntries]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((entry) => (
                    <div
                      key={entry._id}
                      className="flex justify-between items-center p-3 bg-neutral-950 rounded-lg border border-neutral-800 group"
                    >
                      <span className="text-xs text-neutral-400 font-mono">
                        {format(new Date(entry.date), "MMM dd, yyyy")}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">
                          {entry.weight} kg
                        </span>
                        <button
                          onClick={() => handleDeleteWeight(entry._id)}
                          className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Middle & Right: Workbench (Workout Plan) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Banner */}
            <div className="relative p-8 rounded-2xl overflow-hidden group border border-neutral-800 transition-all duration-300 hover:border-lime-500/50">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                  alt="Gym Background"
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-950/80 to-transparent"></div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-lime-500 text-black px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })}{" "}
                      Protocol
                    </span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase italic mb-2">
                    {muscleGroups.join(" & ")}
                  </h2>
                  <p className="text-neutral-400 font-medium text-sm max-w-md">
                    Keep pushing your limits. Track every rep, every set.
                  </p>
                </div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Exercises
                </h3>
              </div>

              {(() => {
                const todaySchedule = workoutSchedule.find(
                  (d) =>
                    d.day ===
                    new Date().toLocaleDateString("en-US", { weekday: "long" }),
                );

                // If rest day or no schedule
                if (
                  !todaySchedule ||
                  todaySchedule.muscleGroups.includes("Rest Day")
                ) {
                  return (
                    <div className="relative rounded-2xl overflow-hidden group border border-neutral-800 h-96 flex items-center justify-center">
                      <div className="absolute inset-0 z-0">
                        <img
                          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop"
                          alt="Rest and Recovery"
                          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
                      </div>
                      <div className="relative z-10 text-center p-8 max-w-lg mx-auto">
                        <div className="mb-6 inline-block p-4 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-500 backdrop-blur-sm animate-pulse">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
                          Recharge & Recovery
                        </h3>
                        <p className="text-neutral-300 font-medium text-lg leading-relaxed">
                          "Micro-tears build muscle, but rest repairs them. Take
                          today to fuel up and prepare for tomorrow's grind."
                        </p>
                      </div>
                    </div>
                  );
                }

                // Group exercises by muscle group for better organization
                return todaySchedule.muscleGroups.map((group) => {
                  const groupExercises = exercises.filter(
                    (ex) => ex.muscleGroup === group,
                  );

                  if (groupExercises.length === 0) return null;

                  return (
                    <div
                      key={group}
                      className="animate-in fade-in duration-500"
                    >
                      {/* Muscle Group Divider */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="h-px flex-1 bg-neutral-800"></div>
                        <div className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-lime-500 font-black uppercase tracking-widest text-xs shadow-lg shadow-lime-500/5">
                          {group}
                        </div>
                        <div className="h-px flex-1 bg-neutral-800"></div>
                      </div>

                      <div className="space-y-4">
                        {groupExercises.map((ex) => (
                          <div
                            key={ex._id}
                            className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-lime-500/30 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-6">
                              <div>
                                <h4 className="text-xl font-bold text-white mb-1">
                                  {toTitleCase(ex.name)}
                                </h4>
                                {newPRs[ex._id] && (
                                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">
                                    🏆 New PR: {newPRs[ex._id].newPR} kg
                                    {newPRs[ex._id].previousPR != null &&
                                      ` (was ${newPRs[ex._id].previousPR} kg)`}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenPRChart(ex._id)}
                                  className={`p-2 rounded-lg transition cursor-pointer ${
                                    prExercise === ex._id
                                      ? "text-amber-500 bg-amber-500/10"
                                      : "text-neutral-400 hover:text-amber-500"
                                  }`}
                                  title="PR progression"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleSaveSessionSets(ex._id)}
                                  disabled={savingExercise === ex._id}
                                  className="px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-400 transition font-black text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                                >
                                  {savingExercise === ex._id
                                    ? "Saving..."
                                    : savedExercises[ex._id]
                                      ? "Saved ✓"
                                      : "Log Sets"}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Warm Up (planned template) */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">
                                  Warm Up
                                </p>
                                {ex.warmUpSets?.length > 0 ? (
                                  <p className="text-sm font-bold text-neutral-300">
                                    {formatSetsDisplay(ex.warmUpSets)}
                                  </p>
                                ) : (
                                  <p className="text-sm font-bold text-neutral-300">
                                    {ex.warmUp || "Not set"}
                                  </p>
                                )}
                              </div>

                              {/* Working Sets (logged, numeric) */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                <p className="text-[10px] text-lime-500 font-bold uppercase tracking-widest mb-2">
                                  Working Sets
                                </p>
                                <div className="space-y-2">
                                  {getSetsFor(ex._id).map((set, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        placeholder="kg"
                                        value={set.weight}
                                        onChange={(e) => updateSet(ex._id, idx, "weight", e.target.value)}
                                        className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
                                      />
                                      <span className="text-neutral-600 text-xs font-black">×</span>
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="reps"
                                        value={set.reps}
                                        onChange={(e) => updateSet(ex._id, idx, "reps", e.target.value)}
                                        className="w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
                                      />
                                      <button
                                        onClick={() => removeSetRow(ex._id, idx)}
                                        className="text-neutral-600 hover:text-red-500 transition"
                                        title="Remove set"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addSetRow(ex._id)}
                                    className="text-xs font-bold text-lime-500 hover:text-lime-400 transition cursor-pointer"
                                  >
                                    + Add set
                                  </button>
                                </div>
                              </div>

                              {/* PR (numeric, auto-updated) */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-80">
                                  <span className="text-2xl">🏆</span>
                                </div>
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2">
                                  Personal Best
                                </p>
                                <div>
                                  <p className="text-sm font-bold text-white mb-1">
                                    {ex.prWeight != null
                                      ? `${ex.prWeight} kg`
                                      : ex.lastPR
                                        ? ex.lastPR
                                        : "None"}
                                  </p>
                                  {ex.lastPRDate && (
                                    <p className="text-[10px] text-neutral-500 font-mono">
                                      {format(new Date(ex.lastPRDate), "MMM d, yyyy")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* PR Progression Chart */}
                            {prExercise === ex._id && (
                              <div className="mt-4 bg-neutral-950 p-4 rounded-xl border border-amber-500/20">
                                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-4">
                                  Top Set Weight — Last 6 Months
                                </p>
                                {prSeries.length === 0 ? (
                                  <p className="text-sm text-neutral-500 font-bold">
                                    No sets logged yet — save your working sets to build history.
                                  </p>
                                ) : (
                                  <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={prSeries}>
                                      <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                                      <XAxis
                                        dataKey="date"
                                        stroke="#525252"
                                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                                        tickFormatter={(d) => format(new Date(d), "MMM d")}
                                      />
                                      <YAxis
                                        stroke="#525252"
                                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                                        domain={[0, "dataMax + 5"]}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "#171717",
                                          border: "1px solid #404040",
                                          borderRadius: "0.5rem",
                                          color: "#fff",
                                        }}
                                        formatter={(value, name) => [
                                          name === "weight" ? `${value} kg` : value,
                                          name === "weight" ? "Top set" : name,
                                        ]}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: "#f59e0b" }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
