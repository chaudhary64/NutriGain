"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

// Helper function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminPage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const mealFormRef = useRef(null);
  const exerciseFormRef = useRef(null);

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

    // Scroll to the form with Lenis
    setTimeout(() => {
      if (mealFormRef.current && window.lenis) {
        window.lenis.scrollTo(mealFormRef.current, { offset: -100, duration: 1.2 });
      } else if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      }
    }, 100);
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

    // Scroll to the form with Lenis
    setTimeout(() => {
      if (exerciseFormRef.current && window.lenis) {
        window.lenis.scrollTo(exerciseFormRef.current, { offset: -100, duration: 1.2 });
      } else if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      }
    }, 100);
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
    return <Loader />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500 selection:text-black">
      <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(132,204,22,0.3)] overflow-hidden">
                <img
                  src="/Rikka.gif"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
                  Nutri<span className="ml-0.5 text-lime-500">Gain</span>
                </h1>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] leading-none">
                  Master Control Terminal
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    Admin
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
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {/* Tabs / Master Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <button
            onClick={() => setActiveTab("meals")}
            className={`
              group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden text-left cursor-pointer
              ${activeTab === "meals"
                ? "bg-lime-500/5 border-lime-500/40 shadow-[0_4px_20px_-5px_rgba(132,204,22,0.15)]"
                : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900 hover:border-neutral-700"
              }
            `}
          >
            {activeTab === "meals" && (
              <div className="absolute left-0 top-0 w-1 h-full bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)]"></div>
            )}
            <div className={`
              p-3 rounded-xl transition-all duration-300 shrink-0
              ${activeTab === "meals"
                ? "bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                : "bg-neutral-950 text-neutral-500 border border-neutral-800 group-hover:text-neutral-300 group-hover:border-neutral-600 group-hover:bg-neutral-900"}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${activeTab === 'meals' ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <div>
              <h3 className={`font-black uppercase tracking-widest text-[11px] sm:text-xs mb-0.5 ${activeTab === 'meals' ? 'text-lime-500' : 'text-white'}`}>Meals</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Database</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("gym")}
            className={`
              group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden text-left cursor-pointer
              ${activeTab === "gym"
                ? "bg-lime-500/5 border-lime-500/40 shadow-[0_4px_20px_-5px_rgba(132,204,22,0.15)]"
                : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900 hover:border-neutral-700"
              }
            `}
          >
            {activeTab === "gym" && (
              <div className="absolute left-0 top-0 w-1 h-full bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)]"></div>
            )}
            <div className={`
              p-3 rounded-xl transition-all duration-300 shrink-0
              ${activeTab === "gym"
                ? "bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                : "bg-neutral-950 text-neutral-500 border border-neutral-800 group-hover:text-neutral-300 group-hover:border-neutral-600 group-hover:bg-neutral-900"}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${activeTab === 'gym' ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className={`font-black uppercase tracking-widest text-[11px] sm:text-xs mb-0.5 ${activeTab === 'gym' ? 'text-lime-500' : 'text-white'}`}>Gym</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Library</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`
              group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 overflow-hidden text-left cursor-pointer
              ${activeTab === "users"
                ? "bg-lime-500/5 border-lime-500/40 shadow-[0_4px_20px_-5px_rgba(132,204,22,0.15)]"
                : "bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900 hover:border-neutral-700"
              }
            `}
          >
            {activeTab === "users" && (
              <div className="absolute left-0 top-0 w-1 h-full bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)]"></div>
            )}
            <div className={`
              p-3 rounded-xl transition-all duration-300 shrink-0
              ${activeTab === "users"
                ? "bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                : "bg-neutral-950 text-neutral-500 border border-neutral-800 group-hover:text-neutral-300 group-hover:border-neutral-600 group-hover:bg-neutral-900"}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${activeTab === 'users' ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className={`font-black uppercase tracking-widest text-[11px] sm:text-xs mb-0.5 ${activeTab === 'users' ? 'text-lime-500' : 'text-white'}`}>Users</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Directory</p>
            </div>
          </button>
        </div>

        {/* Meal Management Section */}
        {activeTab === "meals" && (
          <div className="space-y-6">
            {!showForm && (
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-6 py-3 rounded-xl bg-neutral-900 text-lime-500 border border-neutral-800 hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
                >
                  Manage Days
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-6 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20 cursor-pointer"
                >
                  {showForm ? "Cancel" : "Add New Meal"}
                </button>
              </div>
            )}

            {showForm && (
              <div ref={mealFormRef} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    {editingMeal ? "Edit Meal" : "Add New Meal"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] items-center gap-2 font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Meal Name <span className="text-lime-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grilled Chicken"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="general">General</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
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
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Serving
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 100g"
                        value={formData.servingSize}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            servingSize: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.calories}
                        onChange={(e) =>
                          setFormData({ ...formData, calories: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Protein
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.protein}
                        onChange={(e) =>
                          setFormData({ ...formData, protein: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-lime-500 font-bold text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Carbs/Fats
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="C"
                          value={formData.carbs}
                          title="Carbs"
                          onChange={(e) =>
                            setFormData({ ...formData, carbs: e.target.value })
                          }
                          className="w-full px-2 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm text-center"
                          required
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="F"
                          value={formData.fats}
                          title="Fats"
                          onChange={(e) =>
                            setFormData({ ...formData, fats: e.target.value })
                          }
                          className="w-full px-2 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm text-center"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20 cursor-pointer"
                    >
                      {editingMeal ? "Update Meal" : "Add Meal"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[1.25rem] border border-neutral-800/80 overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
              <div className="overflow-x-auto relative">
                <table className="min-w-full divide-y divide-neutral-800/50">
                  <thead className="bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-10">
                    <tr className="divide-x divide-neutral-800/50">
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                        Name
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden sm:table-cell">
                        Serving
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden sm:table-cell">
                        Calories
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden md:table-cell">
                        Protein
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden md:table-cell">
                        Carbs
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden md:table-cell">
                        Fats
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hidden lg:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50 relative z-0">
                    {meals.map((meal) => (
                      <tr
                        key={meal._id}
                        className="group border-b border-neutral-800/50 hover:bg-neutral-800/40 hover:shadow-inner transition-all duration-300 divide-x divide-neutral-800/50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-300 text-sm group-hover:text-white transition-colors">
                              {toTitleCase(meal.name)}
                            </span>
                            {/* Mobile Only Details */}
                            <div className="sm:hidden mt-2 flex flex-col gap-2">
                              <span className="text-xs text-neutral-400">
                                {meal.servingSize} • <span className="text-white font-mono font-bold">{meal.macros.calories}</span>kcal
                              </span>
                              <div className="flex gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-500 border border-lime-500/20 font-mono text-[10px] font-bold">P: {meal.macros.protein}g</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono text-[10px] font-bold">C: {meal.macros.carbs}g</span>
                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-mono text-[10px] font-bold">F: {meal.macros.fats}g</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-neutral-400 hidden sm:table-cell group-hover:text-neutral-300 transition-colors">
                          {meal.servingSize}
                        </td>
                        <td className="px-6 py-5 text-sm hidden sm:table-cell">
                          <span className="font-mono font-bold text-neutral-300 group-hover:text-white transition-colors">{meal.macros.calories}</span>
                          <span className="text-[10px] font-bold text-neutral-600 ml-1 uppercase tracking-widest">kcal</span>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-lime-500/10 text-lime-500 border border-lime-500/20 font-mono text-xs font-bold">
                            {meal.macros.protein}g
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono text-xs font-bold">
                            {meal.macros.carbs}g
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-mono text-xs font-bold">
                            {meal.macros.fats}g
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden lg:table-cell">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${meal.category === "breakfast"
                              ? "text-amber-500 border-amber-500/20 bg-amber-500/10"
                              : meal.category === "lunch"
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                                : meal.category === "dinner"
                                  ? "text-purple-500 border-purple-500/20 bg-purple-500/10"
                                  : "text-blue-500 border-blue-500/20 bg-blue-500/10"
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {meal.category}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(meal)}
                              className="p-2 bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-800 hover:border-neutral-600 hover:shadow-lg rounded-lg transition-all duration-300 cursor-pointer"
                              title="Edit Meal"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(meal._id)}
                              className="p-2 bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-lg rounded-lg transition-all duration-300 cursor-pointer"
                              title="Delete Meal"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <div className="space-y-8">
            {/* Weekly Schedule Management */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-lime-500/10 p-2.5 rounded-xl text-lime-500 border border-lime-500/20">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">
                    Weekly Split
                  </h2>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                    Manage workout schedule
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {workoutSchedule.map((schedule) => {
                  const isCompact = schedule.muscleGroups.length >= 3;
                  return (
                    <div
                      key={schedule.day}
                      className="bg-neutral-950 rounded-xl p-3 border border-neutral-800 hover:border-lime-500/50 transition-colors group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 group-hover:text-white transition-colors">
                          {schedule.day.substring(0, 3)}
                        </span>
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-neutral-600 hover:text-lime-500 transition-colors cursor-pointer"
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

                      <div className={`space-y-1.5`}>
                        {schedule.muscleGroups.length > 0 ? (
                          schedule.muscleGroups.map((group, idx) => (
                            <div
                              key={idx}
                              className={`bg-neutral-900 px-2 py-1.5 text-[10px] rounded border border-neutral-800 font-bold text-neutral-300 truncate`}
                            >
                              {group}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center py-2 opacity-20">
                            <span className="text-xl grayscale">💤</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule Edit Form */}
            {showScheduleForm && editingDay && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                      Edit{" "}
                      <span className="text-lime-500">{editingDay.day}</span>
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                      Target muscle groups
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
                          ${isSelected
                            ? "bg-lime-500/10 border-lime-500/20"
                            : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          className="w-4 h-4 accent-lime-500 rounded border-neutral-700 bg-neutral-900"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const updatedMuscleGroups = checked
                              ? [...editingDay.muscleGroups, group]
                              : editingDay.muscleGroups.filter(
                                (g) => g !== group,
                              );

                            setEditingDay({
                              ...editingDay,
                              muscleGroups: updatedMuscleGroups,
                            });

                            handleScheduleUpdate(
                              editingDay.day,
                              updatedMuscleGroups,
                            );
                          }}
                        />
                        <span
                          className={`text-sm font-bold uppercase tracking-wider ${isSelected ? "text-lime-500" : "text-neutral-400"}`}
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
                    className="px-6 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Exercise Management */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-8 border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex p-2 bg-lime-500/10 rounded-xl border border-lime-500/20">
                    <span className="text-xl text-lime-500">💪</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      Exercise Library
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                      Manage exercise database
                    </p>
                  </div>
                </div>
                {!showExerciseForm && (
                  <button
                    onClick={() => setShowExerciseForm(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20 cursor-pointer"
                  >
                    Add New Exercise
                  </button>
                )}
              </div>

              {/* Exercise Form */}
              {showExerciseForm && (
                <div ref={exerciseFormRef} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 relative animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 cursor-pointer">
                        {editingExercise ? "Edit Exercise" : "Add New Exercise"}
                      </h4>
                    </div>

                    {/* Buttons moved to top-right (Desktop Only) */}
                    <div className="hidden md:flex gap-3 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={resetExerciseForm}
                        className="px-6 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="exercise-form"
                        className="px-6 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20 cursor-pointer"
                      >
                        {editingExercise ? "Update" : "Save"}
                      </button>
                    </div>
                  </div>

                  <form
                    id="exercise-form"
                    onSubmit={handleExerciseSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
                  >
                    <div className="relative muscle-group-dropdown group">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Muscle Group
                      </label>
                      <div className="relative">
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
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm transition-colors"
                          placeholder="Search or select..."
                          required={!exerciseFormData.muscleGroup}
                        />
                        {showMuscleGroupDropdown && (
                          <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-60 overflow-auto custom-scrollbar" data-lenis-prevent="true">
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
                                  className="px-5 py-3.5 hover:bg-neutral-800 cursor-pointer text-neutral-300 hover:text-white transition-colors border-b border-neutral-800 last:border-0 font-bold text-sm"
                                >
                                  {group}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Exercise Name
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
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm transition-colors"
                        placeholder="e.g., Incline Dumbbell Press"
                        required
                      />
                    </div>

                    <div className="group md:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                        Exercise Type
                      </label>
                      <div className="relative">
                        <select
                          value={exerciseFormData.type}
                          onChange={(e) =>
                            setExerciseFormData({
                              ...exerciseFormData,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-lime-500 text-white font-bold text-sm appearance-none cursor-pointer"
                          required
                        >
                          <option value="COMPOUND">Compound Movement</option>
                          <option value="ISOLATION">Isolation Movement</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
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

                    {/* Mobile Buttons (Bottom) */}
                    <div className="md:col-span-2 flex flex-col-reverse gap-4 justify-end md:mt-4 md:pt-4 border-t border-neutral-800 md:hidden">
                      <button
                        type="button"
                        onClick={resetExerciseForm}
                        className="w-full px-8 py-3.5 rounded-xl border border-neutral-800 text-neutral-400 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full px-10 py-3.5 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20"
                      >
                        {editingExercise ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Exercise List by Muscle Group */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {uniqueMuscleGroups
                  .filter((group) => group !== "Rest Day")
                  .map((muscleGroup) => (
                    <div
                      key={muscleGroup}
                      className="bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-800"
                    >
                      <div className="bg-neutral-950/50 px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-1 h-8 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.4)]"></div>
                          <h4 className="text-lg font-black text-white italic uppercase tracking-wider">
                            {muscleGroup}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-lime-500 bg-lime-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-lime-500/20">
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
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-neutral-950/30 border-b border-neutral-800">
                              <th className="w-1/2 px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Exercise Name
                              </th>
                              <th className="w-1/4 px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Type
                              </th>
                              <th className="w-1/4 px-6 py-4 text-right text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {exercises
                              .filter((ex) => ex.muscleGroup === muscleGroup)
                              .map((exercise) => (
                                <tr
                                  key={exercise.id}
                                  className="hover:bg-neutral-800/40 transition-colors group"
                                >
                                  <td className="px-6 py-4 text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">
                                    {exercise.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${exercise.type === "COMPOUND"
                                        ? "bg-lime-500/10 text-lime-500 border-lime-500/20"
                                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                        }`}
                                    >
                                      {exercise.type === "COMPOUND" && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.5)]"></span>
                                      )}
                                      {exercise.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          handleEditExercise(exercise)
                                        }
                                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors active:scale-95"
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
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95"
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
                                    className="px-6 py-12 text-center text-neutral-500 text-sm font-medium bg-neutral-950/20"
                                  >
                                    No exercises added yet for {muscleGroup}.
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
                              className="p-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/30 transition-colors"
                            >
                              <div className="flex justify-between gap-3">
                                <div className="space-y-2">
                                  <h5 className="font-bold text-white text-sm">
                                    {exercise.name}
                                  </h5>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${exercise.type === "COMPOUND"
                                      ? "bg-lime-500/10 text-lime-500 border-lime-500/20"
                                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                      }`}
                                  >
                                    {exercise.type === "COMPOUND" && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.5)]"></span>
                                    )}
                                    {exercise.type}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleEditExercise(exercise)}
                                    className="p-2 text-neutral-400 hover:text-white bg-neutral-800/50 rounded-lg active:scale-95 transition-colors"
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
                                    className="p-2 text-neutral-400 hover:text-red-500 bg-neutral-800/50 rounded-lg active:scale-95 transition-colors"
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
                            <div className="p-6 text-center text-xs font-bold text-neutral-500 italic bg-neutral-950/20">
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
            <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-xl border border-neutral-800 overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-neutral-800 bg-neutral-950/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-wider flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 bg-lime-500/10 text-lime-500 rounded-xl text-xl shadow-[0_0_10px_rgba(132,204,22,0.2)]">
                        👥
                      </span>
                      Registered Users
                    </h2>
                    <p className="text-sm font-bold text-neutral-500 mt-2 ml-13 uppercase tracking-wider">
                      Manage and track user progress and statistics
                    </p>
                  </div>
                  <div className="self-start sm:self-center ml-10 sm:ml-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-lime-500/10 text-lime-500 border border-lime-500/20 shadow-[0_0_10px_rgba(132,204,22,0.1)] uppercase tracking-wider">
                      Total Users: {users.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8 bg-neutral-950/20 min-h-[400px]">
                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="group relative bg-neutral-950 rounded-2xl p-6 border border-neutral-800 shadow-lg hover:shadow-lime-500/10 hover:border-lime-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() =>
                          router.push(`/admin/user/${userData._id}`)
                        }
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-lime-500/10 transition-colors duration-500" />

                        {/* User Header */}
                        <div className="relative flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4 w-full">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center text-lime-500 text-xl font-black border border-neutral-800 group-hover:border-lime-500/50 group-hover:text-lime-400 transition-all shadow-lg">
                                {userData.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-lg group-hover:text-lime-500 transition-colors truncate">
                                {toTitleCase(userData.name)}
                              </h3>
                              <p className="text-xs font-medium text-neutral-500 truncate">
                                {userData.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="space-y-4 relative">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800 text-center">
                              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                Days Logged
                              </span>
                              <div className="text-xl font-black text-white mt-1">
                                {stats.daysLogged || 0}
                              </div>
                            </div>
                            <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800 text-center flex flex-col justify-center">
                              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                Last Activity
                              </span>
                              <div className="text-xs font-bold text-white mt-1 truncate px-1">
                                {stats.latestLogDate || "Inactive"}
                              </div>
                            </div>
                          </div>

                          {/* Average Macros */}
                          {stats.daysLogged > 0 ? (
                            <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 mt-2">
                              <div className="flex items-end justify-between mb-2 px-1">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                  Avg Intake
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {macros.calories}{" "}
                                  <span className="text-[9px] text-neutral-500">
                                    kcal
                                  </span>
                                </span>
                              </div>

                              <div className="flex h-2 w-full rounded-full overflow-hidden bg-neutral-800 mb-3">
                                <div
                                  className="bg-blue-500 h-full"
                                  style={{
                                    width: `${(p / totalWeight) * 100}%`,
                                  }}
                                  title="Protein"
                                />
                                <div
                                  className="bg-emerald-500 h-full"
                                  style={{
                                    width: `${(c / totalWeight) * 100}%`,
                                  }}
                                  title="Carbs"
                                />
                                <div
                                  className="bg-yellow-500 h-full"
                                  style={{
                                    width: `${(f / totalWeight) * 100}%`,
                                  }}
                                  title="Fats"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center bg-neutral-800/50 rounded-lg py-1.5 border border-neutral-800">
                                  <span className="text-[8px] text-blue-400 font-bold uppercase">
                                    Protein
                                  </span>
                                  <span className="text-[10px] font-bold text-white">
                                    {p}g
                                  </span>
                                </div>
                                <div className="flex flex-col items-center bg-neutral-800/50 rounded-lg py-1.5 border border-neutral-800">
                                  <span className="text-[8px] text-emerald-400 font-bold uppercase">
                                    Carbs
                                  </span>
                                  <span className="text-[10px] font-bold text-white">
                                    {c}g
                                  </span>
                                </div>
                                <div className="flex flex-col items-center bg-neutral-800/50 rounded-lg py-1.5 border border-neutral-800">
                                  <span className="text-[8px] text-yellow-400 font-bold uppercase">
                                    Fats
                                  </span>
                                  <span className="text-[10px] font-bold text-white">
                                    {f}g
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-neutral-900/30 rounded-xl p-6 text-center border-2 border-dashed border-neutral-800">
                              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                                No log data available
                              </p>
                            </div>
                          )}

                          {/* Member Since */}
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                ></path>
                              </svg>
                              {new Date(
                                userData.createdAt,
                              ).toLocaleDateString()}
                            </div>
                            <span className="text-[10px] font-bold text-lime-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider cursor-pointer">
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
                    <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl border border-neutral-800">
                      👥
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-wider">
                      No users found
                    </h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mt-2 text-sm font-medium">
                      Wait for users to register.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-800">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-wider">
                  Manage Weekly Schedule
                </h3>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">
                  Assign Chicken or Paneer days
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-white transition-colors cursor-pointer"
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

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
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
                  className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950/30 hover:bg-neutral-800/50 transition-all group"
                >
                  <span className="font-bold text-neutral-300 group-hover:text-white transition-colors">
                    {day}
                  </span>
                  <div className="flex bg-neutral-950 p-1.5 rounded-lg border border-neutral-800">
                    <button
                      onClick={() => {
                        const newSchedule = [...tempSchedule];
                        newSchedule[index] = "Chicken";
                        setTempSchedule(newSchedule);
                      }}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${tempSchedule[index] === "Chicken"
                        ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                        : "text-neutral-500 hover:text-neutral-300"
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
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${tempSchedule[index] === "Paneer"
                        ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20"
                        : "text-neutral-500 hover:text-neutral-300"
                        }`}
                    >
                      🧀 Paneer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-950/50 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-3 text-neutral-400 font-bold uppercase tracking-wider text-xs hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-6 py-3 bg-lime-500 text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-lime-400 shadow-lg shadow-lime-500/20 transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
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
