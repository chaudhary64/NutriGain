import DashboardSkeleton from "@/components/DashboardSkeleton";

/**
 * Route-level loading UI for the dashboard subtree.
 *
 * This is the boundary Today and Account fall back to, so it renders the
 * neutral dashboard shape inside the real shell. It used to return the
 * full-screen Loader, which took the sidebar with it — the one piece of the
 * app a reader uses to know where they are.
 *
 * Pages with a known layout override this with their own loading.js: meal,
 * gym and stats each draw their real bands.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
