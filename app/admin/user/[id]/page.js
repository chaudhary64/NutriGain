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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Navigation */}
      <nav className="bg-neutral-900 shadow-lg border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl bg-neutral-800 w-10 h-10 rounded-lg flex items-center justify-center border border-neutral-700 shadow-lg">
                👤
              </div>
              <h1 className="text-xl font-black italic uppercase tracking-wider text-white">
                <span className="text-lime-500">{userData.name}'s</span> Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                📊 Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition font-bold text-xs uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* User Info Card */}
        <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-neutral-950 rounded-2xl flex items-center justify-center text-lime-500 text-3xl font-black border border-neutral-800 shadow-2xl">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-wider">
                {userData.name}
              </h2>
              <p className="text-neutral-400 font-medium">{userData.email}</p>
              <p className="text-xs text-neutral-500 mt-2 font-bold uppercase tracking-widest">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-blue-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                📅
              </div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                Days Logged
              </p>
            </div>
            <p className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">
              {stats.totalDaysLogged}
            </p>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-lime-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-lime-500/10 flex items-center justify-center text-xl border border-lime-500/20 group-hover:bg-lime-500/20 transition-colors">
                 🔥
              </div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-lime-500 transition-colors">
                Current Streak
              </p>
            </div>
            <p className="text-4xl font-black text-white group-hover:text-lime-400 transition-colors">
              {stats.currentStreak}
            </p>
            <p className="text-[10px] text-neutral-600 mt-2 font-bold uppercase tracking-wider">
              Longest: {stats.longestStreak} days
            </p>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-orange-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                ⚡
              </div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                Avg Calories
              </p>
            </div>
            <p className="text-4xl font-black text-white group-hover:text-orange-400 transition-colors">
              {stats.averageCalories}
            </p>
            <p className="text-[10px] text-neutral-600 mt-2 font-bold uppercase tracking-wider">
              per day
            </p>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                💪
              </div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-purple-500 transition-colors">
                Avg Protein
              </p>
            </div>
            <p className="text-4xl font-black text-white group-hover:text-purple-400 transition-colors">
              {stats.averageProtein}g
            </p>
            <p className="text-[10px] text-neutral-600 mt-2 font-bold uppercase tracking-wider">
              per day
            </p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-800">
          <h3 className="text-xl font-black text-white italic uppercase tracking-wider mb-6">
            Average Daily Macros
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Calories
              </p>
              <p className="text-2xl font-black text-orange-500">
                {stats.averageCalories}
              </p>
            </div>
            <div className="text-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Protein
              </p>
              <p className="text-2xl font-black text-blue-500">
                {stats.averageProtein}g
              </p>
            </div>
            <div className="text-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Carbs
              </p>
              <p className="text-2xl font-black text-lime-500">
                {stats.averageCarbs}g
              </p>
            </div>
            <div className="text-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Fats
              </p>
              <p className="text-2xl font-black text-purple-500">
                {stats.averageFats}g
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        {dailyLogs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calories Chart */}
            <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-black text-white italic uppercase tracking-wider mb-6">
                Calorie Trend (30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="date"
                    style={{ fontSize: "10px", fontWeight: "bold" }}
                    stroke="#525252"
                    tick={{ fill: "#737373" }}
                  />
                  <YAxis
                    style={{ fontSize: "10px", fontWeight: "bold" }}
                    stroke="#525252"
                    tick={{ fill: "#737373" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#262626",
                      color: "#fff",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: "#f97316", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macros Chart */}
            <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800">
              <h3 className="text-lg font-black text-white italic uppercase tracking-wider mb-6">
                Macros Dist. (30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="date"
                    style={{ fontSize: "10px", fontWeight: "bold" }}
                    stroke="#525252"
                    tick={{ fill: "#737373" }}
                  />
                  <YAxis
                    style={{ fontSize: "10px", fontWeight: "bold" }}
                    stroke="#525252"
                    tick={{ fill: "#737373" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#262626",
                      color: "#fff",
                      borderRadius: "0.75rem",
                    }}
                    cursor={{ fill: "#262626", opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="protein" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" fill="#84cc16" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fats" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Daily Logs */}
        <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800">
          <h3 className="text-xl font-black text-white italic uppercase tracking-wider mb-8">
            Daily Logs History
          </h3>

          {dailyLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-neutral-700">
                📝
              </div>
              <p className="text-neutral-500 text-lg font-bold">No logs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyLogs.map((log) => (
                <div
                  key={log._id}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 hover:border-lime-500/30 transition-all cursor-pointer group"
                  onClick={() =>
                    setSelectedLog(selectedLog?._id === log._id ? null : log)
                  }
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <p className="font-bold text-lg text-white group-hover:text-lime-500 transition-colors">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
                        {log.meals.length} meals logged
                      </p>
                    </div>
                    <div className="flex gap-4 md:gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          Cals
                        </p>
                        <p className="text-lg font-black text-orange-500">
                          {log.totalMacros?.calories || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          Pro
                        </p>
                        <p className="text-lg font-black text-blue-500">
                          {log.totalMacros?.protein || 0}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          Carbs
                        </p>
                        <p className="text-lg font-black text-lime-500">
                          {log.totalMacros?.carbs || 0}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          Fats
                        </p>
                        <p className="text-lg font-black text-purple-500">
                          {log.totalMacros?.fats || 0}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Meal Details */}
                  {selectedLog?._id === log._id && (
                    <div className="mt-6 pt-6 border-t border-neutral-800 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-neutral-400 mb-4 text-xs uppercase tracking-widest">
                        Meals Breakdown:
                      </h4>
                      <div className="space-y-3">
                        {log.meals.map((mealEntry, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-neutral-900 p-4 rounded-xl border border-neutral-800"
                          >
                            <div>
                              <p className="font-bold text-white text-sm">
                                {mealEntry.mealName || mealEntry.meal?.name}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1 font-medium">
                                {mealEntry.mealType.charAt(0).toUpperCase() +
                                  mealEntry.mealType.slice(1)}{" "}
                                • Quantity: {mealEntry.quantity}
                              </p>
                            </div>
                            <div className="flex gap-4 text-xs font-bold">
                              <span className="text-orange-500">
                                {mealEntry.macros?.calories || 0} cal
                              </span>
                              <span className="text-blue-500">
                                {mealEntry.macros?.protein || 0}g P
                              </span>
                              <span className="text-lime-500">
                                {mealEntry.macros?.carbs || 0}g C
                              </span>
                              <span className="text-purple-500">
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
