import GymSkeleton from "@/components/GymSkeleton";

/**
 * Route-level loading UI for /dashboard/gym.
 *
 * The masthead and the session board are fixed shapes, so the placeholder
 * draws them and the swap to real content lands on the same geometry.
 */
export default function GymLoading() {
  return <GymSkeleton />;
}
