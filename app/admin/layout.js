"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";

/**
 * Auth gate and chrome shared by all /admin pages.
 *
 * Requires an authenticated admin — anyone else is bounced to /login.
 *
 * The shell is rendered HERE, above the pages, because a route's loading.js
 * renders in place of its page. While each page owned its own AppShell, every
 * handoff from a placeholder to real content rebuilt the entire chrome: the
 * nav was remounted, the mobile menu state dropped, the logo re-decoded. The
 * pages now draw content only, so the console keeps one shell for the whole
 * visit — including across its loading boundaries.
 *
 * The one thing the pages used to supply through a slot was the way back to
 * the directory, so that now lives here and is derived from the path: the
 * member record is the only page below the console root.
 */
export default function AdminLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  /* The cold-start gate keeps the branded loader. Unlike a page handoff, this
     is the one moment the console cannot be drawn: until auth resolves we do
     not know whether this visitor is an admin, and the admin chrome names a
     surface that must not be shown to anyone else. Every load after it is a
     skeleton inside the shell. */
  if (authLoading) {
    return <Loader />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const inDetail = pathname !== "/admin";

  return (
    <AppShell
      variant="admin"
      navSlot={
        inDetail ? (
          <Link href="/admin" className="sb-back">
            <span aria-hidden="true">←</span> Console
          </Link>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
