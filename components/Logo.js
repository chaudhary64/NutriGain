/**
 * The NutriGain mark — the same artwork as the favicon set, so the browser
 * tab, the nav lockup and the landing illustrations show one logo.
 *
 * `size` is the rendered edge in CSS pixels. public/logo.png is 96px, which
 * keeps it crisp on 3x displays. The mark is decorative everywhere it is
 * used: the nav lockup carries the wordmark beside it, and the landing
 * illustration sits in an aria-hidden rail.
 */
export default function Logo({ size = 24, className = "" }) {
  return (
    <img
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      decoding="async"
    />
  );
}
