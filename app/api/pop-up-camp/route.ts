import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SESSION_LABELS: Record<string, string> = {
  "session-1": "12:30 PM – 1:45 PM",
  "session-2": "2:00 PM – 3:15 PM",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      athleteName,
      age,
      grade,
      school,
      parentName,
      parentPhone,
      parentEmail,
      session,
    } = body;

    if (!athleteName || !age || !grade || !school || !parentName || !parentPhone || !parentEmail || !session) {
      return NextResponse.json(
        { error: "Athlete name, age, grade, school, parent name, parent phone, parent email, and session are required" },
        { status: 400 }
      );
    }

    if (session !== "session-1" && session !== "session-2") {
      return NextResponse.json({ error: "Invalid session selection" }, { status: 400 });
    }

    const sessionLabel = SESSION_LABELS[session];

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Mock pop-up camp registration (Supabase not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: dbError } = await supabase.from("camp_registrations").insert({
      athlete_name: athleteName,
      parent_name: parentName,
      parent_email: parentEmail.trim().toLowerCase(),
      parent_phone: parentPhone,
      school,
      age,
      grade,
      camp_id: "pop-up-camp-sept7",
      camp_name: "Free Pop-Up Camp",
      amount: "Free",
      package_type: "pop-up-camp",
      dropin_session: session,
      status: "confirmed",
    });

    if (dbError) {
      console.error("Pop-Up Camp DB Error:", dbError);
      return NextResponse.json(
        { error: "Failed to save registration. Please try again or email info@ltseliteprep.ca." },
        { status: 500 }
      );
    }

    await supabase.from("analytics_events").insert({
      event_type: "form_submit",
      page: "/pop-up-camp",
      label: "pop_up_camp_registration",
      session_id: "server",
      metadata: { session },
    });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, warning: "Email not configured" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const location = "The Hoop Vancouver — 11111 Twigg Pl #1061, Richmond, BC";

    await Promise.all([
      // ── Parent confirmation email ──────────────────────────
      resend.emails.send({
        from: "LTS ELITE PREP <info@ltseliteprep.ca>",
        to: parentEmail,
        subject: `You're In! Free Pop-Up Camp — ${athleteName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
            <div style="background:#000;padding:28px 32px;border-radius:16px 16px 0 0;">
              <p style="color:#fff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">LTS ELITE PREP</p>
              <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-0.02em;">Free Pop-Up Camp</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;">Labour Day · HS Athletes Preview</p>
            </div>

            <div style="background:#f9f9f9;padding:28px 32px;">
              <p>Hi <strong>${parentName}</strong>,</p>
              <p>${athleteName} is registered for our free Pop-Up Camp — no payment needed, just show up ready to play!</p>

              <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 12px;">Registration Summary</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${athleteName}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Date</td><td style="padding:6px 0;font-weight:700;">Monday, September 7, 2026 (Labour Day)</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Session</td><td style="padding:6px 0;font-weight:700;">${sessionLabel}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Location</td><td style="padding:6px 0;font-weight:700;">${location}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Cost</td><td style="padding:6px 0;font-size:20px;font-weight:900;">FREE</td></tr>
                </table>
              </div>

              <p>Have any questions? Reply to this email or contact <a href="mailto:info@ltseliteprep.ca">info@ltseliteprep.ca</a></p>
              <p style="margin-top:32px;font-size:14px;">See you on the court,<br/><strong>Paolo</strong><br/>LTS ELITE PREP Team</p>
            </div>

            <div style="background:#f0f0f0;padding:16px 32px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="font-size:11px;color:#999;margin:0;">Free Pop-Up Camp · September 7, 2026 · ${location}</p>
            </div>
          </div>
        `,
      }),

      // ── Admin notification ──────────────────────────────────
      resend.emails.send({
        from: "LTS System <info@ltseliteprep.ca>",
        to: "paolo@ltseliteprep.ca",
        subject: `🏀 NEW POP-UP CAMP REG: ${athleteName}`,
        html: `
          <h2 style="font-family:sans-serif;">New Free Pop-Up Camp Registration</h2>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${athleteName}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Age</td><td style="padding:6px 0;">${age}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Grade</td><td style="padding:6px 0;">${grade}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">School</td><td style="padding:6px 0;">${school}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Session</td><td style="padding:6px 0;font-weight:700;">${sessionLabel}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent</td><td style="padding:6px 0;">${parentName}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Phone</td><td style="padding:6px 0;">${parentPhone}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Email</td><td style="padding:6px 0;">${parentEmail}</td></tr>
          </table>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pop-Up Camp API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
