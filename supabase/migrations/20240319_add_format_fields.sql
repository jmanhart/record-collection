-- Add new columns for format and category information
ALTER TABLE records
ADD COLUMN IF NOT EXISTS genres text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS styles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS format_name text,
ADD COLUMN IF NOT EXISTS format_descriptions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS format_quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS year integer; 