import { Sk, SkFrame, SkText } from "@/components/Skeleton";

/**
 * The neutral dashboard shape, for the pages that have no boundary of their
 * own — Today and Account both sit under app/dashboard/loading.js.
 *
 * It is deliberately generic: a masthead, one strip of figures and a stack of
 * cards. Those two pages differ in their details, so a shape that claimed to
 * be either one would be wrong on the other. What it does guarantee is the
 * thing that was actually broken — the shell stays mounted, so the sidebar
 * never disappears and no destination moves out from under the pointer.
 *
 * A page whose layout is known gets its own loading.js instead: meal, gym and
 * stats each draw their real bands.
 */
export default function DashboardSkeleton() {
  return (
    <SkFrame label="Loading your dashboard">
      <div className="m-sk-head">
        <div className="m-sk-head-l">
          <Sk w={148} h={10} r={3} />
          <Sk w={132} h={30} r={6} />
          <Sk w={224} h={11} r={3} />
        </div>
        <Sk w={132} h={38} r={7} />
      </div>

      <div className="m-sk-card m-sk-flush m-sk-strip">
        <div className="m-sk-card-h2">
          <Sk w={96} h={12} r={3} />
          <Sk w={148} h={9} r={3} />
        </div>
        <div className="m-sk-body">
          <div className="m-sk-macros">
            {[0, 1, 2, 3].map((i) => (
              <div className="m-sk-macro" key={i}>
                <Sk w={54} h={9} r={3} />
                <Sk w={i === 0 ? 78 : 52} h={18} r={4} />
                <Sk w="100%" h={6} r={99} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="m-sk-slots">
        {[0, 1].map((i) => (
          <div className="m-sk-card" key={i}>
            <div className="m-sk-card-h">
              <Sk w={72} h={10} r={3} />
              <Sk w={48} h={10} r={3} />
            </div>
            <SkText lines={2} />
          </div>
        ))}
      </div>
    </SkFrame>
  );
}
