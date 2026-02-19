"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ActivityCalendar } from "react-activity-calendar";
import { format, parseISO } from "date-fns";
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
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data State
  const [exercises, setExercises] = useState([]);
  const [workoutSchedule, setWorkoutSchedule] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [gymHistory, setGymHistory] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
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
  const [editFormData, setEditFormData] = useState({
    warmUp: "",
    working: "",
    lastPR: "",
    lastPRDate: "",
  });
  const [editingExercise, setEditingExercise] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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

    await Promise.all([fetchGymData(), fetchWeightData(), fetchGymHistory()]);

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

  const handleSaveExercise = async (exerciseId) => {
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        await fetchGymData();
        setEditingExercise(null);
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-lime-500">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div className="text-xl font-bold tracking-widest uppercase">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.isAdmin) return null;

  // Render Helpers
  const renderCalendar = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const statusMap = new Map();
    gymHistory.forEach((log) => {
      let level = 0;
      if (log.gymStatus === "completed") level = 4;
      else if (log.gymStatus === "partially-completed") level = 2;
      statusMap.set(log.date, level);
    });

    const data = [];
    let curr = new Date(oneYearAgo);
    while (curr <= today) {
      const dateStr = format(curr, "yyyy-MM-dd");
      data.push({
        date: dateStr,
        count: statusMap.get(dateStr) || 0,
        level: statusMap.get(dateStr) || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return (
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
        style={{ width: "100%", minWidth: "800px" }}
      />
    );
  };

  const getTodayMuscleGroups = () => {
    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todaySchedule = workoutSchedule.find((s) => s.day === dayName);
    return todaySchedule ? todaySchedule.muscleGroups : ["Rest Day"];
  };

  const muscleGroups = getTodayMuscleGroups();

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500 selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="black"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
                Nutri<span className="text-lime-500">Gain</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
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

              <div className="h-6 w-px bg-neutral-800"></div>

              <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => router.push("/dashboard/meal")}
                  className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wide"
                >
                  Meal
                </button>
                <button
                  onClick={() => router.push("/dashboard/gym")}
                  className="px-4 py-2 bg-lime-500 text-black rounded-lg shadow-lg shadow-lime-500/20 font-bold text-sm flex items-center gap-2 transition-all uppercase tracking-wide"
                >
                  Gym
                </button>
              </div>

              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    Logged in as
                  </p>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-neutral-800 rounded-lg transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-neutral-900">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    User
                  </p>
                  <p className="text-lg font-bold text-white">{user.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    router.push("/dashboard/meal");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl font-bold uppercase tracking-wider"
                >
                  Meal Tracker
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Gym Tracker <span className="text-lime-500">●</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

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

              <div className="grid grid-cols-2 gap-4 mb-6">
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
                              </div>
                              {editingExercise === ex._id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveExercise(ex._id)}
                                    className="p-2 bg-lime-500 text-black rounded-lg hover:bg-lime-400 transition"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setEditingExercise(null)}
                                    className="p-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingExercise(ex._id);
                                    setEditFormData({
                                      warmUp: ex.warmUp || "",
                                      working: ex.working || "",
                                      lastPR: ex.lastPR || "",
                                      lastPRDate: ex.lastPRDate || "",
                                    });
                                  }}
                                  className="p-2 text-neutral-400 hover:text-lime-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Warm Up */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">
                                  Warm Up
                                </p>
                                {editingExercise === ex._id ? (
                                  <input
                                    type="text"
                                    value={editFormData.warmUp}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        warmUp: e.target.value,
                                      })
                                    }
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-neutral-300">
                                    {ex.warmUp || "Not set"}
                                  </p>
                                )}
                              </div>

                              {/* Working Sets */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                <p className="text-[10px] text-lime-500 font-bold uppercase tracking-widest mb-2">
                                  Working Sets
                                </p>
                                {editingExercise === ex._id ? (
                                  <input
                                    type="text"
                                    value={editFormData.working}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        working: e.target.value,
                                      })
                                    }
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-white">
                                    {ex.working || "Not set"}
                                  </p>
                                )}
                              </div>

                              {/* PR */}
                              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-80">
                                  <span className="text-2xl">🏆</span>
                                </div>
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2">
                                  Personal Best
                                </p>
                                {editingExercise === ex._id ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editFormData.lastPR}
                                      placeholder="Weight"
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          lastPR: e.target.value,
                                        })
                                      }
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
                                    />
                                    <input
                                      type="date"
                                      value={
                                        editFormData.lastPRDate
                                          ? new Date(editFormData.lastPRDate)
                                              .toISOString()
                                              .split("T")[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        setEditFormData({
                                          ...editFormData,
                                          lastPRDate: e.target.value,
                                        })
                                      }
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[10px] font-bold text-white focus:border-lime-500 focus:outline-none"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm font-bold text-white mb-1">
                                      {ex.lastPR || "None"}
                                    </p>
                                    {ex.lastPRDate && (
                                      <p className="text-[10px] text-neutral-500 font-mono">
                                        {format(
                                          new Date(ex.lastPRDate),
                                          "MMM d, yyyy",
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
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
    </div>
  );
}
