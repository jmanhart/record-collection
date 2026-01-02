# Environment Variables Setup Guide

This document lists all the environment variables you need to set up in your `.env` file at the root of the project.

## Required Environment Variables

### Supabase Configuration
These are used by the main React application and the sync tool:

- **`VITE_SUPABASE_URL`** - Your Supabase project URL
  - Format: `https://your-project-id.supabase.co`
  - Used in: `src/services/supabase.ts`, `src/api/updateSupabase.ts`, sync tool
  - Where to find: Supabase Dashboard → Settings → API → Project URL

- **`VITE_SUPABASE_ANON_KEY`** - Your Supabase anonymous/public key
  - Used in: `src/services/supabase.ts`, `src/api/updateSupabase.ts`, sync tool
  - Where to find: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

- **`SUPABASE_SERVICE_ROLE_KEY`** - Your Supabase service role key (for admin operations)
  - Used in: `tools/sync/src/utils/supabase.ts` (for uploading images and admin operations)
  - ⚠️ **Keep this secret!** This key has admin privileges
  - Where to find: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`

### Discogs API Configuration
Used for syncing your record collection from Discogs:

- **`DISCOGS_USER`** - Your Discogs username
  - Used in: `tools/sync/src/utils/fetchDiscogs.ts`
  - Example: `manhartjohn` (as seen in the code)

- **`PUBLIC_DISCOGS_API_TOKEN`** - Your Discogs API token
  - Used in: `tools/sync/src/utils/fetchDiscogs.ts`
  - Where to get: https://www.discogs.com/settings/developers → Generate new token

- **`VITE_DISCOGS_TOKEN`** - Discogs API token (for main app)
  - Used in: `src/api/updateSupabase.ts`
  - Note: This might be the same as `PUBLIC_DISCOGS_API_TOKEN`

### Sentry Configuration (Optional)
Used for error tracking and monitoring:

- **`VITE_SENTRY_DSN`** - Sentry DSN for error tracking
  - Used in: `src/config/sentry.ts`
  - Note: There's a fallback DSN in the code, but you should set your own
  - Where to find: Sentry Dashboard → Settings → Client Keys (DSN)

- **`SENTRY_AUTH_TOKEN`** - Sentry authentication token (for build/source maps)
  - Used in: `vite.config.ts` (for Sentry Vite plugin)
  - Where to get: Sentry Dashboard → Settings → Auth Tokens → Create New Token
  - Required scopes: `project:releases`, `org:read`

- **`VITE_APP_VERSION`** - App version for Sentry release tracking (optional)
  - Used in: `src/config/sentry.ts`
  - Example: `1.0.0`

## Example .env File

Create a `.env` file in the root directory with the following structure:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Discogs API Configuration
DISCOGS_USER=your-discogs-username
PUBLIC_DISCOGS_API_TOKEN=your-discogs-token-here
VITE_DISCOGS_TOKEN=your-discogs-token-here

# Sentry Configuration (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
VITE_APP_VERSION=1.0.0
```

## Where to Get These Values

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and API keys

### Discogs
1. Go to https://www.discogs.com/settings/developers
2. Generate a new personal access token
3. Copy your username from your profile URL

### Sentry
1. Go to https://sentry.io/settings/
2. Navigate to your project
3. Go to Settings → Client Keys (DSN) for the DSN
4. Go to Settings → Auth Tokens to create a new token

## Notes

- All `VITE_` prefixed variables are exposed to the client-side code (browser)
- Variables without `VITE_` prefix are only available in Node.js/server-side code
- The sync tool (`tools/sync`) reads from the root `.env` file
- Make sure `.env` is in your `.gitignore` file (it should be by default)

## Verification

After setting up your `.env` file, you can verify it's working by:

1. **Main app**: Run `npm run dev` - should start without errors
2. **Sync tool**: Run `npm run sync:discogs` - should connect to Supabase and Discogs

