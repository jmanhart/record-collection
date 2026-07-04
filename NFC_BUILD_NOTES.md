# NFC Vinyl Listening Tracker — Build Notes

Reference doc for blog write-up. Covers what was built, why, and how it all connects.

---

## The Idea

Tap a phone on a vinyl record sleeve, and the site logs that you're listening to it. No app to open, no buttons to press — just tap and go. The listen data feeds a timeline so you can look back at what you've been playing.

## Hardware

- **Tags**: NTAG215 stickers (same chip as Amiibos). 504 bytes of writable memory, plus a read-only hardware UID that's unique per tag. Cheap, small enough to stick inside a record sleeve.
- **Reader**: Google Pixel with built-in NFC. Android reads NDEF URLs at the OS level — no app needed. Tap a tag, Chrome opens the URL automatically.
- **What's stored on the tag**: A single URL — `https://records.manhart.io/listen/{nfc_uid}`. That's it. Under 100 bytes.

## How Pairing Works

Before a tag does anything useful, it needs to be linked to a specific record in the database. There are two ways to do this:

### Web NFC (scan with phone)

The browser's Web NFC API (Chrome on Android only, HTTPS required) can both read and write NFC tags. The pairing dialog on a record's detail page lets you:

1. Tap "Start Scan" — browser starts listening for a tag
2. Hold the tag to the phone — browser reads the hardware UID
3. System saves the UID-to-record mapping in Supabase
4. System attempts to write the listen URL onto the tag

If the write fails (flaky API, tag pulled away too fast), the dialog shows a warning and a copyable URL so you can write it manually with NFC Tools.

### Manual entry (fallback)

Web NFC is unreliable enough that a manual path was essential from the start. Copy the tag's UID from NFC Tools, paste it into the dialog, and the system pairs it. Then copy the generated listen URL and write it to the tag yourself. Less magical, but it always works.

## The Listen Flow

This is what happens every time you tap a record:

1. Phone reads the NDEF URL from the tag
2. Android opens Chrome to `https://records.manhart.io/listen/{nfc_uid}`
3. The `ListenRedirect` component looks up the UID in the `nfc_tags` table
4. Finds the `release_id`, logs a row into the `listens` table
5. Redirects to the record's detail page (`/:artist/:album`)

The whole thing takes about a second. You tap, see a brief loading state, and land on the album page.

### Spam prevention

Every tap opens a new browser tab, so there's no client-side state to throttle with. The solution is a Postgres function (`log_listen()`) with a 2-minute global cooldown — if any listen was logged in the last 2 minutes, the insert silently does nothing. This matches the physical reality: you can only listen to one record at a time.

## Database

Two new tables, no foreign keys (keeps it simple with the existing schema):

### `nfc_tags`

Maps physical tags to records. One tag per record.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Auto-generated |
| nfc_uid | text | Hardware serial, normalized (lowercase, no separators) |
| release_id | integer | Discogs release ID |
| created_at | timestamptz | When it was paired |

### `listens`

Append-only log of every listening session.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Auto-generated |
| release_id | integer | What was played |
| listened_at | timestamptz | When |
| source | text | `'nfc'`, `'manual'`, or future sources like `'arduino'` |

Indexes on `listened_at DESC` (timeline queries) and `release_id` (per-record counts).

Both tables have public RLS policies — the site has no user auth, so reads and writes need to work without credentials. The cooldown function handles abuse prevention server-side.

## Frontend Components

### NFC Pairing Dialog

Modal on the record detail page. Shows two tabs if Web NFC is available (scan or manual entry), falls back to manual-only on desktop. When a tag is already paired, shows the UID, the listen URL with a copy button, and an unlink option.

### Listen Redirect

Minimal route component at `/listen/:uid`. Fetches tag data, logs the listen, redirects. Shows an error message if the UID is unknown or the record isn't found.

### Record Detail

Shows a listen count ("12 listens") when a tag is paired. The count query only runs if a tag exists for that record — no wasted requests.

### Record Grid

NFC badge (small icon) on cards for records that have linked tags. Filter dropdown to show only NFC-linked or unlinked records.

### Timeline

Chronological feed of all listens, grouped by day ("Today", "Yesterday", or a date). Each entry shows the album cover, artist/title, and time. Links back to the record detail page.

## UID Handling

NFC UIDs come in messy formats — `04:A2:3B:1A:2C:5E:80`, `04 A2 3B`, etc. A normalize function strips all separators and lowercases. A validation function checks for valid lengths (4-byte, 7-byte, or 10-byte tags = 8, 14, or 20 hex characters). All storage and URL usage works with the cleaned format.

## Key Decisions

| Decision | Why |
|----------|-----|
| NDEF URL on tags, not custom data | Android reads URLs natively — no app, no custom reader code |
| Two pairing methods | Web NFC is Chrome-on-Android-only and sometimes flaky. Manual entry is the reliable escape hatch |
| Server-side cooldown | No persistent client state between taps (each opens a new tab). Database is the only shared state |
| Global 2-min cooldown, not per-record | You physically can't listen to two records simultaneously |
| Public RLS | No auth system on the site. Cooldown function prevents meaningful abuse |
| Append-only listens table | Simple, auditable, easy to aggregate later. Never update or delete listen rows |
| Source column on listens | Future-proofs for Arduino reader, manual logging, or other input methods |

## What's Next

- **Analytics dashboard** — most played records, listening streaks, time-of-day patterns, genre breakdown
- **Arduino reader** — dedicated NFC reader hitting the same `/listen/:uid` endpoint
- **Pre-computed rollups** — daily/weekly/monthly aggregates for performance as the listens table grows
- **Tab cleanup** — `window.close()` after logging (works when the tab was opened by the OS)

## File Map

```
src/
  components/
    NfcPairingDialog/    — Pairing UI (scan + manual entry)
    ListenRedirect/      — /listen/:uid route handler
    RecordDetail/        — Integrates pairing dialog + listen count
    RecordCard/          — NFC badge on grid cards
    RecordGrid/          — NFC filter dropdown
    Timeline/            — Listen feed grouped by day
  hooks/
    useNfcTags.ts        — Tag CRUD + lookup helpers
    useListens.ts        — Timeline data fetching
  services/
    supabase.ts          — getNfcTags, createNfcTag, deleteNfcTag, logListen, getListens, getListenCount
  types/
    web-nfc.d.ts         — W3C Web NFC API type declarations
  utils/
    nfc.ts               — normalizeNfcUid, isValidNfcUid, isWebNfcSupported, buildListenUrl
  App.tsx                — /listen/:uid route

supabase/migrations/
  20260703_create_nfc_tags.sql
  20260703_create_listens.sql
  20260703_create_log_listen_function.sql
  20260703_patch_nfc_tags_policies.sql
```
