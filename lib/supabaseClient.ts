import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev if env vars are missing instead of a silent runtime crash later.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Check your .env.local file."
  );
}

// Client-side (browser) Supabase instance. Uses the public anon key which is
// safe to expose — actual write permissions are enforced by RLS policies.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const GUEST_PHOTOS_BUCKET = "guest-photos";
export const RSVP_TABLE = "rsvps";

export type AttendanceStatus = "attending" | "declining";

export interface RsvpRecord {
  id?: string;
  created_at?: string;
  full_name: string;
  attendance_status: AttendanceStatus;
  guest_count: number;
  email: string;
  phone: string | null;
  message: string | null;
  photo_url: string | null;
}
