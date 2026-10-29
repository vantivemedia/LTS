import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { escapeHtml, isValidEmail, sanitizeAttribution } from "@/lib/guidebook";

// Transition to High School Basketball, Surrey. Grades 7-9, three Tuesday nights in November.
// Registrations live in camp_registrations (camp_id below).
const CAMP_ID = "transition-hs-surrey-nov";
const LOCATION = "Princess Margaret Secondary School, Surrey, BC";
const TIME = "8:00 – 9:30 PM";
const DROP_IN_PRICE = 65;
const ALL_THREE_PRICE = 150;

const SESSIONS = {
  nov3: { short: "Nov 3", long: "Tuesday, November 3", iso: "2026-11-03" },
  nov10: { short: "Nov 10", long: "Tuesday, November 10", iso: "2026-11-10" },
  nov17: { short: "Nov 17", long: "Tuesday, November 17", iso: "2026-11-17" },
} as const;
type SessionId = keyof typeof SESSIONS;
const SESSION_IDS = Object.keys(SESSIONS) as SessionId[];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const athleteName = String(body.athleteName || "").trim();
    const parentName = String(body.parentName || "").trim();
    const parentEmail = String(body.parentEmail || "").trim().toLowerCase();
    const parentPhone = String(body.parentPhone || "").trim();
    const school = String(body.school || "").trim();
    const grade = parseInt(String(body.grade || ""), 10);
    const plan = body.plan === "dropin" ? "dropin" : "all";
    const picked: SessionId[] = Array.isArray(body.dates)
      ? SESSION_IDS.filter((id) => body.dates.includes(id))
      : [];

    if (!athleteName || !parentName || !parentEmail || !parentPhone || !school || !grade) {
      return NextResponse.json(
        { error: "Athlete name, grade, school, parent name, parent phone, and parent email are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(parentEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (grade < 7 || grade > 9) {
      return NextResponse.json({ error: "This series is for athletes in grades 7 to 9" }, { status: 400 });
    }

    // Booking all three drop-ins is the same as the series, at the series price.
    const allThree = plan === "all" || picked.length === SESSION_IDS.length;
    const sessions: SessionId[] = allThree ? SESSION_IDS : picked;
    if (sessions.length === 0) {
      return NextResponse.json({ error: "Please choose at least one session" }, { status: 400 });
    }

    // Past nights can't be booked (Pacific time).
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
    if (sessions.some((id) => SESSIONS[id].iso < today)) {
      return NextResponse.json({ error: "One of the selected sessions has already happened. Please refresh and choose again." }, { status: 400 });
    }

    const price = allThree ? ALL_THREE_PRICE : DROP_IN_PRICE * sessions.length;
    const datesLabel = allThree ? "Nov 3, 10 & 17" : sessions.map((id) => SESSIONS[id].short).join(", ");
    const sessionLabel = `${datesLabel} · ${TIME}`;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Mock Surrey registration (Supabase not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: existing } = await supabase
      .from("camp_registrations")
      .select("athlete_name")
      .eq("camp_id", CAMP_ID)
      .eq("parent_email", parentEmail)
      .neq("status", "cancelled");
    if ((existing || []).some((r: { athlete_name: string }) => r.athlete_name.trim().toLowerCase() === athleteName.toLowerCase())) {
      return NextResponse.json(
        { error: `${athleteName} is already registered for this series. To add sessions, email info@ltseliteprep.ca.`, code: "ALREADY_REGISTERED" },
        { status: 409 }
      );
    }

    const { error: dbError } = await supabase.from("camp_registrations").insert({
      athlete_name: athleteName,
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      school,
      age: null,
      grade: `Grade ${grade}`,
      referred_by: null,
      camp_id: CAMP_ID,
      camp_name: "Transition to High School Basketball, Surrey (Nov)",
      amount: `$${price}`,
      package_type: allThree ? "surrey-all-3" : "surrey-dropin",
      dropin_session: sessionLabel,
      status: "pending_payment",
    });
    if (dbError) {
      console.error("Surrey registration DB Error:", dbError);
      return NextResponse.json(
        { error: "Failed to save registration. Please try again or email info@ltseliteprep.ca." },
        { status: 500 }
      );
    }

    await supabase.from("analytics_events").insert({
      event_type: "form_submit",
      page: "/surrey",
      label: "surrey_registration",
      session_id: typeof body.sessionId === "string" && body.sessionId ? body.sessionId.slice(0, 64) : "server",
      metadata: { ...sanitizeAttribution(body.attribution), allThree, sessions: sessions.length },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const a = escapeHtml(athleteName);
        const p = escapeHtml(parentName);
        const nights = sessions.map((id) => SESSIONS[id].long).join("<br/>");

        await Promise.all([
          resend.emails.send({
            from: "LTS ELITE PREP <info@ltseliteprep.ca>",
            to: parentEmail,
            subject: `Action Required: Complete your Surrey registration — ${athleteName}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
                <div style="background:#000;padding:28px 32px;border-radius:16px 16px 0 0;">
                  <p style="color:#fff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">LTS ELITE PREP</p>
                  <h1 style="color:#fff;font-size:26px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-0.02em;">Transition to High School</h1>
                  <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;">Surrey · Grades 7 to 9</p>
                </div>

                <div style="background:#f9f9f9;padding:28px 32px;">
                  <p>Hi ${p},</p>
                  <p>We&rsquo;ve received your registration for <strong>${a}</strong>. Your spot is held. Please complete the e-transfer payment within <strong>48 hours</strong> to confirm it.</p>

                  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin:24px 0;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 12px;">Registration Summary</p>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Athlete</td><td style="padding:6px 0;font-weight:700;">${a} (Grade ${grade})</td></tr>
                      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Plan</td><td style="padding:6px 0;font-weight:700;">${allThree ? "All 3 Sessions" : `Drop-In (${sessions.length} session${sessions.length === 1 ? "" : "s"})`}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Dates</td><td style="padding:6px 0;font-weight:700;">${nights}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Time</td><td style="padding:6px 0;font-weight:700;">${TIME}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Location</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(LOCATION)}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Amount Due</td><td style="padding:6px 0;font-size:20px;font-weight:900;">$${price}.00</td></tr>
                    </table>
                  </div>

                  <div style="background:#000;border-radius:12px;padding:20px;margin:24px 0;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin:0 0 12px;">Payment Instructions</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">E-transfer to:</strong> info@ltseliteprep.ca</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Amount:</strong> $${price}.00</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Notes:</strong> ${a} — Surrey</p>
                  </div>

                  <p style="color:#d93025;font-weight:700;font-size:13px;">Payment must be received within 48 hours to hold your spot.</p>
                  <p>Questions? Reply to this email or contact <a href="mailto:info@ltseliteprep.ca">info@ltseliteprep.ca</a></p>
                  <p style="margin-top:32px;font-size:14px;">See you on the court,<br/><strong>Paolo</strong><br/>LTS ELITE PREP Team</p>
                </div>

                <div style="background:#f0f0f0;padding:16px 32px;border-radius:0 0 16px 16px;text-align:center;">
                  <p style="font-size:11px;color:#999;margin:0;">Transition to High School Basketball · Surrey · ${escapeHtml(LOCATION)}</p>
                </div>
              </div>
            `,
          }),
          resend.emails.send({
            from: "LTS System <info@ltseliteprep.ca>",
            to: "paolo@ltseliteprep.ca",
            subject: `🏀 NEW SURREY REG: ${athleteName} (${allThree ? "All 3" : datesLabel})`,
            html: `
              <h2>New Surrey Registration (Transition to High School)</h2>
              <table style="border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${a}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Grade</td><td style="padding:6px 0;">${grade}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">School</td><td style="padding:6px 0;">${escapeHtml(school)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Plan</td><td style="padding:6px 0;font-weight:700;">${allThree ? "All 3 sessions" : `Drop-in: ${datesLabel}`}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent</td><td style="padding:6px 0;">${p}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Phone</td><td style="padding:6px 0;">${escapeHtml(parentPhone)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Email</td><td style="padding:6px 0;">${escapeHtml(parentEmail)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Amount</td><td style="padding:6px 0;font-weight:900;">$${price}.00</td></tr>
              </table>
              <p style="color:#d93025;">Payment pending — awaiting e-transfer.</p>
            `,
          }),
        ]);
      } catch (emailErr) {
        // The registration is saved; don't fail the request just because an email didn't go out.
        console.error("Surrey registration email error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, price, allThree, dates: datesLabel });
  } catch (err) {
    console.error("Surrey registration API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
