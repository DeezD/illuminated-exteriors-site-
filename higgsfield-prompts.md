# Illuminated Exteriors: Higgsfield production prompts

Prepared 2026-10-18. Higgsfield project: **"Illuminated Exteriors – Website Visuals"** (all outputs go to its default folder). Account balance at start: 2,862 credits (Ultra). Nano Banana 2.1 at 4K quoted **3 credits for 4 images**, so stills are cheap; check the quote before each video job.

**Status (2026-10-18):** K1 round 1 → owner picked option 2 and asked for a more frontal view. Round 2 (4 frontal options, edits of option 2) is generated and awaiting a pick. That pick becomes **F0** below.

**References in Higgsfield** (imported from the public images on illuminated-exteriors.com, used for architectural style and lighting-channel look only, never copied):
`GU4A8773-HDR-3.jpg`, `Jakubowski Color.jpg`, `Midwestern Metal Build Home.jpg`, `Fry.JPG`. The purple-lit colonial photo sent in chat couldn't be uploaded from this environment (network block); upload it through the Higgsfield web app if wanted.

## What this produces, and where each asset goes

| # | Asset | Model (recommended) | Format | Used by |
|---|---|---|---|---|
| K1 | Hero start frame: the house at sunset, lights off | Nano Banana 2.1 (fallback FLUX 3 Image) | Still, 16:9 at 4K + 9:16 at 2K | Hero poster, film start frame |
| K2 | Hero end frame: blue hour, roofline lit warm white | Nano Banana 2.1 editing K1 | Still, both ratios | Film end frame, lit still, loops' base |
| V1 | **Hero film**: sunset → blue hour, slow dolly, roofline ignites | FLUX 3 Video (start + end frame), alt MiniMax H3 | 16:9 and 9:16, 10–12 s, no audio | `ScrollVideoHero` (as a WebP frame sequence) |
| S1–S6 | Scene stills: same frame as K2, new colors | Nano Banana 2.1 editing K2 | Still, 16:9 + 4:5 | `OccasionScenes` posters, loop frames |
| L1–L6 | Scene loops: lights animate, camera locked | MiniMax H3 (start = end frame for a seamless loop) | 16:9, 6 s | `OccasionScenes` loops |
| D1 | Day version of K2's frame, lights off, track hidden | Nano Banana 2.1 editing K2 | Still 16:9 + 4:5 | `DayNightSlider` |
| M1 | Macro: one light pixel in the trim-matched track | FLUX 3 Image, then FLUX 3 Video push-in | Still + 5 s clip | How It Works page |
| H1 | Headlight sweep: car arrives, walkway lights | FLUX 3 Video from K2 | 16:9, 6–8 s | Optional "Everyday and safety" moment |
| P1 | Phone in hand, porch at night, **blank screen** | Nano Banana 2.1 | 4:5 | "Your phone is the switch" (UI composited later) |
| W1 | Wide final frame: house small under the night sky | Nano Banana 2.1 editing K2 | 16:9 + 9:16 | Dome CTA background (gold arc added in Framer) |
| O1 | Social and link-preview image | Crop of K2 or S-scenes | 1200×630, 1080×1350 | Open Graph, social posts |

**Rule that keeps it all consistent:** K1 is generated once, then **every later image is an edit of K1 or K2, and every video starts from one of those stills.** Never prompt the house from scratch twice.

---

## Before you generate

1. **Honesty line (non-negotiable).** These renders are illustrations of the product. They go in the hero, the scene demo and the How It Works visuals. They **never** appear in "Our Work," reviews or anywhere a visitor would read them as a real customer's home; those sections use real project photos only. Representing AI renders as completed installs risks an FTC deceptive-advertising problem and would undercut the trust section.
2. **Pick the house.** Modern farmhouse to match their portfolio. If the owner has a favorite real project, use its photo as a **style reference only** (massing and materials) and change the address-identifying details. Get the homeowner's OK first.
3. **Upload references through Higgsfield**, not this chat: the Higgsfield server can't read images attached to a Claude conversation. Use the Higgsfield upload widget or `media_upload`.
4. **Lock the seed** (where the model offers one) once K1 looks right, and note it next to the asset name.

---

## Master style block (paste at the end of every prompt)

```
STYLE: Photoreal architectural photography, not CGI-glossy. Shot on a full-frame camera,
32mm lens, tripod at 1.4 m eye height from the end of the driveway, three-quarter front view,
house occupying the right two-thirds of the frame with open sky above and calm negative space
on the left for website text. Natural perspective, verticals corrected, no fisheye, no tilt.

HOUSE (identical in every shot): two-story modern farmhouse, white board-and-batten siding,
charcoal standing-seam metal roof accents over the porch, dark asphalt shingle main roof,
three front-facing gables of different heights, warm limestone stone base on the lower front,
black window frames, a covered front porch with a wood door, two-car garage on the right with
a dark carriage-style door, concrete driveway, short concrete walkway, low boxwoods,
two young ornamental trees, a mature evergreen at the far left. Suburban lot, no neighbors visible.

PERMANENT LIGHTS: a single continuous run of small individual round LED pixels, evenly spaced
about 9 inches apart, mounted in a slim aluminum channel tucked under the roof edge and along
every gable rake. The channel is painted the exact color of the white trim, so it is invisible
when the lights are off. Each pixel reads as a small soft point with a gentle halo, never a
string of bulbs, never rope light, never icicle lights. The lights are only along the roofline,
nothing in trees, nothing on windows.

LIGHT AND COLOR: blue-hour atmosphere, deep navy sky fading to a soft indigo horizon,
very light haze, faint first stars. Warm 2700K interior glow in a few windows. Subtle realistic
reflections of the roofline lights on the metal roof and the slightly damp driveway.
Color palette leans navy, black and warm gold.

AVOID: text, words, numbers, logos, signs, house numbers, watermarks, people, faces, cars
unless asked, snow unless asked, string lights, inflatable decorations, lawn ornaments,
lens flares, oversaturated colors, plastic CGI look, warped or curved roof lines,
misaligned or uneven pixel spacing, lights inside windows, visible cables or clips.
```

---

## The Year in One Scroll (owner's vision, 2026-10-18)

The house stays put. As the visitor scrolls, the sun sets and the roofline lights up, then the year plays through: **Halloween → Christmas → red-and-white game day → blue-and-white game day.** This replaces the separate scene-loop section on desktop; the `OccasionScenes` chips stay below the hero as the "pick any scene" control.

**Why a locked camera:** every segment starts and ends on a shared still, so the cuts are invisible and scrubbing backward works. The site adds a slow 1.00 → 1.06 zoom with CSS for a sense of travel, which avoids the house drifting between AI shots.

**Season logic:** autumn leaves arrive for Halloween; snow arrives at Christmas and stays through both game days (winter football bowl season and basketball season). This keeps the environment consistent and avoids snow disappearing and reappearing.

### Keyframes (stills, Nano Banana 2.1, 4K, 16:9, each an edit of the previous)

| ID | Edit of | Prompt (append "Keep the house, framing and camera identical. Nothing else changes." + master style) |
|---|---|---|
| F0 | — | The chosen frontal sunset frame, lights off |
| F1 | F0 | Blue hour, 6:46 PM: deep navy sky, faint stars. Every roofline LED pixel on in warm 2700K white with a soft wash on the siding below the eaves; windows warmer; three low path lights on the walkway |
| F2 | F1 | Full night on Halloween: scattered autumn leaves on the lawn and walkway, three carved pumpkins glowing on the porch steps. Roofline pixels in alternating groups of three, pumpkin orange and violet |
| F3 | F2 | Christmas Eve night: a fresh blanket of snow on the roofs, lawn and shrubs, light snow falling, a green wreath on the front door; pumpkins and leaves gone. Roofline pixels in alternating pairs of red, green and warm white |
| F4 | F3 | Same snowy winter night, no falling snow, wreath gone. Roofline pixels in alternating groups of five, scarlet red and warm cream white. No logos, letters or team names anywhere |
| F5 | F4 | Same snowy winter night. Roofline pixels in alternating groups of five, royal blue and bright white. No logos, letters or team names anywhere |

### Segments (videos, MiniMax H3, 2K, 16:9, no audio; start image → end image)

| ID | Start → end | Length | Motion prompt (camera locked for every segment: "Locked-off tripod shot, the camera does not move, no zoom") |
|---|---|---|---|
| V1 | F0 → F1 | 10 s | The sun finishes setting and the sky deepens to navy. At about 3 seconds the roofline pixels switch on one at a time, racing outward from the front-door gable along every eave and rake until the whole roofline glows warm white by about 7 seconds; windows warm; path lights fade up |
| V2 | F1 → F2 | 6 s | A few autumn leaves drift down; the pumpkins flicker on. The roofline color sweeps from the center outward, warm white turning to orange and violet |
| V3 | F2 → F3 | 6 s | Snow begins to fall and settles on the roofs and lawn; the leaves and pumpkins disappear under it; the wreath appears. The roofline color sweeps to red, green and warm white |
| V4 | F3 → F4 | 6 s | The snowfall eases and stops. The roofline color sweeps to scarlet and cream |
| V5 | F4 → F5 | 6 s | Still winter night. The roofline color sweeps to royal blue and white |

Every color change is a smooth sweep, never a flash (stay under 3 flashes per second).

**Cost at today's prices:** keyframes ≈ 1 credit each; segments 2 credits/second → 68 credits for 16:9. A 9:16 phone set (outpaint F0–F5 to 9:16, then the same five segments) adds about 68 more. Budget about 150 credits for both, plus one retry per segment if needed (about 300 worst case).

### Assembly

```bash
bash scripts/make-film.sh film-16x9.mp4 1.5 V1.mp4 V2.mp4 V3.mp4 V4.mp4 V5.mp4
DESKTOP_FRAMES=330 bash scripts/make-frames.sh hero film-16x9.mp4 film-9x16.mp4
```
`make-film.sh` holds each lit scene for 1.5 s and prints the "Intro to", "Copy lights at" and chapter "Starts at" values to paste into the hero. The hero's defaults already match a 10 + 4×6-second cut with 1.5 s holds.

---

## 1. Hero keyframes (stills)

### K1: start frame, sunset, lights off
**Model:** Nano Banana 2.1, 4K, 16:9 (thinking level: high). Generate 4 options, pick one, then lock it.

```
The exterior of a two-story modern farmhouse photographed from the end of its driveway
at sunset, 6:12 PM in autumn. The sun has just set behind the viewer; the sky is a gradient
from soft amber at the horizon through dusty mauve to deep blue at the top. The house is in
soft, even shade. The permanent roofline lights are OFF and the trim-matched aluminum
channel is completely invisible against the white fascia. Two windows show a faint warm
interior glow. Calm, quiet, expectant.
[MASTER STYLE BLOCK]
```

Then make the vertical version: **edit K1** with "Extend this exact scene to a 9:16 vertical frame. Keep the house, the camera position and the lighting identical; add sky above and driveway below. The house stays centered horizontally." (Use Higgsfield's outpaint or reframe tool if the model crops instead.)

### K2: end frame, blue hour, lights on (warm white)
**Model:** Nano Banana 2.1, editing **K1** (K1 as the reference image), 4K.

```
Edit this exact photograph. Keep the house, framing, camera position, materials and landscaping
identical. Change the time to 6:46 PM blue hour: the sky becomes deep navy with a soft indigo
glow near the horizon and a few faint stars. Turn ON the permanent roofline lights: every LED
pixel along every eave and gable rake glows a warm 2700K white, evenly spaced and evenly bright,
casting a soft warm wash down the white siding directly beneath the roof edges. Interior windows
glow warmer. The walkway has three low path lights. Add subtle reflections of the roofline on
the metal porch roof and damp driveway. Nothing else changes.
[MASTER STYLE BLOCK]
```

Repeat for 9:16 by editing the 9:16 K1.

**K-check before moving on:** pixels follow every roof edge without gaps; spacing is even; the trim channel isn't visible in K1; the house in K1 and K2 overlays exactly (toggle between them; nothing should shift).

---

## 2. V1: the hero film (scroll-scrubbed)

**Model:** FLUX 3 Video, start image = K1, end image = K2, 1080p (2K if the quote is reasonable), 12 s, **generate_audio: false**. Make the 16:9 version, then repeat with the 9:16 K1/K2 pair. Alternative: MiniMax H3 (2K, start + end frame).

```
A single continuous, unhurried shot. The camera performs a very slow, perfectly smooth dolly
forward up the center of the driveway, moving about four meters over the whole clip,
at constant eye height, with no rotation, no shake and no zoom. Time passes from sunset to blue
hour: the amber horizon fades and the sky deepens to navy. At about two seconds in, the
permanent roofline lights switch on one pixel at a time, starting at the front door gable and
racing outward along every eave and gable rake until the whole roofline is lit in warm white,
finishing by about six seconds. The pixels then hold steady. Interior windows warm up slightly
after the roofline completes. The house, landscaping and materials stay exactly the same
throughout. Ends exactly on the provided end frame.
[MASTER STYLE BLOCK]
```

**Why these choices:** the website scrubs this film with scroll, so it needs constant camera speed (scrubbing exposes any speed change), no cuts, no audio, and an ending that matches K2 exactly, since K2 is also the "lit still" for reduced-motion visitors.

**If the model won't do the pixel-by-pixel trace cleanly** (common: lights fade in all at once or flicker): generate the shot without the ignition ("the roofline lights glow softly from the start") and build the trace in DaVinci Resolve or After Effects with a soft-edged mask that travels along the roofline over K1 → K2. It takes about 30 minutes and gives exact control. This is the most likely place you'll need a manual fix.

**Hand-off:** `bash scripts/make-frames.sh hero V1-16x9.mp4 V1-9x16.mp4` creates 180 desktop and 120 phone frames plus the posters. Upload `out/hero/16x9` and `out/hero/9x16` to a CDN and paste `https://<cdn>/hero/16x9/{n}.webp` into the hero's "Frames" property.

---

## 3. Scene stills and loops (Every Occasion)

### Stills S1–S6
**Model:** Nano Banana 2.1, **editing K2** (16:9), then the same edit on a 4:5 crop of K2 for phones.

Base prompt (fill in the line in brackets):
```
Edit this exact photograph. Keep the house, framing, sky, windows and landscaping identical.
Change ONLY the color of the permanent roofline LED pixels to: [SCENE COLORS]. Every pixel
stays the same size, spacing and brightness; the soft wash on the siding below the eaves takes
on the new colors. Nothing else changes.
[MASTER STYLE BLOCK]
```

| ID | Scene | [SCENE COLORS] | Loop motion (for L-clips) |
|---|---|---|---|
| S1 | Everyday | warm 2700K white on every pixel | Steady; only the faintest natural shimmer |
| S2a | Red & White Game Day (Husker Saturdays) | alternating groups of five pixels in scarlet red (#E41C38) and warm cream white (#F5F1E7) | A slow chase moving left to right |
| S2b | Blue & White Game Day (Creighton hoops) | alternating groups of five pixels in royal blue (#005CA9) and bright white | A slow wave of brightness rolling along the roofline |
| S3 | Birthday | repeating groups of three in hot pink, aqua and sunshine yellow | A gentle chase |
| S4 | July 4th | repeating groups of four in red, white and blue | A slow wave of brightness rolling along the roofline |
| S5 | Halloween | alternating groups of three in pumpkin orange and violet | A soft, irregular ember flicker |
| S6 | Christmas | alternating pairs of red, green and warm white | A slow classic twinkle |

Never put team names, logos or mascots in the images or the prompts' output; colors only (trademark).

### Loops L1–L6
**Model:** MiniMax H3, 2K, 16:9, 6 s, **start image = end image = the scene still** (this is what makes the loop seamless).

```
Locked-off tripod shot; the camera does not move at all. The house and sky are completely still,
with only a barely perceptible drift of haze. The permanent roofline LED pixels animate in this
pattern: [LOOP MOTION]. The pattern moves slowly and smoothly: no strobing, no rapid flashing,
no more than two brightness pulses per second at any point. The clip begins and ends on the
same frame so it can loop seamlessly.
[MASTER STYLE BLOCK]
```

**Flash-safety check (WCAG 2.3.1):** watch each loop full-screen. If any area flashes more than 3 times per second, regenerate it or slow it in the edit. The Pause motion control covers the rest.

**Hand-off:** `bash scripts/make-frames.sh loop L2.mp4 game-day` creates the MP4 and its still. Drop both into the matching scene row of the `OccasionScenes` component.

---

## 4. D1: day/night pair (Invisible by Day)

**Model:** Nano Banana 2.1, editing **K2**, 16:9 and 4:5.

```
Edit this exact photograph. Keep the house, framing and camera position identical. Change the
time to a clear, bright late-morning in early autumn: soft blue sky, gentle sun from the left,
natural soft shadows. The permanent roofline lights are OFF, and the slim aluminum channel
under the roof edge is painted exactly the same white as the fascia trim, so the roofline looks
completely clean, with no visible lights, clips or wires. Windows look normal in daylight.
Nothing else changes.
[MASTER STYLE BLOCK]
```

**Check:** overlay D1 on K2 at 50% opacity in any editor. The roof edges must line up, or the slider will visibly "jump."

---

## 5. M1: the pixel macro (How It Works)

**Still (FLUX 3 Image, 4K, 16:9):**
```
Extreme close-up product photograph of a permanent exterior lighting system under the edge
of a roof: a slim satin-white aluminum channel mounted flush beneath white fascia, with three
round frosted LED pixel lenses visible, about nine inches apart. The middle pixel is lit warm
white and glows softly; the outer two are off and nearly invisible. Shallow depth of field,
night, dark navy background, crisp detail on the brushed aluminum and the frosted lens. Clean,
premium, technical. No text, no logos, no screws visible on the face.
```
**Clip (FLUX 3 Video, start image = the still, 5 s, no audio):** "Very slow push-in toward the lit pixel; the two outer pixels warm up one after the other until all three glow. No camera shake."

The site's file names point to **EverLights**. Once the owner confirms, use EverLights' own product photos and specs for any technical claims, and keep M1 as a mood image only.

---

## 6. H1: headlight sweep (optional)

**Model:** FLUX 3 Video, start image = K2 (Everyday), 8 s, no audio.
```
Locked-off camera. Headlights from a car pulling into the driveway (the car itself stays out of
frame) sweep slowly across the lawn and up the garage door from left to right. As the beam
passes, the three walkway path lights brighten gently. The roofline stays steady warm white.
Calm, safe, welcome-home feeling.
[MASTER STYLE BLOCK]
```

---

## 7. P1: phone in hand (Your Phone Is the Switch)

**Model:** Nano Banana 2.1, 4:5, 2K.
```
A person's hand holding a modern smartphone at chest height on a front porch at night, shot
from over the shoulder, the phone in sharp focus. The phone screen is completely blank and
evenly dark gray, ready for a screen graphic to be added later. In the softly blurred background,
a white farmhouse roofline glows with warm white permanent LED pixels. Warm, intimate,
effortless. No face visible, no rings or watches, natural skin, no text on screen.
[MASTER STYLE BLOCK]
```
The app screen is composited later from the real app the owner installs, never a made-up interface.

---

## 8. W1: the Dome final frame

**Model:** Nano Banana 2.1, editing K2 (outpaint), 16:9 and 9:16.
```
Edit this exact photograph into a wider, higher view: the camera has risen and pulled back so
the lit house sits small in the lower third of the frame, centered, under a vast deep navy night
sky with a gentle dome of faint stars. The roofline is lit in warm white. Lots of empty dark sky
in the upper two thirds for a website form. Nothing else changes.
[MASTER STYLE BLOCK]
```
The gold arc from the logo is drawn in Framer (SVG stroke), not generated, so it stays crisp and on brand.

---

## 9. O1: social and link-preview images

Crop from K2 or S-scenes; don't generate new ones. 1200×630 for Open Graph (house right, dark space left for the title added in Framer), 1080×1350 for Instagram and Facebook.

---

## Post-production and QA

| Step | Tool | Check |
|---|---|---|
| Grade | DaVinci Resolve (free) | All assets share one grade: shadows navy, highlights warm, black point ~#05070B |
| Frames and loops | `scripts/make-frames.sh` | Desktop frames ~6–9 MB total for real footage; phone ~2–4 MB; loops under 2.5 MB each |
| Geometry | Overlay test | K1, K2, S1–S6, D1 roof edges align |
| Lights | Watch at 100% | Even spacing, no gaps, no lights in windows or trees, no visible wires |
| Flicker | Full-screen watch | No area flashes more than 3 times per second |
| Text | Scan every frame | No stray letters, numbers or logos (models sometimes sneak in house numbers) |
| Honesty | Final review | No AI render used where real work is implied |

**Credit discipline:** generate K1 in a batch of 4, everything else in batches of 1–2. Approve each stage before the next one; a wrong K1 multiplies through every later asset.
