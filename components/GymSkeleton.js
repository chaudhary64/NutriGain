import { Sk, SkFrame } from "@/components/Skeleton";

/**
 * The gym log, before the split and exercises have arrived.
 *
 * The masthead is the page's strongest line — a kicker, a large title naming
 * the day's muscles and the date beneath it — so it is reserved at its own
 * size rather than faked with a generic text block.
 *
 * The session area is deliberately NOT drawn as a list of exercise rows. The
 * page has three branches there — a board of exercises, a rest-day card, or an
 * empty-split card — and which one applies is only known once the split has
 * loaded, which is the very thing being waited on. A five-row placeholder
 * promised a session that a rest day never delivers, so the placeholder
 * reserves the rest card's shape instead: it is the smaller of the three, and
 * content growing into a taller board is a benign shift where a false promise
 * is not.
 */
export default function GymSkeleton() {
  return (
    <SkFrame label="Loading your training session">
      <div className="m-sk-head m-sk-head-ruled">
        <div className="m-sk-head-l">
          <Sk w={144} h={10} r={3} />
          <Sk w={258} h={34} r={7} />
          <Sk w={186} h={11} r={3} />
        </div>
        <div className="m-sk-head-r">
          <Sk w={96} h={30} r={7} />
          <Sk w={120} h={30} r={7} />
        </div>
      </div>

      <div className="m-sk-card m-sk-flush m-sk-session">
        <div className="m-sk-card-h2">
          <Sk w={68} h={10} r={3} />
          <Sk w={112} h={10} r={3} />
        </div>
        <div className="m-sk-rest">
          <Sk w={214} h={16} r={4} />
          <Sk w={300} h={10} r={3} />
          <Sk w={236} h={10} r={3} />
        </div>
      </div>
    </SkFrame>
  );
}
