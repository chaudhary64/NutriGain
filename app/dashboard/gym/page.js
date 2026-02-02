"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ActivityCalendar } from "react-activity-calendar";
import { format } from "date-fns";
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

export default function GymTrackingPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [workoutSchedule, setWorkoutSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editFormData, setEditFormData] = useState({
    warmUp: "",
    working: "",
    lastPR: "",
    lastPRDate: "",
  });
  const [weightEntries, setWeightEntries] = useState([]);
  const [targetWeight, setTargetWeight] = useState(75);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [newTargetWeight, setNewTargetWeight] = useState("");
  const [gymHistory, setGymHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayGymStatus, setTodayGymStatus] = useState("not-completed");
  const [showGymLogDropdown, setShowGymLogDropdown] = useState(false);
  const [tempGymStatus, setTempGymStatus] = useState("not-completed");
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.isAdmin) {
      router.push("/admin");
    }
  }, [user, router]);

  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchGymData();
      fetchWeightData();
      fetchGymHistory();
    }
  }, [user, currentDate]);

  // Sync tempGymStatus with todayGymStatus on load
  useEffect(() => {
    setTempGymStatus(todayGymStatus);
  }, [todayGymStatus]);

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
          const status = data.dailyLog.gymStatus || "not-completed";
          setTodayGymStatus(status);
          setTempGymStatus(status);
        }
      }
    } catch (error) {
      console.error("Error fetching gym history:", error);
    }
  };

  const calculateStreaks = (history) => {
    if (!history || history.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Create a set of completed dates (both fully and partially completed)
    const completedDates = new Set(
      history
        .filter(
          (log) =>
            log.gymStatus === "completed" ||
            log.gymStatus === "partially-completed",
        )
        .map((log) => log.date),
    );

    // Calculate current streak
    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (completedDates.has(dateStr)) {
        current++;
      } else if (i > 0) {
        // Only break if it's not today (allow for not working out today yet)
        break;
      }
    }

    // Calculate longest streak
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

  const fetchGymData = async () => {
    try {
      const [exercisesRes, scheduleRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/workout-schedule"),
      ]);

      const exercisesData = await exercisesRes.json();
      const scheduleData = await scheduleRes.json();

      if (Array.isArray(exercisesData)) {
        setExercises(exercisesData);
      }

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
    } finally {
      setLoading(false);
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

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || !newWeightDate) {
      alert("Please enter both weight and date");
      return;
    }

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
        setNewWeightDate(new Date().toISOString().split("T")[0]);
        setShowWeightForm(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add weight entry");
      }
    } catch (error) {
      console.error("Error adding weight:", error);
      alert("Failed to add weight entry");
    }
  };

  const handleDeleteWeight = async (entryId) => {
    if (!confirm("Are you sure you want to delete this weight entry?")) {
      return;
    }

    try {
      const res = await fetch(`/api/weight/${entryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setWeightEntries(data.weightEntries || []);
      } else {
        alert("Failed to delete weight entry");
      }
    } catch (error) {
      console.error("Error deleting weight:", error);
      alert("Failed to delete weight entry");
    }
  };

  const handleUpdateTargetWeight = async (e) => {
    e.preventDefault();
    if (!newTargetWeight) {
      alert("Please enter target weight");
      return;
    }

    try {
      const res = await fetch("/api/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWeight: parseFloat(newTargetWeight),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTargetWeight(data.targetWeight);
        setNewTargetWeight("");
        setShowTargetForm(false);
      } else {
        alert("Failed to update target weight");
      }
    } catch (error) {
      console.error("Error updating target weight:", error);
      alert("Failed to update target weight");
    }
  };

  const handleGymStatusUpdate = async (status) => {
    try {
      console.log(
        "[Update] Updating status to:",
        status,
        "for date:",
        currentDate,
      );
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
        console.log("[Update] Response:", data.dailyLog?.gymStatus);

        // Update states first
        setTodayGymStatus(status);
        setTempGymStatus(status);

        // Close dropdown after saving
        setShowGymLogDropdown(false);

        // Update gym history from API response
        if (data.gymHistory) {
          setGymHistory(data.gymHistory);
          calculateStreaks(data.gymHistory);
        }

        // Show success message after state updates
        const messages = {
          completed: "🎉 Awesome! Full workout completed!",
          "partially-completed": "💪 Good effort! Partial workout logged!",
          "not-completed": "📝 Workout status reset.",
        };

        // Small delay to ensure UI updates before alert
        setTimeout(() => {
          alert(messages[status]);
        }, 100);
      } else {
        const errorData = await res.json();
        console.error("[Frontend] Error response:", errorData);
        alert("Failed to update workout status");
      }
    } catch (error) {
      console.error("[Frontend] Error updating gym status:", error);
      alert("Failed to update workout status");
    }
  };

  const renderGymCalendar = () => {
    // Transform gym history into the format required by react-activity-calendar
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day to include today
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0); // Set to start of day

    // Create a map of dates with their completion status
    const statusMap = new Map();
    gymHistory.forEach((log) => {
      if (log.gymStatus === "completed") {
        statusMap.set(log.date, 4); // Level 4 for completed
      } else if (log.gymStatus === "partially-completed") {
        statusMap.set(log.date, 2); // Level 2 for partially completed
      } else if (log.gymStatus === "not-completed") {
        statusMap.set(log.date, 0); // Level 0 for not completed
      }
    });

    // Generate all dates for the past year
    const data = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
      // Format date in local timezone, not UTC
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const level = statusMap.get(dateStr) || 0;

      data.push({
        date: dateStr,
        count: level,
        level: level,
      });

      // Increment by one day and reset time to avoid timezone issues
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    // Debug: Check if today's data is in the array
    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
    const todayData = data.find((d) => d.date === todayStr);
    console.log(
      "[Calendar Debug] Today:",
      todayStr,
      "Data:",
      todayData,
      "Total entries:",
      data.length,
    );
    console.log("[Calendar Debug] Last 3 entries:", data.slice(-3));

    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="overflow-x-auto [&_text]:fill-gray-700 [&_text]:font-semibold [&>div>footer]:hidden!">
          <style jsx>{`
            div :global(footer) {
              display: none !important;
            }
          `}</style>
          <ActivityCalendar
            data={data}
            theme={{
              light: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
            }}
            labels={{
              totalCount: "{{count}} workouts in the last year",
            }}
            showWeekdayLabels
            blockSize={14}
            blockMargin={4}
            fontSize={14}
            colorScheme="light"
            hideTotalCount={true}
            hideColorLegend={true}
            style={{
              width: "100%",
              color: "#374151",
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ebedf0] rounded-sm border border-gray-300"></div>
            <span className="text-gray-700 font-semibold">Not Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#7bc96f] rounded-sm"></div>
            <span className="text-gray-700 font-semibold">
              Partially Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#196127] rounded-sm"></div>
            <span className="text-gray-700 font-semibold">Completed</span>
          </div>
        </div>
      </div>
    );
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise._id);
    setEditFormData({
      warmUp: exercise.warmUp || "",
      working: exercise.working || "",
      lastPR: exercise.lastPR || "",
      lastPRDate: exercise.lastPRDate || "",
    });
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
      } else {
        alert("Failed to update exercise");
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert("Failed to update exercise");
    }
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setEditFormData({
      warmUp: "",
      working: "",
      lastPR: "",
      lastPRDate: "",
    });
  };

  const calculateDaysSince = (dateString) => {
    if (!dateString) return null;
    const prDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - prDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMuscleGroupEmoji = (group) => {
    const emojiMap = {
      Chest: "",
      Back: "",
      Bicep: "",
      Tricep: "",
      Legs: "",
      Forearms: "",
      Shoulders: "",
      Arms: "",
      "Rest Day": "😴",
    };
    return emojiMap[group] || "";
  };

  const getDayColors = (day) => {
    const colorMap = {
      Monday: {
        bg: "from-blue-50 to-blue-100",
        border: "border-blue-200",
        textDark: "text-blue-900",
        textLight: "text-blue-800",
      },
      Tuesday: {
        bg: "from-green-50 to-green-100",
        border: "border-green-200",
        textDark: "text-green-900",
        textLight: "text-green-800",
      },
      Wednesday: {
        bg: "from-purple-50 to-purple-100",
        border: "border-purple-200",
        textDark: "text-purple-900",
        textLight: "text-purple-800",
      },
      Thursday: {
        bg: "from-orange-50 to-orange-100",
        border: "border-orange-200",
        textDark: "text-orange-900",
        textLight: "text-orange-800",
      },
      Friday: {
        bg: "from-pink-50 to-pink-100",
        border: "border-pink-200",
        textDark: "text-pink-900",
        textLight: "text-pink-800",
      },
      Saturday: {
        bg: "from-teal-50 to-teal-100",
        border: "border-teal-200",
        textDark: "text-teal-900",
        textLight: "text-teal-800",
      },
      Sunday: {
        bg: "from-gray-50 to-gray-100",
        border: "border-gray-200",
        textDark: "text-gray-900",
        textLight: "text-gray-800",
      },
    };
    return colorMap[day] || colorMap.Sunday;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-emerald-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg shadow-green-200 text-white">
                💪
              </div>
              <h1 className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
                NutriGain
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative group">
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-white"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                <button
                  onClick={() => router.push("/dashboard/meal")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span className="text-lg grayscale opacity-70">🍽️</span> Meal
                </button>
                <button
                  onClick={() => router.push("/dashboard/gym")}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg shadow-sm font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <span className="text-lg">💪</span> Gym
                </button>
              </div>

              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-gray-400 font-medium">
                    Welcome back
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {user.name}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-3">
              {/* Mobile Date Picker (Simplified) */}
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-32 py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none"
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
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
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl absolute w-full left-0 shadow-xl">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    router.push("/dashboard/meal");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition cursor-pointer"
                >
                  <span className="grayscale opacity-70">🍽️</span> Meal Tracking
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-semibold transition"
                >
                  <span>💪</span> Gym Tracking
                </button>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Weekly Schedule - Grid Layout */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-green-100/50 border border-white/50 ring-1 ring-white/50 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-linear-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-green-200">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Weekly Schedule
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Your personalized split
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
              {workoutSchedule.map((schedule) => {
                const colors = getDayColors(schedule.day);
                const isToday =
                  schedule.day ===
                  new Date().toLocaleDateString("en-US", { weekday: "long" });

                return (
                  <div
                    key={schedule.day}
                    className={`relative overflow-hidden group rounded-xl p-3 sm:p-4 border transition-all duration-300 ${
                      isToday
                        ? "bg-white shadow-lg shadow-green-100 scale-105 ring-2 ring-green-500 border-transparent z-10"
                        : `bg-linear-to-br ${colors.bg} border-transparent hover:shadow-md hover:-translate-y-1`
                    }`}
                  >
                    {isToday && (
                      <div className="absolute top-0 right-0 p-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </div>
                    )}

                    <div className="text-center relative z-10">
                      <div
                        className={`text-sm sm:text-base font-bold uppercase tracking-wider mb-3 ${colors.textDark}`}
                      >
                        {schedule.day.slice(0, 3)}
                        <span className="hidden sm:inline">
                          {schedule.day.slice(3)}
                        </span>
                      </div>
                      <div
                        className={`flex flex-col ${
                          schedule.muscleGroups.length >= 3
                            ? "gap-1.5"
                            : "gap-2"
                        }`}
                      >
                        {schedule.muscleGroups &&
                        schedule.muscleGroups.length > 0 ? (
                          schedule.muscleGroups.map((group, idx) => (
                            <div
                              key={idx}
                              className={`bg-white/80 backdrop-blur-sm px-2 ${
                                schedule.muscleGroups.length >= 3
                                  ? "py-1 text-xs"
                                  : "py-2 text-xs sm:text-sm"
                              } rounded-lg font-bold shadow-sm border border-black/5 ${
                                colors.textLight
                              } flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]`}
                              title={group}
                            >
                              <span
                                className={
                                  schedule.muscleGroups.length >= 3
                                    ? "text-sm"
                                    : "text-base"
                                }
                              >
                                {getMuscleGroupEmoji(group)}
                              </span>
                              <span className="truncate">{group}</span>
                            </div>
                          ))
                        ) : (
                          <div
                            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-gray-400 italic bg-black/5`}
                          >
                            Rest Day
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gym Streak Section - LeetCode Style */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-linear-to-br from-white to-green-50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-green-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🔥</span>
              Gym Streak
            </h2>

            {/* Streak Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-orange-200">
                <div className="text-orange-600 text-sm font-semibold mb-1">
                  Current Streak
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">
                  {currentStreak}
                  <span className="text-lg ml-1">🔥</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {currentStreak === 1 ? "day" : "days"}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-200">
                <div className="text-purple-600 text-sm font-semibold mb-1">
                  Longest Streak
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                  {longestStreak}
                  <span className="text-lg ml-1">🏆</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {longestStreak === 1 ? "day" : "days"}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200 col-span-2 lg:col-span-1">
                <div className="text-green-600 text-sm font-semibold mb-1">
                  Today's Status
                </div>
                <div className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  {todayGymStatus === "completed" ? (
                    <>
                      <span>✅</span>
                      <span className="text-lg text-green-600">Completed!</span>
                    </>
                  ) : todayGymStatus === "partially-completed" ? (
                    <>
                      <span>⚡</span>
                      <span className="text-lg text-yellow-600">Partial!</span>
                    </>
                  ) : (
                    <>
                      <span>⏳</span>
                      <span className="text-lg text-gray-600">Pending</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {todayGymStatus === "completed"
                    ? "Great job!"
                    : todayGymStatus === "partially-completed"
                      ? "Good effort!"
                      : "Time to hit the gym!"}
                </div>
              </div>
            </div>

            {/* Activity Calendar */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>📊</span>
                Activity History
              </h3>
              {renderGymCalendar()}
            </div>

            {/* Log Today's Session - Simple Dropdown */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">💪</span>
                Log Today's Workout
              </label>

              <div className="bg-white rounded-lg shadow-md border-2 border-gray-300 p-4 space-y-3">
                <select
                  value={tempGymStatus}
                  onChange={(e) => setTempGymStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-indigo-300 rounded-lg hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-gray-800 font-semibold cursor-pointer transition"
                >
                  <option value="not-completed">⏳ Not Completed</option>
                  <option value="partially-completed">
                    ⚡ Partially Completed
                  </option>
                  <option value="completed">✅ Full Workout Completed</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGymStatusUpdate(tempGymStatus)}
                    className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <span>💾</span>
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTempGymStatus("not-completed");
                      handleGymStatusUpdate("not-completed");
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition shadow-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            {currentStreak > 0 && (
              <div className="bg-linear-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
                <p className="text-green-800 font-semibold text-center">
                  {currentStreak >= 7
                    ? `🎉 Amazing! You've been consistent for ${currentStreak} days! Keep it up!`
                    : currentStreak >= 3
                      ? `💪 Great progress! ${currentStreak} days and counting!`
                      : `🚀 You're building momentum! ${currentStreak} ${currentStreak === 1 ? "day" : "days"} down!`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Body Weight Chart */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-100/50 p-6 lg:p-8 border border-white/50 ring-1 ring-white/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                  <span className="text-5xl relative z-10">⚖️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Weight Progress
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    Track your journey
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWeightForm(!showWeightForm)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  showWeightForm
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-200 hover:scale-105"
                }`}
              >
                {showWeightForm ? "Cancel" : "+ Add Entry"}
              </button>
            </div>

            {/* Add Weight Form */}
            {showWeightForm && (
              <div className="bg-gray-50/80 rounded-xl p-6 mb-8 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Add New Weight Entry
                </h3>
                <form onSubmit={handleAddWeight} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-900 placeholder-gray-300 transition-all"
                        placeholder="e.g., 75.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newWeightDate}
                        onChange={(e) => setNewWeightDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-900 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
                    >
                      Save Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWeightForm(false)}
                      className="px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Chart Section */}
            {weightEntries.length > 0 ? (
              <div className="bg-white rounded-2xl p-2 sm:p-6 shadow-sm border border-gray-100 mb-8">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={weightEntries
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((entry) => ({
                        date: new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                        weight: entry.weight,
                        fullDate: new Date(entry.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        ),
                      }))}
                    margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                      padding={{ top: 20, bottom: 20 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        padding: "12px",
                      }}
                      itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
                      labelStyle={{
                        color: "#6b7280",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                      formatter={(value) => [`${value} kg`, "Weight"]}
                    />
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      label={{
                        value: `Goal: ${targetWeight} kg`,
                        position: "insideTopRight",
                        fill: "#f97316",
                        fontSize: 12,
                        fontWeight: "bold",
                        dy: -10,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="url(#colorWeight)"
                      strokeWidth={4}
                      dot={{
                        fill: "#fff",
                        stroke: "#6366f1",
                        strokeWidth: 3,
                        r: 6,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#6366f1",
                        stroke: "#fff",
                        strokeWidth: 3,
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="colorWeight"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 mb-8">
                <div className="text-4xl mb-3 opacity-50">📊</div>
                <p className="text-gray-500 font-medium">
                  No weight entries yet. Start tracking your progress!
                </p>
              </div>
            )}

            {/* Stats Cards */}
            {weightEntries.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Starting Stats */}
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                    Starting
                  </p>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {weightEntries[0]?.weight}
                    <span className="text-lg text-gray-400 font-bold ml-1">
                      kg
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-blue-400">
                    {new Date(weightEntries[0]?.date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </p>
                </div>

                {/* Current Stats */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                    Current
                  </p>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {weightEntries[weightEntries.length - 1]?.weight}
                    <span className="text-lg text-gray-400 font-bold ml-1">
                      kg
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-500">
                    {new Date(
                      weightEntries[weightEntries.length - 1]?.date,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Target Stats */}
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <button
                    onClick={() => {
                      setShowTargetForm(!showTargetForm);
                      setNewTargetWeight(targetWeight);
                    }}
                    className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pencil"
                    >
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
                    Goal
                  </p>
                  {showTargetForm ? (
                    <form onSubmit={handleUpdateTargetWeight} className="mt-1">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          autoFocus
                          value={newTargetWeight}
                          onChange={(e) => setNewTargetWeight(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-orange-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex gap-1 mt-2">
                        <button
                          type="submit"
                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold w-full"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTargetForm(false)}
                          className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold w-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-gray-900 mb-1">
                        {targetWeight}
                        <span className="text-lg text-gray-400 font-bold ml-1">
                          kg
                        </span>
                      </p>
                      <p className="text-xs font-semibold text-orange-500">
                        {Math.abs(
                          weightEntries[weightEntries.length - 1]?.weight -
                            targetWeight,
                        ).toFixed(1)}{" "}
                        kg to{" "}
                        {weightEntries[weightEntries.length - 1]?.weight >
                        targetWeight
                          ? "lose"
                          : "gain"}
                      </p>
                    </>
                  )}
                </div>

                {/* Total Move */}
                <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                    Total Change
                  </p>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {weightEntries[weightEntries.length - 1]?.weight -
                      weightEntries[0]?.weight >
                    0
                      ? "+"
                      : ""}
                    {(
                      weightEntries[weightEntries.length - 1]?.weight -
                      weightEntries[0]?.weight
                    ).toFixed(1)}
                    <span className="text-lg text-gray-400 font-bold ml-1">
                      kg
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-purple-500">
                    Over{" "}
                    {Math.floor(
                      (new Date(weightEntries[weightEntries.length - 1]?.date) -
                        new Date(weightEntries[0]?.date)) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's Workout Details */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-100/50 p-4 sm:p-6 lg:p-8 border border-white/50 ring-1 ring-white/50">
          {(() => {
            // Get current day from currentDate state
            const daysOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];

            // Note: currentDate is yyyy-MM-dd string
            // Create date object and adjust for timezone to get correct day of week
            const dateObj = new Date(currentDate);
            // new Date("yyyy-MM-dd") returns UTC midnight, daysOfWeek[day] might be off depending on timezone
            // Better to use a small helper or just the weekday from date string
            // Let's rely on creating date with time set to ensure local day
            const year = parseInt(currentDate.split("-")[0]);
            const month = parseInt(currentDate.split("-")[1]) - 1;
            const day = parseInt(currentDate.split("-")[2]);
            const localDate = new Date(year, month, day);
            const today = daysOfWeek[localDate.getDay()];

            // Find today's workout schedule
            const todaySchedule = workoutSchedule.find((s) => s.day === today);
            const todayMuscleGroups = todaySchedule?.muscleGroups || [];

            // Filter exercises for today's muscle groups
            const todayExercises = exercises.filter((ex) =>
              todayMuscleGroups.includes(ex.muscleGroup),
            );

            return (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 pb-6 border-b border-gray-100 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                      <span className="text-4xl sm:text-5xl lg:text-6xl relative z-10">
                        💪
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none">
                        Today's Workout
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 sm:mt-1">
                        <span className="text-sm sm:text-lg font-bold text-indigo-600">
                          {today}'s Session
                        </span>
                        <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs sm:text-sm font-medium text-gray-500 w-full sm:w-auto">
                          {todayExercises.length} Exercises
                        </span>
                      </div>
                    </div>
                  </div>
                  {todayMuscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 w-full md:w-auto pl-14 sm:pl-0">
                      {todayMuscleGroups.map((group, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg font-bold text-xs sm:text-sm"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Exercises by Muscle Group */}
                {todayExercises.length > 0 ? (
                  <div className="space-y-10">
                    {todayMuscleGroups.map((muscleGroup) => {
                      const groupExercises = todayExercises.filter(
                        (ex) => ex.muscleGroup === muscleGroup,
                      );

                      if (groupExercises.length === 0) return null;

                      return (
                        <div key={muscleGroup}>
                          <div className="flex items-center gap-3 mb-5">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {muscleGroup}
                            </h3>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                              {groupExercises.length} Exercises
                            </span>
                            <div className="h-px bg-gray-100 flex-1 ml-2"></div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            {groupExercises.map((exercise) => (
                              <div
                                key={exercise._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden group"
                              >
                                {/** Card Header **/}
                                <div className="bg-gray-50/50 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:bg-indigo-50/30 transition-colors">
                                  <div className="flex items-start gap-3 w-full sm:w-auto">
                                    {/** Indicator Bar **/}
                                    <div
                                      className={`w-1 h-8 rounded-full shrink-0 mt-1 sm:mt-0 ${
                                        exercise.type === "COMPOUND"
                                          ? "bg-blue-500"
                                          : "bg-purple-500"
                                      }`}
                                    ></div>

                                    {/** Exercise Name & Type **/}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug wrap-normalbreak-words">
                                        {exercise.name}
                                      </h4>
                                      <span
                                        className={`text-[10px] font-black tracking-widest uppercase mt-0.5 inline-block ${
                                          exercise.type === "COMPOUND"
                                            ? "text-blue-600"
                                            : "text-purple-600"
                                        }`}
                                      >
                                        {exercise.type} MOVEMENT
                                      </span>
                                    </div>

                                    {/** Mobile Edit Button (Top Right) **/}
                                    <div className="sm:hidden shrink-0">
                                      <button
                                        onClick={() =>
                                          editingExercise === exercise._id
                                            ? handleSaveExercise(exercise._id)
                                            : handleEditExercise(exercise)
                                        }
                                        className={`p-2 rounded-lg transition-all ${
                                          editingExercise === exercise._id
                                            ? "bg-green-100 text-green-700"
                                            : "bg-white border border-gray-200 text-gray-500"
                                        }`}
                                      >
                                        {editingExercise === exercise._id
                                          ? "💾"
                                          : "✏️"}
                                      </button>
                                    </div>
                                  </div>

                                  {/** Desktop Edit Button Row **/}
                                  <div className="hidden sm:flex gap-2">
                                    <button
                                      onClick={() =>
                                        editingExercise === exercise._id
                                          ? handleSaveExercise(exercise._id)
                                          : handleEditExercise(exercise)
                                      }
                                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                        editingExercise === exercise._id
                                          ? "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200"
                                          : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                      }`}
                                    >
                                      {editingExercise === exercise._id
                                        ? "Save"
                                        : "Edit"}
                                    </button>
                                    {editingExercise === exercise._id && (
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/** Stats Grid **/}
                                <div className="p-4 sm:p-5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {/** Warm Up **/}
                                    <div className="bg-gray-50 sm:bg-transparent rounded-lg p-3 sm:p-0 border border-gray-100 sm:border-0 col-span-1">
                                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Warm Up
                                      </p>
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.warmUp}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              warmUp: e.target.value,
                                            })
                                          }
                                          className="w-full bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 font-bold text-orange-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                      ) : (
                                        <p className="text-lg sm:text-xl font-bold text-gray-700">
                                          {exercise.warmUp ? (
                                            <>
                                              {exercise.warmUp}
                                              <span className="text-xs font-medium text-gray-400 ml-0.5">
                                                kg
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-gray-300">
                                              -
                                            </span>
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    {/** Working **/}
                                    <div className="bg-blue-50/50 sm:bg-transparent rounded-lg p-3 sm:p-0 border border-blue-100 sm:border-0 col-span-1">
                                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Working
                                      </p>
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.working}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              working: e.target.value,
                                            })
                                          }
                                          className="w-full bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 font-bold text-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      ) : (
                                        <p className="text-lg sm:text-xl font-bold text-blue-600">
                                          {exercise.working ? (
                                            <>
                                              {exercise.working}
                                              <span className="text-xs font-medium text-blue-400 ml-0.5">
                                                kg
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-gray-300">
                                              -
                                            </span>
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    {/** PR **/}
                                    <div className="bg-green-50/50 sm:bg-transparent rounded-lg p-3 sm:p-0 border border-green-100 sm:border-0 col-span-1">
                                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        PR
                                      </p>
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.lastPR}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              lastPR: e.target.value,
                                            })
                                          }
                                          className="w-full bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 font-bold text-green-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                      ) : (
                                        <p className="text-lg sm:text-xl font-bold text-green-600">
                                          {exercise.lastPR ? (
                                            <>
                                              {exercise.lastPR}
                                              <span className="text-xs font-medium text-green-400 ml-0.5">
                                                kg
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-gray-300">
                                              -
                                            </span>
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    {/** Last PR Date **/}
                                    <div className="bg-gray-50 sm:bg-transparent rounded-lg p-3 sm:p-0 border border-gray-100 sm:border-0 col-span-1">
                                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Last PR
                                      </p>
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="date"
                                          value={editFormData.lastPRDate}
                                          onChange={(e) =>
                                            setEditFormData({
                                              ...editFormData,
                                              lastPRDate: e.target.value,
                                            })
                                          }
                                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-1 py-1 text-[10px] focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        />
                                      ) : (
                                        <div>
                                          <p className="text-sm font-semibold text-gray-700 truncate">
                                            {exercise.lastPRDate || "-"}
                                          </p>
                                          {exercise.lastPRDate && (
                                            <p className="text-[10px] text-gray-400 font-medium truncate">
                                              {calculateDaysSince(
                                                exercise.lastPRDate,
                                              ) === 0
                                                ? "Today"
                                                : calculateDaysSince(
                                                      exercise.lastPRDate,
                                                    ) === 1
                                                  ? "1 day ago"
                                                  : `${calculateDaysSince(exercise.lastPRDate)} days ago`}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/** Mobile Actions (Cancel/Save when editing) **/}
                                  {editingExercise === exercise._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 sm:hidden flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleSaveExercise(exercise._id)
                                        }
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm"
                                      >
                                        Save Changes
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4 grayscale opacity-50">😴</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {todayMuscleGroups.includes("Rest Day")
                        ? "Rest Day"
                        : "No Workout Scheduled"}
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">
                      {todayMuscleGroups.includes("Rest Day")
                        ? "Take a well-deserved break and let your muscles recover for big gains!"
                        : "No exercises found for today's muscle groups."}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
