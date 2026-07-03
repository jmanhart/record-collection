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

### Pairing Flow (in-browser, Web NFC API)

**When:** One-time setup for each of the 30 records getting tags
**Where:** Record detail page on `records.manhart.io` in Chrome on Pixel
**How:**

1. User navigates to a record's detail page (e.g., `/:artist/:album`)
2. Taps a "Link NFC Tag" button (only visible on Android/Chrome where Web NFC is supported)
3. Browser shows NFC prompt — "Hold your NFC tag to the back of your phone"
4. Web NFC API reads the tag's **hardware serial number** (UID) — this is read-only, unique per tag, unforgeable
5. Web NFC API writes an NDEF URL record to the tag: `https://records.manhart.io/listen/{nfc_uid}`
6. Frontend inserts a row into `nfc_tags` table: `{ nfc_uid, release_id }`
7. UI confirms: "Tag linked to [Album Name]!"

**Web NFC API requirements:**
- HTTPS (Vercel provides this)
- Chrome on Android only (no iOS — Apple locks NFC)
- Must be triggered by a user gesture (button tap)
- Page must be in foreground during scan

**Code approach:**
```typescript
// Pairing — read UID + write URL
const ndef = new NDEFReader();
await ndef.scan();
ndef.onreading = async (event) => {
  const uid = event.serialNumber; // e.g., "04:a2:3b:1a:2c:5e:80"

  // Write the listen URL to the tag
  await ndef.write({
    records: [{ recordType: "url", data: `https://records.manhart.io/listen/${uid}` }]
  });

  // Save mapping to Supabase
  await supabase.from('nfc_tags').insert({ nfc_uid: uid, release_id: currentRecordId });
};
```

### Listen Logging Flow (native Android NFC → web page)

**When:** Every time user listens to a record
**Where:** Anywhere — phone just needs to be unlocked
**How:**

1. User taps Pixel on the NFC tag stuck to the record/sleeve
2. Android OS reads the NDEF URL from the tag (no app needed)
3. Android auto-opens Chrome to `https://records.manhart.io/listen/{nfc_uid}`
4. React route `/listen/:nfcUid` mounts and:
   a. Looks up `nfc_tags` by `nfc_uid` → gets `release_id`
   b. Fetches the record details (album art, title, artist)
   c. Inserts row into `listens` table: `{ release_id, source: 'nfc' }`
   d. Shows confirmation: album art + "Listen logged!" + listen count
5. Optional: auto-close or redirect after a few seconds

**Edge cases to handle:**
- Unknown NFC UID (tag not paired yet) → "This tag isn't linked to a record. Pair it from your collection."
- Duplicate rapid taps → debounce (ignore listens within 60 seconds of the last one for same record)
- Offline → queue the listen in localStorage, sync when back online (stretch goal)

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
| Debounce             | Ignore duplicate NFC listens within 60s for same release_id |

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

### Phase 2: Pairing Flow (in-browser)
3. Add Web NFC TypeScript types (or `@types/web-nfc`)
4. Create NFC pairing hook: `useNfcPairing(releaseId)`
5. Add "Link NFC Tag" button to record detail page
6. Implement read UID + write URL + save to Supabase flow
7. Handle browser compatibility (hide button on unsupported browsers)

### Phase 3: Listen Logging Route
8. Create `/listen/:nfcUid` route and component
9. Implement lookup → log → confirmation flow
10. Add debounce logic (prevent rapid duplicate logs)
11. Add to Vercel rewrite rules if needed (SPA catch-all should handle it)

### Phase 4: Stats Frontend (future)
12. Listen history page (recent listens)
13. Most played records
14. Listening streaks / calendar heatmap
15. Per-record listen count on detail pages

---

## Tag Placement

Recommended: stick NTAG215 tags on the **inner sleeve** or **back of the jacket** where they won't interfere with the vinyl or artwork. The Pixel's NFC reader is in the upper-center back of the phone.

---

## Notes

- Web NFC API is only available in Chrome on Android (perfect for Pixel, no iOS)
- NTAG215 hardware UID is read-only and unique per tag — good for identification
- 504 bytes easily fits the listen URL (well under 100 bytes needed)
- Tags are the same chip used in Amiibos — well-proven hardware
- Android reads NFC tags natively at the OS level — no app needed for URL-type NDEF records
- The pairing step is the only part that requires the website to be open
- Daily listen logging is completely frictionless: tap phone on record → done
