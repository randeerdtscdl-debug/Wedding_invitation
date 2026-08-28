-- =========================================================
-- Umini & Randeera Wedding Website — Supabase Setup Script
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- =========================================================

-- 1. RSVPS TABLE
-- ---------------------------------------------------------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  attendance_status text not null check (attendance_status in ('attending', 'declining')),
  guest_count integer not null default 1 check (guest_count >= 0 and guest_count <= 10),
  email text not null,
  phone text not null,
  message text,
  photo_url text
);

comment on table public.rsvps is 'Guest RSVP submissions for Umini & Randeera''s wedding.';

-- Helpful index for the public Guest Wall query (attending guests, newest first)
create index if not exists rsvps_attendance_created_idx
  on public.rsvps (attendance_status, created_at desc);

-- 2. ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.rsvps enable row level security;

-- Anyone (anon key) may INSERT a new RSVP — this is what powers the public
-- RSVP form. The API route actually uses the service_role key server-side
-- (which bypasses RLS entirely), so this policy is a safety net in case the
-- form is ever wired to call Supabase directly from the browser instead.
drop policy if exists "Public can submit RSVPs" on public.rsvps;
create policy "Public can submit RSVPs"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- Anyone may SELECT only the columns needed for the public Guest Wall.
-- Postgres RLS policies apply to rows, not columns, so column-level privacy
-- (hiding contact/message/guest_count) is enforced in the GuestWall
-- component by explicitly selecting only id, full_name, photo_url — never
-- select * from the client. This policy still restricts visible ROWS to
-- attending guests only, as a second layer of protection.
drop policy if exists "Public can view attending guests" on public.rsvps;
create policy "Public can view attending guests"
  on public.rsvps
  for select
  to anon
  using (attendance_status = 'attending');

-- The service_role key (used only in the server-side API route) bypasses
-- RLS automatically, so no additional policy is needed for inserts made
-- via app/api/rsvp/route.ts.

-- 3. STORAGE BUCKET FOR GUEST PHOTOS
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('guest-photos', 'guest-photos', true)
on conflict (id) do nothing;

-- Allow public read access to files in the guest-photos bucket so the
-- Guest Wall and RSVP emails can display them via their public URL.
drop policy if exists "Public read access to guest photos" on storage.objects;
create policy "Public read access to guest photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'guest-photos');

-- Uploads are performed server-side via the service_role key (which bypasses
-- storage RLS), so no public INSERT policy is required. If you later want
-- to allow direct browser uploads instead, add a scoped insert policy here.

-- 4. MEMORIES TABLE (guest-submitted photo + comment wall)
-- ---------------------------------------------------------
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

-- Anyone may insert a memory — this is what powers the public "Add Your
-- Memories" mini-form under the RSVP section. As with rsvps, the API route
-- actually writes via the service_role key (bypassing RLS); this policy is
-- a safety net in case the form is ever wired directly to Supabase.
drop policy if exists "Public can submit memories" on public.memories;
create policy "Public can submit memories"
  on public.memories
  for insert
  to anon
  with check (true);

-- The Memories wall is public by design (guests intentionally share these
-- to be seen by other guests), so every row is readable.
drop policy if exists "Public can view memories" on public.memories;
create policy "Public can view memories"
  on public.memories
  for select
  to anon
  using (true);

-- 5. STORAGE BUCKET FOR MEMORY PHOTOS
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to memory photos" on storage.objects;
create policy "Public read access to memory photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'memory-photos');

-- =========================================================
-- Done. Verify in the Supabase dashboard:
--   Table Editor → rsvps          (table exists, RLS enabled)
--   Table Editor → memories       (table exists, RLS enabled)
--   Storage → guest-photos        (bucket exists, marked Public)
--   Storage → memory-photos       (bucket exists, marked Public)
-- =========================================================
