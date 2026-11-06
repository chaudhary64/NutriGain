import { Sk, SkFrame } from "@/components/Skeleton";

/**
 * The admin console, before its directory has arrived.
 *
 * Same contract as the dashboard skeletons: this draws the content column
 * only. app/admin/layout.js owns AppShell, so the console's nav, identity and
 * appearance control stay on screen for the whole wait — the previous
 * full-screen Loader took them with it.
 *
 * The shapes are the console's own — masthead, the three-way tab switcher, the
 * directory table — rather than a generic card stack. The admin visual
 * language lives in each page's ADM_CSS, which is exactly what has not
 * rendered yet, so this frame leans on the .m-sk-* vocabulary instead: those
 * rules carry their own --sk-* tokens and read correctly outside any page
 * scope.
 */
export default function AdminConsoleSkeleton() {
  return (
    <SkFrame label="Loading the admin console">
      <div className="m-sk-head m-sk-head-ruled">
        <div className="m-sk-head-l">
          <Sk w={62} h={10} r={3} />
          <Sk w={186} h={30} r={6} />
          <Sk w={332} h={11} r={3} />
        </div>
      </div>

      {/* The tab switcher: three panes, each an icon over a name and a noun. */}
      <div className="m-sk-tabs">
        {[0, 1, 2].map((i) => (
          <div className="m-sk-tab" key={i}>
            <Sk w={22} h={22} r={6} />
            <Sk w={i === 0 ? 64 : 48} h={11} r={3} />
            <Sk w={i === 0 ? 76 : 62} h={9} r={3} />
          </div>
        ))}
      </div>

      <div className="m-sk-card m-sk-flush" style={{ marginTop: 20 }}>
        <div className="m-sk-card-h2">
          <Sk w={98} h={12} r={3} />
          <Sk w={130} h={9} r={3} />
        </div>
        <div className="m-sk-tbl">
          <div className="m-sk-trow m-sk-thead">
            {[86, 62, 44, 54].map((w, i) => (
              <Sk key={i} w={w} h={9} r={3} />
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="m-sk-trow" key={i}>
              <Sk w={i % 3 === 0 ? "72%" : i % 3 === 1 ? "56%" : "64%"} h={11} r={3} />
              <Sk w="46%" h={10} r={3} />
              <Sk w={34} h={10} r={3} />
              <Sk w={46} h={10} r={3} />
            </div>
          ))}
        </div>
      </div>
    </SkFrame>
  );
}

/**
 * One member's record, before their logs and split have arrived.
 *
 * The page has a fixed order once loaded — identity, four figures, two
 * summary bands, two charts side by side, then the log ledger — so the
 * placeholder reserves that order rather than guessing at content. The charts
 * keep their 280px plot height, which is the largest single shift the real
 * render could otherwise cause.
 */
export function AdminUserSkeleton() {
  return (
    <SkFrame label="Loading this member's record">
      <div className="m-sk-card" style={{ marginBottom: 20 }}>
        <div className="m-sk-id">
          <Sk w={56} h={56} r={12} />
          <div className="m-sk-head-l">
            <Sk w={136} h={20} r={4} />
            <Sk w={198} h={11} r={3} />
            <Sk w={142} h={9} r={3} />
          </div>
        </div>
      </div>

      {/* Days logged, streak, average calories, average protein. */}
      <div className="m-sk-stats">
        {[0, 1, 2, 3].map((i) => (
          <div className="m-sk-card" key={i}>
            <Sk w={i === 2 ? 94 : 84} h={9} r={3} />
            <Sk w={i === 0 ? 38 : 54} h={24} r={4} />
            <Sk w={i === 1 ? 78 : 64} h={9} r={3} />
          </div>
        ))}
      </div>

      {/* Average macros, then split and goals. */}
      {[0, 1].map((i) => (
        <div className="m-sk-card m-sk-flush" style={{ marginBottom: 20 }} key={i}>
          <div className="m-sk-card-h2">
            <Sk w={i === 0 ? 150 : 158} h={12} r={3} />
          </div>
          <div className="m-sk-body">
            <div className="m-sk-macros">
              {[0, 1, 2, 3].map((j) => (
                <Sk key={j} w="100%" h={54} r={6} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Calorie trend and macro distribution. */}
      <div className="m-sk-split" style={{ marginBottom: 20 }}>
        {[0, 1].map((i) => (
          <div className="m-sk-card m-sk-flush" key={i}>
            <div className="m-sk-card-h2">
              <Sk w={170} h={12} r={3} />
            </div>
            <div className="m-sk-body">
              <Sk w="100%" h={280} r={6} />
            </div>
          </div>
        ))}
      </div>

      {/* The log ledger. */}
      <div className="m-sk-card m-sk-flush">
        <div className="m-sk-card-h2">
          <Sk w={138} h={12} r={3} />
        </div>
        <div className="m-sk-body">
          {[0, 1, 2, 3].map((i) => (
            <div className="m-sk-line" key={i}>
              <Sk w={i % 2 ? 152 : 178} h={10} r={3} />
              <Sk w="100%" h={8} r={99} />
              <Sk w={88} h={10} r={3} />
            </div>
          ))}
        </div>
      </div>
    </SkFrame>
  );
}
