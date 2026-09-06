"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <AppShell>

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
    </AppShell>
  );
}
