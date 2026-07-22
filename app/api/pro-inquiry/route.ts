import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athleteName, ageGrade, parentName, email, phone, windows, details, packageInterest } = body;

    if (!athleteName || !parentName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const windowsLabel = Array.isArray(windows) && windows.length > 0 ? windows.join(", ") : "—";
    const packageLabel = packageInterest === "single" ? "Single Session ($85)" : "5-Session Package ($399.99)";

    const messageBody = [
      `Athlete: ${athleteName}`,
      `Age/Grade: ${ageGrade || "—"}`,
      `Interested in: ${packageLabel}`,
      `Preferred windows: ${windowsLabel}`,
      `Additional details: ${details || "—"}`,
    ].join("\n");

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: sbError } = await supabase.from("bookings").insert({
        name: parentName,
        email,
        phone: phone || null,
        program: "pro",
        message: messageBody,
      });

      if (sbError) {
        console.error("Supabase Insert Error (Pro Inquiry):", sbError);
        throw sbError;
      }

      await supabase.from("analytics_events").insert({
        event_type: "form_submit",
        page: "/pro",
        label: "pro_inquiry",
        session_id: "server",
        metadata: { packageInterest, windows },
      });
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "LTS Elite Prep <info@ltseliteprep.ca>",
          to: email,
          subject: "We received your LTS PRO reservation request",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <p>Hi ${parentName},</p>
              <p>Thanks for your interest in <strong>LTS PRO</strong> — our private training program for ${athleteName}.</p>
              <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:10px;font-size:14px;color:#444;white-space:pre-line;">${messageBody}</div>
              <p>Coach Paolo will follow up with you shortly to confirm session times and finalize payment.</p>
              <p style="margin-top:32px;">Best regards,<br/><strong>Paolo</strong><br/>LTS Elite Prep Team</p>
            </div>
          `,
        });

        await resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "paolo@ltseliteprep.ca",
          subject: `🏀 NEW LTS PRO INQUIRY: ${athleteName}`,
          html: `
            <h2 style="font-family:sans-serif;">New LTS PRO Reservation Request</h2>
            <p style="font-family:sans-serif;"><strong>Parent/Guardian:</strong> ${parentName}</p>
            <p style="font-family:sans-serif;"><strong>Email:</strong> ${email}</p>
            <p style="font-family:sans-serif;"><strong>Phone:</strong> ${phone || "—"}</p>
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
