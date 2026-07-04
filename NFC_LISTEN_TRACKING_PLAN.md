# NFC Listen Tracking — Feature Plan

## Overview

Use NTAG215 NFC tags on vinyl records + Google Pixel to tap-to-log listens into the Supabase database.

**Hardware**: 30x NTAG215 tags (504 bytes usable memory, writeable)
**Device**: Google Pixel (Android — native NFC + Chrome Web NFC API support)

---

## Core Concept: Two Separate Concerns

### 1. Pairing (one-time setup per record) — IN-BROWSER

Uses the **Web NFC API in Chrome on Android** to:
- Read the tag's hardware UID
- Write a listen URL to the tag
- Save the UID → record mapping to Supabase

This requires the website to be open in Chrome. User taps a button, then holds the tag to their phone.

### 2. Logging a listen (daily use) — NATIVE ANDROID NFC

**No app or browser needed.** Android reads NFC URLs at the OS level.
- User taps phone on record's NFC tag
- Android reads the URL written to the tag
- Chrome auto-opens to the listen URL
- Page logs the listen and shows confirmation
- Total interaction: tap → done

This split gives the best UX: the browser handles the smart setup work once, then gets out of the way for frictionless daily use.

---

## Data Model (Supabase)

### New table: `nfc_tags`

| Column     | Type          | Notes                                    |
|------------|---------------|------------------------------------------|
| id         | uuid PK       | Default `gen_random_uuid()`              |
| nfc_uid    | text UNIQUE   | Hardware UID from the NFC tag            |
| release_id | integer       | Links to existing record (Discogs ID)    |
| created_at | timestamptz   | Default `now()`, when tag was linked     |

### New table: `listens`

| Column      | Type          | Notes                                   |
|-------------|---------------|-----------------------------------------|
| id          | uuid PK       | Default `gen_random_uuid()`             |
| release_id  | integer       | Which record was played                 |
| listened_at | timestamptz   | Default `now()`                         |
| source      | text          | `'nfc'`, `'manual'`, etc.               |

---

## Detailed Flows

### NFC Status on Records

Every record in the collection shows an NFC paired/unpaired indicator:
- **Collection grid/list view:** Small icon or badge on each record showing NFC status (paired vs not)
- **Record detail page:** Clear indicator — "NFC Tag Linked" or "No NFC Tag"
- **Data source:** Query `nfc_tags` table to check if a `release_id` has a matching row
- **Use case:** As you slowly backlog through 140+ records, you can see at a glance which ones still need tagging

### Pairing Flow — Two Methods

There are two ways to pair a tag to a record. Both save the same data to Supabase and produce the same result. Use whichever works best in the moment.

---

#### Method A: In-Browser Web NFC (automated)

**When the Web NFC API works well, this is the fastest path.**

1. Navigate to a record's detail page on your Pixel in Chrome
2. Tap "Link NFC Tag" button
3. Browser shows NFC prompt — "Hold your NFC tag to the back of your phone"
4. Web NFC API reads the tag's hardware UID
5. Web NFC API writes the listen URL to the tag: `https://records.manhart.io/listen/{nfc_uid_no_colons}`
6. Frontend saves the mapping to `nfc_tags` table
7. UI confirms: "Tag linked!" and shows the NFC status as paired

**Web NFC API requirements:**
- HTTPS (Vercel provides this)
- Chrome on Android only
- Must be triggered by a user gesture (button tap)
- Page must be in foreground during scan

**Code approach:**
```typescript
const ndef = new NDEFReader();
await ndef.scan();
ndef.onreading = async (event) => {
  const uid = event.serialNumber; // e.g., "04:a2:3b:1a:2c:5e:80"
  const uidClean = uid.replaceAll(":", ""); // "04a23b1a2c5e80" — safe for URLs

  // Write the listen URL to the tag
  await ndef.write({
    records: [{ recordType: "url", data: `https://records.manhart.io/listen/${uidClean}` }]
  });

  // Save mapping to Supabase (store the clean version)
  await supabase.from('nfc_tags').insert({ nfc_uid: uidClean, release_id: currentRecordId });
};
```

---

#### Method B: Manual Entry + NFC Tools App (fallback)

**For when the Web NFC API is unreliable or you're working from desktop.**

**Step 1 — Save the mapping (on website, any device):**
1. Navigate to a record's detail page
2. Tap "Link NFC Tag" → choose "Enter manually"
3. Paste the tag's UID (copied from NFC Tools app on your phone)
4. System saves the mapping to `nfc_tags` table
5. System shows the full listen URL with a **copy button**: `https://records.manhart.io/listen/04a23b1a2c5e80`
6. Copy the URL — paste it to Discord, notes, wherever you can grab it on your phone

**Step 2 — Write the URL to the tag (on phone, NFC Tools app):**
1. Open NFC Tools on your Pixel
2. Write → Add a record → URL
3. Paste the listen URL you copied from the website
4. Hold tag to phone → URL written

**This separates the two concerns:**
- Saving the mapping (website, always works)
- Writing the URL to the tag (NFC Tools fallback if Web NFC is rough)

The URL is human-readable and easy to copy/paste through Discord or any messaging app.

---

#### Pairing UI on Record Detail Page

The "Link NFC Tag" button opens a small modal/panel with:
- **"Scan with phone"** — triggers Web NFC API (Method A)
- **"Enter manually"** — shows a text input for pasting UID from NFC Tools (Method B)
- After pairing (either method): shows the listen URL with a copy button
- If already paired: shows "NFC Tag Linked" with the UID and URL (copyable), plus option to unlink/re-pair

### Listen Logging Flow (native Android NFC → web page)

**When:** Every time user listens to a record
**Where:** Anywhere — phone just needs to be unlocked
**How:**

1. User taps Pixel on the NFC tag stuck to the record/sleeve
2. Android OS reads the NDEF URL from the tag (no app needed)
3. Android auto-opens Chrome to `https://records.manhart.io/listen/{nfc_uid_no_colons}`
4. React route `/listen/:nfcUid` mounts and:
   a. Looks up `nfc_tags` by `nfc_uid` → gets `release_id`
   b. Fetches the record details (album art, title, artist)
   c. Inserts row into `listens` table: `{ release_id, source: 'nfc' }`
   d. Shows the **Listen Confirmation Screen** (see below)

### Listen Confirmation Screen

The tab that opens on each tap serves as a visual log/receipt. It should display:

- **Album art** (from Supabase storage)
- **Artist — Album Title**
- **Date and time** of the listen (formatted nicely, e.g., "Thursday, July 3, 2026 at 8:42 PM")
- **Status indicator**: "Listen logged!" (success) or "Already logged recently" (cooldown)
- **Total listen count** for this record (e.g., "Listened 14 times")

This screen is important — it's the confirmation that the tap worked and doubles as a timestamped log entry you can glance at. The date/time display matters because listen data will feed into a **timeline view** in the future (see Phase 4).

The tab stays open so you can reference it. No auto-close.

**Edge cases to handle:**
- Unknown NFC UID (tag not paired yet) → "This tag isn't linked to a record. Pair it from your collection."
- Duplicate rapid taps → see Spam Prevention below
- Offline → queue the listen in localStorage, sync when back online (stretch goal)

---

## Spam Prevention & Debounce

Two layers of protection, both enforced **server-side** (Supabase) so they can't be bypassed:

### 1. Global cooldown — 2 minute timeout
Only one listen can be logged every 2 minutes, regardless of which record. Rationale: you can only physically listen to one record at a time.

Implemented as a Supabase RLS policy or database function that checks:
```sql
-- Reject insert if any listen exists within the last 2 minutes
NOT EXISTS (
  SELECT 1 FROM listens
  WHERE listened_at > now() - interval '2 minutes'
)
```

### 2. Per-record debounce — same record within 2 minutes
Prevents accidental double-taps on the same tag from logging twice. Covered by the global cooldown above, but called out explicitly so the intent is clear.

### Frontend handling
When a listen is rejected by the cooldown, the `/listen/:nfcUid` page should:
- Still show the album art and record info
- Display "Already logged recently" instead of "Listen logged!"
- Show when the last listen was recorded

### Why server-side?
Each NFC tap opens a fresh browser tab — there's no client-side state to persist between taps. The database is the only reliable place to enforce this.

### Future: Arduino NFC reader
The listen logging is designed as a simple API-style call (look up tag → insert listen). An Arduino with an NFC reader can hit the same `/listen/:nfcUid` URL or a dedicated Supabase Edge Function endpoint via HTTP POST. The 2-minute cooldown and debounce apply identically regardless of the source device.

---

## Tech Decisions

| Concern              | Choice                                                      |
|----------------------|-------------------------------------------------------------|
| Pairing NFC access   | Web NFC API (Chrome Android) — in-browser                   |
| Listen NFC trigger   | Native Android NFC → auto-opens URL in Chrome               |
| Tag type             | NTAG215 (504 bytes, writeable)                              |
| Tag data format      | NDEF URL record written during pairing                      |
| Listen logging       | Direct Supabase insert from frontend                        |
| Auth                 | Lightweight (personal site — open or simple token)          |
| Frontend             | New React routes + pairing UI on record detail page         |
| Spam prevention      | 2-min global cooldown, server-side (Supabase RLS/function)  |

---

## RLS Policies

- `nfc_tags`: public read, consider restricting write (service role or simple auth)
- `listens`: public insert (tap-to-log URL must work without auth), public read

---

## New Routes

| Route               | Purpose                                                |
|----------------------|--------------------------------------------------------|
| `/listen/:nfcUid`   | Listen logging — opened by Android NFC tap             |

### Modified Existing Pages

| Page                   | Change                                                  |
|------------------------|---------------------------------------------------------|
| Record detail page     | Add "Link NFC Tag" button (Web NFC pairing flow)        |

---

## Implementation Order

### Phase 1: Database
1. Create `nfc_tags` table in Supabase with RLS policies
2. Create `listens` table in Supabase with RLS policies

### Phase 2: Pairing Flow
3. Add NFC status indicator to collection grid (paired/unpaired badge per record)
4. Add NFC status indicator to record detail page
5. Add "Link NFC Tag" button + modal to record detail page with two methods:
   a. Method A: Web NFC scan (auto read UID + write URL) — requires TypeScript types, browser detection
   b. Method B: Manual UID entry (paste from NFC Tools) + copyable listen URL output
6. Create `useNfcPairing(releaseId)` hook for Web NFC logic
7. Create Supabase query hook to check NFC status per record (has tag or not)
8. After pairing (either method): display copyable listen URL for fallback writing via NFC Tools

### Phase 3: Listen Logging Route
8. Create `/listen/:nfcUid` route and component
9. Implement lookup → log → confirmation flow
10. Add debounce logic (prevent rapid duplicate logs)
11. Add to Vercel rewrite rules if needed (SPA catch-all should handle it)

### Phase 4: Timeline & Analytics (future — planning in progress)
See "Timeline & Analytics" section below for current thinking.

---

## Tag Placement

Tags placed **inside the sleeve** with a label/name on each tag for identification. The Pixel's NFC reader is in the upper-center back of the phone.

---

## Timeline & Analytics (planning in progress)

### What we know so far

**Timeline feed:** A long chronological list of all listens, each entry showing:
- Album art, artist, album title
- Date and time of the listen
- Runtime of the record (using existing `duration_seconds` data from Discogs sync)

**Rollup views:** Day, week, month, and year summaries with full analytics. Stored in Supabase. Specific metrics and UI still being discussed.

**Runtime data status:**
- `duration_seconds` column already exists on `records` and `wishlist` tables
- `fetchDurations.ts` in sync tools pulls track durations from Discogs API and sums per album
- Frontend already uses this (collection page shows total listening time)
- **Gap:** Some records won't have duration data on Discogs — `duration_seconds` will be `null` for those
- Rollup totals will note "approximate" when some records lack duration data
- Manual duration entry for missing records is a future nice-to-have

### Open questions to resolve
1. Timeline feed — single scrollable page or paginated?
2. Should back-to-back listens of the same record (e.g., flipping sides and re-tapping) show as one entry or two?
3. Rollup analytics — which specific metrics? Candidates:
   - Total listens (count)
   - Total listening time (hours/minutes)
   - Most played records / artists
   - Listening streaks (consecutive days)
   - Average listens per day/week
   - Genre breakdown (if genre data exists)
   - Time-of-day patterns
4. Rollup dashboard UI — cards with summary stats, or drill-down (click week → see each day)?
5. Pre-computed rollup tables in Supabase vs. on-the-fly queries? (On-the-fly is fine for 140 records, pre-computed matters at scale)

---

## Tab Clutter Mitigation

Each NFC tap opens a new Chrome tab. To minimize clutter:
- The listen page will attempt `window.close()` after logging (works when the tab was opened by the OS, not always guaranteed)
- If `window.close()` fails, show a minimal confirmation that doesn't need interaction

---

## Notes

- Web NFC API is only available in Chrome on Android (perfect for Pixel, no iOS)
- NTAG215 hardware UID is read-only and unique per tag — good for identification
- 504 bytes easily fits the listen URL (well under 100 bytes needed)
- Tags are the same chip used in Amiibos — well-proven hardware
- Android reads NFC tags natively at the OS level — no app needed for URL-type NDEF records
- The pairing step is the only part that requires the website to be open
- Daily listen logging is completely frictionless: tap phone on record → done
