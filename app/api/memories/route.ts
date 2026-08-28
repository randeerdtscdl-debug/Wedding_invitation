import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MEMORY_PHOTOS_BUCKET, MEMORIES_TABLE } from "@/lib/supabaseClient";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_RELATED = ["couple", "bride", "groom"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const guestName = String(formData.get("guest_name") || "").trim();
    const relatedToRaw = String(formData.get("related_to") || "couple").trim();
    const comment = String(formData.get("comment") || "").trim();
    const photo = formData.get("photo") as File | null;

    const relatedTo = ALLOWED_RELATED.includes(relatedToRaw) ? relatedToRaw : "couple";

    // --- Validation ---
    if (!comment) {
      return NextResponse.json(
        { error: "Please add a short message with your memory." },
        { status: 400 }
      );
    }
    if (!photo || photo.size === 0) {
      return NextResponse.json(
        { error: "Please upload a photo with your memory." },
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

    // --- Photo upload ---
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = photo.name.split(".").pop() || "jpg";
    const safeName = (guestName || "guest")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const fileName = `${Date.now()}-${safeName}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(MEMORY_PHOTOS_BUCKET)
      .upload(fileName, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error (memories):", uploadError);
      return NextResponse.json(
        { error: "We couldn't upload your photo. Please try again." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(MEMORY_PHOTOS_BUCKET)
      .getPublicUrl(fileName);

    const photoUrl = publicUrlData.publicUrl;

    // --- Database insert ---
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from(MEMORIES_TABLE)
      .insert({
        guest_name: guestName || null,
        related_to: relatedTo,
        comment,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error (memories):", insertError);
      return NextResponse.json(
        { error: "We couldn't save your memory. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, memory: inserted }, { status: 201 });
  } catch (err) {
    console.error("Memories route unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
