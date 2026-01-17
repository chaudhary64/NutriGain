"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
    warmUp: '',
    working: '',
    lastPR: '',
    lastPRDate: ''
  });

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
    }
  }, [user]);

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
        const validMuscleGroups = ["Chest", "Back", "Bicep", "Tricep", "Legs", "Forearms", "Shoulders", "Arms", "Rest Day"];
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const filteredSchedule = scheduleData
          .map(s => ({
            ...s,
            muscleGroups: (s.muscleGroups || []).filter(g => validMuscleGroups.includes(g))
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

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise._id);
    setEditFormData({
      warmUp: exercise.warmUp || '',
      working: exercise.working || '',
      lastPR: exercise.lastPR || '',
      lastPRDate: exercise.lastPRDate || ''
    });
  };

  const handleSaveExercise = async (exerciseId) => {
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (res.ok) {
        await fetchGymData();
        setEditingExercise(null);
      } else {
        alert('Failed to update exercise');
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise');
    }
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setEditFormData({
      warmUp: '',
      working: '',
      lastPR: '',
      lastPRDate: ''
    });
  };

  const getMuscleGroupEmoji = (group) => {
    const emojiMap = {
      Chest: "💪",
      Back: "🏋️",
      Bicep: "💪",
      Tricep: "🔥",
      Legs: "🦿",
      Forearms: "💪",
      Shoulders: "🦵",
      Arms: "💪",
      "Rest Day": "😴",
    };
    return emojiMap[group] || "🏋️";
  };

  const getDayColors = (day) => {
    const colorMap = {
      Monday: { bg: "from-blue-50 to-blue-100", border: "border-blue-200", textDark: "text-blue-900", textLight: "text-blue-800" },
      Tuesday: { bg: "from-green-50 to-green-100", border: "border-green-200", textDark: "text-green-900", textLight: "text-green-800" },
      Wednesday: { bg: "from-purple-50 to-purple-100", border: "border-purple-200", textDark: "text-purple-900", textLight: "text-purple-800" },
      Thursday: { bg: "from-orange-50 to-orange-100", border: "border-orange-200", textDark: "text-orange-900", textLight: "text-orange-800" },
      Friday: { bg: "from-pink-50 to-pink-100", border: "border-pink-200", textDark: "text-pink-900", textLight: "text-pink-800" },
      Saturday: { bg: "from-teal-50 to-teal-100", border: "border-teal-200", textDark: "text-teal-900", textLight: "text-teal-800" },
      Sunday: { bg: "from-gray-50 to-gray-100", border: "border-gray-200", textDark: "text-gray-900", textLight: "text-gray-800" },
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
                    <div className={`text-base sm:text-lg lg:text-xl font-bold ${colors.textDark} mb-2`}>
                      {schedule.day}
                    </div>
                    <div className="space-y-1">
                      {schedule.muscleGroups && schedule.muscleGroups.length > 0 ? (
                        schedule.muscleGroups.map((group, idx) => (
                          <div
                            key={idx}
                            className={`bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${colors.textLight}`}
                          >
                            {getMuscleGroupEmoji(group)} {group}
                          </div>
                        ))
                      ) : (
                        <div className={`bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-500`}>
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

        {/* Body Weight Chart */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-linear-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-blue-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">⚖️</span>
              Body Weight Progress
            </h2>

            {/* Chart Container */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { date: "Jan 1", weight: 88, fullDate: "Jan 1, 2026" },
                    { date: "Jan 5", weight: 86, fullDate: "Jan 5, 2026" },
                    { date: "Jan 16", weight: 90, fullDate: "Jan 16, 2026" },
                  ]}
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
                    domain={[72, 92]}
                    ticks={[72, 75, 78, 81, 84, 87, 90]}
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
                    formatter={(value, name, props) => [
                      `${value} kg`,
                      "Weight",
                    ]}
                    labelFormatter={(label) => {
                      const item = [
                        { date: "Jan 1", fullDate: "Jan 1, 2026" },
                        { date: "Jan 5", fullDate: "Jan 5, 2026" },
                        { date: "Jan 16", fullDate: "Jan 16, 2026" },
                      ].find((d) => d.date === label);
                      return item ? item.fullDate : label;
                    }}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    label={{
                      value: "Target: 75 kg",
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

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl sm:text-2xl">📊</span>
                  <p className="text-xs font-bold text-blue-700 uppercase">
                    Starting Weight
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  88 kg
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Jan 1, 2026
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
                  90 kg
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Jan 16, 2026
                </p>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl sm:text-2xl">🎯</span>
                  <p className="text-xs font-bold text-orange-700 uppercase">
                    Target Weight
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  75 kg
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  15 kg to lose
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl sm:text-2xl">📈</span>
                  <p className="text-xs font-bold text-purple-700 uppercase">
                    Total Change
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  +2 kg
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">15 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Workout Details */}
        <div className="bg-linear-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl">💪</span>
                Today's Workout
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2 ml-10 sm:ml-12 lg:ml-14 font-semibold">
                Monday Session
              </p>
            </div>
            <span className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg">
              Chest & Triceps
            </span>
          </div>

          {/* Dynamic Exercises by Muscle Group */}
          {exercises.length > 0 && (
            <>
              {[...new Set(exercises.map(ex => ex.muscleGroup))].map((muscleGroup) => {
                const groupExercises = exercises.filter(ex => ex.muscleGroup === muscleGroup);
                return (
                  <div key={muscleGroup} className="mb-8">
                    <div className="mb-4">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {muscleGroup}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {groupExercises.length} Exercise{groupExercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {groupExercises.map((exercise) => (
                        <div
                          key={exercise._id}
                          className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${
                            exercise.type === 'COMPOUND' ? 'border-blue-500' : 'border-red-500'
                          }`}
                        >
                          <div className={`bg-linear-to-r ${
                            exercise.type === 'COMPOUND' 
                              ? 'from-blue-50 via-indigo-50 to-purple-50' 
                              : 'from-red-50 via-pink-50 to-red-50'
                          } px-4 sm:px-6 py-3 sm:py-4`}>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                                {exercise.name}
                              </h4>
                              <span className={`inline-block ${
                                exercise.type === 'COMPOUND' ? 'bg-blue-600' : 'bg-purple-600'
                              } text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>
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
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.warmUp}
                                          onChange={(e) => setEditFormData({...editFormData, warmUp: e.target.value})}
                                          className="w-full px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-600 text-lg"
                                          placeholder="20"
                                        />
                                      ) : (
                                        <div className="font-bold text-orange-600 text-lg">
                                          {exercise.warmUp ? `${exercise.warmUp} kg` : '-'}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-4 border-b border-gray-200">
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.working}
                                          onChange={(e) => setEditFormData({...editFormData, working: e.target.value})}
                                          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 text-lg"
                                          placeholder="35"
                                        />
                                      ) : (
                                        <div className="font-bold text-blue-600 text-lg">
                                          {exercise.working ? `${exercise.working} kg` : '-'}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-4 border-b border-gray-200">
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={editFormData.lastPR}
                                          onChange={(e) => setEditFormData({...editFormData, lastPR: e.target.value})}
                                          className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-green-600 text-lg"
                                          placeholder="42.5"
                                        />
                                      ) : (
                                        <div className="font-bold text-green-600 text-lg">
                                          {exercise.lastPR ? `${exercise.lastPR} kg` : '-'}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-4 border-b border-gray-200">
                                      {editingExercise === exercise._id ? (
                                        <input
                                          type="date"
                                          value={editFormData.lastPRDate}
                                          onChange={(e) => setEditFormData({...editFormData, lastPRDate: e.target.value})}
                                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm text-gray-700"
                                        />
                                      ) : (
                                        <div className="text-sm text-gray-700">
                                          {exercise.lastPRDate || '-'}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan="4" className="px-3 py-2 border-b border-gray-200">
                                      <div className="flex justify-end gap-2">
                                        {editingExercise === exercise._id ? (
                                          <>
                                            <button
                                              onClick={() => handleSaveExercise(exercise._id)}
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
                                            onClick={() => handleEditExercise(exercise)}
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
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-md font-semibold">
              ✅ Start Workout
            </button>
            <button className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md font-semibold">
              📊 View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
