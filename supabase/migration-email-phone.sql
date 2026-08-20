-- =========================================================
-- Migration: split "contact" into separate "email" and "phone"
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run even if you already have RSVP rows saved.
-- =========================================================

-- 1. Add the new columns (nullable at first so existing rows don't break)
alter table public.rsvps add column if not exists email text;
alter table public.rsvps add column if not exists phone text;

-- 2. Best-effort backfill from the old "contact" column for existing rows:
--    if it looks like an email, put it in email; otherwise treat as phone.
update public.rsvps
set email = contact
where email is null and contact like '%@%';

update public.rsvps
set phone = contact
where phone is null and contact not like '%@%';

-- 3. Drop the old combined column now that data is migrated
alter table public.rsvps drop column if exists contact;

-- 4. Require email going forward (phone stays optional)
alter table public.rsvps alter column email set not null;

-- =========================================================
-- Done. Verify in Table Editor → rsvps that "email" and "phone"
-- columns exist and "contact" is gone.
-- =========================================================
