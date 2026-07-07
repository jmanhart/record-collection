-- Track list data from Discogs' full release endpoint, captured
-- alongside duration_seconds (same API response, previously discarded).
ALTER TABLE records ADD COLUMN IF NOT EXISTS tracklist JSONB;
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS tracklist JSONB;
