# Make illuminated-exteriors.com show the new Framer site

About 20 minutes of clicking, then up to 48 hours for the internet to catch up (usually under an hour). Do this **after** the Framer project has been transferred to the new owner and the Basic plan is active on it, so the domain is attached to the right account.

Values below are from Framer's help article "How to connect a custom domain" (checked 2026-11-11). Framer shows the same values in Site Settings → Hosting → Domains; if they ever differ, use what Framer shows.

## Before you start: two things not to break

1. **Email.** Quote requests and business email go to info@illuminated-exteriors.com. Email depends on the domain's **MX** records (and often TXT records such as SPF). **Do not delete or edit any MX or TXT records.** Only touch the records listed below.
2. **The old GoDaddy website.** The current site is GoDaddy Website Builder. Keep its subscription until the Framer site is live on the domain; cancel it afterwards (step 6). Don't cancel the **domain** itself.

## Step 1: Tell Framer about the domain

1. Open the project in Framer → **Site Settings → Hosting → Domains**.
2. Click **Connect a domain you own**. Enter `illuminated-exteriors.com`.
3. Framer will show the records to add. They should match the table in step 3.

## Step 2: Unhook the domain from GoDaddy Website Builder

GoDaddy often ties the domain to its own site builder with locked records or forwarding.

1. Sign in at godaddy.com → **My Products**.
2. If the domain shows **Forwarding** turned on (Domain settings → Forwarding), remove it.
3. In Website Builder, if the site is "published to illuminated-exteriors.com", change it to its free GoDaddy address or unpublish. (This is why the old site must stay active until step 5: it just stops using the domain.)

## Step 3: Change the DNS records at GoDaddy

**My Products → (domain) → DNS → DNS Records.**

| Action | Type | Name | Value | TTL |
|---|---|---|---|---|
| Edit (or add) | **A** | `@` | `31.43.160.6` | 1 hour (or default) |
| Add | **A** | `@` | `31.43.161.6` | 1 hour |
| Edit (or add) | **CNAME** | `www` | `sites.framer.app` | 1 hour |
| **Delete** | any other **A** record on `@` | `@` | (GoDaddy's old address, often labeled "WebsiteBuilder Site" or "Parked") | |
| **Delete** | any **AAAA** record on `@` | `@` | (if present) | |

- Keep **exactly two** A records on `@`, the two Framer addresses. Any extra A or AAAA record breaks the connection.
- If GoDaddy won't let you delete the old A record ("locked by Website Builder"), finish step 2 first and try again.
- If GoDaddy asks for a trailing dot on the CNAME, use `sites.framer.app.`
- Leave **MX, TXT, SRV and NS** records alone.

## Step 4: Verify in Framer

Back in Framer → Site Settings → Domains, click **Check** / **Verify**. It goes green when the records are found. Framer issues the security certificate (https) automatically; that can take a little longer after the records are found. Then **Publish** once so the site goes out on the new domain.

## Step 5: Test

- Visit `https://illuminated-exteriors.com` and `https://www.illuminated-exteriors.com`; both should show the new site with a padlock. (Framer makes one the main address and forwards the other.)
- On a phone over cellular (not home wifi), check the same, then send yourself a test from the Free Design form and confirm it arrives at info@illuminated-exteriors.com.
- Send an email to info@illuminated-exteriors.com from another account to confirm email still works.

## Step 6: Clean up (after a few days of the site working)

- Cancel the **GoDaddy Website Builder** plan (not the domain).
- Keep the domain on **auto-renew** at GoDaddy.
- The old site's `/m/bookings` and `/m/account` links will show "page not found"; redirects aren't available on Framer Basic.

## If it doesn't connect

| Symptom | Fix |
|---|---|
| Framer says "Invalid DNS" | There's an extra A/AAAA record on `@`, or the old Website Builder record is still there. Recheck step 3. |
| Works at `www` but not without it (or the reverse) | One of the records is missing; re-add it. |
| Changed records but nothing happens | Wait: up to 48 hours. Phone data (not wifi) usually updates first. |
| Email stopped | An MX/TXT record was changed. Restore it from GoDaddy's DNS history, or call GoDaddy support. |

Source: [Framer Help: How to connect a custom domain](https://www.framer.com/help/articles/how-to-connect-a-custom-domain/)
