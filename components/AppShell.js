"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Shared application shell: top navigation + content container.
 *
 * Restyled in the Meridian design system: light paper chrome, ink wordmark,
 * indigo accent — matching app/dashboard/meal/page.js.
 *
 * Variants:
 *  - "dashboard" — full nav with Meal/Gym/Profile tab switcher
 *  - "admin"     — compact nav with an Admin label and logout
 *
 * Slots let pages inject their own controls into the nav:
 *  - navSlot    — rendered in the desktop bar, left of the tab switcher
 *  - mobileSlot — rendered inside the mobile dropdown above the links
 *
 * The shell owns mobile-menu state so pages don't have to.
 */
export default function AppShell({ variant = "dashboard", navSlot, mobileSlot, children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = variant === "admin";

  const navigate = (href) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const dashboardTabs = [
    { label: "Meal", href: "/dashboard/meal" },
    { label: "Gym", href: "/dashboard/gym" },
    { label: "Profile", href: "/dashboard/profile" },
  ];

  const logoutIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      />
    </svg>
  );

  return (
    <div className="app-shell min-h-screen bg-[#fafaf9] text-[#1a1a1e] font-sans selection:bg-[#4f46e5] selection:text-white">
      <nav
        className={`${isAdmin ? "sticky" : "fixed top-0 w-full"} top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e7e7e3]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="white"
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <div>
                <h1
                  className={`text-xl font-extrabold tracking-tight ${isAdmin ? "hidden sm:block" : ""}`}
                >
                  Nutri<span className="text-[#4f46e5]">Gain</span>
                </h1>
                {isAdmin && (
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] leading-none">
                    Master Control Terminal
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-5">
              {navSlot && <div className="flex items-center gap-4">{navSlot}</div>}

              {!isAdmin && (
                <>
                  <div className="h-6 w-px bg-[#e7e7e3]"></div>

                  <div className="flex gap-1 bg-[#f1f1ee] p-1 rounded-[10px]">
                    {dashboardTabs.map((tab) => (
                      <button
                        key={tab.href}
                        onClick={() => navigate(tab.href)}
                        aria-current={pathname === tab.href ? "page" : undefined}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold text-[13px] flex items-center gap-2 transition-all cursor-pointer ${
                          pathname === tab.href
                            ? "bg-[#4f46e5] text-white"
                            : "text-[#5f5f68] hover:text-[#1a1a1e] hover:bg-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                    {isAdmin ? "Admin" : "Signed in"}
                  </p>
                  <p className="text-[13px] font-semibold text-[#1a1a1e] leading-tight">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-500 hover:text-red-600 transition-colors cursor-pointer p-1.5 rounded-lg"
                  aria-label="Log out"
                  title="Log out"
                >
                  {logoutIcon}
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#1a1a1e] hover:bg-[#f1f1ee] rounded-lg transition cursor-pointer"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-b border-[#e7e7e3] bg-white">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                    Signed in
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1e]">{user?.name}</p>
                </div>
              </div>

              {mobileSlot}

              {!isAdmin && (
                <div className="space-y-2">
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.href}
                      onClick={() => navigate(tab.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold ${
                        pathname === tab.href
                          ? "bg-[#eef2ff] text-[#4f46e5]"
                          : "text-[#5f5f68] hover:bg-[#f1f1ee]"
                      }`}
                    >
                      {tab.label === "Meal"
                        ? "Meal Tracker"
                        : tab.label === "Gym"
                          ? "Gym Tracker"
                          : tab.label}
                      {pathname === tab.href && (
                        <span className="text-[#4f46e5]">●</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center justify-between px-4 py-3 text-[#5f5f68] hover:bg-[#f1f1ee] rounded-xl font-semibold"
                  >
                    Admin Panel
                  </button>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-[#e7e7e3]">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className={isAdmin ? "" : "pt-16"}>{children}</div>
    </div>
  );
}
