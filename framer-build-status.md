# Framer build status (2026-10-18)

Built by Claude through Framer Agent in the Framer project **Nuanced Checkbox** (`framer.com/projects/Nuanced-Checkbox--SQQ83ci9vo5eq1VVPoHH`). Branching isn't available on this Framer plan, so the work sits in the project's main version. **Nothing has been published.**

## What's in the project

| Area | Done |
|---|---|
| Design system | 9 color styles and 7 text styles (Display, Display Italic, H2, H3, Body, Small, Mono Label) with desktop, tablet and phone sizes; Nav Link and Inline Link link styles |
| Code components | All 11 files from `framer/` pasted verbatim under the same names; all 7 components compile and show their property controls |
| CMS | Projects (6 real gallery photos from the live site), FAQs (9), Service Areas (8 cities), Reviews (1 draft placeholder) |
| Shared layout ("Main") | Sticky nav with phone drawer, footer (CMS service-area links, MotionToggle), phone-only Call / Free Design bar, LumenCursor |
| Pages | Home, Our Work (occasion filter), project detail `/our-work/:slug`, How It Works, FAQ (grouped, sticky category list), About, Free Design (logo and phone only), service-area detail `/areas/:slug` |
| Breakpoints | Desktop 1200, Tablet 810, Phone 390 on every page and the layout |
| SEO | Site default and per-page titles and descriptions; JSON-LD in Custom Code (end of head), unverifiable fields removed |

## Placeholders (search the project for "PLACEHOLDER")

- Project titles 4–6, neighborhoods, cities, occasions (all "Other"), install dates, review quotes
- FAQ answers on pricing range, track look, app, install time, warranty, weather, HOA
- Service-area ZIPs for Omaha and Lincoln
- Trust strip (Google rating and count, licensed and insured, certified installer), owner name and photo, About founding story, map
- Image slots for Higgsfield P1 (phone in hand) and M1, D1, plus the Day/Night slider images (D1 and K2)
- Reviews: one draft item, not published

## Hero film: properties to fill on ScrollVideoHero (Home)

| Property | Value |
|---|---|
| Frames 16:9 / Frames 9:16 | CDN URL patterns from `scripts/make-frames.sh`, e.g. `https://<cdn>/hero/16x9/{n}.webp` |
| Count 16:9 / Count 9:16 | Frame counts printed by `make-frames.sh` |
| Poster 16:9 / Poster 9:16 / Lit still | Posters from `make-frames.sh`; Lit still = K2 |
| Intro to, Copy lights at, each chapter's Starts at | Printed by `scripts/make-film.sh` |

Until those are set, the hero shows its still state.

## Not done

- Redirects `/m/bookings` and `/m/account` → `/free-design`: the current Framer plan doesn't include redirects
- Phone swipe row has no scroll-snap; nav doesn't hide on scroll down; FAQ accordions don't close each other
- Visual check in Framer's preview: preview needs a publish, and screenshot images are hosted on `framerusercontent.com`, which this environment blocks. Instead, the code components were tested locally in Chromium at 1440, 810 and 390 (no horizontal scroll, the form reaches step 3 and sends), and Home desktop was measured in Framer with no overflow.
- Logo: the live site's logo comes through as a flat JPG, so the nav uses a gold and blue text wordmark for now
- The "10% off your first service" newsletter offer from the old site isn't carried over yet
