/**
 * Client-side rules for the two auth forms.
 *
 * These mirror lib/validation.js so a typo is caught before a round-trip —
 * the API stays the authority. Errors are keyed by field id so a page can
 * render one message directly under the input it belongs to.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  const e = email.trim();

  if (!e) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(e)) errors.email = "That email address doesn’t look right.";

  if (!password) errors.password = "Enter your password.";

  return errors;
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  const n = name.trim();
  const e = email.trim();

  if (!n) errors.name = "Enter your name.";
  else if (n.length < 2) errors.name = "Use at least 2 characters.";
  else if (n.length > 80) errors.name = "Keep your name under 80 characters.";

  if (!e) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(e)) errors.email = "That email address doesn’t look right.";

  if (!password) errors.password = "Choose a password.";
  else if (password.length < 6) errors.password = "Use at least 6 characters.";
  else if (password.length > 128) errors.password = "Keep your password under 128 characters.";

  if (!confirmPassword) errors.confirmPassword = "Repeat your password.";
  else if (confirmPassword !== password) errors.confirmPassword = "These passwords don’t match.";

  return errors;
}

/**
 * 0–4 signal for the signup meter. Advisory only: validity still rests on the
 * 6-character minimum the API enforces.
 */
export function passwordStrength(password) {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score += 1;

  return score;
}

export const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

/**
 * Accept only same-origin, app-internal paths as a post-login destination.
 * Rejects absolute URLs, protocol-relative paths, and the auth pages
 * themselves (which would bounce the user straight back to a form).
 */
export function readSafeNext(search) {
  const next = new URLSearchParams(search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "";
  if (next.startsWith("/login") || next.startsWith("/register")) return "";
  return next;
}
