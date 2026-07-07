-- Custom per-record metadata not sourced from Discogs: acquired date,
-- purchase location, tags, favorite flag.

alter table records
  add column if not exists acquired_at timestamptz,
  add column if not exists purchase_location text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_favorite boolean not null default false;

create table if not exists tag_options (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists purchase_location_options (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Public RLS, same accepted trade-off as nfc_tags/listens: no user-auth
-- system exists on this site, so the anon key needs read+write. The
-- /admin password gate is a UI convenience only, not real authorization.
alter table tag_options enable row level security;
alter table purchase_location_options enable row level security;

create policy "Allow public read" on tag_options
  for select to anon using (true);

create policy "Allow public insert" on tag_options
  for insert to anon with check (true);

create policy "Allow public read" on purchase_location_options
  for select to anon using (true);

create policy "Allow public insert" on purchase_location_options
  for insert to anon with check (true);
