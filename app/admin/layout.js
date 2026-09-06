"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

/**
 * Auth gate shared by all /admin pages.
 *
 * Requires an authenticated admin — anyone else is bounced to /login.
 * Pages render their own <AppShell variant="admin"> so they can inject
 * page-specific controls into the nav via slots.
 */
export default function AdminLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loader />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return children;
}
