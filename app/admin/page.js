"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Helper function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminPage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("meals"); // 'meals', 'gym', or 'users'
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    servingSize: "1 serving",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    category: "general",
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tempSchedule, setTempSchedule] = useState([
    "Paneer",
    "Chicken",
    "Paneer",
    "Chicken",
    "Paneer",
    "Chicken",
    "Paneer",
  ]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/settings/meal-schedule");
        if (res.ok) {
          const data = await res.json();
          setTempSchedule(data.mealDays);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };
    if (showScheduleModal) {
      fetchSchedule();
    }
  }, [showScheduleModal]);

  const handleSaveSchedule = async () => {
    try {
      const res = await fetch("/api/settings/meal-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealDays: tempSchedule }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowScheduleModal(false);
      } else {
        alert("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Failed to update schedule");
    }
  };

  // Users state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Gym workout state
  const [workoutSchedule, setWorkoutSchedule] = useState([
    {
      day: "Monday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
      },
    },
    {
      day: "Tuesday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
      },
    },
    {
      day: "Wednesday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
      },
    },
    {
      day: "Thursday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
      },
    },
    {
      day: "Friday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-800",
      },
    },
    {
      day: "Saturday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-teal-50",
        border: "border-teal-200",
        text: "text-teal-800",
      },
    },
    {
      day: "Sunday",
      muscleGroups: [],
      colorClasses: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
      },
    },
  ]);

  const [exercises, setExercises] = useState([
    {
      id: 1,
      muscleGroup: "Chest",
      name: "Incline Dumbbell Press",
      type: "COMPOUND",
      warmUp: "20 kg",
      working: "35 kg",
      lastPR: "42.5 kg",
      lastPRDate: "Jan 2, 2026",
    },
    {
      id: 2,
      muscleGroup: "Chest",
      name: "Flat Bench Press",
      type: "COMPOUND",
      warmUp: "40 kg",
      working: "70 kg",
      lastPR: "85 kg",
      lastPRDate: "Dec 28, 2025",
    },
    {
      id: 3,
      muscleGroup: "Chest",
      name: "Cable Flyes",
      type: "ISOLATION",
      warmUp: "15 kg",
      working: "25 kg",
      lastPR: "30 kg",
      lastPRDate: "Jan 9, 2026",
    },
    {
      id: 4,
      muscleGroup: "Triceps",
      name: "Tricep Pushdowns",
      type: "ISOLATION",
      warmUp: "20 kg",
      working: "35 kg",
      lastPR: "42.5 kg",
      lastPRDate: "Jan 13, 2026",
    },
    {
      id: 5,
      muscleGroup: "Triceps",
      name: "Overhead Tricep Extension",
      type: "ISOLATION",
      warmUp: "12 kg",
      working: "20 kg",
      lastPR: "25 kg",
      lastPRDate: "Jan 6, 2026",
    },
  ]);

  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseFormData, setExerciseFormData] = useState({
    muscleGroup: "",
    name: "",
    type: "COMPOUND",
    warmUp: "",
    working: "",
    lastPR: "",
    lastPRDate: "",
  });

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  // Searchable dropdown state
  const [muscleGroupSearch, setMuscleGroupSearch] = useState("");
  const [showMuscleGroupDropdown, setShowMuscleGroupDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMuscleGroupDropdown &&
        !event.target.closest(".muscle-group-dropdown")
      ) {
        setShowMuscleGroupDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMuscleGroupDropdown]);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchMeals();
      fetchGymData();
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGymData = async () => {
    try {
      // Fetch exercises
      const exercisesRes = await fetch("/api/exercises");
      const exercisesData = await exercisesRes.json();
      if (exercisesData && Array.isArray(exercisesData)) {
        setExercises(exercisesData.map((ex) => ({ ...ex, id: ex._id })));
      }

      // Fetch workout schedule
      const scheduleRes = await fetch("/api/workout-schedule");
      const scheduleData = await scheduleRes.json();
      if (scheduleData && Array.isArray(scheduleData)) {
        // Map schedule data with color classes
        const colorMap = {
          Monday: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
          },
          Tuesday: {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-800",
          },
          Wednesday: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            text: "text-purple-800",
          },
          Thursday: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-800",
          },
          Friday: {
            bg: "bg-pink-50",
            border: "border-pink-200",
            text: "text-pink-800",
          },
          Saturday: {
            bg: "bg-teal-50",
            border: "border-teal-200",
            text: "text-teal-800",
          },
          Sunday: {
            bg: "bg-gray-50",
            border: "border-gray-200",
            text: "text-gray-800",
          },
        };
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
        const sortedSchedule = scheduleData
          .map((s) => ({
            ...s,
            muscleGroups: (s.muscleGroups || []).filter((g) =>
              validMuscleGroups.includes(g),
            ),
            colorClasses: colorMap[s.day] || colorMap.Sunday,
          }))
          .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        setWorkoutSchedule(sortedSchedule);
      }
    } catch (error) {
      console.error("Error fetching gym data:", error);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      servingSize: formData.servingSize,
      macros: {
        calories: parseFloat(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
      },
      category: formData.category,
    };

    try {
      const url = editingMeal ? `/api/meals/${editingMeal._id}` : "/api/meals";
      const method = editingMeal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchMeals();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save meal");
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal");
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      servingSize: meal.servingSize,
      calories: meal.macros.calories,
      protein: meal.macros.protein,
      carbs: meal.macros.carbs,
      fats: meal.macros.fats,
      category: meal.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMeals();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete meal");
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Failed to delete meal");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      servingSize: "1 serving",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      category: "general",
    });
    setEditingMeal(null);
    setShowForm(false);
  };

  // Gym exercise functions
  const handleExerciseSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingExercise
        ? `/api/exercises/${editingExercise.id}`
        : "/api/exercises";
      const method = editingExercise ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exerciseFormData),
      });

      if (res.ok) {
        await fetchGymData();
        resetExerciseForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save exercise");
      }
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Failed to save exercise");
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setExerciseFormData(exercise);
    setShowExerciseForm(true);
  };

  const handleDeleteExercise = async (id) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return;

    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchGymData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete exercise");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Failed to delete exercise");
    }
  };

  const resetExerciseForm = () => {
    setExerciseFormData({
      muscleGroup: "",
      name: "",
      type: "COMPOUND",
      warmUp: "",
      working: "",
      lastPR: "",
      lastPRDate: "",
    });
    setEditingExercise(null);
    setShowExerciseForm(false);
    setMuscleGroupSearch("");
    setShowMuscleGroupDropdown(false);
  };

  const handleEditSchedule = (daySchedule) => {
    setEditingDay(daySchedule);
    setShowScheduleForm(true);
  };

  const handleScheduleUpdate = async (day, muscleGroups) => {
    try {
      const res = await fetch("/api/workout-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, muscleGroups }),
      });

      if (res.ok) {
        await fetchGymData();
        // Update editingDay to reflect the new muscle groups
        if (editingDay && editingDay.day === day) {
          setEditingDay({
            ...editingDay,
            muscleGroups: muscleGroups,
          });
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Failed to update schedule");
    }
  };

  const uniqueMuscleGroups = [
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 sm:py-0 sm:h-16 gap-2 sm:gap-4">
            {/* Top row on mobile: Title and Logout */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-teal-600 rounded-lg blur-sm opacity-40 group-hover:opacity-75 transition duration-200 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-gray-900 rounded-lg shadow-sm overflow-hidden border border-gray-700/50">
                    <img
                      src="/Rikka.gif"
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-base xs:text-lg sm:text-xl font-black text-gray-900 tracking-tighter uppercase leading-none sm:leading-tight">
                    Master Control{" "}
                    <span className="block sm:inline text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600">
                      Terminal
                    </span>
                  </h1>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    SYSTEM ONLINE
                  </span>
                </div>
              </div>

              {/* Logout button - visible on mobile, hidden on desktop */}
              <button
                onClick={logout}
                className="sm:hidden bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition cursor-pointer shrink-0"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    Master
                  </span>
                  <span className="text-sm font-semibold text-gray-800 leading-none">
                    {user.name}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-1"></div>

              {/* Logout button - visible on desktop */}
              <button
                onClick={logout}
                className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-100 cursor-pointer"
              >
                <span>Logout</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 p-1 bg-gray-50/50 backdrop-blur-xl rounded-xl border border-gray-200/60 shadow-sm">
          <button
            onClick={() => setActiveTab("meals")}
            className={`
              relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 cursor-pointer border
              ${
                activeTab === "meals"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border-transparent transform scale-[1.01]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 shadow-sm hover:shadow-md"
              }
            `}
          >
            <span className="text-lg">🍽️</span>
            <span>Meal Management</span>
          </button>

          <button
            onClick={() => setActiveTab("gym")}
            className={`
              relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 cursor-pointer border
              ${
                activeTab === "gym"
                  ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 border-transparent transform scale-[1.01]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm hover:shadow-md"
              }
            `}
          >
            <span className="text-lg">💪</span>
            <span>Gym Management</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`
              relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 cursor-pointer border
              ${
                activeTab === "users"
                  ? "bg-linear-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20 border-transparent transform scale-[1.01]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 shadow-sm hover:shadow-md"
              }
            `}
          >
            <span className="text-lg">👥</span>
            <span>Users</span>
          </button>
        </div>

        {/* Meal Management Section */}
        {activeTab === "meals" && (
          <div>
            {!showForm && (
              <div className="mb-6 sm:mb-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="group flex items-center justify-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 font-medium w-full sm:w-auto cursor-pointer shadow-sm hover:shadow-md"
                >
                  <span className="text-xl">📅</span>
                  Manage Days
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="group flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-95 font-medium w-full sm:w-auto cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add New Meal
                </button>
              </div>
            )}

            {showForm && (
              <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl shadow-blue-100/50 border border-white/50 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div
                    className={`p-2 rounded-lg ${editingMeal ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {editingMeal ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingMeal ? "Edit Meal Details" : "Add New Meal"}
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
                >
                  <div className="col-span-1 sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-600 font-medium text-sm">
                        Meal Name <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Auto-capitalized
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Grilled Chicken Salad"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all text-sm placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1 cup, 250g"
                      value={formData.servingSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servingSize: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 appearance-none cursor-pointer text-sm"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="general">General</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg
                          className="h-4 w-4"
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

                  <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                        Calories <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.calories}
                        onChange={(e) =>
                          setFormData({ ...formData, calories: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                        Protein (g) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.protein}
                        onChange={(e) =>
                          setFormData({ ...formData, protein: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                        Carbs (g) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.carbs}
                        onChange={(e) =>
                          setFormData({ ...formData, carbs: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 font-medium mb-1.5 text-sm">
                        Fats (g) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.fats}
                        onChange={(e) =>
                          setFormData({ ...formData, fats: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="order-2 sm:order-1 w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-sm active:scale-95 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="order-1 sm:order-2 w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {editingMeal ? (
                        <>
                          <span>Update Meal</span>
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
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Add Meal</span>
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
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80 hidden sm:table-header-group">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Serving Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Calories
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Protein
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Carbs
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Fats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {meals.map((meal) => (
                      <tr
                        key={meal._id}
                        className="hover:bg-blue-50/30 transition-colors duration-200 group flex flex-col sm:table-row w-full sm:w-auto p-4 sm:p-0 border-b sm:border-b-0 border-gray-100 last:border-0"
                      >
                        <td className="px-0 sm:px-6 py-2 sm:py-4 block sm:table-cell w-full sm:w-auto">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-900 text-base sm:text-base group-hover:text-blue-700 transition-colors">
                                {toTitleCase(meal.name)}
                              </div>
                              {meal.description && (
                                <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                  {meal.description}
                                </div>
                              )}
                            </div>

                            {/* Mobile Actions in top right for easy access */}
                            <div className="flex sm:hidden items-center gap-1">
                              <button
                                onClick={() => handleEdit(meal)}
                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg active:scale-95 transition-all cursor-pointer"
                              >
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
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(meal._id)}
                                className="p-1.5 text-rose-600 bg-rose-50 rounded-lg active:scale-95 transition-all cursor-pointer"
                              >
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
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="sm:hidden mt-3 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`
                                inline-flex items-center px-2 py-1 rounded-md font-medium capitalize border
                                ${
                                  meal.category === "breakfast"
                                    ? "bg-orange-50 text-orange-700 border-orange-100"
                                    : meal.category === "lunch"
                                      ? "bg-green-50 text-green-700 border-green-100"
                                      : meal.category === "dinner"
                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                }
                              `}
                              >
                                {meal.category}
                              </span>
                              <div className="text-gray-500 font-medium flex items-center gap-1.5">
                                <span className="text-gray-900">
                                  {meal.servingSize}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="text-gray-900">
                                  {meal.macros.calories} kcal
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100 flex flex-col items-center">
                                <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider mb-0.5">
                                  Protein
                                </span>
                                <span className="font-bold text-emerald-700">
                                  {meal.macros.protein}g
                                </span>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100 flex flex-col items-center">
                                <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider mb-0.5">
                                  Carbs
                                </span>
                                <span className="font-bold text-blue-700">
                                  {meal.macros.carbs}g
                                </span>
                              </div>
                              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 flex flex-col items-center">
                                <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mb-0.5">
                                  Fats
                                </span>
                                <span className="font-bold text-amber-700">
                                  {meal.macros.fats}g
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell font-medium">
                          {meal.servingSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 hidden sm:table-cell">
                          {meal.macros.calories}
                          <span className="text-gray-400 text-xs font-normal ml-1">
                            kcal
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                          <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {meal.macros.protein}g
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                          {meal.macros.carbs}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                          {meal.macros.fats}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <span
                            className={`
                            px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                            ${
                              meal.category === "breakfast"
                                ? "bg-orange-100 text-orange-800"
                                : meal.category === "lunch"
                                  ? "bg-green-100 text-green-800"
                                  : meal.category === "dinner"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                            }
                          `}
                          >
                            {meal.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(meal)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Edit meal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(meal._id)}
                              className="p-2 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Delete meal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Gym Management Section */}
        {activeTab === "gym" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Gym Management
            </h2>

            {/* Weekly Schedule Management */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-green-100/50 border border-white/50 ring-1 ring-white/50 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-linear-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-green-200">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Weekly Workout Schedule
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Manage the workout split
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
                  {workoutSchedule.map((schedule) => {
                    const isCompact = schedule.muscleGroups.length >= 3;
                    return (
                      <div
                        key={schedule.day}
                        className={`${schedule.colorClasses.bg} relative rounded-2xl p-3 sm:p-4 border ${schedule.colorClasses.border} shadow-sm hover:shadow-md transition-all duration-300 group`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-bold ${schedule.colorClasses.text} opacity-70`}
                          >
                            {schedule.day.substring(0, 3)}
                          </span>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className={`p-1 rounded-full hover:bg-white/50 transition-colors ${schedule.colorClasses.text} cursor-pointer`}
                            title="Edit Schedule"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                        </div>

                        <div
                          className={`space-y-1.5 ${isCompact ? "space-y-1" : ""}`}
                        >
                          {schedule.muscleGroups.length > 0 ? (
                            schedule.muscleGroups.map((group, idx) => (
                              <div
                                key={idx}
                                className={`bg-white/80 backdrop-blur-sm px-2.5 ${
                                  isCompact
                                    ? "py-1 text-[10px]"
                                    : "py-1.5 text-xs"
                                } rounded-lg font-bold ${schedule.colorClasses.text} shadow-sm border border-white/50 truncate`}
                              >
                                {group}
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex items-center justify-center py-4 opacity-30 cursor-default select-none">
                              <span className="text-2xl grayscale">💤</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Schedule Edit Form */}
            {showScheduleForm && editingDay && (
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl mb-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Edit {editingDay.day} Schedule
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Select target muscle groups for this day
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {uniqueMuscleGroups.map((group) => {
                    const isSelected = editingDay.muscleGroups.includes(group);
                    return (
                      <label
                        key={group}
                        className={`
                          relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 border
                          ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-200 shadow-inner"
                              : "bg-white/40 border-transparent hover:bg-white/60 hover:shadow-sm hover:border-white/40"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          className="w-4 h-4 accent-indigo-600 rounded border-gray-300"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updatedMuscleGroups = checked
                              ? [...editingDay.muscleGroups, group]
                              : editingDay.muscleGroups.filter(
                                  (g) => g !== group,
                                );

                            // Update local state without closing the form
                            setEditingDay({
                              ...editingDay,
                              muscleGroups: updatedMuscleGroups,
                            });

                            // Save to backend
                            handleScheduleUpdate(
                              editingDay.day,
                              updatedMuscleGroups,
                            );
                          }}
                        />
                        <span
                          className={`font-medium ${isSelected ? "text-indigo-700" : "text-gray-600"}`}
                        >
                          {group}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingDay(null);
                    }}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors font-medium cursor-pointer"
                  >
                    Done Editing
                  </button>
                </div>
              </div>
            )}

            {/* Exercise Management */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex p-2 bg-emerald-100 rounded-xl">
                    <span className="text-2xl">💪</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Exercise Library
                    </h3>
                    <p className="text-sm text-gray-500">
                      Manage your exercise database
                    </p>
                  </div>
                </div>
                {!showExerciseForm && (
                  <button
                    onClick={() => setShowExerciseForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 font-medium"
                  >
                    <span>+</span> Add New
                  </button>
                )}
              </div>

              {/* Exercise Form */}
              {showExerciseForm && (
                <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.7)] shadow-emerald-100/50 p-6 md:p-8 mb-8 border border-emerald-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                  <div className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="p-2 bg-emerald-100/50 rounded-lg text-xl shadow-inner">
                          {editingExercise ? "✏️" : "✨"}
                        </span>
                        {editingExercise ? "Edit Exercise" : "Add New Exercise"}
                      </h4>
                      <p className="text-gray-500 mt-1 ml-12 text-sm">
                        {editingExercise
                          ? "Update the details below to modify the exercise."
                          : "Fill in the details below to add a new exercise to your library."}
                      </p>
                    </div>

                    {/* Buttons moved to top-right (Desktop Only) */}
                    <div className="hidden md:flex gap-3 pl-12 md:pl-0 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={resetExerciseForm}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all font-semibold cursor-pointer active:scale-[0.98] text-sm shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="exercise-form"
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 transition-all transform active:scale-[0.98] font-bold cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
                      >
                        {editingExercise ? (
                          <>
                            <span>Update</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Save</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <form
                    id="exercise-form"
                    onSubmit={handleExerciseSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
                  >
                    <div className="relative muscle-group-dropdown group">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Muscle Group
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 12h16M4 18h7"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={
                            muscleGroupSearch || exerciseFormData.muscleGroup
                          }
                          onChange={(e) => {
                            setMuscleGroupSearch(e.target.value);
                            setShowMuscleGroupDropdown(true);
                          }}
                          onFocus={() => setShowMuscleGroupDropdown(true)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-900 placeholder-gray-400 font-medium outline-none"
                          placeholder="Search or select..."
                          required={!exerciseFormData.muscleGroup}
                        />
                        {showMuscleGroupDropdown && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-emerald-900/10 max-h-60 overflow-auto custom-scrollbar transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                            {uniqueMuscleGroups
                              .filter((group) => group !== "Rest Day")
                              .filter((group) =>
                                group
                                  .toLowerCase()
                                  .includes(muscleGroupSearch.toLowerCase()),
                              )
                              .map((group) => (
                                <div
                                  key={group}
                                  onClick={() => {
                                    setExerciseFormData({
                                      ...exerciseFormData,
                                      muscleGroup: group,
                                    });
                                    setMuscleGroupSearch("");
                                    setShowMuscleGroupDropdown(false);
                                  }}
                                  className="px-5 py-3.5 hover:bg-emerald-50 cursor-pointer text-gray-700 hover:text-emerald-700 transition-colors border-b border-gray-50 last:border-0 font-medium flex items-center justify-between group/item"
                                >
                                  {group}
                                  <span className="opacity-0 group-hover/item:opacity-100 text-emerald-500 transition-opacity">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                </div>
                              ))}
                            {uniqueMuscleGroups
                              .filter((group) => group !== "Rest Day")
                              .filter((group) =>
                                group
                                  .toLowerCase()
                                  .includes(muscleGroupSearch.toLowerCase()),
                              ).length === 0 && (
                              <div className="px-5 py-8 text-gray-400 text-center flex flex-col items-center gap-2">
                                <span className="text-2xl">🔍</span>
                                <span className="text-sm">
                                  No muscle groups found
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {exerciseFormData.muscleGroup &&
                        !showMuscleGroupDropdown && (
                          <div className="absolute top-0 right-0 mt-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              {exerciseFormData.muscleGroup}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="group">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Exercise Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={exerciseFormData.name}
                          onChange={(e) =>
                            setExerciseFormData({
                              ...exerciseFormData,
                              name: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-900 placeholder-gray-400 font-medium outline-none"
                          placeholder="e.g., Incline Dumbbell Press"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Exercise Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <select
                          value={exerciseFormData.type}
                          onChange={(e) =>
                            setExerciseFormData({
                              ...exerciseFormData,
                              type: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer text-gray-900 font-medium outline-none"
                          required
                        >
                          <option value="COMPOUND">Compound Movement</option>
                          <option value="ISOLATION">Isolation Movement</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Buttons (Bottom) */}
                    <div className="md:col-span-2 flex flex-col-reverse gap-4 justify-end md:mt-4 md:pt-4 border-t border-gray-50 md:hidden">
                      <button
                        type="button"
                        onClick={resetExerciseForm}
                        className="w-full px-8 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all font-semibold cursor-pointer active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full px-10 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 transition-all transform active:scale-[0.98] font-bold cursor-pointer flex items-center justify-center gap-2"
                      >
                        {editingExercise ? (
                          <>
                            <span>Update Exercise</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Save Exercise</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Exercise List by Muscle Group */}
              <div className="space-y-6">
                {uniqueMuscleGroups
                  .filter((group) => group !== "Rest Day")
                  .map((muscleGroup) => (
                    <div
                      key={muscleGroup}
                      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
                    >
                      <div className="bg-linear-to-r from-emerald-50/50 to-teal-50/50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-linear-to-b from-emerald-500 to-teal-500"></div>
                        <h4 className="text-lg font-bold text-gray-800">
                          {muscleGroup}
                        </h4>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          {
                            exercises.filter(
                              (ex) => ex.muscleGroup === muscleGroup,
                            ).length
                          }{" "}
                          exercises
                        </span>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse table-fixed">
                          <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                              <th className="w-1/2 px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                Exercise Name
                              </th>
                              <th className="w-1/4 px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="w-1/4 px-6 py-4 text-right text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {exercises
                              .filter((ex) => ex.muscleGroup === muscleGroup)
                              .map((exercise) => (
                                <tr
                                  key={exercise.id}
                                  className="hover:bg-emerald-50/30 transition-colors group"
                                >
                                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                                    {exercise.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                        exercise.type === "COMPOUND"
                                          ? "bg-blue-50 text-blue-700 border-blue-100"
                                          : "bg-purple-50 text-purple-700 border-purple-100"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          exercise.type === "COMPOUND"
                                            ? "bg-blue-500"
                                            : "bg-purple-500"
                                        }`}
                                      ></span>
                                      {exercise.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          handleEditExercise(exercise)
                                        }
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                                        title="Edit"
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
                                        >
                                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                          <path d="m15 5 4 4" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteExercise(exercise.id)
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                                        title="Delete"
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
                                        >
                                          <path d="M3 6h18" />
                                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                          <line
                                            x1="10"
                                            x2="10"
                                            y1="11"
                                            y2="17"
                                          />
                                          <line
                                            x1="14"
                                            x2="14"
                                            y1="11"
                                            y2="17"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            {exercises.filter(
                              (ex) => ex.muscleGroup === muscleGroup,
                            ).length === 0 && (
                              <tr>
                                <td
                                  colSpan="3"
                                  className="px-6 py-8 text-center text-gray-400 italic bg-gray-50/30"
                                >
                                  No exercises added for this muscle group yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden">
                        {exercises
                          .filter((ex) => ex.muscleGroup === muscleGroup)
                          .map((exercise) => (
                            <div
                              key={exercise.id}
                              className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between gap-3">
                                <div className="space-y-2">
                                  <h5 className="font-bold text-gray-800 text-sm">
                                    {exercise.name}
                                  </h5>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold border ${
                                      exercise.type === "COMPOUND"
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-purple-50 text-purple-700 border-purple-100"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        exercise.type === "COMPOUND"
                                          ? "bg-blue-500"
                                          : "bg-purple-500"
                                      }`}
                                    ></span>
                                    {exercise.type}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleEditExercise(exercise)}
                                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg active:scale-95 cursor-pointer"
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
                                    >
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                      <path d="m15 5 4 4" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteExercise(exercise.id)
                                    }
                                    className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-95 cursor-pointer"
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
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" x2="10" y1="11" y2="17" />
                                      <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        {exercises.filter(
                          (ex) => ex.muscleGroup === muscleGroup,
                        ).length === 0 && (
                          <div className="p-6 text-center text-sm text-gray-400 italic bg-gray-50/30">
                            No exercises added yet.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Management Section */}
        {activeTab === "users" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-gray-100 bg-linear-to-b from-white to-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2 sm:gap-3">
                      <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-purple-100/50 text-purple-600 rounded-lg text-lg sm:text-xl">
                        👥
                      </span>
                      Registered Users
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2 ml-10 sm:ml-13 font-medium">
                      Manage and track user progress and statistics
                    </p>
                  </div>
                  <div className="self-start sm:self-center ml-10 sm:ml-0">
                    <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-100 shadow-sm">
                      Total Users: {users.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8 bg-gray-50/30 min-h-[400px]">
                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {users.map((userData) => {
                    const stats = userData.stats || {};
                    const macros = stats.averageMacros || {};
                    const p = Number(macros.protein) || 0;
                    const c = Number(macros.carbs) || 0;
                    const f = Number(macros.fats) || 0;
                    // Avoid division by zero
                    const totalWeight = p + c + f || 1;

                    return (
                      <div
                        key={userData._id}
                        className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-sm hover:shadow-xl hover:border-purple-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() =>
                          router.push(`/admin/user/${userData._id}`)
                        }
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br from-purple-50 to-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 group-hover:scale-110 transition-transform duration-500" />

                        {/* User Header */}
                        <div className="relative flex items-start justify-between mb-4 sm:mb-6">
                          <div className="flex items-center gap-3 sm:gap-4 w-full">
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl transition-transform flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg shadow-purple-200 ring-2 sm:ring-4 ring-white">
                                {userData.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-purple-600 transition-colors truncate">
                                {toTitleCase(userData.name)}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {userData.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="space-y-3 sm:space-y-4 relative">
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="bg-gray-50/80 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 text-center">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Days Logged
                              </span>
                              <div className="text-xl sm:text-2xl font-black text-gray-800 mt-1">
                                {stats.daysLogged || 0}
                              </div>
                            </div>
                            <div className="bg-gray-50/80 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 text-center flex flex-col justify-center">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Last Activity
                              </span>
                              <div className="text-xs sm:text-sm font-bold text-gray-800 mt-1 truncate px-1">
                                {stats.latestLogDate || "Inactive"}
                              </div>
                            </div>
                          </div>

                          {/* Average Macros */}
                          {stats.daysLogged > 0 ? (
                            <div className="bg-white rounded-xl p-1 mt-2">
                              <div className="flex items-end justify-between mb-2 px-1">
                                <span className="text-xs font-semibold text-gray-600">
                                  Avg Intake
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                  {macros.calories}{" "}
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    kcal
                                  </span>
                                </span>
                              </div>

                              <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 mb-3 ring-1 ring-gray-100">
                                <div
                                  className="bg-blue-500 h-full"
                                  style={{
                                    width: `${(p / totalWeight) * 100}%`,
                                  }}
                                  title="Protein"
                                />
                                <div
                                  className="bg-green-500 h-full"
                                  style={{
                                    width: `${(c / totalWeight) * 100}%`,
                                  }}
                                  title="Carbs"
                                />
                                <div
                                  className="bg-purple-500 h-full"
                                  style={{
                                    width: `${(f / totalWeight) * 100}%`,
                                  }}
                                  title="Fats"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                <div className="flex flex-col items-center bg-blue-50/50 rounded-lg py-1.5 border border-blue-100/50">
                                  <span className="text-[9px] sm:text-[10px] text-blue-600 font-medium">
                                    Protein
                                  </span>
                                  <span className="text-xs font-bold text-blue-700">
                                    {p}g
                                  </span>
                                </div>
                                <div className="flex flex-col items-center bg-green-50/50 rounded-lg py-1.5 border border-green-100/50">
                                  <span className="text-[9px] sm:text-[10px] text-green-600 font-medium">
                                    Carbs
                                  </span>
                                  <span className="text-xs font-bold text-green-700">
                                    {c}g
                                  </span>
                                </div>
                                <div className="flex flex-col items-center bg-purple-50/50 rounded-lg py-1.5 border border-purple-100/50">
                                  <span className="text-[9px] sm:text-[10px] text-purple-600 font-medium">
                                    Fats
                                  </span>
                                  <span className="text-xs font-bold text-purple-700">
                                    {f}g
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50/50 rounded-xl p-4 sm:p-6 text-center border-2 border-dashed border-gray-100">
                              <p className="text-xs text-gray-400 font-medium">
                                No log data available
                              </p>
                            </div>
                          )}

                          {/* Member Since */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                ></path>
                              </svg>
                              {new Date(
                                userData.createdAt,
                              ).toLocaleDateString()}
                            </div>
                            <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              View Profile
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
                                  d="M9 5l7 7-7 7"
                                ></path>
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {users.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                      👥
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      No users found
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                      No users have registered for the platform yet. Once they
                      do, they'll appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Manage Weekly Schedule
                </h3>
                <p className="text-sm text-gray-500">
                  Assign Chicken or Paneer days
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day, index) => (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <span className="font-semibold text-gray-700">{day}</span>
                  <div className="flex bg-gray-200/50 p-1 rounded-lg">
                    <button
                      onClick={() => {
                        const newSchedule = [...tempSchedule];
                        newSchedule[index] = "Chicken";
                        setTempSchedule(newSchedule);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
                        tempSchedule[index] === "Chicken"
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      🍗 Chicken
                    </button>
                    <button
                      onClick={() => {
                        const newSchedule = [...tempSchedule];
                        newSchedule[index] = "Paneer";
                        setTempSchedule(newSchedule);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
                        tempSchedule[index] === "Paneer"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      🧀 Paneer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
