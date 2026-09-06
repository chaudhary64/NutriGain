"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ProfilePage() {
  const { user, loading: authLoading, logout, checkAuth } = useAuth();
  const { smoothScroll, toggleSmoothScroll } = useUserSettings();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goalForm, setGoalForm] = useState(null);
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState("");
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!authLoading && user) {
      gsap.fromTo(
        ".stagger-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
      
      gsap.fromTo(
        ".avatar-circle",
        { scale: 0.5, opacity: 0, rotation: -15 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.5)", delay: 0.2 }
      );
      
      gsap.fromTo(
        ".glow-effect",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut", delay: 0.5 }
      );
    }
  }, { scope: containerRef, dependencies: [user, authLoading] });

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
    return <Loader />;
  }

  if (!user || user.isAdmin) {
    return null;
  }

  const goals = user.macroGoals || { calories: 1900, protein: 120, carbs: 170, fats: 60 };

  const handleGoalChange = (field, value) => {
    setGoalForm((prev) => ({ ...(prev || goals), [field]: value }));
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    setGoalsMessage("");
    try {
      const current = goalForm || goals;
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ macroGoals: current }),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        setGoalForm(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setGoalsMessage(data.error || "Failed to save goals");
      }
    } catch (error) {
      console.error("Error saving macro goals:", error);
      setGoalsMessage("Network error. Please try again.");
    } finally {
      setSavingGoals(false);
    }
  };

  const handleToggleScroll = (val) => {
    toggleSmoothScroll(val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NG";

  return (
    <div ref={containerRef} className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500 selection:text-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lime-500/5 blur-[120px] glow-effect"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lime-500/5 blur-[100px] glow-effect"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push("/dashboard")}
            >
              <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.4)] group-hover:scale-105 transition-transform duration-300">
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
              <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
                Nutri<span className="text-lime-500">Gain</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex gap-1 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800/80 shadow-inner">
                <button
                  onClick={() => router.push("/dashboard/meal")}
                  className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wide"
                >
                  Meal
                </button>
                <button
                  onClick={() => router.push("/dashboard/gym")}
                  className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wide"
                >
                  Gym
                </button>
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="px-5 py-2.5 bg-lime-500 text-black rounded-lg shadow-[0_4px_14px_0_rgba(132,204,22,0.39)] hover:shadow-[0_6px_20px_rgba(132,204,22,0.23)] hover:bg-lime-400 font-bold text-sm flex items-center gap-2 transition-all uppercase tracking-wide"
                >
                  Profile
                </button>
              </div>

              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    Logged in as
                  </p>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
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

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-neutral-800 rounded-lg transition"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    User
                  </p>
                  <p className="text-lg font-bold text-white">{user.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { router.push("/dashboard/meal"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  Meal Tracker
                </button>
                <button
                  onClick={() => { router.push("/dashboard/gym"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  Gym Tracker
                </button>
                <button
                  onClick={() => { router.push("/dashboard/profile"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Profile <span className="text-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)] rounded-full">●</span>
                </button>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-800">
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 stagger-item">
          <p className="text-xs font-bold text-lime-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <span className="w-8 h-px bg-lime-500/50"></span>
            Account Management
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 pr-1">
              Profile
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <div className="md:col-span-1 stagger-item">
            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-md border border-neutral-800/80 hover:border-lime-500/40 transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(132,204,22,0.15)] rounded-[2rem] p-8 flex flex-col items-center gap-6 h-full group relative overflow-hidden">
              {/* Subtle background element */}
              <div className="absolute inset-0 bg-gradient-to-t from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* Avatar Circle */}
              <div className="relative avatar-circle mt-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-lime-400 via-lime-500 to-lime-600 flex items-center justify-center shadow-[0_0_40px_rgba(132,204,22,0.4)] ring-4 ring-lime-500/20 group-hover:ring-lime-500/50 transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                  <span className="text-5xl font-black text-neutral-950 tracking-tighter">
                    {initials}
                  </span>
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-lime-500 rounded-full border-4 border-neutral-900 flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.6)]">
                  <div className="w-2.5 h-2.5 bg-neutral-950 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="text-center z-10 mt-2">
                <p className="text-2xl font-black text-white tracking-tight group-hover:text-lime-400 transition-colors duration-300">
                  {user.name}
                </p>
                <p className="text-sm text-neutral-400 font-medium mt-1.5 break-all">
                  {user.email}
                </p>
              </div>

              <div className="w-full mt-auto pt-6 z-10">
                <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 group-hover:border-lime-500/30 transition-colors duration-300">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Role
                  </span>
                  <span className="text-xs font-black text-lime-500 uppercase tracking-widest bg-lime-500/10 px-4 py-1.5 rounded-full border border-lime-500/20 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.8)]"></span>
                    Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="md:col-span-2 space-y-8">
            {/* Preferences */}
            <div className="stagger-item bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-md border border-neutral-800/80 hover:border-lime-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(132,204,22,0.1)] rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="bg-gradient-to-br from-lime-500/20 to-lime-500/5 p-3.5 rounded-2xl border border-lime-500/30 text-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Preferences
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    Customize your experience
                  </p>
                </div>
              </div>

              {/* Smooth Scroll Toggle */}
              <div className="flex items-center justify-between p-6 bg-neutral-950/80 rounded-2xl border border-neutral-800 hover:border-lime-500/20 transition-all duration-300 relative z-10 shadow-inner group/toggle">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-neutral-900 group-hover/toggle:bg-neutral-800 rounded-xl flex items-center justify-center transition-colors border border-neutral-800 group-hover/toggle:border-neutral-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-6 h-6 transition-colors duration-300 ${smoothScroll ? 'text-lime-500' : 'text-neutral-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">
                      Smooth Scrolling
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {smoothScroll
                        ? "Lenis smooth scroll is active"
                        : "Native browser scrolling is active"}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  id="smooth-scroll-toggle"
                  onClick={() => handleToggleScroll(!smoothScroll)}
                  className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
                    smoothScroll
                      ? "bg-lime-500 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                      : "bg-neutral-800 border-neutral-700 hover:border-neutral-600"
                  }`}
                  role="switch"
                  aria-checked={smoothScroll}
                  aria-label="Toggle smooth scrolling"
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-500 ease-spring ${
                      smoothScroll ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Saved indicator */}
              <div
                className={`absolute bottom-8 right-8 flex items-center gap-2 text-xs font-black text-lime-500 uppercase tracking-widest transition-all duration-500 bg-lime-500/10 px-4 py-2 rounded-lg border border-lime-500/20 backdrop-blur-md ${
                  saved ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </div>
            </div>

            {/* Macro Goals */}
            <div className="stagger-item bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-md border border-neutral-800/80 hover:border-orange-500/20 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-3.5 rounded-2xl border border-orange-500/30 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Daily Goals
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    Your personal macro targets
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                {[
                  { field: "calories", label: "Calories", unit: "kcal", color: "text-orange-500" },
                  { field: "protein", label: "Protein", unit: "g", color: "text-blue-500" },
                  { field: "carbs", label: "Carbs", unit: "g", color: "text-lime-500" },
                  { field: "fats", label: "Fats", unit: "g", color: "text-purple-500" },
                ].map((item) => (
                  <div
                    key={item.field}
                    className="p-5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 focus-within:border-orange-500/50 transition-colors"
                  >
                    <label
                      htmlFor={`goal-${item.field}`}
                      className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 block"
                    >
                      {item.label} ({item.unit})
                    </label>
                    <input
                      id={`goal-${item.field}`}
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      value={(goalForm || goals)[item.field] ?? ""}
                      onChange={(e) => handleGoalChange(item.field, e.target.value)}
                      className={`w-full bg-transparent text-2xl font-black ${item.color} outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                  </div>
                ))}
              </div>

              {goalsMessage && (
                <p className="mt-4 text-sm font-bold text-red-500 relative z-10">{goalsMessage}</p>
              )}

              <div className="mt-6 flex items-center justify-between relative z-10">
                <p className="text-xs text-neutral-500">
                  {goalForm ? "Unsaved changes" : "These targets power the meters on your meal dashboard"}
                </p>
                <button
                  onClick={handleSaveGoals}
                  disabled={savingGoals}
                  className="px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 hover:border-orange-500/70 rounded-xl text-orange-500 font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingGoals ? "Saving..." : "Save Goals"}
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="stagger-item bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-md border border-neutral-800/80 hover:border-blue-500/20 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-3.5 rounded-2xl border border-blue-500/30 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Account Info
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    Your details
                  </p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {[
                  { label: "Name", value: user.name, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                  { label: "Email", value: user.email, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className="flex items-center p-5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 hover:border-neutral-700 transition-colors group/item"
                  >
                    <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-500 mr-5 group-hover/item:text-blue-400 group-hover/item:bg-blue-500/10 transition-colors border border-neutral-800 group-hover/item:border-blue-500/30">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                       </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">
                        {item.label}
                      </p>
                      <p className="text-base font-bold text-white group-hover/item:text-blue-50 transition-colors">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="stagger-item bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-md border border-red-900/20 hover:border-red-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 p-3.5 rounded-2xl border border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Session
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    Manage your session
                  </p>
                </div>
              </div>

              <button
                id="profile-logout-btn"
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/60 rounded-2xl text-red-500 font-black uppercase tracking-widest text-sm transition-all duration-300 relative overflow-hidden group/btn shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5 transition-transform duration-300 relative z-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                <span className="relative z-10">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
