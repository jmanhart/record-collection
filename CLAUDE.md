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
  components/       # React components with co-located .module.css
  hooks/            # useRecords.ts, useArticle.ts
  services/         # supabase.ts (client + CRUD)
  config/           # sentry.ts
  content/articles/ # MDX files named by Discogs record ID (e.g., 9216088.mdx)
  styles/           # global.css (theme variables)
  types/            # Record.ts (TypeScript interfaces)
tools/sync/         # Workspace package: Discogs -> Supabase sync tool
scripts/            # copyArticles.js, generateReadme.cjs
```

## Key Commands

```bash
npm run dev          # Copy articles + start Vite dev server
npm run build        # Production build (articles + Vite + Sentry sourcemaps)
npm run lint         # ESLint (strict, zero warnings)
npm run sync:discogs # Fetch records from Discogs, sync to Supabase
npm run sync:readme  # Generate README with album cover gallery
npm run sync:all     # Run both syncs
```

## Architecture Notes

- **Article system**: MDX files in `src/content/articles/` named by Discogs record ID. A Vite plugin auto-generates `index.ts` manifest for dynamic imports. Articles are also copied to `public/articles/` for static access. HMR supported for live editing.
- **Images**: Album covers stored in Supabase Storage (`record-images/covers/`). Fallback placeholder on load failure.
- **Theming**: CSS variables on `:root` / `.dark-theme`. Preference persisted in localStorage, applied before render to prevent flash.
- **Data flow**: Supabase -> React Query (5min stale time, no refetch on focus) -> components.
- **Workspaces**: `tools/sync` is a separate npm workspace with its own deps for the Discogs sync pipeline.

## Environment Variables

Defined in `.env` (see `ENV_SETUP.md` for details):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (browser-exposed)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for sync tool)
- `DISCOGS_TOKEN` (for Discogs API)
- `SENTRY_AUTH_TOKEN`, `VITE_SENTRY_DSN`

## Conventions

- Components use functional style with hooks, TypeScript interfaces for props
- One component per directory with co-located CSS Module
- Articles are optional per-album content, ~4 articles exist currently
- Collection has 140+ records synced from Discogs
