"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

/**
 * Auth gate shared by all /dashboard pages.
 *
 * Visitors are redirected to /login and users who have not completed
 * onboarding to /onboarding. Admins are allowed through — they are users
 * too, and the admin shell's "My dashboard" link leads here. Pages render
 * their own <AppShell> so they can inject page-specific controls into the
 * nav via slots.
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

  return children;
}
