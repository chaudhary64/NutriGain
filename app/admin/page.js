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
  const { user, loading: authLoading, logout } = useAuth();
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
          "Chest",
          "Back",
          "Bicep",
          "Tricep",
          "Legs",
          "Forearms",
          "Shoulders",
          "Arms",
          "Rest Day",
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
              validMuscleGroups.includes(g)
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
        a.name.localeCompare(b.name)
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
            {/* Top row on mobile: Title and Logout */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>

              {/* Logout button - visible on mobile, hidden on desktop */}
              <button
                onClick={logout}
                className="sm:hidden bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>

            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Welcome message - shown on tablet+ */}
              <span className="text-gray-800 text-sm whitespace-nowrap">
                Welcome, {user.name}
              </span>

              {/* Logout button - visible on desktop */}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab("meals")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "meals"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🍽️ Meal Management
          </button>
          <button
            onClick={() => setActiveTab("gym")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "gym"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💪 Gym Management
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "users"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👥 Users
          </button>
        </div>

        {/* Meal Management Section */}
        {activeTab === "meals" && (
          <div>
            {!showForm && (
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm sm:text-base"
                >
                  + Add New Meal
                </button>
              </div>
            )}

            {showForm && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                  {editingMeal ? "Edit Meal" : "Add New Meal"}
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-700 font-medium text-sm sm:text-base">
                        Meal Name *
                      </label>
                      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        ℹ️ Auto-capitalized
                      </p>
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1, 250gm, 2 cups"
                      value={formData.servingSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servingSize: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Calories *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.calories}
                      onChange={(e) =>
                        setFormData({ ...formData, calories: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) =>
                        setFormData({ ...formData, protein: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Carbs (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) =>
                        setFormData({ ...formData, carbs: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Fats (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fats}
                      onChange={(e) =>
                        setFormData({ ...formData, fats: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white cursor-pointer text-sm sm:text-base"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer text-sm sm:text-base"
                    >
                      {editingMeal ? "Update Meal" : "Add Meal"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-500 transition cursor-pointer text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                      Serving Size
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Calories
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Protein
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Carbs
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Fats
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meals.map((meal) => (
                    <tr key={meal._id}>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {toTitleCase(meal.name)}
                        </div>
                        {meal.description && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            {meal.description}
                          </div>
                        )}
                        <div className="sm:hidden text-xs text-gray-600 mt-1">
                          {meal.servingSize}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800 hidden sm:table-cell">
                        {meal.servingSize}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {meal.macros.calories}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {meal.macros.protein}g
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {meal.macros.carbs}g
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {meal.macros.fats}g
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {meal.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => handleEdit(meal)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(meal._id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📅 Weekly Workout Schedule
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
                {workoutSchedule.map((schedule) => (
                  <div
                    key={schedule.day}
                    className={`${schedule.colorClasses.bg} rounded-lg p-4 border-2 ${schedule.colorClasses.border} shadow-md`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-gray-900 mb-2">
                        {schedule.day}
                      </div>
                      <div className="space-y-1">
                        {schedule.muscleGroups.map((group, idx) => (
                          <div
                            key={idx}
                            className={`bg-white px-2 py-1 rounded text-sm font-semibold ${schedule.colorClasses.text}`}
                          >
                            {group}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Edit Form */}
            {showScheduleForm && editingDay && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Edit {editingDay.day} Schedule
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Select muscle groups for this day:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMuscleGroups.map((group) => (
                      <label
                        key={group}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={editingDay.muscleGroups.includes(
                            group
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updatedMuscleGroups = checked
                              ? [...editingDay.muscleGroups, group]
                              : editingDay.muscleGroups.filter(
                                  (g) => g !== group
                                );
                            
                            // Update local state without closing the form
                            setEditingDay({
                              ...editingDay,
                              muscleGroups: updatedMuscleGroups,
                            });
                            
                            // Save to backend
                            handleScheduleUpdate(editingDay.day, updatedMuscleGroups);
                          }}
                        />
                        <span className="font-medium text-gray-800">
                          {group}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingDay(null);
                    }}
                    className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Exercise Management */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  💪 Exercise Library
                </h3>
                {!showExerciseForm && (
                  <button
                    onClick={() => setShowExerciseForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    + Add Exercise
                  </button>
                )}
              </div>

              {/* Exercise Form */}
              {showExerciseForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h4 className="text-lg font-bold mb-4">
                    {editingExercise ? "Edit Exercise" : "Add New Exercise"}
                  </h4>
                  <form
                    onSubmit={handleExerciseSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Muscle Group *
                      </label>
                      <input
                        type="text"
                        value={exerciseFormData.muscleGroup}
                        onChange={(e) =>
                          setExerciseFormData({
                            ...exerciseFormData,
                            muscleGroup: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        placeholder="e.g., Chest, Back, Shoulders"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Exercise Name *
                      </label>
                      <input
                        type="text"
                        value={exerciseFormData.name}
                        onChange={(e) =>
                          setExerciseFormData({
                            ...exerciseFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        placeholder="e.g., Incline Dumbbell Press"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Type *
                      </label>
                      <select
                        value={exerciseFormData.type}
                        onChange={(e) =>
                          setExerciseFormData({
                            ...exerciseFormData,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                        required
                      >
                        <option value="COMPOUND">COMPOUND</option>
                        <option value="ISOLATION">ISOLATION</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex gap-4">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                      >
                        {editingExercise ? "Update Exercise" : "Add Exercise"}
                      </button>
                      <button
                        type="button"
                        onClick={resetExerciseForm}
                        className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                      >
                        Cancel
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
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <h4 className="text-lg font-bold text-gray-800 mb-4">
                        {muscleGroup}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                Exercise
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                Type
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {exercises
                              .filter((ex) => ex.muscleGroup === muscleGroup)
                              .map((exercise) => (
                                <tr
                                  key={exercise.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-3 py-4 border-b border-gray-200 font-medium text-gray-800">
                                    {exercise.name}
                                  </td>
                                  <td className="px-3 py-4 border-b border-gray-200">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        exercise.type === "COMPOUND"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-purple-100 text-purple-800"
                                      }`}
                                    >
                                      {exercise.type}
                                    </span>
                                  </td>
                                  <td className="px-3 py-4 border-b border-gray-200">
                                    <button
                                      onClick={() =>
                                        handleEditExercise(exercise)
                                      }
                                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteExercise(exercise.id)
                                      }
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Management Section */}
        {activeTab === "users" && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">👥 Registered Users</h2>
                  <p className="text-gray-600 mt-1">Total Users: {users.length}</p>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((userData) => (
                  <div
                    key={userData._id}
                    className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/user/${userData._id}`)}
                  >
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{userData.name}</h3>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Days Logged:</span>
                          <span className="text-lg font-bold text-purple-600">{userData.stats.daysLogged}</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Latest Log:</div>
                        <div className="text-xs text-gray-600">
                          {userData.stats.latestLogDate ? (
                            <span>{userData.stats.latestLogDate}</span>
                          ) : (
                            <span className="text-gray-400">No logs yet</span>
                          )}
                        </div>
                      </div>

                      {/* Average Macros */}
                      {userData.stats.daysLogged > 0 && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Average Daily Intake:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Calories:</span>
                              <span className="ml-1 font-bold text-orange-600">{userData.stats.averageMacros.calories}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Protein:</span>
                              <span className="ml-1 font-bold text-blue-600">{userData.stats.averageMacros.protein}g</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Carbs:</span>
                              <span className="ml-1 font-bold text-green-600">{userData.stats.averageMacros.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Fats:</span>
                              <span className="ml-1 font-bold text-purple-600">{userData.stats.averageMacros.fats}g</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Member Since */}
                      <div className="text-xs text-gray-500 text-center pt-2 border-t border-purple-200">
                        Member since {new Date(userData.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-gray-500 text-lg">No users registered yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
