import MealSkeleton from "@/components/MealSkeleton";

/**
 * Route-level loading UI for /dashboard/meal.
 *
 * The page owns a layout we already know, so a spinner that blanks the whole
 * frame is the wrong signal here: the reader can start orienting against the
 * head, the targets strip and the slot cards before the day arrives.
 */
export default function MealLoading() {
  return <MealSkeleton />;
}
