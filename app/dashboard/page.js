"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.isAdmin) {
      router.push("/admin"); // Redirect admin users
    }
  }, [user, router]);

  if (authLoading) {
    return <Loader />;
  }

  if (!user || user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="black"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                Nutri<span className="text-lime-500">Gain</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                  Logged in as
                </p>
                <p className="text-sm font-bold text-white">{user.name}</p>
              </div>
              <div className="h-8 w-px bg-neutral-800"></div>
              <button
                onClick={logout}
                className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200"
              >
                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors">
                  Logout
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 group-hover:text-red-500 transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 hover:bg-neutral-800 rounded-lg transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-b border-neutral-800">
            <div className="px-4 py-6 space-y-4">
              <div className="pb-4 border-b border-neutral-800">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">
                  User
                </p>
                <p className="text-lg font-bold text-white">{user.name}</p>
              </div>
              <button
                onClick={() => {
                  router.push("/dashboard/meal");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-neutral-800 text-white font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
              >
                Meal Tracker
              </button>
              <button
                onClick={() => {
                  router.push("/dashboard/gym");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-neutral-800 text-white font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
              >
                Gym Tracker
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl border border-red-900/50 text-red-500 font-bold uppercase tracking-wider hover:bg-red-900/20 transition flex items-center justify-between"
              >
                Logout
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
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
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-lime-500 uppercase tracking-[0.2em] mb-4">
            Dashboard
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">
            CHOOSE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-lime-400 to-lime-600 pr-2">
              GRIND
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Meal Tracking Card */}
          <div
            onClick={() => router.push("/dashboard/meal")}
            className="group relative h-96 w-full rounded-2xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-lime-500/50 transition-all duration-500 ease-out"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
                alt="Meal Planning"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="h-1 bg-lime-500 mb-6 w-0 group-hover:w-16 transition-all duration-500 delay-100"></div>
              <div className="flex items-end justify-between">
                <div>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Nutrition Log
                  </h4>
                  <p className="text-neutral-400 font-medium group-hover:text-white transition-colors delay-100 max-w-xs">
                    Track macros, calories, and daily meals to fuel your body
                    perfectly.
                  </p>
                </div>
                <div className="bg-lime-500 p-3 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="black"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Gym Tracking Card */}
          <div
            onClick={() => router.push("/dashboard/gym")}
            className="group relative h-96 w-full rounded-2xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-lime-500/50 transition-all duration-500 ease-out"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
                alt="Gym Workout"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="h-1 bg-lime-500 mb-6 w-0 group-hover:w-16 transition-all duration-500 delay-100"></div>
              <div className="flex items-end justify-between">
                <div>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Workout Log
                  </h4>
                  <p className="text-neutral-400 font-medium group-hover:text-white transition-colors delay-100 max-w-xs">
                    Record exercises, sets, reps, and track your strength
                    progress.
                  </p>
                </div>
                <div className="bg-lime-500 p-3 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="black"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
