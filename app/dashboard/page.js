"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="flex justify-between items-center py-3 lg:py-0 lg:h-16">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">🎯</div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NutriGain
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-gray-600 hover:text-gray-800 p-2"
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:flex-row items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/meal")}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                🍽️ Meal
              </button>

              <button
                onClick={() => router.push("/dashboard/gym")}
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition font-medium text-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                💪 Gym
              </button>

              <span className="text-gray-700 font-medium text-sm whitespace-nowrap">
                Welcome, {user.name}!
              </span>

              <button
                onClick={logout}
                className="bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md font-medium cursor-pointer text-sm whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden w-full bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-3">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Choose a category to track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Meal Tracking Box */}
          <div
            onClick={() => router.push("/dashboard/meal")}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 sm:hover:scale-105 border-2 border-transparent hover:border-blue-500 p-6 sm:p-8 lg:p-12"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 sm:mb-6">
                🍽️
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                Meal Tracking
              </h3>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                Track your daily meals and monitor your nutrition intake
              </p>
            </div>
          </div>

          {/* Gym Tracking Box */}
          <div
            onClick={() => router.push("/dashboard/gym")}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 sm:hover:scale-105 border-2 border-transparent hover:border-green-500 p-6 sm:p-8 lg:p-12"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 sm:mb-6">
                💪
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                Gym Tracking
              </h3>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                Log your workouts and track your fitness progress
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
