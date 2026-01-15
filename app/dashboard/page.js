"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

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

  if (authLoading) {
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">🎯</div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NutriGain
                </h1>
              </div>

              <button
                onClick={logout}
                className="sm:hidden bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md font-medium cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/meal")}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-1 cursor-pointer"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 text-lg">
            Choose a category to track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Meal Tracking Box */}
          <div
            onClick={() => router.push("/dashboard/meal")}
            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform border-2 border-transparent hover:border-blue-500 p-8 sm:p-12"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-7xl sm:text-8xl mb-6">🍽️</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Meal Tracking
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">
                Track your daily meals and monitor your nutrition intake
              </p>
            </div>
          </div>

          {/* Gym Tracking Box */}
          <div
            onClick={() => router.push("/dashboard/gym")}
            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform border-2 border-transparent hover:border-green-500 p-8 sm:p-12"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-7xl sm:text-8xl mb-6">💪</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Gym Tracking
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">
                Log your workouts and track your fitness progress
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
