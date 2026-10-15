import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GUIDEBOOK_FILENAME, guidebookExists, readGuidebook, verifyToken } from "@/lib/guidebook";

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
          <p>Thank you for your interest in LTS Elite Prep!</p>
          <p>Every great athlete starts with a commitment to getting better, and we&rsquo;re excited to help your athlete take that next step.</p>
          <p>Your complimentary copy of <strong>The Next Rep Player Guide</strong> is attached to this email.</p>
          <p>Inside, you&rsquo;ll discover practical insights to help your athlete approach training with greater purpose, confidence, and intention.</p>
          <p><strong>What&rsquo;s next?</strong></p>
          <p>If you&rsquo;re interested in seeing how we put these principles into practice, we&rsquo;d love to introduce you to our training programs.</p>
          <p>Simply reply to this email or visit <a href="https://www.ltseliteprep.ca">ltseliteprep.ca</a> to learn more.</p>
          <p>See you on the court!</p>
          <p style="margin-top:32px;">LTS Elite Prep Team</p>
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
        page: "/nextrep",
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
