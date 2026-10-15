import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GUIDEBOOK_FILENAME, escapeHtml, guidebookExists, readGuidebook, verifyToken } from "@/lib/guidebook";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const lead = verifyToken(token);
    if (!lead) {
      return NextResponse.json({ error: "This link has expired. Please unlock the guide again." }, { status: 401 });
    }
    if (!guidebookExists()) {
      return NextResponse.json({ error: "The guidebook is not available yet." }, { status: 503 });
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email is not available right now. Please use the download button instead." }, { status: 503 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "LTS ELITE PREP <info@ltseliteprep.ca>",
      to: lead.email,
      subject: "Your copy of The Next Rep Player Guide",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
          <p>Hi ${escapeHtml(lead.parentName || "there")},</p>
          <p>Thanks for your interest in LTS Elite Prep! Your free copy of <strong>The Next Rep Player Guide</strong> is attached to this email as a PDF.</p>
          <p>If you have any questions or want to see how we train, reply to this email or visit <a href="https://www.ltseliteprep.ca">ltseliteprep.ca</a>.</p>
          <p style="margin-top:40px;">Best regards,<br><strong>Paolo</strong><br>LTS ELITE PREP Team</p>
        </div>
      `,
      attachments: [{ filename: GUIDEBOOK_FILENAME, content: readGuidebook() }],
    });
    if (error) {
      console.error("Guidebook email error:", error);
      return NextResponse.json({ error: "We could not send the email. Please use the download button instead." }, { status: 502 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("analytics_events").insert({
        event_type: "button_click",
        page: "/guide",
        label: "guidebook_emailed",
        session_id: "server",
        metadata: {},
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Guidebook email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
