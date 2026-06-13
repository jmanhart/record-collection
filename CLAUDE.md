# Record Collection - records.manhart.io

Personal vinyl record collection site built with React + TypeScript + Vite, backed by Supabase, with data sourced from Discogs.

## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, React Router 6
- **Data**: Supabase (Postgres + Storage), TanStack React Query 5
- **Content**: MDX articles (personal write-ups about select albums)
- **Styling**: CSS Modules with CSS variables (light/dark theme)
- **UI**: Radix UI (dialog, dropdown), Lucide icons
- **Monitoring**: Sentry (errors, replay, tracing)
- **Deployment**: Vercel (SPA with rewrite rules)

## Project Structure

```
src/
  components/            # React components with co-located .module.css
    ArtistProgress/      # Discography progress tracker (list + detail views)
  data/                  # Static JSON data (discography-targets.json)
  hooks/                 # useRecords.ts, useArticle.ts, useDiscography.ts
  services/              # supabase.ts (client + CRUD)
  config/                # sentry.ts
  content/articles/      # MDX files named by Discogs record ID (e.g., 9216088.mdx)
  styles/                # global.css (theme variables)
  types/                 # Record.ts (TypeScript interfaces)
  utils/                 # slugify.ts
tools/sync/              # Workspace package: Discogs -> Supabase sync tool
  src/utils/             # fetchDiscogs, fetchDurations, syncDiscographyTargets, etc.
scripts/                 # copyArticles.js, generateReadme.cjs
```

## Key Commands

```bash
npm run dev              # Copy articles + start Vite dev server
npm run build            # Production build (articles + Vite + Sentry sourcemaps)
npm run lint             # ESLint (strict, zero warnings)
npm run sync:discogs     # Fetch records from Discogs, sync to Supabase
npm run sync:discography # Sync discography targets (enriches JSON with Discogs metadata)
npm run sync:readme      # Generate README with album cover gallery
npm run sync:all         # Run discogs + readme syncs
```

## Architecture Notes

- **Article system**: MDX files in `src/content/articles/` named by Discogs record ID. A Vite plugin auto-generates `index.ts` manifest for dynamic imports. Articles are also copied to `public/articles/` for static access. HMR supported for live editing.
- **Images**: Album covers stored in Supabase Storage (`record-images/covers/`). Fallback placeholder on load failure. Images keyed by `{releaseId}.jpeg`.
- **Theming**: CSS variables on `:root` / `.dark-theme`. Preference persisted in localStorage, applied before render to prevent flash.
- **Data flow**: Supabase -> React Query (5min stale time, no refetch on focus) -> components.
- **Workspaces**: `tools/sync` is a separate npm workspace with its own deps for the Discogs sync pipeline.
- **Discography tracker**: Hand-curated `src/data/discography-targets.json` defines artists and Discogs release IDs to track. A sync step (`syncDiscographyTargets.ts`) enriches these from the Discogs API into a `discography_targets` Supabase table. Frontend merges this with owned records to show collection progress per artist.

## Discography Tracker

Tracks progress toward completing specific artists' discographies.

### Data flow
1. **Source of truth**: `src/data/discography-targets.json` — array of `{ artist, slug, releaseIds[] }` (Discogs release IDs)
2. **Sync**: `npm run sync:discography` fetches metadata (title, year, cover) from Discogs API for any missing IDs, uploads covers to Supabase Storage, upserts into `discography_targets` table
3. **Frontend**: `useArtistDiscography(slug)` merges JSON config + Supabase metadata + owned records (from `useRecords()`) to produce album list with ownership status

### Supabase table: `discography_targets`
| Column | Type | Notes |
|--------|------|-------|
| release_id | integer PK | Discogs release ID |
| artist | text | Denormalized artist name |
| title | text | Album title from Discogs |
| year | integer | Release year |
| supabase_image_url | text | Cover image in Supabase Storage |

Requires a public-read RLS policy (same as `records` and `wishlist` tables).

### Routes
- `/collecting` — artist list with progress bars
- `/collecting/:artistSlug` — album grid (owned = color, unowned = greyscale + dimmed)
- Navigation: "Collecting" tab in the Tabs component alongside Collection and Wishlist

### Adding a new artist
1. Add an entry to `src/data/discography-targets.json` with the artist name, URL slug, and array of Discogs release IDs
2. Run `npm run sync:discography` to fetch metadata and images
3. The artist will appear at `/collecting` automatically

## Environment Variables

Defined in `.env` (see `ENV_SETUP.md` for details):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (browser-exposed)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for sync tool)
- `DISCOGS_TOKEN` / `PUBLIC_DISCOGS_API_TOKEN` (for Discogs API)
- `SENTRY_AUTH_TOKEN`, `VITE_SENTRY_DSN`

## Conventions

- Components use functional style with hooks, TypeScript interfaces for props
- One component per directory with co-located CSS Module
- CSS uses theme variables (`var(--text-primary)`, `var(--divider)`, `var(--surface200)`, etc.)
- Articles are optional per-album content, ~4 articles exist currently
- Collection has 140+ records synced from Discogs
- Record detail links follow `/:artist/:album` using `slugify()` from `src/utils/slugify.ts`
- Sync tools use `node-fetch`, `supabaseAdmin` (service role key), and rate-limit at ~1 req/sec for Discogs API
