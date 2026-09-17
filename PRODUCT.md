# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Nature of the project:** NutriGain is a portfolio project — a showcase of full-stack engineering and interface craft. The real audience is evaluators of that work (recruiters, peers, other developers); the modeled user is a solo athlete who takes nutrition and lifting seriously and tracks both daily.

**Primary modeled user:** one athlete managing their own macros and training — logging meals at breakfast/lunch/dinner, recording sets in the gym, and reviewing progress between sessions.

## Product Purpose

NutriGain is a precision-first fitness tracking hub that eliminates guesswork from diet and training. It gives one unified, data-rich dashboard where the athlete hits their macros (calories, protein, carbs, fats) against a curated meal database, logs every set as real numbers (kg × reps), and sees consistency made visible. Success means: the athlete can log a meal or a set in seconds, trust every number shown, and see their progress clearly enough to come back tomorrow.

## Positioning

Most fitness apps track food *or* training. NutriGain does both in one place, tied together at the day level: a per-day daily log links meals and gym sessions, and the activity heatmap is fed by real training volume (kg lifted), not self-reported check-ins. Numeric set logging with automatic PR detection — no manual record entry — is a mechanism a basic calorie counter could not truthfully copy.

## Operating Context

- Meal logging happens at mealtimes (fast entry from a searchable database; per-serving macro math done for the user).
- Set logging happens in the gym, between sets — speed and numeric precision outrank everything else in that moment.
- Progress review (heatmaps, PR charts, weight trends) happens after sessions or weekly — this is where motivation matters most.
- The app is demonstrated from the repository (dev server + seeded data); there is no production deployment commitment on record.

## Capabilities and Constraints

**Confirmed capabilities** (from the working implementation):
- Macro tracking with real-time meters; searchable meal database with per-serving macro breakdowns
- Numeric set logging (kg × reps per exercise) with merge-upsert per day and automatic PR detection
- PR progression charts (top-set weight, last 6 months); GitHub-style activity heatmap fed by real volume; body-weight trend charts
- Weekly workout schedules (muscle groups per day) shared across users
- Day-level daily log unifying meals and gym status; date navigation for past logs
- Admin panel for the global meal/exercise databases, the weekly workout split, and users
- Secure auth: bcryptjs hashing, JWT in httpOnly cookies, edge-verified via `jose`, route guards, login rate limiting, server-side validation
- First-run onboarding: single-screen profile (sex/age/height/weight), activity + goal pickers, live Mifflin-St Jeor TDEE macro suggestion; applies server-computed goals and seeds today's weight entry, or can be skipped

**Technical constraints:** Next.js 16 App Router + React 19 + Tailwind CSS 4; MongoDB via Mongoose (Atlas-hosted connection string in `.env.local`); GSAP + Lenis already in the stack and used on the landing experience; Recharts for data visualization.

**Undecided on record:** deployment target is not committed.

## Brand Commitments

- Name: **NutriGain**; tagline: **"Track Your Macros. Dominate Your Goals."**; sign-off voice: *"Built for athletes."*
- The incumbent visual identity is a **dark, premium, data-driven aesthetic** (committed across the README and existing UI).
- Emoji-forward, athlete-toned copy is part of the existing voice (🔥 🏋️ 🏆 in feature naming).

## Evidence on Hand

- Full working implementation in this repo: dashboard surfaces (`/dashboard/meal`, `/dashboard/gym`, `/dashboard/stats`, `/dashboard/profile`), admin panel, REST API routes, and Mongoose models.
- Progress page: weekly macro averages vs. goals, training volume/frequency, weight trend, and consistency streaks from a single aggregation endpoint.
- README.md documents the complete feature set, stack, and application flow.
- No real users, testimonials, benchmarks, or marketing claims exist — future work must not fabricate any.

## Product Principles

1. **Data is the hero.** Every surface shows real, precise numbers; nothing decorative masquerades as a metric.
2. **Fast where it counts.** Logging flows (meals, sets) must never slow entry; review surfaces can afford richer visuals.
3. **One unified day.** Nutrition and training are read together through the daily log, never as silos.
4. **Consistency made visible.** Streaks, heatmaps, and PRs celebrate the habit, not just the outcome.
5. **Craft is the proof.** As a portfolio piece, the interface itself must demonstrate engineering and design quality — the UI is part of the résumé.
