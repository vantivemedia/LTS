import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createToken, escapeHtml, guidebookExists, isValidEmail, sanitizeAttribution } from "@/lib/guidebook";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parentName = String(body.parentName || "").trim();
    const athleteName = String(body.athleteName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    // Hidden honeypot field — real visitors never fill it in, bots do. Pretend it worked.
    if (body.website) {
      return NextResponse.json({ success: true, token: "" });
    }

    if (!parentName || !athleteName || !email) {
      return NextResponse.json({ error: "Parent name, athlete name, and parent email are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!guidebookExists()) {
      return NextResponse.json({ error: "The guide is not available yet. Please check back soon." }, { status: 503 });
    }

    let saved = false;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase.from("leads").insert({
        parent_name: parentName,
        athlete_name: athleteName,
        email,
        source: "guidebook",
      });
      if (error) {
        // Don't block the visitor from getting the guide — the notification email below still
        // records the lead so it isn't lost.
        console.error("Guidebook lead insert error:", error);
      } else {
        saved = true;
        await supabase.from("analytics_events").insert({
          event_type: "form_submit",
          page: "/nextrep",
          label: "guidebook_unlock",
          // use the visitor's browser session so the campaign funnel can join page view -> unlock
          session_id: typeof body.sessionId === "string" && body.sessionId ? body.sessionId.slice(0, 64) : "server",
          metadata: sanitizeAttribution(body.attribution),
        });
      }
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const notSavedNote = saved
          ? ""
          : `<p style="font-family:sans-serif;color:#d93025;"><strong>Not saved to the database</strong> (check the leads table). This email is the only record.</p>`;
        await resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "paolo@ltseliteprep.ca",
          subject: `New Next Rep guide lead: ${athleteName}`,
          html: `
            <h2 style="font-family:sans-serif;">New Player Guide Lead (The Next Rep)</h2>
            <p style="font-family:sans-serif;"><strong>Parent:</strong> ${escapeHtml(parentName)}</p>
            <p style="font-family:sans-serif;"><strong>Athlete:</strong> ${escapeHtml(athleteName)}</p>
            <p style="font-family:sans-serif;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            ${notSavedNote}
          `,
        });
      } catch (emailErr) {
        console.error("Guidebook lead notification error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, token: createToken(email, parentName), email });
  } catch (err) {
    console.error("Guidebook unlock error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
