import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { escapeHtml, isValidEmail, sanitizeAttribution } from "@/lib/guidebook";

// The Next Rep: The Mental Reset — one-day workshop, Friday Oct 23, 2026.
// Registrations live in camp_registrations (camp_id below); the session is derived from the
// athlete's grade so families can't book into the wrong age group.
const CAMP_ID = "next-rep-mental-reset-oct23";
const CAPACITY = 10;
const LOCATION = "The Hoop — 11111 Twigg Pl #1061, Richmond, BC";

const SESSIONS = {
  1: { label: "Session 1 · Grades 7–9 · 10:30 AM – 12:00 PM", time: "10:30 AM – 12:00 PM", grades: "Grades 7–9" },
  2: { label: "Session 2 · Grades 10–12 · 12:30 PM – 2:00 PM", time: "12:30 PM – 2:00 PM", grades: "Grades 10–12" },
} as const;

function sessionForGrade(grade: number): 1 | 2 | null {
  if (grade >= 7 && grade <= 9) return 1;
  if (grade >= 10 && grade <= 12) return 2;
  return null;
}

function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sessionCounts(supabase: any) {
  const { data } = await supabase
    .from("camp_registrations")
    .select("dropin_session")
    .eq("camp_id", CAMP_ID)
    .neq("status", "cancelled");
  const counts = { 1: 0, 2: 0 };
  (data || []).forEach((r: { dropin_session: string | null }) => {
    if (r.dropin_session?.startsWith("Session 1")) counts[1] += 1;
    else if (r.dropin_session?.startsWith("Session 2")) counts[2] += 1;
  });
  return counts;
}

// Live spot counts for the page.
export async function GET() {
  const supabase = getClient();
  if (!supabase) return NextResponse.json({ capacity: CAPACITY, session1: 0, session2: 0 });
  const counts = await sessionCounts(supabase);
  return NextResponse.json(
    { capacity: CAPACITY, session1: counts[1], session2: counts[2] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const athleteName = String(body.athleteName || "").trim();
    const parentName = String(body.parentName || "").trim();
    const parentEmail = String(body.parentEmail || "").trim().toLowerCase();
    const parentPhone = String(body.parentPhone || "").trim();
    const school = String(body.school || "").trim();
    const grade = parseInt(String(body.grade || ""), 10);
    const withAcademy = !!body.withAcademy;

    if (!athleteName || !parentName || !parentEmail || !parentPhone || !school || !grade) {
      return NextResponse.json(
        { error: "Athlete name, grade, school, parent name, parent phone, and parent email are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(parentEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    const session = sessionForGrade(grade);
    if (!session) {
      return NextResponse.json({ error: "This workshop is for athletes in grades 7–12" }, { status: 400 });
    }

    const price = withAcademy ? 125 : 85;
    const amount = `$${price}`;
    const sessionInfo = SESSIONS[session];

    const supabase = getClient();
    if (!supabase) {
      console.log("Mock Mental Reset registration (Supabase not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }

    // Capacity + duplicate checks (checked right before insert; a simultaneous last-spot race is possible but unlikely).
    const counts = await sessionCounts(supabase);
    if (counts[session] >= CAPACITY) {
      return NextResponse.json(
        { error: `${sessionInfo.grades} (${sessionInfo.time}) is full. Email info@ltseliteprep.ca to join the waitlist.`, code: "SESSION_FULL" },
        { status: 409 }
      );
    }
    const { data: existing } = await supabase
      .from("camp_registrations")
      .select("id, athlete_name")
      .eq("camp_id", CAMP_ID)
      .eq("parent_email", parentEmail)
      .neq("status", "cancelled");
    if ((existing || []).some((r: { athlete_name: string }) => r.athlete_name.trim().toLowerCase() === athleteName.toLowerCase())) {
      return NextResponse.json(
        { error: `${athleteName} is already registered for this workshop. Check your email for the confirmation.`, code: "ALREADY_REGISTERED" },
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
      camp_name: "The Next Rep: The Mental Reset (Oct 23)",
      amount,
      package_type: withAcademy ? "mental-reset-academy" : "mental-reset",
      dropin_session: sessionInfo.label,
      status: "pending_payment",
    });

    if (dbError) {
      console.error("Mental Reset DB Error:", dbError);
      return NextResponse.json(
        { error: "Failed to save registration. Please try again or email info@ltseliteprep.ca." },
        { status: 500 }
      );
    }

    await supabase.from("analytics_events").insert({
      event_type: "form_submit",
      page: "/mental-reset",
      label: "mental_reset_registration",
      session_id: typeof body.sessionId === "string" && body.sessionId ? body.sessionId.slice(0, 64) : "server",
      metadata: { ...sanitizeAttribution(body.attribution), session, withAcademy },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const a = escapeHtml(athleteName);
        const p = escapeHtml(parentName);

        const academyRow = withAcademy
          ? `<tr><td style="padding:6px 0;color:#666;">Also included</td><td style="padding:6px 0;font-weight:700;">LTS Academy, Friday Oct 23 · 5:30 – 7:00 PM</td></tr>`
          : "";

        await Promise.all([
          resend.emails.send({
            from: "LTS ELITE PREP <info@ltseliteprep.ca>",
            to: parentEmail,
            subject: `Action Required: Complete your Mental Reset registration — ${athleteName}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
                <div style="background:#fdf4dc;padding:28px 32px;border-radius:16px 16px 0 0;">
                  <p style="color:#1a110c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">LTS ELITE PREP · The Next Rep</p>
                  <h1 style="color:#1a110c;font-size:30px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-0.02em;">The <span style="color:#a9001c;font-style:italic;font-family:Georgia,serif;text-transform:none;">Mental</span> Reset</h1>
                  <p style="color:#5a4a3a;font-size:12px;margin:6px 0 0;">Friday, October 23, 2026 · ${escapeHtml(LOCATION.split(" — ")[0])}</p>
                </div>

                <div style="background:#f9f9f9;padding:28px 32px;">
                  <p>Hi ${p},</p>
                  <p>We&rsquo;ve received your registration for <strong>${a}</strong>. Your spot is held. Please complete the e-transfer payment within <strong>48 hours</strong> to confirm it.</p>

                  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin:24px 0;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 12px;">Registration Summary</p>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                      <tr><td style="padding:6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${a} (Grade ${grade})</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Workshop</td><td style="padding:6px 0;font-weight:700;">Friday, October 23, 2026</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Session</td><td style="padding:6px 0;font-weight:700;">${sessionInfo.grades} · ${sessionInfo.time}</td></tr>
                      ${academyRow}
                      <tr><td style="padding:6px 0;color:#666;">Location</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(LOCATION)}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Amount Due</td><td style="padding:6px 0;font-size:20px;font-weight:900;">$${price}.00</td></tr>
                    </table>
                  </div>

                  <div style="background:#000;border-radius:12px;padding:20px;margin:24px 0;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin:0 0 12px;">Payment Instructions</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">E-transfer to:</strong> info@ltseliteprep.ca</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Amount:</strong> $${price}.00</p>
                    <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Notes:</strong> ${a} — Mental Reset</p>
                  </div>

                  <p style="color:#d93025;font-weight:700;font-size:13px;">Payment must be received within 48 hours to hold your spot. Space is limited to ${CAPACITY} athletes per session.</p>

                  <p>Questions? Reply to this email or contact <a href="mailto:info@ltseliteprep.ca">info@ltseliteprep.ca</a></p>
                  <p style="margin-top:32px;font-size:14px;">See you on the court,<br/><strong>Paolo</strong><br/>LTS ELITE PREP Team</p>
                </div>

                <div style="background:#f0f0f0;padding:16px 32px;border-radius:0 0 16px 16px;text-align:center;">
                  <p style="font-size:11px;color:#999;margin:0;">The Next Rep: The Mental Reset · October 23, 2026 · ${escapeHtml(LOCATION)}</p>
                </div>
              </div>
            `,
          }),
          resend.emails.send({
            from: "LTS System <info@ltseliteprep.ca>",
            to: "paolo@ltseliteprep.ca",
            subject: `🏀 NEW MENTAL RESET REG: ${athleteName} (${sessionInfo.grades})`,
            html: `
              <h2>New Mental Reset Registration (Oct 23)</h2>
              <table style="border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${a}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Grade</td><td style="padding:6px 0;">${grade}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">School</td><td style="padding:6px 0;">${escapeHtml(school)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Session</td><td style="padding:6px 0;font-weight:700;">${sessionInfo.grades} · ${sessionInfo.time} (${counts[session] + 1} of ${CAPACITY})</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">+ Academy 5:30–7:00 PM</td><td style="padding:6px 0;font-weight:700;">${withAcademy ? "YES" : "No"}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent</td><td style="padding:6px 0;">${p}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Phone</td><td style="padding:6px 0;">${escapeHtml(parentPhone)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent Email</td><td style="padding:6px 0;">${escapeHtml(parentEmail)}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666;">Amount</td><td style="padding:6px 0;font-weight:900;">$${price}.00</td></tr>
              </table>
              <p style="color:#d93025;">Payment pending — awaiting e-transfer.${withAcademy ? " Add them to the 5:30 PM Academy list too." : ""}</p>
            `,
          }),
        ]);
      } catch (emailErr) {
        // The registration is saved; don't fail the request just because an email didn't go out.
        console.error("Mental Reset email error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, session, price });
  } catch (err) {
    console.error("Mental Reset API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
