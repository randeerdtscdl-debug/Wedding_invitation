import { Resend } from "resend";

// Sends email via Resend's API (no SMTP, no Gmail App Password needed —
// this account's Google settings don't expose App Passwords).
//
// Setup:
//   1. Get an API key from https://resend.com/api-keys and put it in
//      RESEND_API_KEY in .env.local (and in Vercel → Settings →
//      Environment Variables for production).
//   2. Until a domain is verified in Resend, emails can only be sent to
//      the address that owns the Resend account (i.e. only good for
//      testing). Verify a domain (e.g. cdl.lk) under Resend → Domains
//      to send to any guest's email address.
//   3. RESEND_FROM_EMAIL controls the "from" address. Before domain
//      verification this MUST be onboarding@resend.dev. After
//      verifying a domain, switch it to something like
//      wedding@cdl.lk.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

let client: Resend | null = null;

function getClient() {
  if (!RESEND_API_KEY) return null;
  if (!client) {
    client = new Resend(RESEND_API_KEY);
  }
  return client;
}

/** True once RESEND_API_KEY is set. */
export function isMailerConfigured() {
  return Boolean(RESEND_API_KEY);
}

interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  /** Friendly display name shown as the sender, e.g. "Umini & Randeera". */
  fromName?: string;
}

/**
 * Sends one email via Resend. Throws on failure so callers can decide
 * whether to swallow the error (as the RSVP route does — email
 * failures should never block an RSVP from being saved).
 */
export async function sendMail({ to, subject, html, fromName }: SendMailArgs) {
  const resend = getClient();
  if (!resend) {
    throw new Error("Mailer not configured — set RESEND_API_KEY in .env.local");
  }

  const { error } = await resend.emails.send({
    from: fromName ? `${fromName} <${RESEND_FROM_EMAIL}>` : RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
  }
}
