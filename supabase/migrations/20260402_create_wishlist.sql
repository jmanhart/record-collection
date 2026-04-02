-- Create wishlist table for Discogs wantlist sync
CREATE TABLE wishlist (
  id BIGINT PRIMARY KEY,
  release_id BIGINT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  supabase_image_url TEXT,
  genres TEXT[] DEFAULT '{}',
  styles TEXT[] DEFAULT '{}',
  format_name TEXT DEFAULT 'Unknown',
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous read access (matches records table policy)
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON wishlist
  FOR SELECT
  TO anon
  USING (true);
