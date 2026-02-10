"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-neutral-950 text-white">
      {/* Left: Image Pane (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-neutral-900 border-r border-neutral-800">
        <div className="absolute inset-0 bg-lime-900/20 mix-blend-overlay z-10"></div>
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent z-20"></div>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Gym Training"
            className="w-full h-full object-cover object-center opacity-80 filter grayscale contrast-125"
          />
        </div>
        <div className="absolute bottom-16 left-12 z-30 max-w-lg">
          <blockquote className="text-5xl font-black text-white leading-[0.9] italic tracking-tighter mb-6">
            "THE ONLY BAD WORKOUT IS THE ONE THAT DIDN'T HAPPEN."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-lime-500"></div>
            <p className="text-lime-400 font-bold uppercase tracking-widest text-sm">
              NutriGain
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-10 relative z-10">
          {/* Header */}
          <div>
            <div className="h-12 w-12 bg-lime-500 rounded-xl mb-6 shadow-[0_0_15px_rgba(132,204,22,0.4)] flex items-center justify-center transform -rotate-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="black"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
              Member <span className="text-lime-500">Login</span>
            </h2>
            <p className="text-neutral-500 font-medium">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-lime-500 focus:border-lime-500 text-white placeholder-neutral-600 transition outline-none font-medium"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-lime-500 hover:text-lime-400 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-lime-500 focus:border-lime-500 text-white placeholder-neutral-600 transition outline-none font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 font-medium">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-white hover:text-lime-500 transition-colors font-bold"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
