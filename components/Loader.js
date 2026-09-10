"use client";

/**
 * Meridian loading state: light paper ground, single indigo spinner.
 * Replaces the legacy dark/lime loader so navigation no longer flashes
 * the old theme between the light shell and pages.
 *
 * Honors prefers-reduced-motion via the global rule in app/globals.css.
 */
export default function Loader({ text = "Loading" }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf9] text-[#1a1a1e]"
      role="status"
      aria-live="polite"
    >
      <div className="w-8 h-8 rounded-full border-[3px] border-[#e7e7e3] border-t-[#4f46e5] animate-spin" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6b76]">
        {text}
      </p>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
