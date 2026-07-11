---
name: verify
description: Build, launch, and drive this app in a headless browser to verify UI changes end-to-end.
---

# Verifying record-collection changes

## Launch

```bash
pnpm run dev --port 5199 --strictPort   # run in background; Vite ready in <1s
curl -s -o /dev/null -w "%{http_code}" http://localhost:5199/   # 200 when up
```

Real Supabase data loads with the checked-in `.env` (140+ records, live listens), so pages render meaningful content — no seeding needed.

## Drive (headless browser)

No Playwright in the project, but browsers are cached at
`~/Library/Caches/ms-playwright/`. Install `playwright-core` in the session
scratchpad (`npm i playwright-core`) and launch with:

```js
chromium.launch({ executablePath:
  "/Users/manhart/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" })
```

(If that version dir is gone, `ls ~/Library/Caches/ms-playwright/` for the current one.)

## Flows worth driving

- `/` — collection grid, Tabs (Collection / Timeline / Wishlist / Collecting)
- `/home` — stats page: hero, StatCards, ListeningChart (Week/Month/Year + Time/Albums toggles), Activity feed
- `/:artist/:album` — record detail (slugified)
- `/collecting/:artistSlug` — discography progress

## Gotchas

- Theme persists in `localStorage.theme` ("light"/"dark"), applied before render — set it then `page.reload()` to test both themes.
- Headless defaults render the dark theme; pass `colorScheme: "light"` + `localStorage.theme = "light"` for light.
- Layout breakpoints: 900px (Home shell collapses to single column), check ~480px too.
- Recharts labels: read X-axis via `.recharts-cartesian-axis-tick-value tspan`.
- Site timezone is America/Los_Angeles; date bucketing keys off it, not UTC.
