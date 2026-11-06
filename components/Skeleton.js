/**
 * Skeleton primitives — page-shaped placeholders for content whose layout is
 * already known.
 *
 * SkFrame draws the content column only — AppShell belongs to
 * app/dashboard/layout.js, which sits above every route and its loading
 * boundary, so the sidebar is never unmounted by a handoff. That column sits
 * outside every Meridian page scope
 * (.mrd/.gym/.st) — that scope is applied by the page itself, which is the
 * thing still loading — so --line/--card/--sunken are undefined there. The
 * bars take their colour from the --sk-* set in globals.css, derived from
 * html[data-theme] the same way .m-loader derives --ld-*.
 *
 * A skeleton is a purely visual signal, so the loading state is announced
 * once on the frame — aria-busy on the region plus a polite status message.
 * The bars themselves stay out of the accessibility tree.
 */

/** One bar. Widths are CSS lengths so a caller can pass a number or a string. */
export function Sk({ w = "100%", h = 12, r = 4, className = "" }) {
  return (
    <span
      className={"m-sk" + (className ? ` ${className}` : "")}
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

/**
 * A paragraph of placeholder lines. The last one is short so the block reads
 * as text rather than as a filled rectangle.
 */
export function SkText({ lines = 2, h = 11, last = "64%", gap = 8 }) {
  return (
    <span className="m-sk-text" style={{ gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Sk key={i} w={i === lines - 1 && lines > 1 ? last : "100%"} h={h} />
      ))}
    </span>
  );
}

/**
 * A placeholder for one region inside a page that is already on screen.
 *
 * Unlike SkFrame it brings no background or offset of its own — it sits in
 * the page's own container, where the Meridian tokens do resolve, so the
 * .m-sk-region rule in globals.css maps --sk-* straight onto them.
 */
export function SkRegion({ label = "Loading", children }) {
  return (
    <>
      {/* The status message is a SIBLING of the busy region, not a child.
          aria-busy defers announcements inside the subtree it marks, and this
          frame unmounts rather than ever setting busy back to false — so a
          label nested inside it could be withheld for the whole wait. */}
      <span className="sr-only" role="status" aria-live="polite">
        {label}
      </span>
      <div className="m-sk-region" aria-busy="true">
        {children}
      </div>
    </>
  );
}

/**
 * The page frame.
 *
 * It renders no shell of its own: the layout above it owns AppShell, so the
 * content column is already offset by .sb-main and the mobile bar by
 * .sb-mwrap. Wrapping again here would nest a second sidebar inside the
 * first.
 */
export function SkFrame({ label = "Loading", children }) {
  return (
    <>
      {/* Outside the busy region for the same reason as SkRegion: a live
          region marked busy suppresses its own announcements, and nothing
          here ever clears the flag before unmounting. */}
      <span className="sr-only" role="status" aria-live="polite">
        {label}
      </span>
      <div className="m-sk-page" aria-busy="true">
        {children}
      </div>
    </>
  );
}
