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
      <div className="mb-5 last:mb-0 group">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-100 text-lg transition-transform group-hover:scale-110 duration-300">
              {icon}
            </span>
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </div>
          <div className="text-right flex items-baseline gap-1">
            <span
              className={`text-sm font-bold ${
                isOverLimit ? "text-red-500" : "text-gray-900"
              }`}
            >
              {value}
            </span>
            <span className="text-xs text-gray-400 font-medium">/</span>
            <span className="text-xs text-gray-500">{max}</span>
            {hasPreview &&
              value !==
                previewMacros[
                  label.toLowerCase().split(" ")[0].replace("(g)", "")
                ] && (
                <span className="ml-1 text-green-600 font-bold animate-pulse text-xs">
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
          className={`w-full ${
            bgClass || "bg-gray-100"
          } rounded-full h-2.5 relative overflow-hidden ring-1 ring-inset ring-black/5`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${color} ${
              isOverLimit ? "animate-pulse" : ""
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
          {hasPreview && (
            <div
              className={`h-full rounded-full absolute top-0 left-0 transition-all duration-300 opacity-30 bg-green-500`}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-200 text-white">
                🍽️
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
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-700 cursor-pointer hover:bg-white"
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
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <span className="text-lg">🍽️</span> Meal
                </button>
                <button
                  onClick={() => router.push("/dashboard/gym")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span className="text-lg grayscale opacity-70">💪</span> Gym
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
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
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
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
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
                  className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold transition"
                >
                  <span>🍽️</span> Meal Tracking
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition cursor-pointer"
                >
                  <span className="grayscale opacity-70">💪</span> Gym Tracking
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Macro Meters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-indigo-100/50 lg:sticky lg:top-6 border border-white/50 ring-1 ring-white/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
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
                    <h2 className="text-lg font-bold text-gray-900">
                      Today's Macros
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Daily Nutritional Goals
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <MacroMeter
                  label="Calories"
                  value={totalMacros.calories}
                  max={goals.calories}
                  color="bg-linear-to-r from-blue-500 to-blue-600"
                  bgClass="bg-blue-50"
                  icon="🔥"
                />

                <MacroMeter
                  label="Protein"
                  value={totalMacros.protein}
                  max={goals.protein}
                  color="bg-linear-to-r from-red-500 to-pink-600"
                  bgClass="bg-red-50"
                  icon="🍖"
                />

                <MacroMeter
                  label="Carbs"
                  value={totalMacros.carbs}
                  max={goals.carbs}
                  color="bg-linear-to-r from-yellow-500 to-orange-600"
                  bgClass="bg-orange-50"
                  icon="🍞"
                />

                <MacroMeter
                  label="Fats"
                  value={totalMacros.fats}
                  max={goals.fats}
                  color="bg-linear-to-r from-green-500 to-emerald-600"
                  bgClass="bg-green-50"
                  icon="🥑"
                />
              </div>

              {/* Summary with 2x2 Grid */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">
                  Remaining Intake
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Calories",
                      val: goals.calories - totalMacros.calories,
                      unit: "kcal",
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Protein",
                      val: (goals.protein - totalMacros.protein).toFixed(1),
                      unit: "g",
                      color: "text-red-600",
                      bg: "bg-red-50",
                    },
                    {
                      label: "Carbs",
                      val: (goals.carbs - totalMacros.carbs).toFixed(1),
                      unit: "g",
                      color: "text-orange-600",
                      bg: "bg-orange-50",
                    },
                    {
                      label: "Fats",
                      val: (goals.fats - totalMacros.fats).toFixed(1),
                      unit: "g",
                      color: "text-green-600",
                      bg: "bg-green-50",
                    },
                  ].map((item, idx) => {
                    const valNum = parseFloat(item.val);
                    const isExceeded = valNum < 0;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors ${item.bg} bg-opacity-40`}
                      >
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            isExceeded ? "text-red-500" : item.color
                          }`}
                        >
                          {isExceeded
                            ? `+${Math.abs(valNum).toFixed(
                                item.label === "Calories" ? 0 : 1,
                              )}`
                            : `-${valNum}`}
                          <span className="text-xs font-medium ml-0.5 opacity-70 text-gray-600">
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
                  <div
                    className={`p-6 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl border border-white/20 ${
                      isChickenDay
                        ? "bg-linear-to-br from-orange-500 via-red-500 to-rose-600 shadow-orange-500/20"
                        : "bg-linear-to-br from-emerald-500 via-green-500 to-teal-600 shadow-emerald-500/20"
                    }`}
                  >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                        className="text-white"
                      >
                        <circle cx="50" cy="50" r="50" />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 p-8 opacity-10 transform -translate-x-4 translate-y-4">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                        className="text-white"
                      >
                        <rect width="100" height="100" rx="20" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-white">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-white/30">
                           Protein Plan 
                          </span>
                          <span className="text-white/90 text-sm font-semibold">
                            {new Date(y, m - 1, d).toLocaleDateString("en-US", {
                              weekday: "long",
                            })}
                          </span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-1 text-white shadow-sm">
                          {isChickenDay ? "Chicken Day" : "Paneer Day"}
                        </h2>
                        <p className="text-blue-50/90 font-medium text-sm">
                          {isChickenDay
                            ? "Fuel your muscles with lean protein!"
                            : "Rich protein & healthy fats day!"}
                        </p>
                      </div>
                      <div className="text-6xl drop-shadow-xl filter backdrop-brightness-110 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        {isChickenDay ? "🍗" : "🧀"}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Add Meal Form */}
            <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-indigo-100/50 border border-white/50 ring-1 ring-white/50 relative z-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-linear-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add Meal</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Log your daily nutrition
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddMeal}
                className="grid grid-cols-1 md:grid-cols-12 gap-4"
              >
                <div className="md:col-span-3">
                  <label className="block text-gray-700 font-bold mb-2 text-xs uppercase tracking-wider">
                    Meal Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 font-medium cursor-pointer appearance-none hover:bg-white"
                    >
                      <option value="breakfast">🌅 Breakfast</option>
                      <option value="lunch">☀️ Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
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
                  <label className="block text-gray-700 font-bold mb-2 text-xs uppercase tracking-wider">
                    Select Meal
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 placeholder-gray-400 font-medium hover:bg-white"
                        placeholder="Search for food..."
                        required={!selectedMeal}
                      />
                      {showMealDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-indigo-100/50 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200">
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
                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-700 text-sm flex justify-between items-center group transition-colors border-b border-gray-50 last:border-0"
                              >
                                <span className="font-medium group-hover:text-indigo-700">
                                  {toTitleCase(meal.name)}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-white">
                                  {meal.servingSize}
                                </span>
                              </div>
                            ))}
                          {meals.filter((meal) =>
                            meal.name
                              .toLowerCase()
                              .includes(mealSearch.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                              <span className="text-2xl opacity-50">🔍</span>
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
                      className="shrink-0 w-12 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-sm"
                      title="Show meal stats"
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2 text-xs uppercase tracking-wider">
                    Qty
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 font-medium text-center hover:bg-white"
                    required
                  />
                </div>

                <div className="md:col-span-12 mt-2">
                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200 font-bold tracking-wide transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add to Daily Log
                  </button>
                </div>
              </form>

              {/* Meal Stats Display */}
              {showMealStats && selectedMeal && (
                <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animation-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      <span className="text-lg">🍎</span>
                      Nutritional Information
                    </h3>
                    <button
                      onClick={() => setShowMealStats(false)}
                      className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition cursor-pointer"
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">
                            Calories
                          </span>
                          <p className="font-bold text-gray-800 text-lg">
                            {meal.macros.calories}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              kcal
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">
                            Protein
                          </span>
                          <p className="font-bold text-gray-800 text-lg">
                            {meal.macros.protein}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              g
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">
                            Carbs
                          </span>
                          <p className="font-bold text-gray-800 text-lg">
                            {meal.macros.carbs}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              g
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100/50">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">
                            Fats
                          </span>
                          <p className="font-bold text-gray-800 text-lg">
                            {meal.macros.fats}
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              g
                            </span>
                          </p>
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

  const getGradient = (title) => {
    switch (title.toLowerCase()) {
      case "breakfast":
        return "from-orange-50/50 to-amber-50/50";
      case "lunch":
        return "from-blue-50/50 to-cyan-50/50";
      case "dinner":
        return "from-indigo-50/50 to-violet-50/50";
      default:
        return "from-gray-50/50 to-slate-50/50";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-indigo-100/50 border border-white/50 ring-1 ring-white/50 hover:shadow-indigo-200/50 transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 text-xl">
            {getMealIcon(title)}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              {meals.length} {meals.length === 1 ? "Item" : "Items"} Logged
            </p>
          </div>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 group hover:border-gray-300 transition-colors">
          <span className="text-3xl block mb-2 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
            {getMealIcon(title)}
          </span>
          <p className="text-gray-400 font-medium text-sm">
            No meals logged for {title.toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((entry) => {
            return (
              <div
                key={entry._id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-linear-to-r ${getGradient(
                  title,
                )} rounded-xl border border-gray-100/50 hover:border-indigo-200 hover:shadow-md transition-all duration-300 gap-4 group`}
              >
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                      {toTitleCase(entry.mealName)}
                    </h3>
                    <span className="px-2 py-0.5 bg-white rounded-md text-xs text-gray-500 font-medium shadow-sm border border-gray-100">
                      {entry.meal?.servingSize || "1 serving"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      🔥 {entry.meal?.macros?.calories || 0} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {entry.meal?.macros?.protein || 0}g P
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      {entry.meal?.macros?.carbs || 0}g C
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {entry.meal?.macros?.fats || 0}g F
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200/50 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          Math.max(0.5, parseFloat(entry.quantity) - 0.5),
                        )
                      }
                      className="w-7 h-7 bg-gray-50 rounded-md hover:bg-gray-100 transition flex items-center justify-center font-bold text-gray-600 cursor-pointer hover:text-indigo-600"
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
                      className="w-10 text-center text-sm font-bold text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          parseFloat(entry.quantity) + 0.5,
                        )
                      }
                      className="w-7 h-7 bg-gray-50 rounded-md hover:bg-gray-100 transition flex items-center justify-center font-bold text-gray-600 cursor-pointer hover:text-indigo-600"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(entry._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
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
