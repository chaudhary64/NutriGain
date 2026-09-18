import Loader from "@/components/Loader";

/**
 * Route-level loading UI for the dashboard subtree — every navigation into
 * /dashboard/* shows the branded loader instead of a blank frame.
 */
export default function DashboardLoading() {
  return <Loader />;
}
