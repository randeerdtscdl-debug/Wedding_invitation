import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GUEST_PHOTOS_BUCKET, RSVP_TABLE } from "@/lib/supabaseClient";

export const runtime = "nodejs";

const COUPLE_NOTIFICATION_EMAIL =
  process.env.COUPLE_NOTIFICATION_EMAIL || "your-email@example.com";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Wedding details shown in the guest confirmation email — edit here if
// any detail changes, this is the single place it's defined.
const WEDDING_DETAILS = {
  coupleNames: "Umini & Randeera",
  dateLabel: "Thursday, 22nd October 2026",
  ceremonyTime: "9.15 A.M. (Poruwa Ceremony)",
  venueName: "Monarch Imperial",
  venueAddress: "Sri Jayawardenepura Kotte, Sri Lanka",
  mapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Monarch Imperial, Sri Jayawardenepura Kotte, Sri Lanka"),
  rsvpDeadline: "10th October 2026",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = String(formData.get("full_name") || "").trim();
    const attendanceStatus = String(formData.get("attendance_status") || "").trim();
    const guestCountRaw = String(formData.get("guest_count") || "1");
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const photo = formData.get("photo") as File | null;

    // --- Validation ---
    // Name, email, phone, and a photo are all required so every RSVP can
    // appear on the Guest Wall and the couple always has a way to reach back.
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Full name, email address, and phone number are all required." },
        { status: 400 }
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    if (attendanceStatus !== "attending" && attendanceStatus !== "declining") {
      return NextResponse.json(
        { error: "Invalid attendance status." },
        { status: 400 }
      );
    }
    if (!photo || photo.size === 0) {
      return NextResponse.json(
        { error: "Please upload a photo to complete your RSVP." },
        { status: 400 }
      );
    }
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      return NextResponse.json(
        { error: "Unsupported photo format. Please upload a JPG, PNG, WEBP or HEIC image." },
        { status: 400 }
      );
    }
    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Photo must be smaller than 5MB." },
        { status: 400 }
      );
    }
    const guestCount = Math.min(Math.max(parseInt(guestCountRaw, 10) || 1, 1), 10);

    // --- Photo upload ---
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = photo.name.split(".").pop() || "jpg";
    const safeName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const fileName = `${Date.now()}-${safeName}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(GUEST_PHOTOS_BUCKET)
      .upload(fileName, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "We couldn't upload your photo. Please try again." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(GUEST_PHOTOS_BUCKET)
      .getPublicUrl(fileName);

    const photoUrl = publicUrlData.publicUrl;

    // --- Database insert ---
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from(RSVP_TABLE)
      .insert({
        full_name: fullName,
        attendance_status: attendanceStatus,
        guest_count: attendanceStatus === "attending" ? guestCount : 0,
        email,
        phone: phone || null,
        message: message || null,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "We couldn't save your RSVP. Please try again." },
        { status: 500 }
      );
    }

    // --- Email notification to the couple (non-blocking best-effort) ---
    try {
      await sendMail({
        to: COUPLE_NOTIFICATION_EMAIL,
        fromName: WEDDING_DETAILS.coupleNames,
        subject: `New RSVP: ${fullName} — ${
          attendanceStatus === "attending" ? "Attending 🎉" : "Regretfully Declining"
        }`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color:#8B0000;">New RSVP Received</h2>
              <table style="width:100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding:6px 0; color:#666;">Name</td><td style="padding:6px 0;"><strong>${escapeHtml(
                  fullName
                )}</strong></td></tr>
                <tr><td style="padding:6px 0; color:#666;">Status</td><td style="padding:6px 0;">${
                  attendanceStatus === "attending" ? "Attending" : "Regretfully Declining"
                }</td></tr>
                <tr><td style="padding:6px 0; color:#666;">Guests</td><td style="padding:6px 0;">${guestCount}</td></tr>
                <tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0;">${escapeHtml(
                  email
                )}</td></tr>
                <tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;">${escapeHtml(
                  phone || "—"
                )}</td></tr>
                <tr><td style="padding:6px 0; color:#666;">Message</td><td style="padding:6px 0;">${escapeHtml(
                  message || "—"
                )}</td></tr>
              </table>
              ${
                photoUrl
                  ? `<p style="margin-top:16px;"><img src="${photoUrl}" alt="Guest photo" style="max-width:200px; border-radius:8px;" /></p>`
                  : ""
              }
            </div>
          `,
      });
    } catch (emailError) {
      // We deliberately do not fail the whole request if only the email fails —
      // the RSVP is already safely stored in Supabase.
      console.error("Mailer error (couple notification):", emailError);
    }

    // --- Confirmation email to the guest, with wedding details & location ---
    try {
      const isAttending = attendanceStatus === "attending";
      await sendMail({
        to: email,
        fromName: WEDDING_DETAILS.coupleNames,
        subject: isAttending
          ? `You're Invited: ${WEDDING_DETAILS.coupleNames}'s Wedding — ${WEDDING_DETAILS.dateLabel}`
          : `Thank You For Your RSVP — ${WEDDING_DETAILS.coupleNames}`,
        html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color:#2B1010;">
              <h2 style="color:#8B0000; margin-bottom:4px;">${escapeHtml(
                WEDDING_DETAILS.coupleNames
              )}</h2>
              <p style="color:#800020; font-style:italic; margin-top:0;">are getting married</p>

              <p style="font-size:15px; line-height:1.6;">
                Dear <strong>${escapeHtml(fullName)}</strong>,<br/><br/>
                ${
                  isAttending
                    ? "Thank you for confirming you'll be joining us! Here are the wedding details:"
                    : "Thank you for letting us know. We'll miss you, but here are the details in case your plans change:"
                }
              </p>

              <table style="width:100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
                <tr><td style="padding:6px 0; color:#666; width:120px;">Date</td><td style="padding:6px 0;"><strong>${
                  WEDDING_DETAILS.dateLabel
                }</strong></td></tr>
                <tr><td style="padding:6px 0; color:#666;">Ceremony</td><td style="padding:6px 0;">${
                  WEDDING_DETAILS.ceremonyTime
                }</td></tr>
                <tr><td style="padding:6px 0; color:#666;">Venue</td><td style="padding:6px 0;"><strong>${
                  WEDDING_DETAILS.venueName
                }</strong></td></tr>
                <tr><td style="padding:6px 0; color:#666;">Location</td><td style="padding:6px 0;">${
                  WEDDING_DETAILS.venueAddress
                }</td></tr>
              </table>

              <p style="margin: 20px 0;">
                <a href="${WEDDING_DETAILS.mapsUrl}"
                   style="background:#8B0000; color:#D4AF37; padding:10px 22px; border-radius:24px; text-decoration:none; font-size:13px; letter-spacing:1px; text-transform:uppercase;">
                  Get Directions
                </a>
              </p>

              <p style="font-size:13px; color:#888;">
                Please let us know of any changes before ${WEDDING_DETAILS.rsvpDeadline}.
              </p>

              <p style="margin-top:24px; font-style:italic; color:#8B0000;">
                With love,<br/>${escapeHtml(WEDDING_DETAILS.coupleNames)}
              </p>
            </div>
          `,
      });
    } catch (guestEmailError) {
      // Same best-effort handling — a failed guest confirmation email should
      // never block the RSVP from being saved.
      console.error("Mailer error (guest confirmation):", guestEmailError);
    }

    return NextResponse.json({ success: true, rsvp: inserted }, { status: 201 });
  } catch (err) {
    console.error("RSVP route unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
