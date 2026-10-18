# Illuminated Exteriors: Framer build guide and Framer AI prompts

Framer AI is good at layout, sections and responsive breakpoints. It can't produce the scroll-scrubbed hero, the scene switcher, the day/night slider or the multi-step form, so those come from the code components in `framer/`. The order below gets Framer AI to build the frame, then plugs the components in.

---

## Step 1: Project and design system (manual, about 20 minutes)

**New project →** blank, dark. Breakpoints: Desktop 1440, Tablet 810, Phone 390.

**Fonts** (Site Settings → Fonts, all free Google Fonts): Instrument Serif, Montserrat (400, 500, 600), IBM Plex Mono (400, 500). The code components use these names, so they must be loaded here.

**Color styles** (match `framer/tokens.tsx`):

| Style | Value | Use |
|---|---|---|
| Night | `#05070B` | Page background |
| Blue Hour | `#0E1626` | Cards, form panel |
| Dome | `#1E3A6E` | Rare deep accents |
| Exteriors Blue | `#4AA3FF` | Small labels |
| Gold | `#D9B46A` | Primary CTA, rules, the arc |
| Gold Bright | `#F2D59A` | Emphasis text, hover |
| Moonstone | `#C9D1D9` | Body text |
| Dim | `#7D8794` | Captions, mono labels |
| Line | `rgba(201,209,217,0.16)` | Hairlines |

**Text styles:**

| Style | Font | Desktop / Phone | Notes |
|---|---|---|---|
| Display | Instrument Serif 400 | 84 / 44, line 0.98, tracking −1% | One per section |
| Display Italic | Instrument Serif Italic | same | Gold Bright, for the emphasis line |
| H2 | Instrument Serif 400 | 60 / 38, line 1.0 | |
| H3 | Montserrat 600 | 22 / 19, line 1.3 | |
| Body | Montserrat 400 | 17 / 16, line 1.6, max 60ch | Moonstone |
| Small | Montserrat 400 | 14, line 1.5 | |
| Mono Label | IBM Plex Mono 500 | 11.5, tracking 14%, UPPERCASE | Dim or Gold Bright |

**Retire** the current olive-green outline button and the cart icon.

---

## Step 2: Add the code components

Assets → Code → **New File** for each, named exactly as below, then paste the file contents. The files import each other by name (`./tokens.tsx`), so keep the names.

1. `tokens.tsx`, `store.tsx`, `useDeviceTier.tsx`, `frameSequence.tsx` (shared modules, never placed on the canvas)
2. `MagneticButton.tsx`, `MotionToggle.tsx`, `LumenCursor.tsx`
3. `ScrollVideoHero.tsx`, `OccasionScenes.tsx`, `DayNightSlider.tsx`, `BookingForm.tsx`

Each shows up in the Insert panel with property controls. Details and props are in `README.md`.

---

## Step 3: CMS collections (manual)

| Collection | Fields |
|---|---|
| **Projects** | Title, Slug, Neighborhood (text), City (text), Occasion (option: Everyday, Game Day, Birthday, July 4th, Halloween, Christmas, Other), Home style (option), Night photo (image), Day photo (image), Gallery (images), Review quote (text), Reviewer first name and last initial (text), Featured (toggle), Install date (date) |
| **Reviews** | Quote, Name (first name and last initial), City, Rating (number), Source (Google / Facebook), Link |
| **FAQs** | Question, Answer (rich text), Category (option), Show on home (toggle), Order (number) |
| **Service Areas** | City, State, Slug, Intro (rich text), ZIPs (text), Hero image, Featured projects (multi-reference to Projects) |

**Projects and Reviews hold real content only.** No AI renders and no invented reviews. Placeholders stay marked "PLACEHOLDER" until real material replaces them.

---

## Step 4: Framer AI prompts

Paste each prompt into Framer AI ("Generate section" or "Generate page"). Each one carries the system so Framer AI stays on brand. After generating, **swap any image or button it invents for the real component or CMS binding** named in the brackets.

### Shared preamble (start every prompt with this)

```
Brand: Illuminated Exteriors, a local installer of permanent, app-controlled LED roofline lighting
for homes: warm white every night, color for holidays, game days and birthdays. Premium, calm,
neighborly. Dark site: background #05070B, cards #0E1626, body text #C9D1D9, primary accent gold
#D9B46A (only the main call to action is gold), emphasis text #F2D59A, small labels in IBM Plex Mono
uppercase. Headlines in Instrument Serif (one per section), body in Montserrat. Generous spacing,
left-aligned text, hairline dividers rgba(201,209,217,.16). No gradients on buttons, no glassmorphism,
no stock icons in colored circles, no emoji, no centered walls of text, no exclamation points.
Breakpoints 1440 / 810 / 390, everything stacks cleanly to one column on phone.
```

### Global: navigation
```
[Preamble] Create a site navigation bar. Left: the Illuminated Exteriors logo (I will swap in the
file). Center-right: text links "Our Work", "How It Works", "FAQ" in Montserrat 15 medium, then the
phone number as plain text, then a primary gold pill button "Get a Free Design". Transparent over
the hero; after scrolling it becomes solid #05070B with a hairline bottom border. It hides when
scrolling down and returns when scrolling up. On phone: logo left, "Free Design" small gold pill and a
menu icon right; the menu opens a full-screen dark panel with large Instrument Serif links, the phone
number and the service area line.
```
→ Replace the gold button with **MagneticButton** (primary). Add a variant with a short gold mark under the current page link.

### Global: phone action bar
```
[Preamble] Create a fixed bottom bar for phones only: two equal buttons, "Call" (outlined) and
"Free Design" (gold). Dark #05070B background with a hairline top border, respects the iPhone
home-indicator safe area, hidden on tablet and desktop.
```

### Home: section 3, "Your phone is the switch"
```
[Preamble] Create a two-column section. Left: mono label "8:30 PM · Control", headline "Change the
night from the couch.", body "Set warm white for every evening, team colors every Sunday, and the
birthday show at 7 PM sharp. Schedules run themselves, and you can change anything in seconds from
your phone.", then three short schedule rows in mono type: "Nightly · sunset → 11 PM · Warm white",
"Sundays · Game Day colors", "Dec 1–31 · Christmas twinkle". Right: a large portrait image of a
phone in hand on a porch at night. On phone, the image comes first.
```
→ Image: Higgsfield **P1** with the real app's screen composited in.

### Home: section 4, "It's real"
```
[Preamble] Create a proof section. Mono label "9:15 PM · Real homes", headline "Real homes. Real
neighbors.", then a horizontal row of three large project cards, each with a night photo (4:5),
neighborhood name in Montserrat 600, the occasion as a mono label, and a one-line review quote with
the reviewer's first name and last initial. Below: a trust strip in one row with the Google rating
and review count, "Licensed & insured", "[System] certified installer", and a "See all our work"
text link with an arrow. On phone the cards become a swipeable row with snap.
```
→ Bind cards to **Projects** (Featured = on). Trust strip numbers from the owner only. Add a cursor halo over cards by giving the card component the class `project-card` and putting `.project-card` in LumenCursor's "Also over".

### Home: section 5, "How it happens"
```
[Preamble] Create a three-step process section. Mono label "10:00 PM · The process", headline "Three
visits. Zero ladders for you." Three steps in a vertical sequence connected by a thin gold vertical
line on the left: "1. Free design: we visit at dusk, measure your roofline and show you scenes on your
own house." "2. Install day: the trim-matched track goes up and disappears into your fascia."
"3. Walkthrough: we set up the app with you and program your first scenes." Next to the steps, a
compact panel "How pricing works" listing the factors: roofline length, number of stories,
controller and zones; and a gold button "Start my free design".
```
→ Confirm the owner's real process and wording. The gold line can be a Framer scroll-transform (scale Y 0 → 1 while in view).

### Home: section 6, quick answers
```
[Preamble] Create an FAQ section with a mono label "10:45 PM · Quick answers", headline "Before you
ask.", and an accordion of five questions with plus icons that rotate to an X when open. Only one
open at a time. Under it, a text link "All questions" with an arrow.
```
→ Bind to **FAQs** where Show on home = on.

### Home: section 7, the Dome (final CTA)
```
[Preamble] Create a closing section with a full-bleed night-sky background image showing a lit house
small in the lower third. Center-left: mono label "11:59 PM", headline "Your home, after dark.",
italic gold line "Let's design it.". Right: space for a booking form card. Under the form: Google
rating stars, phone number as plain text, and a small round photo of the owner with the line "Owned
and installed locally by [Owner name]". A thin gold arc (like the arc in the logo) curves over the
whole composition.
```
→ Background: Higgsfield **W1**. Form: **BookingForm**. Arc: an SVG with a Framer appear animation (draw from 0 → 100% path length over 1.8 s, ease out).

### Page: Our Work
```
[Preamble] Create a portfolio page. Headline "Our work, after dark." A filter row of pill toggles:
All, Everyday, Game Day, Birthday, July 4th, Halloween, Christmas. A responsive masonry grid of
project cards (night photo, neighborhood, occasion label). Each card opens a project page.
```
→ Bind to **Projects** with CMS filtering. **Project page template:** large night photo header, a **DayNightSlider** with the project's day and night photos, the gallery, the review, and a gold "Get a Free Design" button.

### Page: How It Works
```
[Preamble] Create a page explaining the system in four bands: "The track" (trim-matched aluminum
channel, invisible by day), "The lights" (individually controllable LED pixels, warm white and full
color), "The app" (scenes, schedules, zones), "The warranty" (coverage details). Each band: mono
label, H2, two short paragraphs, one image. End with a pricing-factors panel and a gold CTA.
```
→ Images: Higgsfield **M1**, **D1** (in a DayNightSlider), **P1**. Specs and warranty only from the system they actually install.

### Page: FAQ
```
[Preamble] Create a full FAQ page grouped by category (Cost, Installation, The lights, The app,
Weather and durability, HOA and neighbors), each group an accordion, with a sticky category list
on the left on desktop. End with "Still have a question?" and the phone number plus a gold CTA.
```

### Page: About
```
[Preamble] Create an About page: a large photo of the owner on a job site at dusk, headline
"Your neighbors, lighting your street.", a short story section, a values row of three plain-text
statements (no icons), a service-area map placeholder with the list of cities served, and a gold CTA.
```
→ The current "Our Mission" text belongs here, edited to speak to the homeowner.

### Page: Free Design
```
[Preamble] Create a focused booking page with no navigation links except the logo and phone number.
Left: headline "Book your free design.", three short reassurance lines (free and no obligation, we
visit at dusk, a reply within one business day), a review quote. Right: space for a booking form card.
```
→ Form: **BookingForm** (set Endpoint, Service ZIPs, Phone, Reply within).

### Template: Service Area (CMS page)
```
[Preamble] Create a city landing page template: headline "Permanent roofline lighting in {City}",
an intro paragraph, three featured local projects, the five most common questions, and the booking
form section.
```

---

## Step 5: Place the code components on Home

| Order | Component or section | Key settings |
|---|---|---|
| 0 | **ScrollVideoHero** | Frames 16:9 and 9:16 URLs and counts from `make-frames.sh`; Poster 16:9 and 9:16; Lit still = K2 |
| 1 | **OccasionScenes** | One row per scene: label, loop (MP4), still, colors, readout; Anchor ID `occasions` |
| 2 | Section with **DayNightSlider** | Day = D1, Night = K2; headline "You'll forget it's there. Until sunset." |
| 3–7 | Framer AI sections above | Bound to the CMS |
| Global | **LumenCursor** (once per page, anywhere) and **MotionToggle** (footer, or fixed bottom-left) | |

---

## Step 6: SEO

**Per-page titles and descriptions** ([City] = Omaha; make service-area pages for Elkhorn, Omaha, Papillion, Bellevue, Gretna, Bennington, Council Bluffs and Lincoln):

| Page | Title (≤ 60 chars) | Description (≤ 155 chars) |
|---|---|---|
| Home | Permanent Roofline Lighting in [City] · Illuminated Exteriors | Permanent LED roofline lights, invisible by day. Warm white every night, colors for every holiday and game day. Book a free design. |
| Our Work | Our Work · Illuminated Exteriors | Real homes lit by Illuminated Exteriors: everyday warm white, holidays, game days and birthdays. See the before and after. |
| How It Works | How Permanent Lights Work · Illuminated Exteriors | A trim-matched track, individually controllable lights and an app for scenes and schedules. See how the system works. |
| FAQ | Permanent Lighting FAQ · Illuminated Exteriors | Cost, installation, HOA rules, weather and warranty: straight answers about permanent roofline lighting. |
| Free Design | Book a Free Design · Illuminated Exteriors | Free, no-obligation design visit at dusk. We measure your roofline and show scenes on your own home. |
| Service area | Permanent Christmas & Roofline Lights in {City} · Illuminated Exteriors | Permanent LED roofline lighting for {City} homes. Warm white every night, color for every occasion. Free design visit. |

**Search terms to cover naturally** (in headings and copy, not stuffed): permanent Christmas lights, permanent holiday lights, permanent outdoor lighting, roofline lighting, "[City]" variants.

**Structured data** (Site Settings → General → Custom Code → End of `<head>`). Fill every bracket from the owner; delete lines you can't verify:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Illuminated Exteriors",
  "url": "https://illuminated-exteriors.com/",
  "logo": "https://illuminated-exteriors.com/[logo-path].png",
  "image": "https://illuminated-exteriors.com/[og-image].jpg",
  "telephone": "+1-402-699-6256",
  "priceRange": "$$",
  "address": { "@type": "PostalAddress", "addressLocality": "Elkhorn", "addressRegion": "NE", "addressCountry": "US" },
  "areaServed": { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 41.2866, "longitude": -96.2367 }, "geoRadius": "80467" },
  "openingHours": "Mo-Fr 09:00-17:00",
  "sameAs": ["https://www.facebook.com/illuminatedexteriors", "[Google Business Profile URL]"],
  "makesOffer": { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Permanent roofline lighting installation" } }
}
</script>
```
Don't add `aggregateRating` by hand. Google ignores self-served review markup for local businesses, and stale numbers create a mismatch.

**Other settings:**
- Open Graph image per page (O1 crops), favicon from the logo's house mark
- **Headings:** one H1 per page (the hero's `Tag` = h1 on Home; h2 everywhere else)
- **Alt text:** describes the real scene ("Two-story home in [Neighborhood] lit in Game Day blue and orange"). AI renders get honest alt text ("Illustration of a home with permanent roofline lights")
- **Redirects:** the old GoDaddy site has `/m/bookings` and `/m/account`; 301 them to `/free-design`
- **Keep the offer:** the current site promises "10% off your first service" for newsletter sign-ups. Either keep honoring it (add an email field in the footer) or retire it deliberately
- **Domain:** `illuminated-exteriors.com` didn't resolve from my environment on 2026-10-18. Confirm both the apex and `www` records point to Framer when you connect the domain

---

## Step 7: Performance and accessibility checklist

- [ ] Hero frames on a CDN with long cache headers; posters are the LCP image (`fetchpriority=high` is set by the component)
- [ ] Loops under 2.5 MB each, stills WebP or AVIF through Framer's image sizing
- [ ] Lighthouse mobile: LCP < 2.5 s, CLS < 0.05, TBT < 200 ms
- [ ] Reduced motion (OS setting on): the hero shows the lit still, no scrubbing, loops become stills
- [ ] Pause motion control visible on every page
- [ ] Keyboard: Tab reaches every chip, slider, button and form field in visual order, with a visible gold focus ring
- [ ] VoiceOver and TalkBack pass on the form: labels, errors and step changes are announced
- [ ] Text contrast AA over every image (the components' scrims handle the hero and scenes)
- [ ] Form test: in-area, out-of-area (waitlist), validation errors, photo upload, failed network (error + saved draft), success
- [ ] No AI render used in Our Work, reviews or any "real project" context
