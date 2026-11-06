import { AdminUserSkeleton } from "@/components/AdminSkeleton";

/**
 * Route-level loading UI for one member's record.
 *
 * The record's shape is fixed and known, so this draws it rather than the
 * console's table: arriving from the directory should not flash a layout the
 * reader is not about to get.
 */
export default function AdminUserLoading() {
  return <AdminUserSkeleton />;
}
