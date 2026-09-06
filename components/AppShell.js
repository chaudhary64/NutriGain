"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Shared application shell: top navigation + content container.
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
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500 selection:text-black">
      <nav
        className={`${isAdmin ? "sticky" : "fixed top-0 w-full"} top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="black"
                  className="w-6 h-6"
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
                  className={`text-2xl font-black tracking-tighter uppercase ${isAdmin ? "hidden sm:block" : ""}`}
                >
                  Nutri<span className={`${isAdmin ? "ml-0.5 " : ""}text-lime-500`}>Gain</span>
                </h1>
                {isAdmin && (
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] leading-none">
                    Master Control Terminal
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              {navSlot && <div className="flex items-center gap-4">{navSlot}</div>}

              {!isAdmin && (
                <>
                  <div className="h-6 w-px bg-neutral-800"></div>

                  <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                    {dashboardTabs.map((tab) => (
                      <button
                        key={tab.href}
                        onClick={() => navigate(tab.href)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wide ${
                          pathname === tab.href
                            ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    {isAdmin ? "Admin" : "Logged in as"}
                  </p>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  {logoutIcon}
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                aria-label="Toggle menu"
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
          <div className="md:hidden border-b border-neutral-800 bg-neutral-900">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    User
                  </p>
                  <p className="text-lg font-bold text-white">{user?.name}</p>
                </div>
              </div>

              {mobileSlot}

              {!isAdmin && (
                <div className="space-y-2">
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.href}
                      onClick={() => navigate(tab.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold uppercase tracking-wider ${
                        pathname === tab.href
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-800"
                      }`}
                    >
                      {tab.label === "Meal"
                        ? "Meal Tracker"
                        : tab.label === "Gym"
                          ? "Gym Tracker"
                          : tab.label}
                      {pathname === tab.href && (
                        <span className="text-lime-500">●</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center justify-between px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl font-bold uppercase tracking-wider"
                  >
                    Admin Panel
                  </button>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-neutral-800">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 rounded-xl font-bold uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className={isAdmin ? "" : "pt-20"}>{children}</div>
    </div>
  );
}
