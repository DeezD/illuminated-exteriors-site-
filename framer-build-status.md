# Framer build status (2026-10-18)

Built by Claude through Framer Agent in the Framer project **Nuanced Checkbox** (`framer.com/projects/Nuanced-Checkbox--SQQ83ci9vo5eq1VVPoHH`). Branching isn't available on this Framer plan, so the work sits in the project's main version. **Published to production on 2026-10-18 (version 8781015f1) at https://nuanced-checkbox-084836.framer.app, on the owner's go-ahead.**

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

## Smoothness fix and motion loops: live (2026-10-24)

Published to production (version 66e395acb) on the owner's "go".

**Scroll film**
- `ScrollVideoHero.tsx` and `frameSequence.tsx` replaced verbatim in Framer.
- New frames are at `https://illuminated-exteriors-media.higgsfield.app/hero/v2/16x9/{n}.webp` (330 frames at 1280 px, quality 60, 14 MB, down from 23 MB) and `/hero/v2/9x16/{n}.webp` (240 frames, up from 150, at 720 px, 7.8 MB). The phone set is cut from the desktop frames at the same crop as before (x 601, width 507).
- A `_headers` file on the host serves `/hero/v2/*` and `/loops/v1/*` with `Cache-Control: public, max-age=31536000, immutable`. The old `/hero/16x9` and `/hero/9x16` sets stay up, unused.
- Framer has no site-wide smooth-scroll setting in this project (no smooth-scroll code in Custom Code or components), so nothing fights the canvas.

**Motion loops**: all five MiniMax videos completed, with no retries.
- They were converted with `make-frames.sh loop` (H.264, 1280 px, no audio): 0.5 to 1.2 MB each.
- Flash test: 0 flashes per second in every quarter-frame region (WCAG 2.3.1). The houses hold their shape (checked on contact sheets).
- The videos are hosted on Framer's CDN (`framerusercontent.com/assets/…`), because the Higgsfield host doesn't answer byte-range requests, which iPhone Safari needs for video.
- `LoopFeature.tsx` was added verbatim. Bands:
  - Home: Invisible by day (after the scroll film, media left), Light show (after Every Occasion, right), Warm to cool (after the phone section, left).
  - How It Works: The light (after The lights, left), Zones (after The app, right).
- Home's old "Day and Night" slider section is hidden (not deleted): it had the same headline as the Invisible by day band. The slider still appears on How It Works.
- None of the loops appear in Our Work.

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

## Scroll smoothness fix (2026-10-21)

Owner reported the live scroll film feels glitchy. Cause: 330 desktop frames at ~69 KB each (~22 MB), served with `max-age=0`, and only 150 phone frames. Until every frame arrived, the hero showed the nearest loaded frame and jumped; on phones each frame step was large.

**Code (in `framer/ScrollVideoHero.tsx` and `framer/frameSequence.tsx`, replace both files in Framer verbatim):**
- Blends the two frames either side of the exact scroll position instead of snapping (no visible steps even with a short or partly loaded sequence).
- Loads the frames nearest the visitor's scroll position first.
- Decodes frames to ImageBitmaps ahead of time (no Safari decode stalls mid-scroll).
- Frame-rate-independent easing (same feel on 60 Hz and 120 Hz phones).
- Doesn't clear the canvas when the phone toolbar shows or hides.
- Measured on a 20-frame test sequence while scrolling slowly: steps larger than 3 dropped from 6 to 0; the biggest step went from 3.73 to 2.50.

**Assets (still to do):**
- Re-export desktop at 1280 px, quality 60 (target ~30–35 KB per frame, ~11 MB total): `DESKTOP_FRAMES=330` with width 1280 in `make-frames.sh`.
- Phone: 240 frames at 720 px (currently 150), so steps are smaller.
- Serve frames with long caching (`Cache-Control: public, max-age=31536000, immutable`), e.g. jsDelivr from this repo's `assets/` or any CDN that allows it; the current host sends `max-age=0`.
- In Framer Site Settings, keep any "smooth scroll" option off; it fights the scroll-scrubbed canvas.
