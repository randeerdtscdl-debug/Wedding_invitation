-- =========================================================
-- Migration: make phone required on rsvps, and add the
-- "memories" table + storage bucket for the new Memories wall.
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run even if you already have RSVP rows saved.
-- =========================================================

-- 1. Make phone required going forward.
--    Existing rows with a null phone are backfilled with a placeholder so
--    the NOT NULL constraint can be applied — update them manually later
--    if you want the real numbers on file.
update public.rsvps set phone = 'not provided' where phone is null;
alter table public.rsvps alter column phone set not null;

-- 2. MEMORIES TABLE
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text,
  related_to text not null default 'couple' check (related_to in ('couple', 'bride', 'groom')),
  comment text not null,
  photo_url text not null
);

comment on table public.memories is 'Guest-submitted photo memories & messages for Umini & Randeera''s wedding, shown on the public Memories wall.';

create index if not exists memories_created_idx
  on public.memories (created_at desc);

alter table public.memories enable row level security;

drop policy if exists "Public can submit memories" on public.memories;
create policy "Public can submit memories"
  on public.memories
  for insert
  to anon
  with check (true);

drop policy if exists "Public can view memories" on public.memories;
create policy "Public can view memories"
  on public.memories
  for select
  to anon
  using (true);

-- 3. STORAGE BUCKET FOR MEMORY PHOTOS
insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to memory photos" on storage.objects;
create policy "Public read access to memory photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'memory-photos');

-- 4. ENABLE REALTIME (so the Guest Wall and Memories wall update live,
--    without a page refresh, the instant a new row is inserted).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rsvps'
  ) then
    alter publication supabase_realtime add table public.rsvps;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'memories'
  ) then
    alter publication supabase_realtime add table public.memories;
  end if;
end $$;

-- =========================================================
-- Done. Verify in Table Editor:
--   rsvps      → "phone" column is now required (not null)
--   memories   → table exists, RLS enabled
-- Verify in Storage:
--   memory-photos → bucket exists, marked Public
-- Verify in Database → Replication:
--   rsvps & memories both listed under the supabase_realtime publication
-- =========================================================
