# Illuminated Exteriors website: handoff

For the new owner of the Framer site. Prepared 2026-11-11.

## What you're getting

| Piece | Where it lives | Moves with the Framer project? |
|---|---|---|
| The website (9 pages, design, text, form, code components) | Framer project "Nuanced Checkbox" | Yes |
| Scroll-film hero (7 "frame pack" files), five motion loops, all site photos | Uploaded into Framer's own storage | Yes |
| Code components (`ScrollVideoHero`, `OccasionScenes`, `LoopFeature`, `BookingForm`, etc.) | Code files inside the Framer project (Assets → Code) | Yes. GitHub isn't needed |
| CMS: **Projects** and **Service Areas** (2 collections, fits Basic) | Framer CMS | Yes |
| Original 4K images and source videos | `IE-media-masters.zip` (and trimmed copies in the shared Drive folder) | No: keep for future edits |
| Code backup, docs and these instructions | `IE-site-handoff.zip` | No: a backup copy |

Already done: the scroll film and photos are hosted in Framer, the FAQs were moved into the pages as regular content, and the Reviews collection was removed (backup in `assets/cms-backup/`). Nothing on the site depends on Higgsfield, GitHub or anyone else's account.

## Steps (in order)

### 1. New owner: create a Framer account

Sign up at framer.com with the business email (info@illuminated-exteriors.com is a good choice, so the account stays with the business). No plan yet.

### 2. Transfer the project (current owner does this)

1. Open the project, click the Framer logo → **File → Transfer Project**.
2. Enter the new owner's email. Untick "remain editor" if the old owner should step away.
3. The new owner clicks **Confirm Transfer** in the email. The site stays live throughout.
4. Any site plan on the old account is cancelled on acceptance.

### 3. New owner: buy the Basic plan

In the project: **Site Settings → Plans → Basic**. $10/month billed yearly ($15 monthly). Includes custom domain, 30 pages, 2 CMS collections, 1,000 CMS items, 50 GB bandwidth. The site uses 9 pages and 2 collections.

Not on Basic: redirects and staging. Neither is used.

### 4. Connect illuminated-exteriors.com (GoDaddy)

Follow **`DOMAIN-GODADDY.md`**. Short version, in GoDaddy DNS:

| Type | Name | Value |
|---|---|---|
| A | @ | 31.43.160.6 |
| A | @ | 31.43.161.6 |
| CNAME | www | sites.framer.app |

Delete any other A or AAAA record on `@`. **Leave MX and TXT records alone** (they run email). Then verify in Framer → Site Settings → Domains and publish.

### 5. Turn on the quote form

Requests go to info@illuminated-exteriors.com through FormSubmit (free). The very first request sends a one-time **activation email** to that inbox; click it, or later requests won't arrive. Do a test submission right after the domain is live.

### 6. Clean up access

- **AI access:** in Framer, revoke any API keys / Framer Agent access created during the build (Site Settings → General / Integrations). The old owner should do this before the transfer, and the new owner should check after.
- **GoDaddy Website Builder:** cancel once the new site has run on the domain for a few days. Keep the domain itself on auto-renew.

### 7. Still to add (owner content)

- Real Google reviews and rating (add as a simple section on Home)
- Real project neighborhoods for Our Work
- Scot's story for the About section
- Exact service ZIP codes (the form currently accepts 680–681, 683–685 and 515 prefixes)

## Editing the visuals later

- **Masters:** `IE-media-masters.zip` has every still (4K) and source video, named by what they show (F0 sunset → F5 blue & white for the scroll film; loop-* for motion loops; scene-* for scene chips).
- **Rebuilding the scroll film:** `scripts/make-film.sh` → `scripts/make-frames.sh` → `scripts/make-packs.py`, then replace the pack files in the hero's properties (Desktop Pack 1–6, Mobile Pack 1–6, in order).
- **Rules worth keeping:** AI renders are illustrations and never go in Our Work; game-day scenes use colors, not team names or logos; nothing on the site flashes more than 3 times a second.
