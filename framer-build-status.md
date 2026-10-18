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

## Placeholders

Final scan (2026-10-18): no "PLACEHOLDER" text on any page, and none in the live CMS. The one draft Reviews item is unpublished.

Owner details added: founder Scot Ballan (Home and About), 12-month system warranty (How It Works and the FAQ), business ZIP 68116 (Omaha service-area page and the JSON-LD address). No Google rating appears anywhere.

Photos: Palm Tree House was replaced by Three-Car Ranch. Four owner photos were added as projects (Three-Car Ranch, Modern Two-Story, Two-Story in Purple, Ranch in Amber), plus a red roofline close-up on How It Works. House numbers are blurred and EXIF/GPS is stripped. Sources are in `assets/photos/`.

Still from the owner: real reviews and rating once they exist, project neighborhoods and cities, the founding story, and the exact Omaha and Lincoln ZIP lists.

Fixed during validation: 13 lines of text had lost their text style during earlier rewrites (rendering as black Inter); the Home trust strip was squeezed into a narrow column; the phone nav pushed its menu button off-screen (the CTA is now hidden on phone, where the sticky bottom bar covers it).

## Audit (2026-10-18, second pass)

- Home "Real homes" now features Three-Car Ranch, Modern Farmhouse and Modern Two-Story.
- Fixed: About value blurbs overlapped on phone (now stacked); Free Design phone header wordmark collided with the phone number (smaller on phone); "Locally owned by Scot Ballan" was too dim over the photo (now moonstone).
- Checked: no internal links to missing pages; one phone number (402-699-6256) and one email everywhere; no unstyled text; every live project has photo and alt text; all 480 scroll-film frames return 200 from the frame host.
- Canvas screenshots show CMS lists on tablet/phone as a single template card ("Title", "City"); this is the screenshot tool, not the site (Our Work shows the same), and desktop renders every item.

## Hero film: properties to fill on ScrollVideoHero (Home)

| Property | Value |
|---|---|
| Frames 16:9 / Frames 9:16 | CDN URL patterns from `scripts/make-frames.sh`, e.g. `https://<cdn>/hero/16x9/{n}.webp` |
| Count 16:9 / Count 9:16 | Frame counts printed by `make-frames.sh` |
| Poster 16:9 / Poster 9:16 / Lit still | Posters from `make-frames.sh`; Lit still = K2 |
| Intro to, Copy lights at, each chapter's Starts at | Printed by `scripts/make-film.sh` |

**Scroll film: live (2026-10-18).** Frames are hosted at `https://illuminated-exteriors-media.higgsfield.app/hero/16x9/{n}.webp` (330) and `/hero/9x16/{n}.webp` (150), set on the Home hero with Intro to 0.210, Copy lights at 0.163 and chapters at 0.344 / 0.530 / 0.710 / 0.890 (from `make-film.sh`). Segments: V1, V2, V3, V5 by MiniMax H3; V4 (Christmas → red & white) failed twice on MiniMax, so it is a 6 s cross-fade between the neighbouring clips. The 9:16 set is a portrait crop of the 16:9 film. Tested in Chromium at 1440 and 390: all frames load, the canvas scrubs, no horizontal scroll.

The frame host is published, so it also appears on Higgsfield's community feed (owner approved). Its files are served with `max-age=0`; moving them to the now-public GitHub repo via jsDelivr would add long-term caching.

**Higgsfield stills placed (2026-10-18):** hero poster F0 and lit still F1; Day/Night slider F0 → F1; scene stills Everyday F1, Red & White F4, Blue & White F5, Halloween F2, Christmas F3. Birthday and July 4th stills and the W1 night-sky background (closing section, Free Design and city pages) were added later the same day.

## Not done

- Redirects `/m/bookings` and `/m/account` → `/free-design`: the current Framer plan doesn't include redirects
- Phone swipe row has no scroll-snap; nav doesn't hide on scroll down; FAQ accordions don't close each other
- Visual check in Framer's preview: preview needs a publish, and screenshot images are hosted on `framerusercontent.com`, which this environment blocks. Instead, the code components were tested locally in Chromium at 1440, 810 and 390 (no horizontal scroll, the form reaches step 3 and sends), and Home desktop was measured in Framer with no overflow.
- Logo: the live site's logo comes through as a flat JPG, so the nav uses a gold and blue text wordmark for now
- The "10% off your first service" newsletter offer from the old site isn't carried over yet
