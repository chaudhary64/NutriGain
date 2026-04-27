"use client";

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "Charging your power level…",
  "Entering training mode…",
  "Awakening your potential…",
  "Synchronizing your strength…",
  "Initiating transformation…",
  "Preparing your next battle…",
  "Calibrating your stats…",
  "Loading your training arc…",
  "Your journey is about to begin…",
  "Summoning your inner strength…",

  "Calculating your power stats…",
  "Tracking your strength progression…",
  "Optimizing your training arc…",
  "Analyzing your gains…",
  "Updating your skill tree…",

  "Syncing with your system…",
  "Initializing fitness protocol…",
  "Linking your performance data…",
  "Activating core systems…",

  "Logging your reps and sets…",
  "Scanning your physique stats…",
  "Measuring hypertrophy levels…",
  "Updating your PR records…",
  "Balancing your macros…",
  "Fueling your recovery system…",

  "Entering hypertrophy mode…",
  "Engaging beast mode…",
  "Unleashing full strength…",
  "Breaking your limits…",
  "Pushing beyond 100%…",

  "Analyzing muscle output…",
  "Stabilizing core strength…",
  "Enhancing endurance stats…",
  "Upgrading your physique…",
  "Refining your form…",

  "Preparing next set: maximum effort…",
  "Rest timer initiated…",
  "Cooldown phase engaged…",

  "Skill unlocked: Strength +1",
  "Skill unlocked: Endurance +1",
  "New achievement incoming…",
  "Updating training log…",
  "Sync complete. Stand by…"
];

export default function Loader({ text }) {
  const [message, setMessage] = useState("LOADING YOUR EXPERIENCE...");

  useEffect(() => {
    if (!text) {
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setMessage(LOADING_MESSAGES[randomIndex]);
    } else {
      setMessage(text);
    }
  }, [text]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 border border-lime-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="w-16 h-16 border-t-2 border-r-2 border-transparent border-t-lime-500 border-solid rounded-full animate-spin shadow-[0_0_15px_rgba(132,204,22,0.2)]"></div>
        <div className="absolute w-10 h-10 bg-lime-500/5 rounded-full animate-pulse backdrop-blur-sm"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 absolute text-lime-500 animate-pulse drop-shadow-[0_0_8px_rgba(132,204,22,0.8)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      </div>
      <div className="mt-8 text-[10px] font-black tracking-[0.4em] text-lime-500/70 uppercase animate-pulse">
        {message}
      </div>
    </div>
  );
}
