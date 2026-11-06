import { Sk, SkFrame, SkRegion, SkText } from "@/components/Skeleton";

/**
 * The progress page, before its window has been measured.
 *
 * Two shapes, one set of bands: the route boundary needs the masthead and the
 * window selector as well, while the page itself already shows both and only
 * the evidence below them is pending. Drawing the bands once and wrapping
 * them two ways keeps the in-page swap and the route swap identical, so a
 * navigation into Progress cannot change silhouette between the two states.
 */
function Bands() {
  return (
    <>
      {/* Lead card — the three figures the window answers with. */}
      <div className="m-sk-lead">
        {[0, 1, 2].map((i) => (
          <div className="m-sk-cell" key={i}>
            <Sk w={62} h={9} r={3} />
            <Sk w={i === 0 ? 96 : 72} h={28} r={6} />
            <SkText lines={2} h={10} last="58%" />
            <Sk w="100%" h={22} r={4} />
          </div>
        ))}
      </div>

      {/* Nutrition — four macro columns over their tracks. */}
      <div className="m-sk-card m-sk-flush">
        <div className="m-sk-card-h2">
          <Sk w={124} h={12} r={3} />
          <Sk w={132} h={9} r={3} />
        </div>
        <div className="m-sk-body">
          <div className="m-sk-macros">
            {[0, 1, 2, 3].map((i) => (
              <div className="m-sk-macro" key={i}>
                <Sk w={54} h={9} r={3} />
                <Sk w={i === 0 ? 78 : 52} h={18} r={4} />
                <Sk w="100%" h={6} r={99} />
                <Sk w={64} h={9} r={3} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training — three headline figures. */}
      <div className="m-sk-card m-sk-flush">
        <div className="m-sk-card-h2">
          <Sk w={104} h={12} r={3} />
          <Sk w={116} h={9} r={3} />
        </div>
        <div className="m-sk-body">
          <div className="m-sk-figs">
            {[0, 1, 2].map((i) => (
              <div className="m-sk-macro" key={i}>
                <Sk w={i === 1 ? 84 : 48} h={22} r={4} />
                <Sk w={92} h={9} r={3} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight — a chart with its weigh-in ledger beside it. */}
      <div className="m-sk-card m-sk-flush">
        <div className="m-sk-card-h2">
          <Sk w={112} h={12} r={3} />
          <Sk w={96} h={9} r={3} />
        </div>
        <div className="m-sk-wt">
          <div className="m-sk-wt-main">
            <Sk w="100%" h={176} r={6} />
          </div>
          <div className="m-sk-wt-side">
            <Sk w={78} h={9} r={3} />
            <Sk w="100%" h={34} r={6} />
            {[0, 1, 2].map((i) => (
              <div className="m-sk-line" key={i}>
                <Sk w={64} h={9} r={3} />
                <Sk w={44} h={9} r={3} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consistency — one row per week of the window. */}
      <div className="m-sk-card m-sk-flush">
        <div className="m-sk-card-h2">
          <Sk w={118} h={12} r={3} />
          <Sk w={88} h={9} r={3} />
        </div>
        <div className="m-sk-body">
          {[0, 1, 2, 3].map((i) => (
            <div className="m-sk-line" key={i}>
              <Sk w={82} h={9} r={3} />
              <Sk w="100%" h={8} r={99} />
              <Sk w={68} h={9} r={3} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** The whole page — used by the route boundary. */
export default function StatsPageSkeleton() {
  return (
    <SkFrame label="Loading your progress">
      <div className="m-sk-mast">
        <div className="m-sk-head-l">
          <Sk w={126} h={10} r={3} />
          <Sk w={168} h={30} r={6} />
          <Sk w={286} h={11} r={3} />
        </div>
        <Sk w={148} h={34} r={8} />
      </div>
      <div className="m-sk-bands">
        <Bands />
      </div>
    </SkFrame>
  );
}

/**
 * Just the evidence — used inside the page, under the masthead the reader is
 * already looking at.
 */
export function StatsBandsSkeleton() {
  return (
    <SkRegion label="Loading your stats">
      <div className="m-sk-bands">
        <Bands />
      </div>
    </SkRegion>
  );
}
