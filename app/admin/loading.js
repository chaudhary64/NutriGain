import AdminConsoleSkeleton from "@/components/AdminSkeleton";

/**
 * Route-level loading UI for /admin.
 *
 * Rendered in place of the page, inside app/admin/layout.js — so the console's
 * shell is already on screen and only the content column is pending. It used
 * to be the full-screen Loader, which blanked the nav on every navigation into
 * the console.
 *
 * The member record under /admin/user/[id] has its own boundary, so a deep
 * link there does not draw the directory first.
 */
export default function AdminLoading() {
  return <AdminConsoleSkeleton />;
}
