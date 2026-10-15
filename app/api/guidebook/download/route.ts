import { NextResponse } from "next/server";
import { GUIDEBOOK_FILENAME, guidebookExists, readGuidebook, verifyToken } from "@/lib/guidebook";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "This download link has expired. Please unlock the guide again." }, { status: 401 });
  }
  if (!guidebookExists()) {
    return NextResponse.json({ error: "The guidebook is not available yet." }, { status: 503 });
  }
  return new NextResponse(new Uint8Array(readGuidebook()), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${GUIDEBOOK_FILENAME}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
