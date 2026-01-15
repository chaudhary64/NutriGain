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
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showMealStats, setShowMealStats] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd")
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
        a.name.localeCompare(b.name)
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

  const MacroMeter = ({ label, value, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <span className="text-sm font-medium text-gray-800">
            {value} / {max}
            {hasPreview &&
              value !==
                previewMacros[
                  label.toLowerCase().split(" ")[0].replace("(g)", "")
                ] && (
                <span className="ml-2 text-green-600 font-bold">
                  →{" "}
                  {label.includes("Calories")
                    ? previewMacros.calories
                    : label.includes("Protein")
                    ? previewMacros.protein
                    : label.includes("Carbs")
                    ? previewMacros.carbs
                    : previewMacros.fats}
                </span>
              )}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
          {hasPreview && (
            <div
              className="h-4 rounded-full absolute top-0 left-0 opacity-40 transition-all duration-300 bg-green-400"
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
                  100
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
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">🍽️</div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Meal Tracking
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
                  className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  🍽️ Meal Tracking
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/gym");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition font-medium text-sm flex items-center gap-2 cursor-pointer"
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
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 cursor-pointer text-sm"
              />

              <button
                onClick={() => router.push("/dashboard/meal")}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm flex items-center gap-1 cursor-pointer"
              >
                🍽️ Meal
              </button>

              <button
                onClick={() => router.push("/dashboard/gym")}
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition font-medium text-sm flex items-center gap-1 cursor-pointer"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Macro Meters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg lg:sticky lg:top-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">📊</span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Today's Macros
                </h2>
              </div>

              <MacroMeter
                label="Calories"
                value={totalMacros.calories}
                max={goals.calories}
                color="bg-linear-to-r from-blue-500 to-blue-600"
              />

              <MacroMeter
                label="Protein (g)"
                value={totalMacros.protein}
                max={goals.protein}
                color="bg-linear-to-r from-red-500 to-pink-600"
              />

              <MacroMeter
                label="Carbs (g)"
                value={totalMacros.carbs}
                max={goals.carbs}
                color="bg-linear-to-r from-yellow-500 to-orange-600"
              />

              <MacroMeter
                label="Fats (g)"
                value={totalMacros.fats}
                max={goals.fats}
                color="bg-linear-to-r from-green-500 to-emerald-600"
              />

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span>📈</span>Summary
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span>
                      Calories{" "}
                      {totalMacros.calories > goals.calories
                        ? "Exceeded:"
                        : "Remaining:"}
                    </span>
                    <span
                      className={`font-bold ${
                        totalMacros.calories > goals.calories
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {totalMacros.calories > goals.calories
                        ? `+${totalMacros.calories - goals.calories}`
                        : goals.calories - totalMacros.calories}{" "}
                      kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Protein{" "}
                      {totalMacros.protein > goals.protein
                        ? "Exceeded:"
                        : "Remaining:"}
                    </span>
                    <span
                      className={`font-bold ${
                        totalMacros.protein > goals.protein
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {totalMacros.protein > goals.protein
                        ? `+${(totalMacros.protein - goals.protein).toFixed(1)}`
                        : (goals.protein - totalMacros.protein).toFixed(1)}
                      g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Carbs{" "}
                      {totalMacros.carbs > goals.carbs
                        ? "Exceeded:"
                        : "Remaining:"}
                    </span>
                    <span
                      className={`font-bold ${
                        totalMacros.carbs > goals.carbs
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {totalMacros.carbs > goals.carbs
                        ? `+${(totalMacros.carbs - goals.carbs).toFixed(1)}`
                        : (goals.carbs - totalMacros.carbs).toFixed(1)}
                      g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Fats{" "}
                      {totalMacros.fats > goals.fats
                        ? "Exceeded:"
                        : "Remaining:"}
                    </span>
                    <span
                      className={`font-bold ${
                        totalMacros.fats > goals.fats
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {totalMacros.fats > goals.fats
                        ? `+${(totalMacros.fats - goals.fats).toFixed(1)}`
                        : (goals.fats - totalMacros.fats).toFixed(1)}
                      g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Sections */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Add Meal Form */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">➕</span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Add Meal
                </h2>
              </div>
              <form
                onSubmit={handleAddMeal}
                className="grid grid-cols-1 gap-3 sm:gap-4"
              >
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Meal Type
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 bg-white cursor-pointer text-sm sm:text-base"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Select Meal
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedMeal}
                      onChange={(e) => setSelectedMeal(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 bg-white cursor-pointer text-sm sm:text-base"
                      required
                    >
                      <option value="">Choose a meal...</option>
                      {meals.map((meal) => (
                        <option key={meal._id} value={meal._id}>
                          {toTitleCase(meal.name)} ({meal.servingSize})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowMealStats(!showMealStats)}
                      disabled={!selectedMeal}
                      className="shrink-0 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium cursor-pointer text-sm sm:text-base"
                      title="Show meal stats"
                    >
                      📊
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-semibold cursor-pointer text-sm sm:text-base"
                  >
                    Add to Log
                  </button>
                </div>
              </form>

              {/* Meal Stats Display */}
              {showMealStats && selectedMeal && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                      <span>📊</span>
                      Meal Nutritional Info
                    </h3>
                    <button
                      onClick={() => setShowMealStats(false)}
                      className="text-gray-500 hover:text-gray-700 font-bold text-xl cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  {(() => {
                    const meal = meals.find((m) => m._id === selectedMeal);
                    if (!meal) return null;
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Meal:</span>
                          <p className="font-bold text-gray-800">
                            {toTitleCase(meal.name)}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Serving Size:</span>
                          <p className="font-bold text-gray-800">
                            {meal.servingSize}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Calories:</span>
                          <p className="font-bold text-blue-600">
                            {meal.macros.calories} kcal
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Protein:</span>
                          <p className="font-bold text-red-600">
                            {meal.macros.protein}g
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Carbs:</span>
                          <p className="font-bold text-yellow-600">
                            {meal.macros.carbs}g
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-600">Fats:</span>
                          <p className="font-bold text-green-600">
                            {meal.macros.fats}g
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

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-xl sm:text-2xl">{getMealIcon(title)}</span>
        {title}
      </h2>

      {meals.length === 0 ? (
        <p className="text-gray-700 text-center py-6 sm:py-8 bg-gray-50 rounded-lg font-medium text-sm sm:text-base">
          No meals added yet
        </p>
      ) : (
        <div className="space-y-3">
          {meals.map((entry) => {
            return (
              <div
                key={entry._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-linear-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition gap-3 sm:gap-0"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {toTitleCase(entry.mealName)} (
                    {entry.meal?.servingSize || "1 serving"})
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-800">
                    <span className="font-medium">
                      {entry.meal?.macros?.calories || 0} cal
                    </span>
                    <span>🥩 {entry.meal?.macros?.protein || 0}g</span>
                    <span>🍞 {entry.meal?.macros?.carbs || 0}g</span>
                    <span>🥑 {entry.meal?.macros?.fats || 0}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1 flex-1 sm:flex-none">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          Math.max(0.5, parseFloat(entry.quantity) - 0.5)
                        )
                      }
                      className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm sm:text-base"
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
                      className="w-12 sm:w-16 text-center px-1 sm:px-2 py-1 border-0 focus:outline-none font-medium text-gray-900 text-sm sm:text-base"
                    />
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          entry._id,
                          parseFloat(entry.quantity) + 0.5
                        )
                      }
                      className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm sm:text-base"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(entry._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer text-sm sm:text-base"
                  >
                    🗑️
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
