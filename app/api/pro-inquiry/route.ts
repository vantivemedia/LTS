import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athleteName, school, grade, parentName, email, phone, sessionLength, availability, details } = body;

    if (!athleteName || !parentName || !email || !phone || !school || !grade) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // LTS PRO has no fixed schedule — every session is requested and confirmed by Coach Paolo.
    const lengthLabel = sessionLength === "90" ? "90 minutes ($105)" : "60 minutes ($85)";

    const messageBody = [
      `Athlete: ${athleteName}`,
      `School / Grade: ${school} / ${grade}`,
      `Session length: ${lengthLabel}`,
      `Availability: ${availability || "—"}`,
      `Additional details: ${details || "—"}`,
    ].join("\n");

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: sbError } = await supabase.from("bookings").insert({
        name: athleteName,
        parent_name: parentName,
        email,
        phone,
        school,
        grade,
        program: "pro",
        message: messageBody,
      });

      if (sbError) {
        console.error("Supabase Insert Error (Pro Inquiry):", sbError);
        return NextResponse.json(
          { error: "Failed to save your request. Please try again or email info@ltseliteprep.ca." },
          { status: 500 }
        );
      }

      await supabase.from("analytics_events").insert({
        event_type: "form_submit",
        page: "/pro",
        label: "pro_inquiry",
        session_id: "server",
        metadata: { sessionLength },
      });
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "LTS ELITE PREP <info@ltseliteprep.ca>",
          to: email,
          subject: "We received your LTS PRO session request",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <p>Hi ${parentName},</p>
              <p>Thanks for your interest in <strong>LTS PRO</strong> — private training for ${athleteName}.</p>
              <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:10px;font-size:14px;color:#444;white-space:pre-line;">${messageBody}</div>
              <p>Coach Paolo will follow up with you shortly to confirm a session time that works. Payment is by e-transfer to info@ltseliteprep.ca once your time is confirmed.</p>
              <p style="margin-top:32px;">Best regards,<br/><strong>Paolo</strong><br/>LTS ELITE PREP Team</p>
            </div>
          `,
        });

        await resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "paolo@ltseliteprep.ca",
          subject: `🏀 NEW LTS PRO REQUEST: ${athleteName}`,
          html: `
            <h2 style="font-family:sans-serif;">New LTS PRO Session Request</h2>
            <p style="font-family:sans-serif;"><strong>Parent/Guardian:</strong> ${parentName}</p>
            <p style="font-family:sans-serif;"><strong>Email:</strong> ${email}</p>
            <p style="font-family:sans-serif;"><strong>Phone:</strong> ${phone}</p>
            <pre style="font-family:sans-serif;white-space:pre-line;">${messageBody}</pre>
          `,
        });
      } catch (emailErr) {
        console.error("Email notification error (Pro Inquiry):", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pro Inquiry API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
