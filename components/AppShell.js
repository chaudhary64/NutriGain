"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

/**
 * Shared application shell: top navigation + content container.
 *
 * Restyled in the Whisper design system: a slim 56px hairline bar — ink "N."
 * monogram, wide-tracked NUTRIGAIN. wordmark (W2 lockup), uppercase tabs with
 * a hairline accent underline, quiet right rail. Theme-aware via the
 * --shell-* tokens in globals.css.
 *
 * Variants:
 *  - "dashboard" — full nav with Meal/Gym/Profile tab switcher
 *  - "admin"     — compact nav with the MASTER CONTROL TERMINAL tag and logout
 *  - "marketing" — public pages (home): same bar, auth actions instead of tabs
 *
 * Slots let pages inject their own controls into the nav:
 *  - navSlot    — rendered in the desktop bar, right of the tabs
 *  - mobileSlot — rendered inside the mobile dropdown above the links
 *
 * The shell owns mobile-menu state so pages don't have to.
 */
export default function AppShell({ variant = "dashboard", navSlot, mobileSlot, children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = variant === "admin";
  const isMarketing = variant === "marketing";

  // Lock body scroll and close on Escape while the full-screen menu is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  const navigate = (href) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const dashboardTabs = [
    { label: "Meal", href: "/dashboard/meal" },
    { label: "Gym", href: "/dashboard/gym" },
    { label: "Stats", href: "/dashboard/stats" },
    { label: "Profile", href: "/dashboard/profile" },
  ];

  const initials =
    (user?.name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "·";

  const logoutIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-[18px] h-[18px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      />
    </svg>
  );

  // Theme toggle — hairline ghost button, matches the logout weight.
  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg transition-colors cursor-pointer text-[var(--shell-muted)] hover:text-[var(--shell-ink)] hover:bg-[var(--shell-sunken)]"
      role="switch"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-checked={theme === "dark"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );

  // Role-aware home: marketing → landing, dashboard → hub, admin → console.
  const homeHref = isAdmin ? "/admin" : isMarketing ? "/" : "/dashboard";

  // W2 lockup — ink monogram + wide-tracked NUTRIGAIN. wordmark.
  // The brand links to the variant's home so it's always a way back.
  const brand = (
    <Link
      href={homeHref}
      className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
      aria-label={isAdmin ? "NutriGain admin home" : isMarketing ? "NutriGain home" : "NutriGain dashboard home"}
    >
      <span
        aria-hidden="true"
        className="w-6 h-6 rounded-md bg-[var(--shell-ink)] text-[var(--shell-on-ink)] flex items-center justify-center text-[11px] font-extrabold leading-none select-none flex-none"
      >
        N.
      </span>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.24em] leading-none whitespace-nowrap text-[var(--shell-ink)]">
        NUTRIGAIN<span className="text-[var(--shell-accent)]">.</span>
      </span>
      {isAdmin && (
        <span className="hidden sm:inline-flex items-center font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-accent)] bg-[var(--shell-accent-soft)] border border-[var(--shell-line)] rounded px-1.5 py-[3px] whitespace-nowrap">
          Master Control Terminal
        </span>
      )}
    </Link>
  );

  // Desktop tabs — uppercase micro-links with a hairline accent underline.
  const tabs = (
    <nav className="hidden md:flex h-full items-center gap-6" aria-label="Primary">
      {dashboardTabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => navigate(tab.href)}
            aria-current={active ? "page" : undefined}
            className={`h-full flex items-center px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] border-b-[1.5px] -mb-px transition-colors cursor-pointer ${
              active
                ? "border-[var(--shell-accent)] text-[var(--shell-ink)]"
                : "border-transparent text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );

  // Escape hatch from the admin console — admins are users too, and the
  // console previously offered no way back to the tracking side.
  const myDashboardLink = isAdmin ? (
    <Link
      href="/dashboard"
      className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--shell-ink)] hover:text-[var(--shell-accent)] transition-colors"
    >
      My dashboard
    </Link>
  ) : null;

  // Right rail — page controls, theme, user, logout.
  const rightRail = (
    <div className="flex items-center gap-2.5">
      {navSlot && <div className="hidden md:flex items-center gap-3 min-w-0">{navSlot}</div>}
      {myDashboardLink}
      {themeToggle}
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="w-7 h-7 rounded-lg bg-[var(--shell-sunken)] border border-[var(--shell-line)] text-[var(--shell-ink)] flex items-center justify-center text-[10px] font-extrabold flex-none"
        >
          {initials}
        </span>
        <div className="hidden sm:block leading-tight">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-[var(--shell-muted)]">
            {isAdmin ? "Admin" : "Signed in"}
          </p>
          <p className="text-[12px] font-bold text-[var(--shell-ink)] max-w-[140px] truncate">{user?.name}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="p-1.5 rounded-lg transition-colors cursor-pointer text-[var(--shell-muted)] hover:text-[var(--shell-danger)] hover:bg-[var(--shell-danger-soft)]"
        aria-label="Log out"
        title="Log out"
      >
        {logoutIcon}
      </button>
    </div>
  );

  // Shared mobile bar — brand + theme + hamburger. One definition so all
  // three variants (marketing, dashboard, admin) can't drift apart again.
  const mobileBar = (
    <div className="md:hidden flex items-center justify-between h-14">
      {brand}
      <div className="flex items-center gap-1.5">
        {themeToggle}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[var(--shell-ink)] hover:bg-[var(--shell-sunken)] rounded-lg transition cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-shell min-h-screen bg-[var(--shell-bg)] text-[var(--shell-ink)] font-sans selection:bg-[var(--shell-accent)] selection:text-[var(--shell-on-accent)]">
      <nav
        className={`${isAdmin ? "sticky" : "fixed top-0 w-full"} top-0 z-50 bg-[var(--shell-chrome)] backdrop-blur-md border-b border-[var(--shell-line)]`}
      >
        <div className="ng-container">
          {isAdmin ? (
            <>
              {/* Admin desktop — the console rail now shares the standard
                  right rail, adding identity and the 'My dashboard' escape. */}
              <div className="hidden md:flex justify-between items-center h-14">
                {brand}
                {rightRail}
              </div>
              {/* Admin mobile — previously missing entirely; now the shared
                  bar, which finally makes the mobile menu reachable. */}
              {mobileBar}
            </>
          ) : isMarketing ? (
            <>
              {/* Marketing desktop — brand left, auth actions right */}
              <div className="hidden md:flex h-14 items-center justify-between">
                {brand}
                <div className="flex items-center gap-5">
                  {themeToggle}
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className="w-7 h-7 rounded-lg bg-[var(--shell-sunken)] border border-[var(--shell-line)] text-[var(--shell-ink)] flex items-center justify-center text-[10px] font-extrabold flex-none"
                        >
                          {initials}
                        </span>
                        <span className="text-[12px] font-bold text-[var(--shell-ink)] max-w-[140px] truncate">{user.name}</span>
                      </div>
                      <span aria-hidden="true" className="h-4 w-px bg-[var(--shell-line)]" />
                      <Link
                        href="/dashboard"
                        className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--shell-ink)] hover:text-[var(--shell-accent)] transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer text-[var(--shell-muted)] hover:text-[var(--shell-danger)] hover:bg-[var(--shell-danger-soft)]"
                        aria-label="Log out"
                        title="Log out"
                      >
                        {logoutIcon}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--shell-muted)] hover:text-[var(--shell-ink)] transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--shell-on-accent)] bg-[var(--shell-accent)] hover:opacity-90 transition-opacity rounded-lg px-4 py-2"
                      >
                        Get started
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Marketing mobile — shared bar (brand + theme + hamburger) */}
              {mobileBar}
            </>
          ) : (
            <>
              {/* Desktop — brand left / centered tabs / right rail */}
              <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-14 gap-3">
                <div className="flex h-full items-center">{brand}</div>
                <div className="flex justify-center h-full">{tabs}</div>
                <div className="flex justify-end h-full items-center">{rightRail}</div>
              </div>
              {/* Dashboard mobile — shared bar (brand + theme + hamburger) */}
              {mobileBar}
            </>
          )}
        </div>

      </nav>

      {/* Mobile full-screen menu — rendered outside <nav> so the bar's
          backdrop-filter can't become its containing block and clip it. */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-[60] bg-[var(--shell-bg)] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Index header — mirrors the top bar so chrome doesn't jump.
              Theme toggle lives here too: the overlay hides the bar's rail. */}
          <div className="ng-container h-14 flex items-center justify-between border-b border-[var(--shell-line)] bg-[var(--shell-chrome)] backdrop-blur-md flex-none">
            {brand}
            <div className="flex items-center gap-1.5">
              {themeToggle}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[var(--shell-ink)] hover:bg-[var(--shell-sunken)] rounded-lg transition cursor-pointer"
                aria-label="Close menu"
              >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          </div>

          {/* Rows */}
          <nav className="flex-1 flex flex-col justify-center px-7 overflow-y-auto" aria-label="Mobile">
            {mobileSlot && <div className="mb-8 pb-2">{mobileSlot}</div>}

            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--shell-muted)] mb-4">
              {isAdmin ? "Master control" : isMarketing ? "Menu" : "Index"}
            </p>

            {isMarketing &&
              (user
                ? [
                    { label: "Dashboard", href: "/dashboard", action: null },
                    { label: "Log out", action: logout },
                  ]
                : [
                    { label: "Login", href: "/login", action: null },
                    { label: "Get started", href: "/register", action: null, accent: true },
                  ]
              ).map((row, i) => (
                <button
                  key={row.label}
                  onClick={() => (row.action ? (row.action(), setMobileMenuOpen(false)) : navigate(row.href))}
                  style={{ animationDelay: `${80 + i * 70}ms` }}
                  className="wg-row-in group w-full text-left flex items-baseline gap-3 py-4 border-b border-[var(--shell-line)] cursor-pointer text-[var(--shell-ink)]"
                >
                  <span
                    aria-hidden="true"
                    className={`text-[10px] font-bold tracking-[0.08em] pt-1 ${row.accent ? "text-[var(--shell-accent)]" : "text-[var(--shell-muted)]"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[26px] font-extrabold uppercase tracking-[0.1em] leading-none">{row.label}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-auto self-center text-[var(--shell-muted)] ${row.accent ? "text-[var(--shell-accent)]" : ""}`}
                  >
                    →
                  </span>
                </button>
              ))}

            {!isMarketing && !isAdmin &&
              dashboardTabs.map((tab, i) => {
                const active = pathname === tab.href;
                return (
                  <button
                    key={tab.href}
                    onClick={() => navigate(tab.href)}
                    aria-current={active ? "page" : undefined}
                    style={{ animationDelay: `${80 + i * 70}ms` }}
                    className={`wg-row-in group w-full text-left flex items-baseline gap-3 py-4 border-b border-[var(--shell-line)] cursor-pointer transition-colors ${
                      active ? "text-[var(--shell-ink)]" : "text-[var(--shell-muted)] active:text-[var(--shell-ink)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`text-[10px] font-bold tracking-[0.08em] pt-1 ${
                        active ? "text-[var(--shell-accent)]" : "text-[var(--shell-muted)]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[26px] font-extrabold uppercase tracking-[0.1em] leading-none">
                      {tab.label}
                    </span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="ml-auto w-6 h-[2px] bg-[var(--shell-accent)] self-center"
                      />
                    )}
                  </button>
                );
              })}

            {isAdmin &&
              [
                { label: "Admin", href: "/admin" },
                { label: "My dashboard", href: "/dashboard" },
              ].map((row, i) => {
                const active = pathname === row.href;
                return (
                  <button
                    key={row.href}
                    onClick={() => navigate(row.href)}
                    aria-current={active ? "page" : undefined}
                    style={{ animationDelay: `${80 + i * 70}ms` }}
                    className={`wg-row-in group w-full text-left flex items-baseline gap-3 py-4 border-b border-[var(--shell-line)] cursor-pointer transition-colors ${
                      active ? "text-[var(--shell-ink)]" : "text-[var(--shell-muted)] active:text-[var(--shell-ink)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`text-[10px] font-bold tracking-[0.08em] pt-1 ${
                        active ? "text-[var(--shell-accent)]" : "text-[var(--shell-muted)]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[26px] font-extrabold uppercase tracking-[0.1em] leading-none">{row.label}</span>
                    {active && (
                      <span aria-hidden="true" className="ml-auto w-6 h-[2px] bg-[var(--shell-accent)] self-center" />
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Foot */}
          <div className="flex-none px-7 pb-10 pt-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              {isAdmin ? "Admin" : user ? "Signed in" : "NutriGain"}
            </p>
            <p className="text-[15px] font-bold text-[var(--shell-ink)] truncate mt-0.5">
              {user?.name || "Track macros. Dominate goals."}
            </p>
          </div>
        </div>
      )}

      <div className={isAdmin ? "" : "pt-14"}>{children}</div>
    </div>
  );
}
