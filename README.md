# Illuminated Exteriors: Framer site kit

A production kit for rebuilding illuminated-exteriors.com in Framer as the "Night Side" experience: a scroll-scrubbed cinematic hero, a scene switcher for every occasion, a day/night proof slider and a three-step booking flow, built on the brand's real gold-and-blue identity.

A family project, kept in its own repository: nothing here belongs to or touches Lifetime Retirement Partners.

## Business facts (from the live GoDaddy site, 2026-10-18)

| Item | Value |
|---|---|
| Market | Omaha and Elkhorn, NE; jobs within about 50 miles |
| Phone | 402-699-6256 |
| Hours | Mon–Fri 9:00 AM–5:00 PM; closed weekends |
| Facebook | facebook.com/illuminatedexteriors |
| Current site | GoDaddy Website Builder; quote form (name, email, phone, address, attachments); "10% off your first service" newsletter offer; empty reviews section |
| Lighting system | Likely **EverLights** (a gallery file is named "EverLights Ad Palm Tree House"). Confirm with the owner. |
| Teams | Nebraska Cornhuskers (scarlet and cream), Creighton Bluejays (blue and white) |

**Gallery honesty flag:** at least two current gallery images ("EverLights Ad Palm Tree House", "Downward Facing FL Rambler") look like manufacturer marketing photos rather than Omaha installs. In the new site, "Our Work" shows only their own jobs; manufacturer images, if used at all, go on How It Works with a credit.

**Trademarks:** scene names use colors ("Red & White Game Day"), not team names or logos. Using "Huskers" or "Bluejays" in ads implies a university affiliation; skip it unless they hold a license.

## What's here

| Path | What it is |
|---|---|
| `framer/` | Framer code components (TypeScript and React, framer-motion only; no other dependencies) |
| `framer-ai-prompts.md` | Step-by-step Framer build: design system, CMS, Framer AI prompts per section and page, SEO, launch checklist |
| `higgsfield-prompts.md` | Production prompts for every visual: the hero film, scene loops, the day/night pair and supporting stills |
| `scripts/make-frames.sh` | Turns the Higgsfield renders into web assets (frame sequences, loops, stills) |

## Architecture

```
tokens.tsx          design + motion tokens (colors, fonts, easings, durations)
store.tsx           shared page state: chosen scene, "interacted", motion paused
useDeviceTier.tsx   high / medium / low / still tier from pointer, memory, network, reduced motion
frameSequence.tsx   progressive image-sequence loader + cover drawing (no UI)

MagneticButton      the one button: primary (gold, 6px magnetic), secondary, text link;
                    can rewrite itself to "Put {scene} on my house"
ScrollVideoHero     sticky canvas scrubbing the hero film; ignition intro; clock HUD
OccasionScenes      scene chips + inline [scene] words + scroll-driven seasons; crossfading loops
DayNightSlider      before/after comparison; touch-safe; real range input for keyboard/AT
BookingForm         3 steps, ZIP service-area check + waitlist, draft save, multipart POST
LumenCursor         warm halo over night imagery only; system cursor always stays
MotionToggle        global Pause motion (WCAG 2.2.2)
```

Presentation lives in the components; logic that isn't UI (state, tiering, frame loading) lives in the shared modules. Components talk only through `store.tsx`: picking a scene in `OccasionScenes` personalizes every `MagneticButton` that has Personalize on, and pre-fills the form.

## Device tiers and fallbacks

| Tier | Who | Hero | Scenes | Cursor and magnetism |
|---|---|---|---|---|
| high | Mouse and trackpad, wide screen | 16:9 frames, DPR up to 2 | Loops, scroll-driven seasons | On |
| medium | Tablets, phones | 9:16 frames (if provided), DPR 1.5, shorter scroll | Loops, chips only | Off |
| low | Save-Data, 2G/3G, ≤2 GB memory, ≤2 cores | Lit still, normal-height section | Stills | Off |
| still | prefers-reduced-motion | Lit still, normal-height section | Stills | Off |

Plus: **Pause motion** freezes loops, the intro, the halo and magnetism at any tier. Inside the Framer editor, components render static previews.

## Performance budget

- **Hero:** the poster paints first and is the LCP image. Frames load coarse to fine (first, last, then every 64th, 32nd … frame), so scrubbing works within about a second and sharpens as the rest arrive. Target 6–9 MB total for 180 desktop frames and 2–4 MB for 120 phone frames, never loaded on low or still tiers.
- **Rendering:** one requestAnimationFrame loop that runs only while something changes and the hero is on screen. The canvas redraws only when the frame index changes.
- **Loops:** only the visible loop, the one fading out, and one warmed on hover are ever mounted. Loops pause off screen.
- **DOM motion:** transform and opacity only.

## Install in Framer

Follow `framer-ai-prompts.md` steps 1–5. In short: add the fonts and color styles, create one code file per `.tsx` in `framer/` **with the same file name**, then place the components and fill their properties.

## Producing the visuals

1. Generate the assets in the order in `higgsfield-prompts.md` (K1 → K2 → V1 → scenes → D1 → extras).
2. `bash scripts/make-frames.sh hero V1-16x9.mp4 V1-9x16.mp4`, then upload `out/hero/16x9` and `out/hero/9x16` to a CDN (Cloudflare R2 or Bunny cost a few dollars a month at this size).
3. `bash scripts/make-frames.sh loop L2.mp4 game-day` for each scene; upload loops and stills into the component properties.

## Verified (2026-10-18)

- TypeScript strict typecheck passes for all components, against a stub of the `framer` module.
- Browser smoke test (headless Chromium, desktop 1440 and phone 390) with placeholder frames and loops:
  - **Hero:** the ignition intro runs to 6:23 PM; scrolling scrubs to 6:43 PM.
  - **Scenes:** chips and inline scene words switch scenes; the CTA rewrites to "Put Game Day on my house"; a WebM loop plays; Pause motion swaps loops for stills.
  - **Slider:** the keyboard Home key moves the slider; the caption updates.
  - **Form:** validation messages, out-of-area waitlist, in-area city confirmation, scene pre-fill following the latest choice, phone formatting, and a POST with every field, then the success state.
  - **Phone layout:** no horizontal overflow at 390 px.
  - **Reduced motion:** no canvas; the hero collapses to one screen.
- `make-frames.sh` produced 180 + 120 frames, posters and a loop from test clips.

**Not verified:** the components inside the Framer editor itself (Framer's runtime wasn't available here), H.264 playback (the test browser lacks the codec; real Chrome, Safari and Firefox play it), and real footage weights.

## Known limits and decisions

- **Image sequence instead of scrubbing an MP4:** seeking video on scroll stutters on iOS Safari; frames don't.
- **Game Day team colors:** with pre-rendered loops, the visitor picks from produced scenes rather than any color. Free color choice needs the real-time WebGL house from the earlier prototype; it's a possible phase 2.
- **Form endpoint (email):** set Endpoint to `https://formsubmit.co/ajax/<their email>`. FormSubmit is free and needs no account; the first submission sends a one-time activation email to that address, and every request after that arrives as an email with the photo attached. The subject line is "Free design request · <name> · <area>". Without an endpoint, the form shows its error state and logs a console warning.
- **Service area:** defaults to ZIP prefixes for the Omaha metro, Lincoln and southwest Iowa. ZIPs outside the list can still send ("we'll confirm we can reach you"), so no lead is lost on the 50-mile boundary; the email marks them `in_service_area: no, confirm`.
- **defaultProps:** used for Framer's property defaults; React may log a deprecation notice in development only.
