# Illuminated Exteriors site audit (2026-11-11)

Audited: the live site at `https://nuanced-checkbox-084836.framer.app` (23 pages: 6 main, 9 project, 8 city) and the component code in `framer/`. Read-only: nothing on the site, the Framer project or the repo's code was changed. Paths below are relative to this `audit/` folder.

## Verdict

The site looks premium and the basics are sound: no page scrolls sideways at 390, 810 or 1440 px, every page has exactly one H1, Lighthouse accessibility is 100 on every page tested, layout shift is low, and reduced-motion and Save-Data visitors get a still hero with no film download. Five things hold it back. (1) On the free `framer.app` address the whole site is served `noindex`, and the "Made in Framer" badge sits on top of the phone "Free Design" button. (2) The "Recent installs" row is collapsed to slivers on phones on all 8 city pages. (3) On phones the fixed Call / Free Design bar covers every call-to-action inside the scroll film. (4) The hero downloads the full film (7.9 MB phone, 14.3 MB desktop) before the visitor scrolls and holds roughly 0.9–1.0 GB of memory once loaded; the unpublished "frame pack" change cuts requests but not weight or memory. (5) Trust content is thin: no reviews, city pages that differ by one word, project pages with one photo, and FAQ answers that are not in the page's HTML.

## Findings, ranked by impact

Where: **(a)** Framer editor, **(b)** code components, **(c)** needs the owner. Effort: S under an hour, M half a day, L more.

| # | Area | Finding | Evidence | Recommended fix | Effort | Where |
|---|---|---|---|---|---|---|
| 1 | SEO / conversion | Site cannot be indexed and the Framer badge covers the main phone CTA | Response header `x-robots-tag: noindex` on every page (Lighthouse SEO 66–69, only failing audit `is-crawlable`). Canonicals point at `framer.app` while JSON-LD `url` says `illuminated-exteriors.com`. Badge at x 230–370, y 786–824 over the "Free Design" button: `screens/home-390-fold.png` | Move to Basic and connect the custom domain; both should clear (not verifiable here). Then re-check the header, canonicals and sitemap host | S | (c) then (a) |
| 2 | Layout (phone) | City pages: "Recent installs" is broken on phones. The three project cards collapse; names and photos are not visible | Card links measure 350 × 1 px at 390 (397 px tall at 810 and 1440). All 8 city pages. `screens/areas_omaha-390-recent-installs.png` | Fix the phone breakpoint of the city template: give the card stack a "fit content" height / remove the fixed height or negative gap | S | (a) |
| 3 | Conversion (phone) | Fixed bottom bar covers the hero's chapter buttons ("Put Halloween on my house", etc.) and the "See every occasion" link. The hero stage is 100svh but starts under the 76 px nav, so its bottom 76 px is below the fold on first paint at every width (tablet CTA is cut) | Bar occupies y 769–844; chapter CTA sits at y 765–812 in all four chapters. `screens/home-390-hero-2-halloween.png`, `screens/home-810-fold.png`. Code: `ScrollVideoHero.tsx` lines 93, 99–100, 125 | Add "top offset" and "bottom inset" properties: stage `top: <nav>`, `height: calc(100svh - nav)`, overlay bottom padding = bar height on phones. Or hide the bar while the hero is on screen | S | (b) or (a) |
| 4 | Performance | Hero memory. Every frame is force-decoded and kept, so the "memory window" does not bound memory | Harness, real packs: renderer memory 245 → 875 MB (phone) and 279 → 1,020 MB (desktop) after load, and it stays there after scrolling past the hero. Long tasks while scrolling at 4× CPU slowdown: 11 tasks, 6.0–6.6 s total, longest 0.7–1.4 s. Code: `frameSequence.tsx` line 139 (`await img.decode()`), line 144 (keeps every `<img>`) | Keep only the compressed blobs; decode `ImageBitmap`s from blobs for the window plus a sparse set. A test build of this measured 448 MB phone / 614 MB desktop and 0–2 long tasks (120 ms). Dropping only the `decode()` call measured 412 / 563 MB | M | (b) |
| 5 | Performance | The full film downloads on every animated visit before any scroll | Harness: all 3 phone packs (1.0 + 3.8 + 3.1 MB) or 4 desktop packs (1.9 + 4.3 + 4.1 + 4.0 MB) requested within 1 s of load. On emulated slow 4G (1.6 Mbps) the first frame draws at 9.2 s and the last pack lands at 45 s. Live today: 244 / 330 frame requests, 8.1 / 14.0 MB | Load pack 1 only (it holds every 8th frame, enough for the intro with blending); fetch the rest on first scroll or when idle. Consider a shorter or lower-quality phone film | S–M | (b) |
| 6 | Conversion | Quote form delivery is unverified. FormSubmit needs a one-time activation click from info@ before any request arrives | `BookingForm.tsx` line 639; HANDOFF step 5. Not tested: read-only audit, and `formsubmit.co` is blocked from this environment | Owner sends one real test request from a phone and confirms the email (with photo) arrives | S | (c) |
| 7 | SEO | City pages are 99% identical; project pages are thin | Visible text of the 8 city pages: 245 words each, 98.8–99.2% word-level match, only the city name differs; same three projects on each. Project pages: title, one tag and one photo shown twice (`screens/our-work_three-car-ranch-390.jpg`); all 9 share one meta description | Per city: 2–3 true local sentences (neighborhoods, a local install, drive time). Per project: neighborhood, scene, a line about the job. Until then expect little search value from these 17 pages | M | (c) + (a) |
| 8 | SEO / a11y | FAQ answers and hero chapter copy are not in the served HTML | `/faq` HTML has 0 rendered occurrences of "12-month" (only inside script data); answers mount on click. Chapter titles: 0 occurrences in Home HTML. FAQ buttons have no `aria-expanded` | Build the accordion so the answer stays in the DOM (collapsed height, not a swapped variant) and check the unpublished static version the same way. Repeat the four chapter lines as plain text in the Occasions section | M | (a) |
| 9 | Performance | Fonts are half of a light page | 312–340 KB of fonts per page; `/faq` totals 618 KB. Three Montserrat weights at 82 KB each from Fontshare; IBM Plex Mono has no `font-display: swap` (Lighthouse `font-display`) | Switch Montserrat to the Google Fonts source (subsetted, roughly a quarter of the size) and use two weights | S | (a) |
| 10 | Trust | Little proof beyond photos | No reviews, rating, system brand, insurance or price guidance anywhere. Home cards print a literal "CITY" label; 7 of 9 projects are tagged "OTHER", so the occasion filter is nearly empty (`screens/our-work-390.jpg`) | Owner supplies real reviews, neighborhoods, the system brand and what the 12-month warranty covers. Hide the City label until filled; re-tag projects | M | (c) + (a) |
| 11 | Readability | Text over photos falls below 4.5:1 | Measured from screenshots (approximate): desktop closing-section lede 1.5–2.1:1 and phone number 3.5:1 (`screens/home-1440.jpg`, bottom); "ONE OF OUR INSTALLS" caption 1.5:1 (`screens/free-design-390.jpg`); phone hero eyebrow 3–4:1 at 11.5 px (`screens/home-390-hero-0-intro.png`). Text on solid backgrounds passes (lowest 5.5:1) | Add a dark gradient behind the closing-section copy; move the caption onto the solid background; start the hero scrim higher on phones | S | (a) + (b) |
| 12 | Accessibility / SEO | Real install photos have no alt text | Empty `alt` on 9 of 9 images on Our Work, 3 on Home, 4 per city page, 2 per project page | Fill the CMS image alt field and bind it | S | (a) |
| 13 | Performance | Hero poster is not optimised for LCP | On phones the server HTML carries the desktop poster; the phone poster is requested only after JavaScript runs (Lighthouse: "request is discoverable in initial document: false"). Posters and backgrounds are 5504 × 3072 PNGs, 204–327 KB each on desktop | Render the poster as `<picture>` with a phone `<source>`; re-upload the three PNGs as WebP or JPEG at 2400 px | S | (b) + (a) |
| 14 | UX | The scroll film is long | Phone: hero is 4.2 screens before any other content. Desktop: hero 720svh + Occasions 415svh are about 65% of a 15,777 px page | Judgment: try Scroll length 400–450 and fewer Occasions steps; keep the film, shorten the walk | S | (a) |
| 15 | Performance | Tablets in portrait get the 16:9 desktop film | `useDeviceTier.tsx`: `narrow` is `max-width: 809px`; at 810 px the page made 356 requests and drew the wide film cropped | Choose the 9:16 set by orientation (portrait), not width alone | S | (b) |
| 16 | Copy / form | Small wording and behaviour gaps | Home and city pages show "Your home, after dark. Let's design it." twice in a row (section and form). Success says "You're booked in." though nothing is booked. Form offers "Weekend" visits; footer says Mon–Fri 9–5. Photos over 10 MB are dropped silently (line 526). Success-state phone number is not a tap-to-call link. Consent label renders bold | Form heading "Tell us about your home."; success "Request received."; owner confirms visit times; add a "photo too large" message; make the number a `tel:` link | S | (b) + (c) |
| 17 | Phone layout | `/free-design`: the form starts about 800 px down, below the photo | `screens/free-design-390.jpg` | On phones put the form directly under the three bullets, photo after | S | (a) |
| 18 | Tap targets | Several links are under 44 px tall | Footer links 19 px (32 px pitch), "See all our work" and "All questions" 18 px, hero text link 31 px, consent checkbox 13 × 18 px. Bar buttons (43 px), menu links (52 px), form fields (50 px) are fine | Add vertical padding to footer and "see all" links; enlarge the checkbox | S | (a) + (b) |
| 19 | SEO polish | No share image, default Framer favicon, no `<main>` landmark, Our Work has no headings below the H1 | No `og:image` on any page; favicon is Framer's default; landmarks found: nav and footer only | Add a social image and favicon in Site Settings; tag the page body as Main; make project names H2 | S | (a) |
| 20 | Code | The animation loop never stops if a frame fails to load | Code reading, not measured: `frameSequence.tsx` line 141 skips the failed frame without counting it, so `loadedCount < count` stays true (`ScrollVideoHero.tsx` line 300) | Count failures as settled | S | (b) |

**Framer's lint warning (negative spacing in Home's phone breakpoint, node pJ54fVzxW):** on the live Home page at 390 px I found no visible overlap between sections (`screens/home-390.jpg`). The only overlap is the fixed bar over the hero buttons (#3), which has a different cause. Likely harmless as rendered, possibly from the hidden Day/Night section, but I could not open the canvas to confirm. The visible phone breakage is on the city pages (#2).

## Lighthouse (before = live site, Lighthouse 12.8.2, one run each)

| Page | Device | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT | Transfer | Requests |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | Mobile | 70 | 100 | 96 | 69 | 7.8 s | 0.04 | 90 ms | 9,523 KiB | 293 |
| Home | Desktop | 82 | 100 | 96 | 69 | 2.6 s | 0.04 | 0 ms | 15,932 KiB | 373 |
| Our Work | Mobile | 77 | 100 | 96 | 69 | 6.9 s | 0.03 | 30 ms | 1,580 KiB | 40 |
| Our Work | Desktop | 100 | 100 | 96 | 69 | 0.7 s | 0.01 | 0 ms | 1,016 KiB | 40 |
| FAQ | Mobile | 100 | 100 | 96 | 66 | 1.0 s | 0.06 | 30 ms | 618 KiB | 27 |
| FAQ | Desktop | 100 | 100 | 96 | 66 | 0.4 s | 0.01 | 0 ms | 618 KiB | 27 |
| City (Omaha) | Mobile | 80 | 100 | 96 | 69 | 5.4 s | 0.03 | 40 ms | 978 KiB | 38 |
| City (Omaha) | Desktop | 89 | 100 | 96 | 69 | 2.2 s | 0.04 | 0 ms | 1,132 KiB | 37 |
| Free Design | Mobile | 81 | 100 | 96 | 69 | 5.1 s | 0.05 | 40 ms | 664 KiB | 26 |
| Free Design | Desktop | 96 | 100 | 96 | 69 | 1.4 s | 0.01 | 0 ms | 759 KiB | 26 |

Reading the table:

- Mobile LCP is Lighthouse's slow-4G simulation. Unthrottled, the same runs painted LCP in 0.2–1.6 s. No field data exists for this address.
- Home mobile spent 16.2 s on the main thread, mostly decoding frames. TBT stays low because the work is spread out.
- Largest resources: the film (8.1 MB phone, 14.0 MB desktop from the Higgsfield host); PNG stills at 204–327 KB each; `framer.*.mjs` 111 KB; three Montserrat files at 82 KB each. Our Work photos are sent at 1024 px for 350 px slots (estimated 563 KiB saving on mobile).
- Render-blocking resources: none. Unused JavaScript: an estimated 81–97 KiB of about 318 KiB, all Framer's runtime, not controllable from the editor.
- SEO 66–69 is entirely the `noindex` header (#1). Best practices 96 is this test environment: Framer's on-page editor script host is blocked by the proxy.

**What changes when the unpublished hero goes live.** Measured in the harness: frame requests fall from 240 / 330 to 3 / 4, the Higgsfield dependency ends, and the first frame draws about 0.2 s after load locally. Not changed: bytes (packs total 8.05 MB phone, 14.3 MB desktop), main-thread decode work, or memory. Expect a modest gain in Home's simulated mobile score from fewer competing requests; I could not run Lighthouse on unpublished pages. The larger gains need #4, #5 and #13. The static FAQ lists should be checked against #8 after publishing. The live code also fires 4 frame requests under reduced motion; the repo code fires none (harness-verified).

## What passed

- No horizontal scroll on any of 23 pages at 390, 810 and 1440 (69 page loads).
- One H1 per page; unique titles and descriptions on the six main pages and eight city pages; `robots.txt` allows all; sitemap lists all 23 URLs; one LocalBusiness JSON-LD block per page with no invented fields.
- Keyboard: logical tab order on Home, FAQ and Our Work; a visible focus ring on links and buttons (`screens/focus-ring-nav-1440.png`), though the Our Work filter shows only a thin gold border when focused (`screens/focus-ring-filter-1440.png`); menu button is labelled; accordions are real buttons.
- Motion: reduced-motion gives a one-screen still hero, no canvas, no video; Save-Data requests no packs; Pause motion is on every page. Flashing was not re-measured; the repo documents 0 flashes per second for the loops.
- Form: labelled fields, 16 px inputs, correct phone keyboards and autofill hints, clear error text with focus moved to the first error, an out-of-area path that still lets the visitor continue (`screens/free-design-390-form-*.png`).

## Not tested

- Real iPhones or Android phones, and Safari. Memory and jank figures are headless Chromium on Linux with emulated throttling; treat them as relative, not absolute.
- Form submission and email delivery; `illuminated-exteriors.com` (blocked here); the Framer editor and the three unpublished changes as they will render in Framer.
- Screen readers. Video loop playback (this Chromium lacks the codec, so loops show their stills in screenshots).
- The live site reports "Published Nov 11, 2026, 2:24 AM UTC" but still loads single frames from Higgsfield, consistent with the hero change being unpublished.

## Files

- `screens/`: full-page captures `<page>-<width>.jpg` and first-screen captures `<page>-<width>-fold.png` for all 23 pages at 390, 810 and 1440, plus hero scroll states, menu, form steps, reduced motion and focus rings (about 60 MB).
- `lighthouse/`: the ten HTML reports. `data/`: crawl, accessibility-check and hero-harness measurements.
