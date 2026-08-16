import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GUEST_PHOTOS_BUCKET, RSVP_TABLE } from "@/lib/supabaseClient";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

const COUPLE_NOTIFICATION_EMAIL =
  process.env.COUPLE_NOTIFICATION_EMAIL || "your-email@example.com";
// Resend requires a sender on a domain you've verified with them.
// See the setup instructions for how to configure this.
const RESEND_FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "RSVP <rsvp@yourdomain.com>";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = String(formData.get("full_name") || "").trim();
    const attendanceStatus = String(formData.get("attendance_status") || "").trim();
    const guestCountRaw = String(formData.get("guest_count") || "1");
    const contact = String(formData.get("contact") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const photo = formData.get("photo") as File | null;

    // --- Validation ---
    if (!fullName || !contact) {
      return NextResponse.json(
        { error: "Full name and contact information are required." },
        { status: 400 }
      );
    }
    if (attendanceStatus !== "attending" && attendanceStatus !== "declining") {
      return NextResponse.json(
        { error: "Invalid attendance status." },
        { status: 400 }
      );
    }
    const guestCount = Math.min(Math.max(parseInt(guestCountRaw, 10) || 1, 1), 10);

    let photoUrl: string | null = null;

    // --- Photo upload (only relevant when attending) ---
    if (photo && photo.size > 0) {
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

      photoUrl = publicUrlData.publicUrl;
    }

    // --- Database insert ---
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from(RSVP_TABLE)
      .insert({
        full_name: fullName,
        attendance_status: attendanceStatus,
        guest_count: attendanceStatus === "attending" ? guestCount : 0,
        contact,
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
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: RESEND_FROM_ADDRESS,
          to: COUPLE_NOTIFICATION_EMAIL,
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
                <tr><td style="padding:6px 0; color:#666;">Contact</td><td style="padding:6px 0;">${escapeHtml(
                  contact
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
      }
    } catch (emailError) {
      // We deliberately do not fail the whole request if only the email fails —
      // the RSVP is already safely stored in Supabase.
      console.error("Resend email error:", emailError);
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
