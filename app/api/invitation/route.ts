import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "documents",
  "invitation-template.pdf"
);

// Coordinates (PDF points, origin bottom-left) for the "MR. / MRS. ........."
// guest-name line on page 2 of the invitation — calibrated against the
// supplied template. If the invitation design ever changes, re-calibrate
// these against the new PDF before deploying.
const NAME_LINE = {
  pageIndex: 1, // page 2 of the PDF (0-indexed)
  x0: 83,
  x1: 261,
  y: 191,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = (searchParams.get("name") || "").trim();

    if (!rawName) {
      return NextResponse.json(
        { error: "A guest name is required to generate the invitation." },
        { status: 400 }
      );
    }

    // Keep it to a sane length so it can never overflow the card.
    const displayName = rawName.slice(0, 60);

    const templateBytes = await fs.readFile(TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[NAME_LINE.pageIndex];
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Shrink the font until the name fits within the dotted line, down to a
    // sensible minimum, so long names never spill off the card.
    let fontSize = 12;
    const maxWidth = NAME_LINE.x1 - NAME_LINE.x0 - 6;
    let textWidth = font.widthOfTextAtSize(displayName, fontSize);
    while (textWidth > maxWidth && fontSize > 7) {
      fontSize -= 0.5;
      textWidth = font.widthOfTextAtSize(displayName, fontSize);
    }

    const x = NAME_LINE.x0 + Math.max(0, (maxWidth - textWidth) / 2) + 3;

    page.drawText(displayName, {
      x,
      y: NAME_LINE.y,
      size: fontSize,
      font,
      color: rgb(0.16, 0.04, 0.04),
    });

    const filledBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(filledBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Umini-and-Randeera-Wedding-Invitation.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Invitation generation error:", err);
    return NextResponse.json(
      { error: "We couldn't generate your invitation. Please try again." },
      { status: 500 }
    );
  }
}
