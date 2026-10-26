"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import NavIcon from "@/components/NavIcon";
import Logo from "@/components/Logo";
import MarketingLinks from "@/components/MarketingLinks";

/**
 * Shared application shell.
 *
 * Two chromes, one source of truth:
 *
 *  - "dashboard" / "admin" — a fixed left sidebar: brand at the top, a page
 *    filter, the vertical nav, and identity + appearance + logout pinned to
 *    the foot. The content column scrolls beside it. Below 1024px the
 *    sidebar collapses into a sticky top bar plus a full-screen menu, so no
 *    destination is lost on small screens.
 *  - "marketing" — public pages keep the slim fixed top bar; framing the
 *    landing page in app chrome would make it read as a signed-in surface.
 *    Its links, the marker for the section being read, and the narrow-screen
 *    disclosure live in MarketingLinks.
 *
 * The sidebar is a real <aside> landmark and its rows carry aria-current,
 * so keyboard and screen-reader users get the same map as sighted ones.
 * Theme-aware via the --shell-* tokens in globals.css.
 *
 * Slots let pages inject their own controls into the chrome:
 *  - navSlot    — rendered in a hairline context strip above the content
 *  - mobileSlot — rendered at the top of the mobile menu
 */
export default function AppShell({ variant = "dashboard", navSlot, mobileSlot, children }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
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

  // One nav model feeds both the sidebar and the mobile menu.
  const navItems = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Console", href: "/admin", icon: "console", strict: true },
        { label: "My dashboard", href: "/dashboard", icon: "feed", strict: true },
      ];
    }
    const items = [
      { label: "Today", href: "/dashboard", icon: "feed", strict: true },
      { label: "Meal", href: "/dashboard/meal", icon: "meal" },
      { label: "Gym", href: "/dashboard/gym", icon: "gym" },
      { label: "Progress", href: "/dashboard/stats", icon: "progress" },
      { label: "Account", href: "/dashboard/account", icon: "profile" },
    ];
    // Admins are users too — the console is one extra row, never a second app.
    if (user?.isAdmin) items.push({ label: "Console", href: "/admin", icon: "console" });
    return items;
  }, [isAdmin, user?.isAdmin]);

  const isActive = (item) =>
    item.strict ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  const initials =
    (user?.name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "·";

  const homeHref = isAdmin ? "/admin" : isMarketing ? "/" : "/dashboard";

  // The app mark beside the wide-tracked NUTRIGAIN. wordmark.
  const brand = (
    <Link
      href={homeHref}
      className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
    >
      <Logo size={24} className="shrink-0" />
      <span className="mk-word text-[13px] font-semibold uppercase tracking-[0.22em] leading-none whitespace-nowrap text-[var(--shell-ink)]">
        NUTRIGAIN<span className="text-[var(--shell-accent)]">.</span>
      </span>
      {isAdmin && (
        <span className="hidden lg:inline-flex items-center font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--shell-muted)] bg-[var(--shell-sunken)] border border-[var(--shell-line)] rounded-[4px] px-1.5 py-[2px] whitespace-nowrap">
          Admin
        </span>
      )}
    </Link>
  );

  /* Both glyphs are drawn so the icon can morph between them rather than snap.
     The visible one is the action, not the state: a sun in dark mode, a moon in
     light mode — the page already tells you which mode you are in.

     A button whose name is the action it performs, not a switch: APG requires a
     switch's label to stay the same as its state flips, and this one is named
     for what pressing it will do. `labelled` adds the same word the glyph
     carries, for the marketing bar's wide layout. */
  const themeToggle = ({ labelled = false, className = "sb-icon" } = {}) => (
    <button
      type="button"
      onClick={toggleTheme}
      className={className}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      <span className={"sb-theme-glyph" + (theme === "light" ? " is-moon" : "")} aria-hidden="true">
        <NavIcon name="sun" className="sb-theme-sun" />
        <NavIcon name="moon" className="sb-theme-moon" />
      </span>
      {/* The name already carries this word, so the span stays out of the
          accessibility tree and the control is not announced twice. */}
      {labelled && (
        <span className="mk-theme-label" aria-hidden="true">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );

  const logoutButton = (
    <button onClick={logout} className="sb-icon sb-icon-danger" aria-label="Log out" title="Log out">
      <NavIcon name="logout" />
    </button>
  );

  // Nav rows — icon + label, accent-tinted when current.
  const navList = (items, onPick) => (
    <ul className="sb-list">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onPick}
              className={"sb-row" + (active ? " on" : "")}
            >
              <span className="sb-ico" aria-hidden="true">
                <NavIcon name={item.icon} />
              </span>
              <span className="sb-lbl">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // ------------------------------------------------------------------
  // Sidebar — dashboard + admin chrome
  // ------------------------------------------------------------------
  const sidebar = (
    <aside className="sb" aria-label="Primary">
      <div className="sb-head">{brand}</div>

      <nav className="sb-nav" aria-label="Sections">
        {navList(navItems)}
      </nav>

      {/* Foot — one identity row: who you are, then the controls. The theme
          toggle sits with the way out rather than on a labelled row of its
          own — its switch role, label and title carry the meaning. */}
      <div className="sb-foot">
        <div className="sb-user">
          <span className="sb-ava" aria-hidden="true">{initials}</span>
          <span className="sb-user-txt">
            <b>{user?.name || "Guest"}</b>
            <i>{isAdmin ? "Admin" : "Signed in"}</i>
          </span>
          <div className="sb-acts">
            {themeToggle()}
            {logoutButton}
          </div>
        </div>
      </div>
    </aside>
  );

  // ------------------------------------------------------------------
  // Mobile chrome — sticky top bar + full-screen menu
  // ------------------------------------------------------------------
  const mobileBar = (
    <div className="sb-mbar">
      {brand}
      <div className="flex items-center gap-1">
        {themeToggle()}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sb-icon"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <NavIcon name={mobileMenuOpen ? "close" : "menu"} />
        </button>
      </div>
    </div>
  );

  const marketingBar = (
    <nav className="mk-bar" aria-label="Primary">
      <div className="ng-container mk-bar-inner">
        {brand}
        <div className="mk-actions">
          {/* In-page signposts — the landing page is one long argument, so its
              sections are the only navigation it needs. MarketingLinks owns
              them: the marker for the section being read, and the menu that
              keeps them reachable below 940px. The menu also carries the
              account end and the appearance control, so the phone bar is the
              mark and one button instead of three small targets. */}
          {!isAdmin && (
            <MarketingLinks
              brand={brand}
              renderMenu={() => (
                <>
                  {user ? (
                    <div className="mk-menu-acct">
                      <div className="mk-menu-id">
                        <span className="mk-menu-ava" aria-hidden="true">{initials}</span>
                        <span className="mk-menu-id-txt">
                          <b>{user.name}</b>
                          <i>{user.isAdmin ? "Admin" : "Signed in"}</i>
                        </span>
                      </div>
                      <Link href="/dashboard" className="mk-menu-row">
                        Dashboard
                      </Link>
                      {/* data-menu-close: the sheet closes itself on anything
                          that leaves the page, including this. */}
                      <button
                        type="button"
                        className="mk-menu-row"
                        data-menu-close
                        onClick={logout}
                      >
                        Log out
                        <NavIcon name="logout" />
                      </button>
                    </div>
                  ) : (
                    <div className="mk-menu-acct">
                      <Link href="/login" className="mk-menu-row">
                        Sign in
                      </Link>
                      <Link href="/register" className="mk-menu-row mk-menu-row-ink">
                        Get started free
                      </Link>
                    </div>
                  )}

                  {/* Two states, named. A menu has room for the words an icon
                      in the bar has to stand in for. */}
                  <div className="mk-menu-theme" role="group" aria-label="Appearance">
                    <span className="mk-menu-theme-lbl">Appearance</span>
                    <div className="mk-seg">
                      <button
                        type="button"
                        aria-pressed={theme === "light"}
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </button>
                      <button
                        type="button"
                        aria-pressed={theme === "dark"}
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </>
              )}
            />
          )}
        </div>

        {/* The account end: the way the page looks, who you are, and the way in
            or out — held off the map of the page by a rule, so the links never
            read as the first two items of one long list. */}
        <div className="mk-auth">
          {!isAdmin && <span className="mk-sep" aria-hidden="true" />}
          {themeToggle({ labelled: true, className: "mk-theme" })}
          {user ? (
            <>
              <Link href="/dashboard" className="mk-link mk-link-dash">
                Dashboard
              </Link>
              <span className="hidden sm:flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-md bg-[var(--shell-sunken)] border border-[var(--shell-line)] text-[var(--shell-ink)] flex items-center justify-center text-[10px] font-semibold" style={{ flex: "none" }}
                >
                  {initials}
                </span>
                <span className="text-[12px] font-medium text-[var(--shell-ink)] max-w-[140px] truncate">
                  {user.name}
                </span>
              </span>
              {logoutButton}
            </>
          ) : (
            <>
              <Link href="/login" className="mk-link mk-link-signin">
                Sign in
              </Link>
              <Link href="/register" className="mk-link mk-link-ink">
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (isMarketing) {
    return (
      <div className="app-shell min-h-screen bg-[var(--shell-bg)] text-[var(--shell-ink)] font-sans selection:bg-[var(--shell-accent)] selection:text-[var(--shell-on-accent)]">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {marketingBar}
        <div className="pt-16">{children}</div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[var(--shell-bg)] text-[var(--shell-ink)] font-sans selection:bg-[var(--shell-accent)]">
      {/* Desktop sidebar */}
      <div className="sb-wrap">{sidebar}</div>

      {/* Mobile bar */}
      <div className="sb-mwrap">{mobileBar}</div>

      {/* Content column — offset by the sidebar on desktop. */}
      <div className="sb-main">
        {navSlot && (
          <div className="sb-context">
            <div className="ng-container">{navSlot}</div>
          </div>
        )}
        {children}
      </div>

      {/* Full-screen mobile menu — outside the bar so backdrop-filter can't
          become its containing block and clip it. */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="sb-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="sb-menu-head ng-container">
            {brand}
            <div className="flex items-center gap-1">
              {themeToggle()}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="sb-icon"
                aria-label="Close menu"
              >
                <NavIcon name="close" />
              </button>
            </div>
          </div>

          <nav className="sb-menu-body ng-container" aria-label="Mobile">
            {mobileSlot && <div className="sb-menu-slot">{mobileSlot}</div>}
            {navList(navItems, () => setMobileMenuOpen(false))}
          </nav>

          <div className="sb-menu-foot ng-container">
            <span className="sb-ava" aria-hidden="true">{initials}</span>
            <span className="sb-user-txt">
              <b>{user?.name || "Guest"}</b>
              <i>{isAdmin ? "Admin" : "Signed in"}</i>
            </span>
            {logoutButton}
          </div>
        </div>
      )}
    </div>
  );
}
