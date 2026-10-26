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
| 2 | Features ×3 | Meals, remaining macros, sets — each with the real UI beside it |
| 3 | Record | The training heatmap and the PR trend drawn from sample entries, then three surfaces as a ruled list |
| 4 | How it works | Three steps, honest about the actual setup |
| 5 | Pricing | One plan, $0, inclusions on the right |
| 6 | FAQ | Five questions that block signup |
| 7 | Closing CTA | Ink panel, repeat of the primary action |
| 8 | Footer | Product, account, project |

Anchors: `#features`, `#how`, `#pricing`, `#faq`, all with `scroll-margin-top: 84px`.

## Chrome

One fixed bar, 64px, on the page's own ground with a hairline under it — no shadow, no
second row. Left: the mark and the wide-tracked wordmark. Centre: the four section links.
Right: a 1px rule, the appearance switch, then the account end — Dashboard, your name and
logout, or Sign in and Get started free. The rule is what keeps the links from reading as
the first items of one long list, and it is why the switch never reads as a fifth link. The
bar is a three-track grid, so the centre group sits on the bar's own centre line rather
than in whatever room the wordmark leaves over.

The appearance switch is the one control in the bar whose glyph could be read as decoration
or as a state badge, so from 1200px it carries its word as well — "Dark" beside a moon while
the page is light, "Light" beside a sun while it is dark. Word and glyph both name the
action. Narrower, the glyph carries it alone with `aria-label` and `title` doing the naming.
It is a button named for what pressing it does, not a `switch`: APG requires a switch's label
to stay put while its state flips.

The link for the section being read carries a 2px underline in ink and
`aria-current="location"`; the rest keep the hover rule. The marker is read from the
section's own box, so it needs no offset table.

Below 940px the bar is the mark and the menu, and everything else moves inside it: the four
sections, the account end — Dashboard, your name, logout, or Sign in and Get started free —
and an Appearance row that names Light and Dark as two buttons rather than leaving the sun
and moon to carry it. The glyph is three lines with the last one short and pulled right; even
bars read as a list icon at this size, and the broken line is what makes it a menu.

The menu is the whole screen, not a dropdown under the bar. Both directions are GSAP
timelines in `MarketingLinks` — not CSS keyframes, because the timing then lives in one
place and the exit can be awaited before the sheet unmounts. It drops in from the bar's top
edge on a `transform` (the `clip-path` wipe it started as was repainted every frame), the
rows follow it in on a 50ms stagger, and it leaves on a 260ms `power2.in` before unmounting.
A 600ms guard finishes the close even if the tab's animation clock has stopped, so a
backgrounded tab can never leave the page scroll-locked. Reduced motion skips both tweens.
It repeats the wordmark with a named Close beside it, lists the sections at 56px rows, and
pins the account end and the Appearance choice to the bottom edge. Picking a section, Close
or Escape returns to the page with focus back on the button and the page scroll unlocked. It is portalled out of the bar, because the bar's `backdrop-filter` would
otherwise become the containing block for a fixed sheet and clip it to 64px. A bordered box
with a chevron was the first version of this control and it read as a select.

Below 520px the wordmark is clipped rather than removed, so the home link keeps its name.

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
- Section headings stand alone: no eyebrow or kicker sits above an h1/h2. Micro-labels
  (card headers, legends, table captions) are Geist Mono 9.5–11px, uppercase, 0.06–0.08em.
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

- No testimonials, no customer logos, no user counts. Nothing stands where a logo row would
  sit; the claim is the page itself.
- One plan at $0 because that is true, with the self-host path stated and linked.
- FAQ answers the real blockers: free?, targets?, lifting only?, data?, phone?.
- Every claim maps to something the app does.
- One label for the primary action everywhere — nav, hero, pricing, closing panel: **Get
  started free**. Nothing on the page asks for the same thing under a second name.

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

1440px container, 28px gutters. Breaks: 1200px (the appearance switch keeps its word), 1080px
(mock drops its side column), 940px (the bar becomes mark and menu; section
links fold into the `Sections` disclosure, the rule leaves the bar), 900px (features stack,
pricing stacks, footer to two columns), 700px (hero type scale, mock budget becomes 2×2,
full-width actions), 640px (nav drops the duplicate "Sign in"), 520px (mark without the
wordmark), 360px (everything above still clears the menu and the switch).

## Verification

- `next build` and ESLint exit 0.
- Contrast computed from the rendered page in both themes: body copy 7.7:1 dark / 5.1:1 light,
  captions and micro-labels 6.8:1 / 5.0:1 — every text step clears 4.5:1.
- Layout measured at 1440 and 375: no horizontal overflow, the two record panels within 10px
  of each other, heat cells 23px and 10px respectively.
- Semantics checked by hand — figures carry captions, the heatmap cells and mockup rails are
  decorative, the trend svg and mockup group are labelled. axe is not a project dependency, so
  there is no automated sweep to report.

## Files

- `app/page.js` — the page, its scoped CSS, the mockup and the content arrays.
- `components/HomeMotion.js` — the IntersectionObserver reveal.
- `components/AppFooter.js` — footer columns.
- `components/AppShell.js` — marketing bar (mark, action cluster, one ink action).
- `components/MarketingLinks.js` — the section links, the read marker and the disclosure.
- `app/globals.css` — `.mk-*` chrome styles, skip link.
- `public/og.png` — regenerated from the live hero at 1200×630.
