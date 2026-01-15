"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function GymTrackingPage() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          <div className="text-8xl mb-6">🏋️‍♂️</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Gym Tracking Coming Soon!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            This feature is currently under development. Soon you'll be able to:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-800 mb-2">Log Workouts</h3>
              <p className="text-gray-600 text-sm">
                Track your exercises, sets, reps, and weight for each workout
                session
              </p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-gray-800 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Monitor your strength gains and workout consistency over time
              </p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-800 mb-2">Set Goals</h3>
              <p className="text-gray-600 text-sm">
                Create and achieve personal fitness goals for different
                exercises
              </p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-800 mb-2">View Analytics</h3>
              <p className="text-gray-600 text-sm">
                Get insights into your workout patterns and performance trends
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-md font-semibold cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
