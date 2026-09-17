"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

// Helper function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ============ Meridian Admin — theme tokens (mirror of the dashboard systems) ============ */
const ADM_CSS = `
.adm *{box-sizing:border-box}
.adm{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--track:#efefec;--on-ac:#fff;--ac-soft:#eef2ff;--ac-soft-b:#c7d2fe;--green:#047857;--green-soft:#ecfdf5;--red-soft:#fef2f2;--red-soft-b:#fecaca;--pro:#7c3aed;--pro-soft:#f5f3ff;--car:#b45309;--car-soft:#fffbeb;color:var(--t1);font-family:inherit}
html[data-theme="dark"] .adm{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--track:#2e2e34;--on-ac:#111113;--ac-soft:#232347;--ac-soft-b:#3730a3;--green:#34d399;--green-soft:#0d2a22;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b;--pro:#a78bfa;--pro-soft:#2b2140;--car:#fbbf24;--car-soft:#3a2d10}
.adm-head{margin-bottom:28px}
.adm-crumb{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--t3);text-transform:uppercase;margin-bottom:6px}
.adm-h1{font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin:0}
.adm-sub{font-size:13px;font-weight:500;color:var(--t2);margin-top:4px}
/* tab switcher */
.adm-tabs{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:32px}
@media(min-width:640px){.adm-tabs{grid-template-columns:repeat(3,1fr)}}
.adm-tab{position:relative;display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px;text-align:left;cursor:pointer;transition:border-color .15s ease,background .15s ease;font:inherit}
.adm-tab:hover{background:var(--sunken)}
.adm-tab:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.adm-tab.on{border-color:var(--ac);background:var(--card)}
.adm-tab.on::before{content:"";position:absolute;left:-1px;top:12px;bottom:12px;width:3px;border-radius:3px;background:var(--ac)}
.adm-tab-ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--sunken);color:var(--t2);flex-shrink:0;transition:background .15s ease,color .15s ease}
.adm-tab.on .adm-tab-ico{background:var(--ac-soft);color:var(--ac)}
.adm-tab-name{font-size:13px;font-weight:700;color:var(--t1)}
.adm-tab.on .adm-tab-name{color:var(--ac)}
.adm-tab-sub{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);margin-top:2px}
/* buttons */
.adm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 20px;background:var(--ac);color:var(--on-ac);border:none;border-radius:10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s ease,transform .06s ease}
.adm-btn:hover{background:var(--ach)}
.adm-btn:active{transform:translateY(1px)}
.adm-btn:disabled{opacity:.55;cursor:wait}
.adm-btn:focus-visible,.adm-ghost:focus-visible,.adm-icon:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.adm-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 20px;background:transparent;color:var(--t2);border:1px solid var(--line);border-radius:10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s ease,color .15s ease}
.adm-ghost:hover{background:var(--sunken);color:var(--t1)}
.adm-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--t2);cursor:pointer;transition:background .15s ease,color .15s ease,border-color .15s ease}
.adm-icon:hover{background:var(--sunken);color:var(--t1)}
.adm-icon.danger:hover{background:var(--red-soft);border-color:var(--red-soft-b);color:var(--red)}
/* cards & forms */
.adm-card{background:var(--card);border:1px solid var(--line);border-radius:14px}
.adm-form{padding:22px}
.adm-form h3{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--t1);margin:0}
.adm-lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:7px}
.adm-in{width:100%;height:44px;padding:0 13px;background:var(--card);border:1px solid var(--line);border-radius:10px;font:inherit;font-size:14px;font-weight:500;color:var(--t1);outline:none;transition:border-color .15s ease,box-shadow .15s ease}
.adm-in::placeholder{color:var(--t3);opacity:.7}
.adm-in:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac-soft)}
select.adm-in{appearance:none;cursor:pointer}
.adm-dd{position:absolute;z-index:40;width:100%;margin-top:6px;background:var(--card);border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.14);max-height:240px;overflow:auto}
.adm-dd button{display:block;width:100%;text-align:left;padding:11px 15px;background:transparent;border:none;border-bottom:1px solid var(--line);font:inherit;font-size:13px;font-weight:600;color:var(--t1);cursor:pointer}
.adm-dd button:last-child{border-bottom:none}
.adm-dd button:hover{background:var(--sunken)}
/* table */
.adm-tblwrap{overflow-x:auto}
.adm table{width:100%;border-collapse:collapse;font-size:13px}
.adm th{padding:13px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);background:var(--sunken);border-bottom:1px solid var(--line);white-space:nowrap}
.adm td{padding:13px 16px;border-top:1px solid var(--line);color:var(--t2);vertical-align:middle}
.adm tbody tr{transition:background .12s ease}
.adm tbody tr:hover{background:var(--sunken)}
.adm .tname{font-weight:600;color:var(--t1)}
.adm .tnum{font-variant-numeric:tabular-nums;font-weight:600;color:var(--t1)}
.adm .tunit{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-left:4px}
.adm-chip{display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}
.adm-chip.pro{background:var(--pro-soft);color:var(--pro)}
.adm-chip.car{background:var(--car-soft);color:var(--car)}
.adm-chip.fat{background:var(--green-soft);color:var(--green)}
.adm-cat{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:var(--sunken);color:var(--t2);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.adm-cat i{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.adm-cat.breakfast i{background:var(--car)}
.adm-cat.lunch i{background:var(--green)}
.adm-cat.dinner i{background:var(--pro)}
.adm-cat.general i{background:var(--ac)}
/* section headers */
.adm-sec{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:34px 0 18px}
.adm-sec h2{font-size:17px;font-weight:800;letter-spacing:-.01em;color:var(--t1);margin:0}
.adm-sec p{font-size:12px;font-weight:500;color:var(--t2);margin:2px 0 0}
/* schedule grid */
.adm-days{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:640px){.adm-days{grid-template-columns:repeat(4,1fr)}}
@media(min-width:1024px){.adm-days{grid-template-columns:repeat(7,1fr)}}
.adm-day{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.adm-day-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.adm-day-h span{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3)}
.adm-day-h button{display:inline-flex;border:none;background:transparent;color:var(--t3);cursor:pointer;padding:4px;border-radius:6px}
.adm-day-h button:hover{color:var(--ac);background:var(--ac-soft)}
.adm-day-chip{display:block;padding:6px 9px;border-radius:7px;background:var(--sunken);color:var(--t2);font-size:11px;font-weight:600;margin-bottom:5px}
.adm-day-rest{padding:10px 0;text-align:center;font-size:11px;font-weight:600;color:var(--t3)}
/* checkbox cards */
.adm-check{display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--card);border:1px solid var(--line);border-radius:10px;cursor:pointer;transition:border-color .15s ease,background .15s ease;font-size:13px;font-weight:600;color:var(--t2)}
.adm-check:hover{background:var(--sunken)}
.adm-check.on{border-color:var(--ac);background:var(--ac-soft);color:var(--ac)}
.adm-check input{accent-color:var(--ac);width:15px;height:15px}
/* exercise group cards */
.adm-eg{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.adm-eg-h{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--sunken)}
.adm-eg-h h4{font-size:14px;font-weight:800;letter-spacing:-.01em;color:var(--t1);margin:0}
.adm-eg-h .count{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ac);background:var(--ac-soft);border-radius:999px;padding:3px 9px}
.adm-eg table td:first-child{color:var(--t1);font-weight:600}
.adm-type{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--sunken);color:var(--t2)}
.adm-type i{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.adm-type.compound{background:var(--ac-soft);color:var(--ac)}
.adm-type.compound i{background:var(--ac)}
.adm-empty{padding:34px 16px;text-align:center;font-size:13px;font-weight:500;color:var(--t3);background:var(--sunken)}
/* users */
.adm-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 13px;border-radius:999px;background:var(--ac-soft);color:var(--ac);font-size:12px;font-weight:700}
.adm-user{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;cursor:pointer;transition:border-color .15s ease,transform .15s ease,box-shadow .15s ease}
.adm-user:hover{border-color:var(--ac-soft-b);transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.08)}
.adm-ava{width:50px;height:50px;border-radius:12px;background:var(--sunken);color:var(--ac);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;flex-shrink:0}
.adm-mini{background:var(--sunken);border-radius:10px;padding:11px;text-align:center}
.adm-mini span{display:block;font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--t3)}
.adm-mini b{display:block;font-size:17px;font-weight:800;color:var(--t1);margin-top:3px;font-variant-numeric:tabular-nums}
.adm-mbar{display:flex;height:7px;border-radius:999px;overflow:hidden;background:var(--track);margin:9px 0}
.adm-mbar i{height:100%}
.adm-mrow{display:flex;justify-content:space-between;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
/* (modal/overlay CSS removed with the meal-days modal — no modals remain) */
@media(prefers-reduced-motion:reduce){.adm *{transition:none!important;animation:none!important}}
`;

/* Meridian stroke icons */
const I = {
  utensils: (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
  ),
  dumbbell: (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  pencil: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
  ),
};

export default function AdminPage() {
  const { user } = useAuth();
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

  // Users state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Gym workout state
  const [workoutSchedule, setWorkoutSchedule] = useState([
    { day: "Monday", muscleGroups: [] },
    { day: "Tuesday", muscleGroups: [] },
    { day: "Wednesday", muscleGroups: [] },
    { day: "Thursday", muscleGroups: [] },
    { day: "Friday", muscleGroups: [] },
    { day: "Saturday", muscleGroups: [] },
    { day: "Sunday", muscleGroups: [] },
  ]);

  const [exercises, setExercises] = useState([]);

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

  useEffect(() => {
    if (user && user.isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMeals();
      fetchGymData();
      fetchUsers();
    }
  }, [user]);

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

  if (loading) {
    return <Loader />;
  }

  return (
    <AppShell variant="admin">
      <style>{ADM_CSS}</style>

      <div className="adm ng-container py-8">
        {/* Page header */}
        <div className="adm-head">
          <p className="adm-crumb">Admin</p>
          <h1 className="adm-h1">Console</h1>
          <p className="adm-sub">Manage the meal database, exercise library, weekly split, and users.</p>
        </div>

        {/* Tabs */}
        <div className="adm-tabs" role="tablist" aria-label="Admin sections">
          {[
            { id: "meals", name: "Meals", sub: "Database", icon: I.utensils },
            { id: "gym", name: "Gym", sub: "Library", icon: I.dumbbell },
            { id: "users", name: "Users", sub: "Directory", icon: I.users },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`adm-tab ${activeTab === tab.id ? "on" : ""}`}
            >
              <span className="adm-tab-ico">{tab.icon}</span>
              <span>
                <span className="adm-tab-name">{tab.name}</span>
                <span className="adm-tab-sub" style={{ display: "block" }}>{tab.sub}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Meal Management Section */}
        {activeTab === "meals" && (
          <div className="space-y-5">
            {!showForm && (
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button onClick={() => setShowForm(true)} className="adm-btn">
                  Add new meal
                </button>
              </div>
            )}

            {showForm && (
              <div ref={mealFormRef} className="adm-card adm-form">
                <div className="flex items-center justify-between mb-5">
                  <h3>{editingMeal ? "Edit meal" : "Add new meal"}</h3>
                  <button onClick={resetForm} className="adm-icon" aria-label="Close form">
                    {I.x}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="adm-lbl">Meal name</label>
                      <input
                        type="text"
                        placeholder="e.g. Grilled Chicken"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="adm-in"
                        required
                      />
                    </div>

                    <div>
                      <label className="adm-lbl">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="adm-in"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="adm-lbl">Serving</label>
                      <input
                        type="text"
                        placeholder="e.g. 100g"
                        value={formData.servingSize}
                        onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                        className="adm-in"
                      />
                    </div>
                    <div>
                      <label className="adm-lbl">Calories</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        className="adm-in"
                        required
                      />
                    </div>
                    <div>
                      <label className="adm-lbl">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        className="adm-in"
                        required
                      />
                    </div>
                    <div>
                      <label className="adm-lbl">Carbs / Fats (g)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="C"
                          value={formData.carbs}
                          title="Carbs"
                          onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                          className="adm-in"
                          style={{ textAlign: "center" }}
                          required
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="F"
                          value={formData.fats}
                          title="Fats"
                          onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                          className="adm-in"
                          style={{ textAlign: "center" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--line)" }}>
                    <button type="button" onClick={resetForm} className="adm-ghost">
                      Cancel
                    </button>
                    <button type="submit" className="adm-btn">
                      {editingMeal ? "Update meal" : "Add meal"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="adm-card adm-tblwrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hidden sm:table-cell">Serving</th>
                    <th className="hidden sm:table-cell">Calories</th>
                    <th className="hidden md:table-cell">Protein</th>
                    <th className="hidden md:table-cell">Carbs</th>
                    <th className="hidden md:table-cell">Fats</th>
                    <th className="hidden lg:table-cell">Category</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal) => (
                    <tr key={meal._id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="tname">{toTitleCase(meal.name)}</span>
                          {/* Mobile only details */}
                          <div className="sm:hidden mt-2 flex flex-col gap-1.5">
                            <span style={{ fontSize: 12 }}>
                              {meal.servingSize} • <span className="tnum">{meal.macros.calories}</span><span className="tunit">kcal</span>
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="adm-chip pro">P: {meal.macros.protein}g</span>
                              <span className="adm-chip car">C: {meal.macros.carbs}g</span>
                              <span className="adm-chip fat">F: {meal.macros.fats}g</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">{meal.servingSize}</td>
                      <td className="hidden sm:table-cell">
                        <span className="tnum">{meal.macros.calories}</span>
                        <span className="tunit">kcal</span>
                      </td>
                      <td className="hidden md:table-cell"><span className="adm-chip pro">{meal.macros.protein}g</span></td>
                      <td className="hidden md:table-cell"><span className="adm-chip car">{meal.macros.carbs}g</span></td>
                      <td className="hidden md:table-cell"><span className="adm-chip fat">{meal.macros.fats}g</span></td>
                      <td className="hidden lg:table-cell">
                        <span className={`adm-cat ${meal.category}`}><i />{meal.category}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(meal)} className="adm-icon" title="Edit meal" aria-label={`Edit ${meal.name}`}>
                            {I.pencil}
                          </button>
                          <button onClick={() => handleDelete(meal._id)} className="adm-icon danger" title="Delete meal" aria-label={`Delete ${meal.name}`}>
                            {I.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {meals.length === 0 && (
                    <tr><td colSpan="8" className="adm-empty">No meals in the database yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gym Management Section */}
        {activeTab === "gym" && (
          <div>
            {/* Weekly Schedule Management */}
            <div className="adm-card adm-form">
              <div className="mb-5">
                <h3>Weekly split</h3>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--t2)", marginTop: 3 }}>
                  Target muscle groups per training day.
                </p>
              </div>

              <div className="adm-days">
                {workoutSchedule.map((schedule) => (
                  <div key={schedule.day} className="adm-day">
                    <div className="adm-day-h">
                      <span>{schedule.day.substring(0, 3)}</span>
                      <button onClick={() => handleEditSchedule(schedule)} aria-label={`Edit ${schedule.day}`}>
                        {I.pencil}
                      </button>
                    </div>

                    {schedule.muscleGroups.length > 0 ? (
                      schedule.muscleGroups.map((group, idx) => (
                        <span key={idx} className="adm-day-chip">{group}</span>
                      ))
                    ) : (
                      <div className="adm-day-rest">Rest</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Edit Form */}
            {showScheduleForm && editingDay && (
              <div className="adm-card adm-form" style={{ marginTop: 20 }}>
                <div className="mb-5">
                  <h3>Edit {editingDay.day}</h3>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--t2)", marginTop: 3 }}>
                    Target muscle groups
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {uniqueMuscleGroups.map((group) => {
                    const isSelected = editingDay.muscleGroups.includes(group);
                    return (
                      <label key={group} className={`adm-check ${isSelected ? "on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
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
                        {group}
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingDay(null);
                    }}
                    className="adm-btn"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Exercise Management */}
            <div className="adm-sec" style={{ borderTop: "1px solid var(--line)", paddingTop: 30 }}>
              <div>
                <h2>Exercise library</h2>
                <p>Manage the exercise database.</p>
              </div>
              {!showExerciseForm && (
                <button onClick={() => setShowExerciseForm(true)} className="adm-btn">
                  Add new exercise
                </button>
              )}
            </div>

            {/* Exercise Form */}
            {showExerciseForm && (
              <div ref={exerciseFormRef} className="adm-card adm-form" style={{ marginBottom: 24 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                  <h3>{editingExercise ? "Edit exercise" : "Add new exercise"}</h3>

                  {/* Desktop buttons */}
                  <div className="hidden md:flex gap-3">
                    <button type="button" onClick={resetExerciseForm} className="adm-ghost">
                      Cancel
                    </button>
                    <button type="submit" form="exercise-form" className="adm-btn">
                      {editingExercise ? "Update" : "Save"}
                    </button>
                  </div>
                </div>

                <form
                  id="exercise-form"
                  onSubmit={handleExerciseSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="relative muscle-group-dropdown">
                    <label className="adm-lbl">Muscle group</label>
                    <input
                      type="text"
                      value={muscleGroupSearch || exerciseFormData.muscleGroup}
                      onChange={(e) => {
                        setMuscleGroupSearch(e.target.value);
                        setShowMuscleGroupDropdown(true);
                      }}
                      onFocus={() => setShowMuscleGroupDropdown(true)}
                      className="adm-in"
                      placeholder="Search or select…"
                      required={!exerciseFormData.muscleGroup}
                    />
                    {showMuscleGroupDropdown && (
                      <div className="adm-dd" data-lenis-prevent="true">
                        {uniqueMuscleGroups
                          .filter((group) => group !== "Rest Day")
                          .filter((group) =>
                            group
                              .toLowerCase()
                              .includes(muscleGroupSearch.toLowerCase()),
                          )
                          .map((group) => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => {
                                setExerciseFormData({
                                  ...exerciseFormData,
                                  muscleGroup: group,
                                });
                                setMuscleGroupSearch("");
                                setShowMuscleGroupDropdown(false);
                              }}
                            >
                              {group}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="adm-lbl">Exercise name</label>
                    <input
                      type="text"
                      value={exerciseFormData.name}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          name: e.target.value,
                        })
                      }
                      className="adm-in"
                      placeholder="e.g., Incline Dumbbell Press"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="adm-lbl">Exercise type</label>
                    <select
                      value={exerciseFormData.type}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          type: e.target.value,
                        })
                      }
                      className="adm-in"
                      required
                    >
                      <option value="COMPOUND">Compound movement</option>
                      <option value="ISOLATION">Isolation movement</option>
                    </select>
                  </div>

                  {/* Mobile buttons */}
                  <div className="md:col-span-2 flex flex-col-reverse gap-3 md:hidden" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                    <button type="button" onClick={resetExerciseForm} className="adm-ghost w-full">
                      Cancel
                    </button>
                    <button type="submit" className="adm-btn w-full">
                      {editingExercise ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Exercise List by Muscle Group */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {uniqueMuscleGroups
                .filter((group) => group !== "Rest Day")
                .map((muscleGroup) => {
                  const groupExercises = exercises.filter((ex) => ex.muscleGroup === muscleGroup);
                  return (
                    <div key={muscleGroup} className="adm-eg">
                      <div className="adm-eg-h">
                        <h4>{muscleGroup}</h4>
                        <span className="count">{groupExercises.length} exercises</span>
                      </div>

                      {/* Desktop table */}
                      <div className="hidden md:block adm-tblwrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Exercise name</th>
                              <th>Type</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupExercises.map((exercise) => (
                              <tr key={exercise.id}>
                                <td>{exercise.name}</td>
                                <td>
                                  <span className={`adm-type ${exercise.type === "COMPOUND" ? "compound" : ""}`}>
                                    {exercise.type === "COMPOUND" && <i />}
                                    {exercise.type}
                                  </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditExercise(exercise)} className="adm-icon" title="Edit" aria-label={`Edit ${exercise.name}`}>
                                      {I.pencil}
                                    </button>
                                    <button onClick={() => handleDeleteExercise(exercise.id)} className="adm-icon danger" title="Delete" aria-label={`Delete ${exercise.name}`}>
                                      {I.trash}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {groupExercises.length === 0 && (
                              <tr><td colSpan="3" className="adm-empty">No exercises added yet for {muscleGroup}.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden">
                        {groupExercises.map((exercise) => (
                          <div key={exercise.id} className="p-4 flex justify-between gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
                            <div>
                              <h5 style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", margin: 0 }}>{exercise.name}</h5>
                              <span className={`adm-type ${exercise.type === "COMPOUND" ? "compound" : ""}`} style={{ marginTop: 8, display: "inline-flex" }}>
                                {exercise.type === "COMPOUND" && <i />}
                                {exercise.type}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => handleEditExercise(exercise)} className="adm-icon" aria-label={`Edit ${exercise.name}`}>{I.pencil}</button>
                              <button onClick={() => handleDeleteExercise(exercise.id)} className="adm-icon danger" aria-label={`Delete ${exercise.name}`}>{I.trash}</button>
                            </div>
                          </div>
                        ))}
                        {groupExercises.length === 0 && (
                          <div className="adm-empty">No exercises added yet.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Users Management Section */}
        {activeTab === "users" && (
          <div>
            <div className="adm-sec" style={{ marginTop: 0 }}>
              <div>
                <h2>Registered users</h2>
                <p>Manage and review user progress and statistics.</p>
              </div>
              <span className="adm-pill">Total users: {users.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                    className="adm-user"
                    onClick={() =>
                      router.push(`/admin/user/${userData._id}`)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/admin/user/${userData._id}`);
                      }
                    }}
                  >
                    {/* User header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="adm-ava">{userData.name.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", margin: 0 }} className="truncate">
                          {toTitleCase(userData.name)}
                        </h3>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--t3)", margin: 0 }} className="truncate">
                          {userData.email}
                        </p>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="adm-mini">
                        <span>Days logged</span>
                        <b>{stats.daysLogged || 0}</b>
                      </div>
                      <div className="adm-mini">
                        <span>Last activity</span>
                        <b style={{ fontSize: 12, fontWeight: 700 }}>{stats.latestLogDate || "Inactive"}</b>
                      </div>
                    </div>

                    {/* Average macros */}
                    {stats.daysLogged > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-end justify-between">
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)" }}>
                            Avg intake
                          </span>
                          <span className="tnum" style={{ fontSize: 13 }}>
                            {macros.calories}<span className="tunit">kcal</span>
                          </span>
                        </div>

                        <div className="adm-mbar">
                          <i style={{ width: `${(p / totalWeight) * 100}%`, background: "var(--pro)" }} title="Protein" />
                          <i style={{ width: `${(c / totalWeight) * 100}%`, background: "var(--car)" }} title="Carbs" />
                          <i style={{ width: `${(f / totalWeight) * 100}%`, background: "var(--green)" }} title="Fats" />
                        </div>

                        <div className="adm-mrow">
                          <span style={{ color: "var(--pro)" }}>P {p}g</span>
                          <span style={{ color: "var(--car)" }}>C {c}g</span>
                          <span style={{ color: "var(--green)" }}>F {f}g</span>
                        </div>
                      </div>
                    ) : (
                      <div className="adm-mini" style={{ marginBottom: 16, padding: "18px 11px" }}>
                        <span>No log data available</span>
                      </div>
                    )}

                    {/* Member since */}
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--line)" }}>
                      <div className="flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--t3)" }}>
                        {I.calendar}
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--ac)" }}>
                        View profile →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {users.length === 0 && (
              <div className="adm-empty" style={{ borderRadius: 14 }}>
                No users found — wait for users to register.
              </div>
            )}
          </div>
        )}
      </div>

    </AppShell>
  );
}
