"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-lime-500 selection:text-black font-sans">
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
              <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
                Nutri<span className="text-lime-500">Gain</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-8">
              {user ? (
                <>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                      Logged in as
                    </p>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                  </div>
                  <div className="h-8 w-px bg-neutral-800"></div>
                  <Link
                    href="/dashboard"
                    className="text-sm font-bold uppercase tracking-wider text-lime-500 hover:text-lime-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-neutral-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-lime-500 text-black px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-lime-400 transition-colors shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
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
              {user ? (
                <>
                  <div className="pb-4 border-b border-neutral-800">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">
                      User
                    </p>
                    <p className="text-lg font-bold text-white">{user.name}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-3 rounded-xl bg-neutral-800 text-white font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-red-900/50 text-red-500 font-bold uppercase tracking-wider hover:bg-red-900/20 transition flex items-center justify-between"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-3 rounded-xl bg-neutral-800 text-white font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-3 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-wider hover:bg-lime-400 transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 pointer-events-none"></div>

      <div className="relative container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Area */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-lime-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)] transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <span className="text-4xl">🎯</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic">
            Nutri<span className="text-lime-500">Gain</span>
          </h1>

          <p className="text-2xl md:text-3xl text-neutral-300 mb-8 font-light tracking-wide">
            Track Your Macros.{" "}
            <span className="text-lime-500 font-bold">
              Dominate Your Goals.
            </span>
          </p>

          <p className="text-lg text-neutral-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Monitor your daily calorie intake, protein, carbs, and fats with
            ease. Select meals from our database and watch your macros update in
            real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-lime-500 rounded-xl font-bold text-black uppercase tracking-wider hover:bg-lime-400 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="group px-8 py-4 bg-transparent border border-neutral-700 rounded-xl font-bold text-white uppercase tracking-wider hover:border-lime-500 hover:text-lime-500 transition-all hover:scale-105"
            >
              Login
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-lime-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-6 bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">
                Track Macros
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Monitor calories, protein, carbs, and fats throughout your day
                with beautiful progress bars
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-lime-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-6 bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                🍽️
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">
                Meal Database
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Select from a comprehensive database of meals with accurate
                nutrition data
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-lime-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-6 bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">
                Real-time Updates
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                See your macro meters update instantly as you add or adjust
                meals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
