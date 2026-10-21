# NutriGain landing page — direction and system

A conventional SaaS marketing page built on **Meridian**, the same design system the
dashboard, admin and auth pages use. The landing page is not a separate brand: it inherits
`--line`, `--card`, `--paper`, `--t1…--t3`, `--ac`, `--on-ac`, `--sunken`, `--track` and
`--link` from `app/meridian.css`, so a token change in the app moves the site with it.

Craft checks (type scale, contrast, hover behaviour, motion, audit) follow the `awwwards`
skill (github.com/juliobsz/skills); the structure is the familiar product page a visitor
expects.

## Structure

| Order | Section | Job |
|---|---|---|
| 1 | Hero | One promise, two actions, the dashboard immediately below |
| 2 | Stack strip | What it is built on, no invented customer logos |
| 3 | Features ×3 | Meals, remaining macros, sets — each with the real UI beside it |
| 4 | Also included | The four secondary surfaces, as compact cards |
| 5 | How it works | Three steps, honest about the actual setup |
| 6 | Pricing | One plan, $0, inclusions on the right |
| 7 | FAQ | Five questions that block signup |
| 8 | Closing CTA | Ink panel, repeat of the primary action |
| 9 | Footer | Product, account, project |

Anchors: `#features`, `#how`, `#pricing`, `#faq`, all with `scroll-margin-top: 84px`.

## Tokens

The page carries `.lp mrd`; `.mrd` supplies the Meridian token set, and `.lp` only renames
it for the page's own rules (`--bg`, `--surface`, `--ink`, `--accent`…) so both surfaces read
from one source.

| Meridian token | Light | Dark | Used for |
|---|---|---|---|
| `--paper` | `#FAFAFA` | `#0A0A0A` | page ground |
| `--card` | `#FFFFFF` | `#111111` | cards, mockup surfaces |
| `--card-2` | `#FAFAFA` | `#161616` | wells, rail, side column |
| `--line` | `#EBEBEB` | `#262626` | every hairline |
| `--t1` | `#171717` | `#EDEDED` | headings, figures, ink buttons |
| `--t2` | `#4D4D4D` | `#A1A1A1` | body copy, links |
| `--t3` | `#8F8F8F` | `#8F8F8F` | dashboard micro-labels only |
| `--ac` / `--on-ac` | `#171717` / `#FFF` | `#EDEDED` / `#0A0A0A` | primary buttons |
| `--sunken` | `#F2F2F2` | `#1A1A1A` | chips, badges, quiet fills |
| `--link` | `#0070F3` | `#3291FF` | inline text links |

There is **no saturated accent on this page**. The dashboard's primary is ink and the only
blue in the app is the link colour, so the landing keeps it that way: black buttons, grey
chips, and blue reserved for actual links. The closing panel is an ink field, not a coloured
one — the strongest block on the page is still the app's own ink.

`--t3` is 3.1:1 on paper, which the dashboard uses for 10–11px mono labels. The landing sets
13px captions from it, so it derives `--ink-3: color-mix(in srgb, var(--t1) 62%, var(--paper))`
— same ink and paper, ~5:1. Nothing else departs from the token set.

## Type

One family, like the app: **Geist** for everything, **Geist Mono** for labels and figures.

- h1 600, `clamp(2.8rem, 5.6vw, 4.6rem)`, tracking −0.04em, leading 1.02.
- h2 600, `clamp(1.85rem, 3.2vw, 2.75rem)`; h3 600, `clamp(1.3rem, 1.9vw, 1.75rem)`.
- Body 15–17px / 1.6, measure 40–52 characters, `--t2`.
- Eyebrows and table labels: Geist Mono 10–11px, uppercase, 0.06–0.08em.
- Nav 13px/500, buttons 13.5px/500 — the dashboard's own sizes.
- Archivo (the previous display face) is no longer loaded; `app/layout.js` carries Geist,
  Geist Mono and the 404/error Playfair only.

## Shape

- Radii: **6px** buttons, chips and tags; **12px** cards, steps, pricing, closing panel,
  window; 4px for the PR marker. Meridian's `--ng-r-sm` / `--ng-r-md` scale.
- Shadows: hairline first. Cards, steps and pricing have **none**; only the hero product
  window floats (`0 1px 2px … , 0 26px 60px -30px …`). No glows, no coloured shadows.
- Borders: 1px `--line`; hover raises the border to `--faint` on secondary cards, never a lift
  with a shadow.

## The product is markup, not a screenshot

`DashboardMock` renders the Today screen — remaining calories, three macro cells, three meal
slots, the session with its sets and a weight sparkline — as real DOM inside a 12px card with
an app-style header (`nutrigain.app/dashboard`, `Sample day`). It inherits light/dark from
the page, stays sharp at any density, costs no image bytes, and cannot drift into a picture
of a product that no longer exists. The sample tag keeps the numbers from reading as a
visitor's own.

The three feature cards use the same vocabulary at smaller sizes: meal rows, macro bars, set
rows — crops of the surfaces they describe.

## Content rules

- No testimonials, no customer logos, no user counts. The stack strip stands where a logo row
  would sit, because the products named there are actually used.
- One plan at $0 because that is true, with the self-host path stated and linked.
- FAQ answers the real blockers: free?, targets?, lifting only?, data?, phone?.
- Every claim maps to something the app does.

## Motion

- Reveals only: `[data-reveal]` settles 18px up over 0.7s, 80/160ms stagger inside a group.
  Initial styles come from JS, so no-JS visitors see a complete page.
- Hover follows Meridian's restraint: buttons darken (`--ac` → `--ach`) and lift 1px; nav
  links draw a 1px rule and lift 1px; secondary cards change border colour only.
- Reduced motion: the observer is never created and CSS transitions are disabled.

## Accessibility

Skip link first, one h1, landmarks, focus-visible rings in ink, 32px nav hit areas, 28px
footer hit areas, native `<details>` FAQ, and text at 4.5:1 or better — verified with axe in
both themes.

## Responsive

1440px container, 28px gutters. Breaks: 1080px (mock drops its side column), 900px (features
stack, pricing stacks, footer to two columns), 700px (hero type scale, mock budget becomes
2×2, full-width actions), 640px (nav drops the duplicate "Sign in"), 360px (lockup shrinks so
it never touches the toggle).

## Verification (production build)

- axe (color-contrast) — 0 violations light, 0 dark.
- Full audit: 0 violations overall, 0 undersized targets, LCP 164ms desktop / 1.12s mobile
  (4× CPU, slow 4G), CLS 0, 60fps scroll, keyboard order clean, reduced motion still, every
  hover target moves.
- `npm run build` and ESLint exit 0.

## Files

- `app/page.js` — the page, its scoped CSS, the mockup and the content arrays.
- `components/HomeMotion.js` — the IntersectionObserver reveal.
- `components/AppFooter.js` — footer columns.
- `components/AppShell.js` — marketing bar (nav labels, one ink action).
- `app/globals.css` — `.mk-*` chrome styles, skip link.
- `public/og.png` — regenerated from the live hero at 1200×630.
