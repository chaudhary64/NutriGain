"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function UserDetailPage() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [userData, setUserData] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (!authLoading && (!authUser || !authUser.isAdmin)) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      
      if (res.ok) {
        setUserData(data.user);
        setDailyLogs(data.dailyLogs);
        setStats(data.stats);
      } else {
        alert("Failed to fetch user data");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to fetch user data");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (authUser && authUser.isAdmin && userId) {
      fetchUserData();
    }
  }, [authUser, userId, fetchUserData]);

  const getChartData = () => {
    return dailyLogs
      .slice(0, 30)
      .reverse()
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calories: log.totalMacros?.calories || 0,
        protein: log.totalMacros?.protein || 0,
        carbs: log.totalMacros?.carbs || 0,
        fats: log.totalMacros?.fats || 0,
      }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!authUser || !authUser.isAdmin || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👤</div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {userData.name}'s Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition font-medium text-sm flex items-center gap-1"
              >
                📊 Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {userData.name}
              </h2>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">📅</span>
              <p className="text-sm font-bold text-blue-700 uppercase">
                Days Logged
              </p>
            </div>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalDaysLogged}
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <p className="text-sm font-bold text-green-700 uppercase">
                Current Streak
              </p>
            </div>
            <p className="text-4xl font-bold text-green-600">
              {stats.currentStreak}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Longest: {stats.longestStreak} days
            </p>
          </div>

          <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">⚡</span>
              <p className="text-sm font-bold text-orange-700 uppercase">
                Avg Calories
              </p>
            </div>
            <p className="text-4xl font-bold text-orange-600">
              {stats.averageCalories}
            </p>
            <p className="text-xs text-gray-600 mt-1">per day</p>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">💪</span>
              <p className="text-sm font-bold text-purple-700 uppercase">
                Avg Protein
              </p>
            </div>
            <p className="text-4xl font-bold text-purple-600">
              {stats.averageProtein}g
            </p>
            <p className="text-xs text-gray-600 mt-1">per day</p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Average Daily Macros
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.averageCalories}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.averageProtein}g
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.averageCarbs}g
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Fats</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.averageFats}g
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        {dailyLogs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Calories Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Calorie Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macros Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Macros Distribution (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="protein" fill="#3b82f6" />
                  <Bar dataKey="carbs" fill="#10b981" />
                  <Bar dataKey="fats" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Daily Logs */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Daily Logs History
          </h3>

          {dailyLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No logs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyLogs.map((log) => (
                <div
                  key={log._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() =>
                    setSelectedLog(selectedLog?._id === log._id ? null : log)
                  }
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg text-gray-800">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {log.meals.length} meals logged
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Calories</p>
                        <p className="text-lg font-bold text-orange-600">
                          {log.totalMacros?.calories || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Protein</p>
                        <p className="text-lg font-bold text-blue-600">
                          {log.totalMacros?.protein || 0}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Carbs</p>
                        <p className="text-lg font-bold text-green-600">
                          {log.totalMacros?.carbs || 0}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Fats</p>
                        <p className="text-lg font-bold text-purple-600">
                          {log.totalMacros?.fats || 0}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Meal Details */}
                  {selectedLog?._id === log._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Meals:
                      </h4>
                      <div className="space-y-2">
                        {log.meals.map((mealEntry, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {mealEntry.mealName || mealEntry.meal?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {mealEntry.mealType.charAt(0).toUpperCase() +
                                  mealEntry.mealType.slice(1)}{" "}
                                • Quantity: {mealEntry.quantity}
                              </p>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <span className="text-orange-600 font-semibold">
                                {mealEntry.macros?.calories || 0} cal
                              </span>
                              <span className="text-blue-600 font-semibold">
                                {mealEntry.macros?.protein || 0}g P
                              </span>
                              <span className="text-green-600 font-semibold">
                                {mealEntry.macros?.carbs || 0}g C
                              </span>
                              <span className="text-purple-600 font-semibold">
                                {mealEntry.macros?.fats || 0}g F
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
