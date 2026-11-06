import { Sk, SkFrame, SkText } from "@/components/Skeleton";

/**
 * The meal log, before its day has arrived.
 *
 * The three bands are the page's own: the head with the day navigator, the
 * targets strip (calories wide, then protein, carbs, fat), and one card per
 * meal slot. Heights follow those bands rather than guessing, so the swap to
 * real content does not move anything — a skeleton that changes shape when
 * the data lands causes the very jump it was meant to prevent.
 */
export default function MealSkeleton() {
  return (
    <SkFrame label="Loading your meal log">
      <div className="m-sk-head">
        <div className="m-sk-head-l">
          <Sk w={132} h={10} r={3} />
          <Sk w={150} h={28} r={6} />
          <Sk w={206} h={11} r={3} />
        </div>
        <div className="m-sk-head-r">
          <Sk w={34} h={34} r={8} />
          <Sk w={148} h={34} r={8} />
          <Sk w={34} h={34} r={8} />
        </div>
      </div>

      <div className="m-sk-targets">
        <div className="m-sk-targets-h">
          <Sk w={92} h={10} r={3} />
          <Sk w={104} h={26} r={7} />
        </div>
        <div className="m-sk-cols">
          {[0, 1, 2, 3].map((i) => (
            <div className="m-sk-col" key={i}>
              <Sk w={58} h={9} r={3} />
              <Sk w={i === 0 ? 92 : 58} h={i === 0 ? 26 : 20} r={5} />
              <Sk w="100%" h={6} r={99} />
              <Sk w={68} h={9} r={3} />
            </div>
          ))}
        </div>
      </div>

      <div className="m-sk-slots">
        {[0, 1, 2, 3].map((i) => (
          <div className="m-sk-card" key={i}>
            <div className="m-sk-card-h">
              <Sk w={64} h={10} r={3} />
              <Sk w={44} h={10} r={3} />
            </div>
            <SkText lines={2} />
            <Sk w="100%" h={6} r={99} />
          </div>
        ))}
      </div>
    </SkFrame>
  );
}
