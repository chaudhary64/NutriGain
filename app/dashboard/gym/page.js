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
          "Arms",
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
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">💪</div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Gym Tracking
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden text-gray-600 hover:text-gray-800 p-2"
                  aria-label="Toggle menu"
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

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="sm:hidden w-full bg-gray-50 rounded-lg p-3 space-y-2">
                <button
                  onClick={() => {
                    router.push("/dashboard/meal");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-2 cursor-pointer"
                >
                  🍽️ Meal Tracking
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-green-600 bg-green-50 rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  💪 Gym Tracking
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium text-sm flex items-center gap-2 cursor-pointer"
                >
                  🚪 Logout
                </button>
              </div>
            )}

            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:flex-row items-center gap-2 sm:gap-3">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-gray-900 cursor-pointer text-sm"
              />

              <button
                onClick={() => router.push("/dashboard/meal")}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-1 cursor-pointer"
              >
                🍽️ Meal
              </button>

              <button
                onClick={() => router.push("/dashboard/gym")}
                className="px-4 py-2 text-green-600 bg-green-50 rounded-lg font-medium text-sm flex items-center gap-1 cursor-pointer"
              >
                💪 Gym
              </button>

              <span className="hidden sm:inline text-gray-700 font-medium text-sm whitespace-nowrap">
                Welcome, {user.name}!
              </span>

              <button
                onClick={logout}
                className="hidden sm:block bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md font-medium cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Weekly Schedule - Grid Layout */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📅</span>
            Weekly Workout Schedule
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {workoutSchedule.map((schedule) => {
              const colors = getDayColors(schedule.day);
              return (
                <div
                  key={schedule.day}
                  className={`bg-linear-to-br ${colors.bg} rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 ${colors.border} shadow-md hover:shadow-xl transition cursor-pointer`}
                >
                  <div className="text-center">
                    <div
                      className={`text-base sm:text-lg lg:text-xl font-bold ${colors.textDark} mb-2`}
                    >
                      {schedule.day}
                    </div>
                    <div className="space-y-1">
                      {schedule.muscleGroups &&
                      schedule.muscleGroups.length > 0 ? (
                        schedule.muscleGroups.map((group, idx) => (
                          <div
                            key={idx}
                            className={`bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${colors.textLight}`}
                          >
                            {getMuscleGroupEmoji(group)} {group}
                          </div>
                        ))
                      ) : (
                        <div
                          className={`bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-500`}
                        >
                          No Workout
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
        <div className="mb-6 sm:mb-8">
          <div className="bg-linear-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-blue-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">⚖️</span>
                Body Weight Progress
              </h2>
              <button
                onClick={() => setShowWeightForm(!showWeightForm)}
                className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md font-semibold text-sm"
              >
                {showWeightForm ? "Cancel" : "+ Add Weight"}
              </button>
            </div>

            {/* Add Weight Form */}
            {showWeightForm && (
              <div className="bg-white rounded-lg p-4 mb-4 border-2 border-blue-300 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Add Weight Entry
                </h3>
                <form onSubmit={handleAddWeight} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="75.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newWeightDate}
                        onChange={(e) => setNewWeightDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Add Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWeightForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Weight Entries List */}
            {weightEntries.length > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Weight History
                </h3>
                <div className="space-y-2">
                  {[...weightEntries]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((entry) => (
                      <div
                        key={entry._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div>
                          <span className="font-bold text-gray-800 text-lg">
                            {entry.weight} kg
                          </span>
                          <span className="text-gray-600 text-sm ml-3">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteWeight(entry._id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chart Container */}
            {weightEntries.length > 0 ? (
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
                <ResponsiveContainer width="100%" height={300}>
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
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        ),
                      }))}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: "12px", fontWeight: "600" }}
                      domain={[
                        Math.min(
                          ...weightEntries.map((e) => e.weight),
                          targetWeight,
                        ) - 5,
                        Math.max(
                          ...weightEntries.map((e) => e.weight),
                          targetWeight,
                        ) + 5,
                      ]}
                      label={{
                        value: "Weight (kg)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: "14px", fontWeight: "700" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        padding: "10px 15px",
                        fontWeight: "600",
                      }}
                      formatter={(value) => [`${value} kg`, "Weight"]}
                      labelFormatter={(label) => {
                        const item = weightEntries.find(
                          (e) =>
                            new Date(e.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) === label,
                        );
                        return item
                          ? new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : label;
                      }}
                    />
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#f97316"
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      label={{
                        value: `Target: ${targetWeight} kg`,
                        position: "insideTopRight",
                        fill: "#f97316",
                        fontSize: 11,
                        fontWeight: "bold",
                        offset: 10,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="url(#colorWeight)"
                      strokeWidth={3}
                      dot={{
                        fill: "#8b5cf6",
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: 6,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#ec4899",
                        stroke: "#fff",
                        strokeWidth: 2,
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
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                <p className="text-gray-600 text-lg">
                  No weight entries yet. Click "Add Weight" to start tracking
                  your progress!
                </p>
              </div>
            )}

            {/* Stats Summary */}
            {weightEntries.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">📊</span>
                    <p className="text-xs font-bold text-blue-700 uppercase">
                      Starting Weight
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {weightEntries[0]?.weight} kg
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {new Date(weightEntries[0]?.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>

                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">⚖️</span>
                    <p className="text-xs font-bold text-green-700 uppercase">
                      Current Weight
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {weightEntries[weightEntries.length - 1]?.weight} kg
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {new Date(
                      weightEntries[weightEntries.length - 1]?.date,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <p className="text-xs font-bold text-orange-700 uppercase">
                      Target Weight
                    </p>
                    <button
                      onClick={() => {
                        setShowTargetForm(!showTargetForm);
                        setNewTargetWeight(targetWeight);
                      }}
                      className="ml-auto text-orange-600 hover:text-orange-800 text-xs font-bold"
                    >
                      Edit
                    </button>
                  </div>
                  {showTargetForm ? (
                    <form onSubmit={handleUpdateTargetWeight} className="mt-2">
                      <input
                        type="number"
                        step="0.1"
                        value={newTargetWeight}
                        onChange={(e) => setNewTargetWeight(e.target.value)}
                        className="w-full px-2 py-1 border-2 border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold"
                        required
                      />
                      <div className="flex gap-1 mt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTargetForm(false)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                        {targetWeight} kg
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
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

                <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">📈</span>
                    <p className="text-xs font-bold text-purple-700 uppercase">
                      Total Change
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {weightEntries[weightEntries.length - 1]?.weight -
                      weightEntries[0]?.weight >
                    0
                      ? "+"
                      : ""}
                    {(
                      weightEntries[weightEntries.length - 1]?.weight -
                      weightEntries[0]?.weight
                    ).toFixed(1)}{" "}
                    kg
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
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
        <div className="bg-linear-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
          {(() => {
            // Get current day
            const daysOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            const today = daysOfWeek[new Date().getDay()];

            // Find today's workout schedule
            const todaySchedule = workoutSchedule.find((s) => s.day === today);
            const todayMuscleGroups = todaySchedule?.muscleGroups || [];

            // Filter exercises for today's muscle groups
            const todayExercises = exercises.filter((ex) =>
              todayMuscleGroups.includes(ex.muscleGroup),
            );

            return (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-4xl sm:text-5xl lg:text-6xl">💪</span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Today's Workout
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 font-semibold">
                        {today} Session
                      </p>
                    </div>
                  </div>
                  {todayMuscleGroups.length > 0 && (
                    <span className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg">
                      {todayMuscleGroups.join(" & ")}
                    </span>
                  )}
                </div>

                {/* Dynamic Exercises by Muscle Group */}
                {todayExercises.length > 0 ? (
                  <>
                    {todayMuscleGroups.map((muscleGroup) => {
                      const groupExercises = todayExercises.filter(
                        (ex) => ex.muscleGroup === muscleGroup,
                      );

                      if (groupExercises.length === 0) return null;

                      return (
                        <div key={muscleGroup} className="mb-8">
                          <div className="mb-4">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                              {muscleGroup}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {groupExercises.length} Exercise
                              {groupExercises.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {groupExercises.map((exercise) => (
                              <div
                                key={exercise._id}
                                className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${
                                  exercise.type === "COMPOUND"
                                    ? "border-blue-500"
                                    : "border-red-500"
                                }`}
                              >
                                <div
                                  className={`bg-linear-to-r ${
                                    exercise.type === "COMPOUND"
                                      ? "from-blue-50 via-indigo-50 to-purple-50"
                                      : "from-red-50 via-pink-50 to-red-50"
                                  } px-4 sm:px-6 py-3 sm:py-4`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                                      {exercise.name}
                                    </h4>
                                    <span
                                      className={`inline-block ${
                                        exercise.type === "COMPOUND"
                                          ? "bg-blue-600"
                                          : "bg-purple-600"
                                      } text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}
                                    >
                                      {exercise.type}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse table-fixed">
                                      <thead>
                                        <tr className="bg-gray-100">
                                          <th className="w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                            Warm Up
                                          </th>
                                          <th className="w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                            Working
                                          </th>
                                          <th className="w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                            Last PR
                                          </th>
                                          <th className="w-1/4 px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                            Last PR Date
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="hover:bg-gray-50">
                                          <td className="px-3 py-4 border-b border-gray-200">
                                            {editingExercise ===
                                            exercise._id ? (
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
                                                className="w-full px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-600 text-lg"
                                                placeholder="20"
                                              />
                                            ) : (
                                              <div className="font-bold text-orange-600 text-lg">
                                                {exercise.warmUp
                                                  ? `${exercise.warmUp} kg`
                                                  : "-"}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-3 py-4 border-b border-gray-200">
                                            {editingExercise ===
                                            exercise._id ? (
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
                                                className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 text-lg"
                                                placeholder="35"
                                              />
                                            ) : (
                                              <div className="font-bold text-blue-600 text-lg">
                                                {exercise.working
                                                  ? `${exercise.working} kg`
                                                  : "-"}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-3 py-4 border-b border-gray-200">
                                            {editingExercise ===
                                            exercise._id ? (
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
                                                className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-green-600 text-lg"
                                                placeholder="42.5"
                                              />
                                            ) : (
                                              <div className="font-bold text-green-600 text-lg">
                                                {exercise.lastPR
                                                  ? `${exercise.lastPR} kg`
                                                  : "-"}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-3 py-4 border-b border-gray-200">
                                            {editingExercise ===
                                            exercise._id ? (
                                              <input
                                                type="date"
                                                value={editFormData.lastPRDate}
                                                onChange={(e) =>
                                                  setEditFormData({
                                                    ...editFormData,
                                                    lastPRDate: e.target.value,
                                                  })
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm text-gray-700"
                                              />
                                            ) : (
                                              <div className="text-sm text-gray-700">
                                                {exercise.lastPRDate ? (
                                                  <div>
                                                    <div>
                                                      {exercise.lastPRDate}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      {calculateDaysSince(
                                                        exercise.lastPRDate,
                                                      ) === 0
                                                        ? "Today"
                                                        : calculateDaysSince(
                                                              exercise.lastPRDate,
                                                            ) === 1
                                                          ? "1 day ago"
                                                          : `${calculateDaysSince(exercise.lastPRDate)} days ago`}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  "-"
                                                )}
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            colSpan="4"
                                            className="px-3 py-2 border-b border-gray-200"
                                          >
                                            <div className="flex justify-end gap-2">
                                              {editingExercise ===
                                              exercise._id ? (
                                                <>
                                                  <button
                                                    onClick={() =>
                                                      handleSaveExercise(
                                                        exercise._id,
                                                      )
                                                    }
                                                    className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm font-semibold"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-500 text-white px-4 py-1 rounded-lg hover:bg-gray-600 text-sm font-semibold"
                                                  >
                                                    Cancel
                                                  </button>
                                                </>
                                              ) : (
                                                <button
                                                  onClick={() =>
                                                    handleEditExercise(exercise)
                                                  }
                                                  className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                                >
                                                  Edit
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">😴</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      {todayMuscleGroups.includes("Rest Day")
                        ? "Rest Day"
                        : "No Workout Scheduled"}
                    </h3>
                    <p className="text-gray-600">
                      {todayMuscleGroups.includes("Rest Day")
                        ? "Take a well-deserved break and let your muscles recover!"
                        : "No exercises found for today's muscle groups. Contact your trainer."}
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
