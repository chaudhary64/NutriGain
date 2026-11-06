import StatsPageSkeleton from "@/components/StatsSkeleton";

/**
 * Route-level loading UI for /dashboard/stats.
 *
 * The page's frame — masthead, window selector, the three-figure lead card and
 * the evidence bands — is fixed before any data arrives, so the placeholder
 * draws it instead of blanking the screen behind a centred ring.
 */
export default function StatsLoading() {
  return <StatsPageSkeleton />;
}
