"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Helper function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function MealTrackingPage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showMealStats, setShowMealStats] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mealSearch, setMealSearch] = useState("");
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [globalSchedule, setGlobalSchedule] = useState([
    "Paneer",
    "Chicken",
    "Paneer",
    "Chicken",
    "Paneer",
    "Chicken",
    "Paneer",
  ]);

  // Fetch global meal schedule
  const fetchGlobalSchedule = async () => {
    try {
      const res = await fetch(`/api/settings/meal-schedule?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setGlobalSchedule(data.mealDays);
      }
    } catch (error) {
      console.error("Error fetching global schedule:", error);
    }
  };

  // Refresh user data and schedule when component mounts or becomes visible
  useEffect(() => {
    checkAuth();
    fetchGlobalSchedule();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
        fetchGlobalSchedule();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMealDropdown && !event.target.closest(".meal-dropdown")) {
        setShowMealDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMealDropdown]);

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
      fetchDailyLog();
      fetchMeals();
    }
  }, [user, currentDate]);

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

  const handleAddMeal = async (e) => {
    e.preventDefault();

    if (!selectedMeal || quantity <= 0) {
      alert("Please select a meal and enter a valid quantity");
      return;
    }

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
        setSelectedMeal("");
        setQuantity(1);
        setMealSearch("");
        setShowMealDropdown(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add meal");
      }
    } catch (error) {
      console.error("Error adding meal:", error);
      alert("Failed to add meal");
    }
  };

  const handleUpdateQuantity = async (entryId, newQuantity) => {
    const qty = parseFloat(newQuantity);

    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be greater than 0");
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
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm("Are you sure you want to remove this meal?")) return;

    try {
      const res = await fetch(`/api/daily-log/${entryId}?date=${currentDate}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLog(data.dailyLog);
      } else {
        const data = await res.json();
        console.error("Delete failed:", data);
        alert(data.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  const getMealsByType = (type) => {
    if (!dailyLog) return [];
    return dailyLog.meals.filter((entry) => entry.mealType === type);
  };

  const MacroMeter = ({ label, value, max, color, icon, bgClass }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isOverLimit = value > max;

    return (
      <div className="mb-6 last:mb-0 group">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 bg-neutral-800 rounded-lg text-lg border border-neutral-700">
              {icon}
            </span>
            <span className="text-sm font-bold text-neutral-300 uppercase tracking-wide">
              {label}
            </span>
          </div>
          <div className="text-right flex items-baseline gap-1">
            <span
              className={`text-sm font-bold ${
                isOverLimit ? "text-red-500" : "text-white"
              }`}
            >
              {value}
            </span>
            <span className="text-xs text-neutral-600 font-medium">/</span>
            <span className="text-xs text-neutral-500">{max}</span>
            {hasPreview &&
              value !==
                previewMacros[
                  label.toLowerCase().split(" ")[0].replace("(g)", "")
                ] && (
                <span className="ml-1 text-lime-500 font-bold animate-pulse text-xs">
                  +
                  {label.includes("Calories")
                    ? previewMacros.calories - value
                    : label.includes("Protein")
                      ? Math.round((previewMacros.protein - value) * 10) / 10
                      : label.includes("Carbs")
                        ? Math.round((previewMacros.carbs - value) * 10) / 10
                        : Math.round((previewMacros.fats - value) * 10) / 10}
                </span>
              )}
          </div>
        </div>
        <div
          className={`w-full bg-neutral-950 rounded-full h-2 relative overflow-hidden border border-neutral-800`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${color} ${
              isOverLimit ? "animate-pulse" : ""
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
          {hasPreview && (
            <div
              className={`h-full rounded-full absolute top-0 left-0 transition-all duration-300 opacity-30 bg-lime-500`}
              style={{
                width: `${Math.min(
                  ((label.includes("Calories")
                    ? previewMacros.calories
                    : label.includes("Protein")
                      ? previewMacros.protein
                      : label.includes("Carbs")
                        ? previewMacros.carbs
                        : previewMacros.fats) /
                    max) *
                    100,
                  100,
                )}%`,
              }}
            ></div>
          )}
        </div>
      </div>
    );
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

  if (!user || user.isAdmin) {
    return null;
  }

  const totalMacros = dailyLog?.totalMacros || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  // Calculate preview macros when a meal is selected
  const getPreviewMacros = () => {
    if (!selectedMeal || !quantity) return totalMacros;

    const meal = meals.find((m) => m._id === selectedMeal);
    if (!meal) return totalMacros;

    const qty = parseFloat(quantity) || 0;
    return {
      calories: totalMacros.calories + Math.round(meal.macros.calories * qty),
      protein:
        Math.round((totalMacros.protein + meal.macros.protein * qty) * 10) / 10,
      carbs:
        Math.round((totalMacros.carbs + meal.macros.carbs * qty) * 10) / 10,
      fats: Math.round((totalMacros.fats + meal.macros.fats * qty) * 10) / 10,
    };
  };

  const previewMacros = getPreviewMacros();
  const hasPreview = selectedMeal && quantity > 0;

  // Daily goals from environment variables
  const goals = {
    calories: parseInt(process.env.NEXT_PUBLIC_GOAL_CALORIES) || 1900,
    protein: parseInt(process.env.NEXT_PUBLIC_GOAL_PROTEIN) || 120,
    carbs: parseInt(process.env.NEXT_PUBLIC_GOAL_CARBS) || 170,
    fats: parseInt(process.env.NEXT_PUBLIC_GOAL_FATS) || 60,
  };

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
              {/* Date Picker */}
              <div className="relative group">
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-sm font-bold text-white cursor-pointer hover:bg-neutral-800 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="h-6 w-px bg-neutral-800"></div>

              <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => router.push("/dashboard/meal")}
                  className="px-4 py-2 bg-lime-500 text-black rounded-lg shadow-lg shadow-lime-500/20 font-bold text-sm flex items-center gap-2 transition-all uppercase tracking-wide"
                >
                  Meal
                </button>
                <button
                  onClick={() => router.push("/dashboard/gym")}
                  className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wide"
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
                  className="text-neutral-500 hover:text-red-500 transition-colors"
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

              <div className="pb-4">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-2">
                  Select Date
                </p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full py-3 px-4 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-medium focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    router.push("/dashboard/meal");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Meal Tracker <span className="text-lime-500">●</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl font-bold uppercase tracking-wider"
                >
                  Gym Tracker
                </button>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-800">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 rounded-xl font-bold uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Macro Meters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-lime-500/10 p-2 rounded-lg text-lime-500 border border-lime-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                      Macros
                    </h2>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                      Daily Targets
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <MacroMeter
                  label="Calories"
                  value={totalMacros.calories}
                  max={goals.calories}
                  color="bg-blue-500"
                  icon="🔥"
                />

                <MacroMeter
                  label="Protein"
                  value={totalMacros.protein}
                  max={goals.protein}
                  color="bg-lime-500"
                  icon="🍖"
                />

                <MacroMeter
                  label="Carbs"
                  value={totalMacros.carbs}
                  max={goals.carbs}
                  color="bg-amber-500"
                  icon="🥔"
                />

                <MacroMeter
                  label="Fats"
                  value={totalMacros.fats}
                  max={goals.fats}
                  color="bg-purple-500"
                  icon="🥑"
                />
              </div>

              {/* Summary with 2x2 Grid */}
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
                  Remaining
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Calories",
                      val: goals.calories - totalMacros.calories,
                      unit: "kcal",
                      color: "text-blue-500",
                      borderColor: "group-hover:border-blue-500/50",
                    },
                    {
                      label: "Protein",
                      val: (goals.protein - totalMacros.protein).toFixed(1),
                      unit: "g",
                      color: "text-lime-500",
                      borderColor: "group-hover:border-lime-500/50",
                    },
                    {
                      label: "Carbs",
                      val: (goals.carbs - totalMacros.carbs).toFixed(1),
                      unit: "g",
                      color: "text-amber-500",
                      borderColor: "group-hover:border-amber-500/50",
                    },
                    {
                      label: "Fats",
                      val: (goals.fats - totalMacros.fats).toFixed(1),
                      unit: "g",
                      color: "text-purple-500",
                      borderColor: "group-hover:border-purple-500/50",
                    },
                  ].map((item, idx) => {
                    const valNum = parseFloat(item.val);
                    const isExceeded = valNum < 0;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 transition-colors group ${item.borderColor}`}
                      >
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`text-xl font-black ${
                            isExceeded ? "text-red-500" : "text-white"
                          }`}
                        >
                          {isExceeded
                            ? `+${Math.abs(valNum).toFixed(
                                item.label === "Calories" ? 0 : 1,
                              )}`
                            : valNum}
                          <span className="text-xs font-bold ml-1 opacity-50 text-neutral-400">
                            {item.unit}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Meal Sections */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            {/* Day Type Banner */}
            {user &&
              (() => {
                const [y, m, d] = currentDate.split("-").map(Number);
                const dayIndex = new Date(y, m - 1, d).getDay();
                const dayType = globalSchedule[dayIndex] || "Paneer";
                const isChickenDay = dayType === "Chicken";

                return (
                  <div className="relative p-8 rounded-2xl overflow-hidden group border border-neutral-800 transition-all duration-300 hover:border-lime-500/50">
                    {/* Background */}
                    <div
                      className={`absolute inset-0 bg-neutral-900 ${isChickenDay ? "bg-linear-to-br from-orange-950/40 to-neutral-900" : "bg-linear-to-br from-lime-950/40 to-neutral-900"} z-0`}
                    ></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-white gap-6">
                      <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                          <span className="bg-lime-500 text-black px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                            Daily Plan
                          </span>
                          <span className="text-neutral-400 text-sm font-bold uppercase tracking-wider">
                            {new Date(y, m - 1, d).toLocaleDateString("en-US", {
                              weekday: "long",
                            })}
                          </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic">
                          {isChickenDay ? "Chicken" : "Paneer"}{" "}
                          <span className="text-transparent bg-clip-text pr-2 bg-linear-to-r from-lime-500 to-lime-200">
                            Day
                          </span>
                        </h2>
                        <p className="text-neutral-400 font-medium text-sm max-w-md">
                          {isChickenDay
                            ? "Focus on lean protein consumption today to maximize muscle recovery."
                            : "Healthy fats and vegetarian protein sources are prioritized today."}
                        </p>
                      </div>
                      <div className="text-7xl sm:text-8xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        {isChickenDay ? "🍗" : "🧀"}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Add Meal Form */}
            <div className="bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-800 relative z-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-1 bg-lime-500 rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Add Meal
                  </h2>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                    Log your intake
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddMeal}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                <div className="md:col-span-3">
                  <label className="block text-neutral-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="w-full h-14 px-4 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all text-white font-bold cursor-pointer appearance-none uppercase text-sm tracking-wider"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-lime-500">
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="meal-dropdown md:col-span-7 relative z-30">
                  <label className="block text-neutral-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                    Item
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={
                          mealSearch ||
                          (selectedMeal
                            ? meals.find((m) => m._id === selectedMeal)?.name
                              ? toTitleCase(
                                  meals.find((m) => m._id === selectedMeal)
                                    .name,
                                )
                              : ""
                            : "")
                        }
                        onChange={(e) => {
                          setMealSearch(e.target.value);
                          setShowMealDropdown(true);
                        }}
                        onFocus={() => setShowMealDropdown(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const filteredMeals = meals.filter((meal) =>
                              meal.name
                                .toLowerCase()
                                .includes(mealSearch.toLowerCase()),
                            );
                            if (filteredMeals.length === 1) {
                              setSelectedMeal(filteredMeals[0]._id);
                              setMealSearch("");
                              setShowMealDropdown(false);
                            } else if (filteredMeals.length > 1) {
                              setSelectedMeal(filteredMeals[0]._id);
                              setMealSearch("");
                              setShowMealDropdown(false);
                            }
                          }
                        }}
                        className="w-full h-14 pl-11 pr-4 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all text-white placeholder-neutral-600 font-medium text-sm"
                        placeholder="Search database..."
                        required={!selectedMeal}
                      />
                      {showMealDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                          {meals
                            .filter((meal) =>
                              meal.name
                                .toLowerCase()
                                .includes(mealSearch.toLowerCase()),
                            )
                            .map((meal) => (
                              <div
                                key={meal._id}
                                onClick={() => {
                                  setSelectedMeal(meal._id);
                                  setMealSearch("");
                                  setShowMealDropdown(false);
                                }}
                                className="px-4 py-3 hover:bg-neutral-800 cursor-pointer text-gray-300 text-sm flex justify-between items-center group transition-colors border-b border-neutral-800 last:border-0"
                              >
                                <span className="font-bold text-white group-hover:text-lime-500 transition-colors">
                                  {toTitleCase(meal.name)}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-bold uppercase bg-neutral-950 px-2 py-1 rounded">
                                  {meal.servingSize}
                                </span>
                              </div>
                            ))}
                          {meals.filter((meal) =>
                            meal.name
                              .toLowerCase()
                              .includes(mealSearch.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-4 py-8 text-center text-neutral-500 text-sm flex flex-col items-center gap-2">
                              <span className="text-2xl opacity-20">🔍</span>
                              No matching meals found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMealStats(!showMealStats)}
                      disabled={!selectedMeal}
                      className="shrink-0 w-14 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-xl hover:bg-neutral-700 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                      title="Show info"
                    >
                      <span className="text-lg">ℹ️</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-neutral-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                    Qty
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-14 px-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all text-white font-bold text-center text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-12">
                  <button
                    type="submit"
                    className="w-full bg-lime-500 text-black py-4 rounded-xl hover:bg-lime-400 transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)] font-black uppercase tracking-wider transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    ADD ENTRY
                  </button>
                </div>
              </form>

              {/* Meal Stats Display */}
              {showMealStats && selectedMeal && (
                <div className="mt-6 p-4 bg-neutral-950 rounded-xl border border-neutral-800 animation-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                      Nutritional Data (Per Unit)
                    </h3>
                    <button
                      onClick={() => setShowMealStats(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {(() => {
                    const meal = meals.find((m) => m._id === selectedMeal);
                    if (!meal) return null;
                    return (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-center">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1">
                            Cal
                          </span>
                          <span className="font-bold text-white text-lg">
                            {meal.macros.calories}
                          </span>
                        </div>
                        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-center">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1">
                            Pro
                          </span>
                          <span className="font-bold text-lime-500 text-lg">
                            {meal.macros.protein}
                          </span>
                        </div>
                        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-center">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1">
                            Carb
                          </span>
                          <span className="font-bold text-amber-500 text-lg">
                            {meal.macros.carbs}
                          </span>
                        </div>
                        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-center">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1">
                            Fat
                          </span>
                          <span className="font-bold text-purple-500 text-lg">
                            {meal.macros.fats}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Breakfast */}
            <MealSection
              title="Breakfast"
              meals={getMealsByType("breakfast")}
              onUpdateQuantity={handleUpdateQuantity}
              onDelete={handleDeleteEntry}
            />

            {/* Lunch */}
            <MealSection
              title="Lunch"
              meals={getMealsByType("lunch")}
              onUpdateQuantity={handleUpdateQuantity}
              onDelete={handleDeleteEntry}
            />

            {/* Dinner */}
            <MealSection
              title="Dinner"
              meals={getMealsByType("dinner")}
              onUpdateQuantity={handleUpdateQuantity}
              onDelete={handleDeleteEntry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MealSection({ title, meals, onUpdateQuantity, onDelete }) {
  const getMealIcon = (title) => {
    switch (title.toLowerCase()) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      default:
        return "🍽️";
    }
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 bg-neutral-800 rounded-xl text-2xl border border-neutral-700 shadow-inner">
            {getMealIcon(title)}
          </span>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              {title}
            </h2>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
              {meals.length} {meals.length === 1 ? "Item" : "Items"} Logged
            </p>
          </div>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-10 rounded-xl bg-neutral-950/50 border border-dashed border-neutral-800">
          <p className="text-neutral-600 font-bold text-sm uppercase tracking-wider">
            No meals logged
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((entry) => {
            return (
              <div
                key={entry._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-lime-500/30 transition-all duration-300 gap-4 group"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-start items-start w-full">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg">
                          {toTitleCase(entry.mealName)}
                        </h3>
                        <span className="px-2 py-0.5 bg-neutral-900 rounded-md text-[10px] text-neutral-400 font-bold border border-neutral-800 uppercase tracking-wider">
                          {entry.meal?.servingSize || "1 unit"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="font-bold text-neutral-300">
                          {entry.meal?.macros?.calories || 0}{" "}
                          <span className="text-neutral-600">kcal</span>
                        </span>
                        <span className="w-px h-3 bg-neutral-800 my-auto"></span>
                        <span className="font-bold text-lime-500">
                          {entry.meal?.macros?.protein || 0}g P
                        </span>
                        <span className="font-bold text-amber-500">
                          {entry.meal?.macros?.carbs || 0}g C
                        </span>
                        <span className="font-bold text-purple-500">
                          {entry.meal?.macros?.fats || 0}g F
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1 bg-neutral-900 rounded-lg border border-neutral-800 p-1">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          Math.max(0.5, parseFloat(entry.quantity) - 0.5),
                        )
                      }
                      className="w-8 h-8 rounded hover:bg-neutral-800 transition flex items-center justify-center font-bold text-neutral-400 cursor-pointer hover:text-white"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={entry.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(entry._id, parseFloat(e.target.value))
                      }
                      className="w-10 text-center text-sm font-bold text-white bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          parseFloat(entry.quantity) + 0.5,
                        )
                      }
                      className="w-8 h-8 rounded hover:bg-neutral-800 transition flex items-center justify-center font-bold text-neutral-400 cursor-pointer hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(entry._id)}
                    className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-all cursor-pointer"
                    title="Delete entry"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
