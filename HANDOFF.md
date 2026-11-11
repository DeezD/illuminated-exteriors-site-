# Illuminated Exteriors website: handoff

For the new owner of the Framer site. Prepared 2026-11-11.

## What you're getting

| Piece | Where it lives | Moves with the Framer project? |
|---|---|---|
| The website (pages, design, text, CMS, form, code components) | Framer project "Nuanced Checkbox" | Yes |
| Five motion loops and the site photos | Uploaded into Framer | Yes |
| Scroll-film frames (hero) | Seven "frame pack" files uploaded into the hero component (see step 2) | Yes, once step 2 is done |
| Code components (`ScrollVideoHero`, `OccasionScenes`, `LoopFeature`, `BookingForm`, etc.) | Code files inside the Framer project (Assets → Code) | Yes. GitHub isn't needed |
| Original 4K images and source videos | `IE-media-masters.zip` | No: keep this zip for future edits |
| Code backup, docs and these instructions | `IE-site-handoff.zip` | No: a backup copy |

Nothing on the site depends on Higgsfield, GitHub or anyone else's account once step 2 is done.

## Steps

### 1. Pick a Framer plan: Basic is enough (after step 3)

Framer **Basic** is $10/month billed yearly ($15 monthly): custom domain, 30 pages, **2 CMS collections**, 1,000 CMS items, 50 GB bandwidth. The site uses 9 pages (well under 30). It needs only one change to fit: step 3.

Not on Basic: site redirects and staging. Neither is used today. The old GoDaddy `/m/bookings` link simply won't redirect.

### 2. Move the scroll film into Framer

1. Open the Home page and select the **ScrollVideoHero** at the top.
2. In its properties, **Packs 16:9**: add four files in this order: `hero-16x9-1-of-4.bin`, `hero-16x9-2-of-4.bin`, `hero-16x9-3-of-4.bin`, `hero-16x9-4-of-4.bin`. **Count 16:9** = 330.
3. **Packs 9:16**: `hero-9x16-1-of-3.bin`, `-2-of-3`, `-3-of-3` in order. **Count 9:16** = 240.
4. Clear **Frames 16:9** and **Frames 9:16** (the old Higgsfield addresses). The packs take over.
5. Make sure the code files `ScrollVideoHero` and `frameSequence` are the latest versions (from the `framer/` folder in the backup zip).
6. Preview, scroll the hero on desktop and phone, then publish.

The packs are in the `framer-upload/` folder of `IE-site-handoff.zip`. The first file makes the whole film scrollable within a second; the rest sharpen it.

### 3. Fit the CMS into Basic's 2 collections

Keep the two collections that power their own pages:
- **Projects**: Our Work and each project page
- **Service Areas**: each city page

Convert the other two into regular page content:
- **FAQs** (9 questions): put them straight into the FAQ page's accordion, and the 5 marked "show on home" into Home's Quick Answers. Then delete the FAQs collection.
- **Reviews** (one unpublished draft): delete the collection. Add real reviews later as a simple section on Home.

### 4. Transfer the project

1. In the project, click the Framer logo → **File → Transfer Project**.
2. Enter the new owner's email. Untick "remain editor" if the old owner should step away.
3. The new owner accepts through the email link (**Confirm Transfer**). The site stays live throughout, and the custom-domain connection stays intact.
4. The old owner's site plan is cancelled on acceptance; the new owner starts their Basic plan.

### 5. Afterwards

- **Domain:** connect illuminated-exteriors.com in Site Settings → Domains, if it isn't already, and update DNS at GoDaddy as Framer instructs.
- **Quote form:** requests go to info@illuminated-exteriors.com through FormSubmit. The very first request sends a one-time activation email to that inbox, and someone must click it.
- **AI access:** if Claude was connected through Framer Agent, revoke it in Framer's project settings.
- **Still to add:** real reviews and rating, project neighborhoods, Scot's story, exact service ZIPs.

## Editing the visuals later

- **Masters:** `IE-media-masters.zip` has every still (4K) and source video, named by what they show (F0 sunset → F5 blue & white for the scroll film; loop-* for the motion loops; scene-* for the scene chips).
- **Rebuilding the scroll film after changing frames:** `scripts/make-film.sh` → `scripts/make-frames.sh` → `scripts/make-packs.py`, then replace the pack files in the hero.
- **Rules worth keeping:** AI renders are illustrations and never go in Our Work; game-day scenes use colors, not team names or logos; nothing on the site flashes more than 3 times a second.
