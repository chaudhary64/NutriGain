"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Whisper footer — reusable across marketing pages.
 *
 * Three-part grid under a hairline: brand lockup + tagline, a MENU column
 * (anchor links when on the landing page, auth/dashboard links otherwise),
 * and a baseline row with copyright and colophon. Theme-aware via the
 * --shell-* tokens; aligns to the shared .ng-container.
 */
export default function AppFooter({ links }) {
  const { user } = useAuth();

  // Default menu: section anchors for the landing page, with a signed-in
  // shortcut. Pages can pass their own [{label, href}] to override.
  const menu =
    links ||
    (user
      ? [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Meal tracker", href: "/dashboard/meal" },
          { label: "Gym tracker", href: "/dashboard/gym" },
        ]
      : [
          { label: "Features", href: "/#features" },
          { label: "Gym tracking", href: "/#gym" },
          { label: "Nutrition", href: "/#nutrition" },
          { label: "Login", href: "/login" },
          { label: "Get started", href: "/register", accent: true },
        ]);

  return (
    <footer className="relative z-10 border-t" style={{ borderColor: "var(--shell-line)" }}>
      <div className="ng-container pt-14 pb-10">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:gap-20">
          {/* Brand + tagline */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold leading-none select-none"
                style={{ background: "var(--shell-ink)", color: "var(--shell-bg)" }}
              >
                N.
              </span>
              <span className="text-[13px] font-extrabold uppercase tracking-[0.24em] leading-none">
                NUTRIGAIN<span style={{ color: "var(--shell-accent)" }}>.</span>
              </span>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--shell-ink-2)" }}>
              A quiet, precise tracker for athletes — macros, meals, PRs, and consistency
              in one hairline-clean ledger.
            </p>
          </div>

          {/* Menu */}
          <nav aria-label="Footer" className="md:text-right">
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.18em] mb-5"
              style={{ color: "var(--shell-muted)" }}
            >
              Menu
            </p>
            <ul className="space-y-3">
              {menu.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      item.accent ? "" : ""
                    }`}
                    style={{ color: item.accent ? "var(--shell-accent)" : "var(--shell-ink-2)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Baseline */}
        <div
          className="mt-14 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "var(--shell-line)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--shell-muted)" }}>
            © {new Date().getFullYear()} NutriGain
          </p>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em]" style={{ color: "var(--shell-muted)" }}>
            Built for athletes<span style={{ color: "var(--shell-accent)" }}>.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
