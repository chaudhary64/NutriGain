"use client";

/**
 * Meridian loading state — theme-aware (light paper / dark charcoal).
 *
 * Styling lives in .m-loader tokens (app/globals.css) keyed off
 * <html data-theme>, which the no-flash script sets before first paint —
 * so even the pre-auth loading flash already matches the user's
 * preference with zero JS here.
 *
 * Honors prefers-reduced-motion via globals.css.
 */
export default function Loader({ text = "Loading" }) {
  return (
    <div className="m-loader min-h-screen flex flex-col items-center justify-center" role="status" aria-live="polite">
      <i aria-hidden="true" />
      <p>{text}</p>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
