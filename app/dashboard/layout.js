"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";

/**
 * Auth gate shared by all /dashboard pages.
 *
 * Visitors are redirected to /login and users who have not completed
 * onboarding to /onboarding. Admins are allowed through — they are users
 * too, and the admin shell's "My dashboard" link leads here.
 *
 * The shell is rendered HERE, above the pages, because a route's loading.js
 * renders in place of its page. When each page owned its own AppShell, every
 * handoff from a skeleton to real content unmounted one shell and mounted
 * another: the nav was rebuilt, the mobile menu state reset, the logo
 * re-decoded and focus inside the sidebar was lost. Owning it once means the
 * sidebar is the same DOM node for the whole visit, and the loading
 * boundaries draw content only.
 */
export default function DashboardLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !user.isAdmin && user.onboardedAt === null) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (authLoading) {
    return <Loader />;
  }

  if (!user || (!user.isAdmin && user.onboardedAt === null)) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
