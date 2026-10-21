# Motion library (inspired by jellyfishlighting.com, made original)

Reviewed 2026-10-21. **Owner approved 2026-10-21: add all five to the site and publish.** JellyFish's homepage (itself a Framer site) runs five short loops: a 10-second hero, a day-to-night reveal ("Now you see it, now you don't"), a music-reactive clip, a special-projects reel, and a warm-to-cool white slider. Its app section sells per-light control, zoning, schedules, custom patterns and presets.

We take the *ideas*, not their footage: every loop below is generated on our own house (the scroll-film house) in Higgsfield, project "Illuminated Exteriors – Website Visuals". Each sits on the site in a `LoopFeature` band (media one side, copy the other, alternating).

| # | Loop | JellyFish idea it answers | Our angle | Higgsfield (start → end) | Where it goes |
|---|---|---|---|---|---|
| L1 | **Invisible by day** | "Now you see it, now you don't" | A full day-to-night time-lapse on one locked frame: clean roofline at noon, lights race on at dusk | `1777329b` day still → `f74ca7bc` lit, MiniMax H3, 8 s · video `8d3d1813` | Home, after the scroll film; replaces the static day/night slider on phones |
| L2 | **Zones** | "Zoning: control sections independently" | Front gable alone, then each zone sweeps on until the whole house glows | `df91dbe8` one-zone still → `f74ca7bc`, 6 s · video `1f968276` | How It Works → "The app" |
| L3 | **Warm to cool** | White-temperature slider (2700K–5000K) | Cozy 2700K for the evening, crisp 5000K "security white" after midnight | `f74ca7bc` warm → `e3b30b29` cool, 6 s · video `3dcabb87` | Home band "Cozy at 7. Bright at midnight." + Security page |
| L4 | **Light show** | Music Box / custom patterns | Birthday confetti chase and wave, seamless loop (start = end frame), under 2 pulses/s | `3cb85f27` → `3cb85f27`, 6 s · video `63b462e1` | Home "Every occasion" band, Birthday scene loop |
| L5 | **The pixel** | "Designed to last" product block | Macro push-in on the trim-matched channel, pixels warm up one by one | `a5a3cc47` start, 6 s · video `e52ceb5b` | How It Works → "The lights" (generic mood only; specs come from the real system) |

## Ideas worth adding later (not generated yet)

- **Headlight welcome** (security): a car's headlights sweep the lawn, and the walkway and roofline brighten to cool white. Pairs with L3.
- **Phone tap**: a hand taps a scene on a phone and the house behind it changes color. Composite the real app screen; never a made-up interface.
- **Neighborhood dusk**: three houses on one street light up one after another, illustrating "join your neighbors." Use only after real installs exist on one street, or label it as an illustration.
- **Patio and landscape**: JellyFish sells patio string and landscape lights. Only add these if Illuminated Exteriors offers them.

## Rules

- Calm, locked camera; the light does the moving. No strobing (under 3 flashes per second, WCAG 2.3.1); the site's Pause motion control stops every loop.
- Every loop needs a still (the start frame) for reduced motion and slow connections.
- Export each with `bash scripts/make-frames.sh loop <file.mp4> <name>` (H.264, 1280 px, no audio, under ~2.5 MB).
- These are illustrations of the product, so they never appear in "Our Work."
