# Umini & Randeera — Wedding Website

A luxurious, interactive Next.js 14 (App Router) wedding website with an
intro music/video gate, countdown timer, Poruwa ceremony details, photo
gallery, an RSVP form with photo upload, and a live "Attending Guests"
photo wall — backed by Supabase and Resend.

---

## 1. What's included

```
umini-randeera-wedding/
├── app/
│   ├── layout.tsx          # Fonts + global layout
│   ├── page.tsx             # Full single-page experience
│   ├── globals.css
│   └── api/rsvp/route.ts    # Handles upload + DB insert + email
├── components/
│   ├── IntroOverlay.tsx
│   ├── AudioPlayer.tsx
│   ├── HeroSection.tsx
│   ├── CountdownTimer.tsx
│   ├── DetailsSection.tsx
│   ├── PoruwaTimeline.tsx
│   ├── MapSection.tsx
│   ├── GallerySection.tsx
│   ├── RsvpForm.tsx
│   └── GuestWall.tsx
├── lib/
│   ├── supabaseClient.ts    # Browser client (anon key)
│   └── supabaseAdmin.ts     # Server-only client (service role key)
├── supabase/schema.sql      # Full DB + storage + RLS setup script
├── .env.local.example
└── package.json
```

**Note on media files:** the intro cinematic video, hero background video,
background music track, and gallery photos are referenced by path
(`/public/video/intro-cinematic.mp4`, `/public/video/hero-loop.mp4`,
`/public/audio/wedding-theme.mp3`, `/public/images/gallery/photo-1.jpg`
etc.) but are **not included** — those are the couple's own media, which
you should drop into the matching `public/` folders. The code degrades
gracefully: if `intro-cinematic.mp4` is missing, the intro just skips
straight to the site; if `hero-loop.mp4` is missing, the poster image
shows instead.

---

## 2. Local setup

### Step 1 — Install dependencies
```bash
cd umini-randeera-wedding
npm install
```

### Step 2 — Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Once it's provisioned, open **SQL Editor** and paste the entire contents
   of `supabase/schema.sql`, then **Run**. This creates:
   - The `rsvps` table with a `check` constraint on `attendance_status`
   - Row Level Security policies (public insert, public read of attending
     guests only)
   - The `guest-photos` public Storage bucket with a public-read policy
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     never put it behind `NEXT_PUBLIC_`)

### Step 3 — Set up Resend (email notifications)
1. Sign up at [resend.com](https://resend.com) → **API Keys** → create a
   key → this is your `RESEND_API_KEY`.
2. Under **Domains**, add and verify the domain you want to send from
   (e.g. `yourdomain.com`). Until a domain is verified, Resend only lets
   you send to your own account email — fine for testing, but you'll want
   a verified domain before the real wedding invites go out.
3. Set `RESEND_FROM_ADDRESS` to something like
   `RSVP <rsvp@yourdomain.com>` on that verified domain.
4. Set `COUPLE_NOTIFICATION_EMAIL` to the inbox that should receive every
   RSVP (this can be Umini's or Randeera's personal email, or a shared
   one).

### Step 4 — Environment variables
```bash
cp .env.local.example .env.local
```
Fill in all six values from Steps 2–3.

### Step 5 — Add your media
Drop your files into:
- `public/video/intro-cinematic.mp4` — short cinematic intro clip
- `public/video/hero-loop.mp4` — looping hero background video
- `public/images/hero-poster.jpg` — fallback poster image for the hero video
- `public/audio/wedding-theme.mp3` — background music track
- `public/images/gallery/photo-1.jpg` … `photo-6.jpg` — pre-wedding shoot
  photos (add more and extend the array in `GallerySection.tsx` if needed)

### Step 6 — Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 3. How the RSVP flow works

1. Guest fills the form in `RsvpForm.tsx` and submits.
2. The form `POST`s a `FormData` payload (including the photo file, if
   any) to `app/api/rsvp/route.ts`.
3. The API route, running server-side with the **service role key**:
   - Validates the input (name, contact, file type/size ≤ 5MB)
   - Uploads the photo to the `guest-photos` Storage bucket (only when
     `attendance_status === "attending"` and a file was provided)
   - Inserts the RSVP row into the `rsvps` table
   - Sends a notification email to `COUPLE_NOTIFICATION_EMAIL` via Resend
     (this step is best-effort — if email sending fails, the RSVP itself
     is still saved)
4. `GuestWall.tsx` subscribes to Supabase Realtime on the `rsvps` table
   and re-queries on load, always selecting **only** `id`, `full_name`,
   `photo_url` for rows where `attendance_status = 'attending'` — phone
   numbers, emails, guest counts, and messages are never fetched into
   that component, so they can't leak onto the public wall.

---

## 4. Deploying to Vercel (free)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   the repo.
3. In **Environment Variables**, add all six values from `.env.local`
   (Vercel will prompt you during import, or add them later under
   **Settings → Environment Variables**).
4. Click **Deploy**. Vercel auto-detects Next.js — no config needed.
5. Once deployed, add your production domain (if you have one) under
   **Settings → Domains**, and re-verify that domain with Resend if it's
   different from the one used for `RESEND_FROM_ADDRESS`.

---

## 5. Customizing further

- **Colors/fonts**: edit `tailwind.config.ts` (`ruby`, `wine`, `gold`,
  `cream`, `ivory` and the three font families).
- **Countdown target**: `WEDDING_DATE_ISO` in `CountdownTimer.tsx`.
- **Venue map**: `MapSection.tsx` builds the embed from a text query, so
  it works without a Google Maps API key. Swap in a Place ID for more
  precision if you have one.
- **Gallery images**: extend the `GALLERY_IMAGES` array in
  `GallerySection.tsx`.
