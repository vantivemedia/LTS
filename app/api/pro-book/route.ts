import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { escapeHtml, isValidEmail, sanitizeAttribution } from "@/lib/guidebook";
import {
  PRO_LENGTHS, PRO_STEP, formatTime, longDate, pacificNow, parseTimeLabel,
  slotInfo, timeLabel, toMinutes, type ProLength, type ProTaken,
} from "@/lib/pro-slots";

const LOCATION = "The Hoop — 11111 Twigg Pl #1061, Richmond, BC";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = String(body.date || "");
    const start = Number(body.start);
    const length = Number(body.length) as ProLength;
    const hasPass = !!body.hasPass;
    const details = String(body.details || "").trim().slice(0, 500);
    let athleteName = String(body.athleteName || "").trim();
    let parentName = String(body.parentName || "").trim();
    let school = String(body.school || "").trim();
    let grade = String(body.grade || "").trim();
    let phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(start) || !(length in PRO_LENGTHS)) {
      return NextResponse.json({ error: "Please choose a session length, date and time" }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!hasPass && (!athleteName || !parentName || !school || !grade || !phone)) {
      return NextResponse.json({ error: "Athlete name, parent name, parent phone, school, and grade are required" }, { status: 400 });
    }
    if (start % PRO_STEP !== 0) {
      return NextResponse.json({ error: "That start time is not available" }, { status: 400 });
    }
    const end = start + length;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Mock PRO booking (Supabase not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Not in the past (Pacific time)
    const now = pacificNow();
    if (date < now.date || (date === now.date && start <= now.minutes)) {
      return NextResponse.json({ error: "That time has already passed. Please pick another.", code: "SLOT_TAKEN" }, { status: 409 });
    }

    // The session must sit inside one of Coach Paolo's availability windows
    const { data: windows } = await supabase.from("classes").select("start_time, end_time").eq("program", "pro").eq("class_date", date);
    const inWindow = (windows || []).some((w) => start >= toMinutes(w.start_time) && end <= toMinutes(w.end_time));
    if (!inWindow) {
      return NextResponse.json({ error: "That time is not available. Please pick another.", code: "SLOT_TAKEN" }, { status: 409 });
    }

    // Capacity / overlap check against existing PRO bookings that day
    const { data: existing } = await supabase
      .from("bookings")
      .select("preferred_time, email, name")
      .eq("program", "pro")
      .eq("preferred_date", date)
      .neq("status", "cancelled");
    const counts = new Map<string, ProTaken>();
    for (const b of existing || []) {
      const r = parseTimeLabel(b.preferred_time);
      if (!r) continue;
      const k = `${r[0]}|${r[1]}`;
      const cur = counts.get(k) || { date, start: r[0], end: r[1], count: 0 };
      cur.count += 1;
      counts.set(k, cur);
    }
    const info = slotInfo(date, start, end, [...counts.values()]);
    if (!info.available) {
      return NextResponse.json(
        { error: "Sorry, that time was just booked. Please choose another.", code: "SLOT_TAKEN" },
        { status: 409 }
      );
    }

    // Pass holders: match the pass by email (the session is deducted after the booking is saved)
    let pass: { id: string; name: string; parent_name: string | null; phone: string | null; school: string | null; grade: string | null; sessions_total: number; sessions_used: number } | null = null;
    if (hasPass) {
      const { data: passes } = await supabase
        .from("pass_holders")
        .select("id, name, parent_name, phone, school, grade, sessions_total, sessions_used")
        .eq("email", email)
        .eq("status", "active")
        .eq("program", "pro")
        .order("created_at", { ascending: true });
      pass = (passes || []).find((p) => p.sessions_used < p.sessions_total) || null;
      if (!pass) {
        return NextResponse.json(
          { error: "We couldn't find an active LTS PRO pass for that email. Please fill in the rest of your info to book a single session.", code: "NO_PASS_FOUND" },
          { status: 404 }
        );
      }
      athleteName = pass.name;
      parentName = pass.parent_name || pass.name;
      phone = pass.phone || "";
      school = pass.school || "";
      grade = pass.grade || "";
    }

    // One booking per athlete per session
    if ((existing || []).some((b) => {
      const r = parseTimeLabel(b.preferred_time);
      return r && r[0] === start && r[1] === end && b.email?.toLowerCase() === email && b.name?.trim().toLowerCase() === athleteName.toLowerCase();
    })) {
      return NextResponse.json({ error: `${athleteName} is already booked for that time.` }, { status: 409 });
    }

    const { price, name: sessionType, capacity } = PRO_LENGTHS[length];
    const label = timeLabel(start, end);
    // "PASS USAGE" prefix keeps pass bookings out of the revenue totals; "90 min" lets revenue use the $105 price.
    const message = hasPass
      ? `PASS USAGE\nLTS PRO · ${sessionType.toLowerCase()} · ${length} min${details ? `\n${details}` : ""}`
      : `LTS PRO · ${sessionType.toLowerCase()} · ${length} min · $${price}${details ? `\n${details}` : ""}`;

    const { error: insertError } = await supabase.from("bookings").insert({
      name: athleteName,
      parent_name: parentName,
      email,
      phone: phone || null,
      school: school || null,
      grade: grade || null,
      program: "pro",
      preferred_date: date,
      preferred_time: label,
      message,
    });
    if (insertError) {
      console.error("PRO booking insert error:", insertError);
      return NextResponse.json({ error: "Failed to save your booking. Please try again or email info@ltseliteprep.ca." }, { status: 500 });
    }

    let sessionsLeft: number | null = null;
    if (pass) {
      const used = pass.sessions_used + 1;
      sessionsLeft = pass.sessions_total - used;
      const { error: passError } = await supabase
        .from("pass_holders")
        .update(used >= pass.sessions_total ? { sessions_used: used, status: "expired" } : { sessions_used: used })
        .eq("id", pass.id);
      if (passError) console.error("PRO pass deduction error (booking saved):", passError);
    }

    await supabase.from("analytics_events").insert({
      event_type: "form_submit",
      page: "/pro",
      label: "pro_booking",
      session_id: typeof body.sessionId === "string" && body.sessionId ? body.sessionId.slice(0, 64) : "server",
      metadata: { ...sanitizeAttribution(body.attribution), length, hasPass },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const a = escapeHtml(athleteName);
        const p = escapeHtml(parentName);
        const when = `${longDate(date)} · ${formatTime(start)} – ${formatTime(end)}`;

        const paymentBlock = hasPass
          ? `<p>1 session has been taken from your LTS PRO pass${sessionsLeft !== null ? ` (${sessionsLeft} left)` : ""}.</p>`
          : `<div style="background:#000;border-radius:12px;padding:20px;margin:24px 0;">
               <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin:0 0 12px;">Payment Instructions</p>
               <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">E-transfer to:</strong> info@ltseliteprep.ca</p>
               <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Amount:</strong> $${price}.00</p>
               <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Notes:</strong> ${a} — LTS PRO</p>
             </div>
             <p style="color:#d93025;font-weight:700;font-size:13px;">Payment must be received within 48 hours (and before your session) to hold your time.</p>`;

        await Promise.all([
          resend.emails.send({
            from: "LTS ELITE PREP <info@ltseliteprep.ca>",
            to: email,
            subject: `Your LTS PRO session is booked: ${longDate(date)}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
                <p>Hi ${p},</p>
                <p><strong>${a}</strong> is booked for an LTS PRO ${sessionType.toLowerCase()} session${capacity > 1 ? " (small group, up to " + capacity + " athletes)" : ""}.</p>
                <div style="margin:24px 0;padding:20px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;">
                  <p style="margin:6px 0;"><strong>When:</strong> ${when}</p>
                  <p style="margin:6px 0;"><strong>Session:</strong> ${sessionType}, ${length} minutes</p>
                  <p style="margin:6px 0;"><strong>Location:</strong> ${escapeHtml(LOCATION)}</p>
                  ${hasPass ? "" : `<p style="margin:6px 0;"><strong>Amount due:</strong> $${price}.00</p>`}
                </div>
                ${paymentBlock}
                <p>Need to change your time? Reply to this email at least 24 hours before your session.</p>
                <p style="margin-top:32px;">See you on the court,<br/><strong>Paolo</strong><br/>LTS ELITE PREP Team</p>
              </div>
            `,
          }),
          resend.emails.send({
            from: "LTS System <info@ltseliteprep.ca>",
            to: "paolo@ltseliteprep.ca",
            subject: `🏀 NEW LTS PRO BOOKING: ${athleteName} · ${when}`,
            html: `
              <h2>New LTS PRO Booking</h2>
              <p><strong>${a}</strong>${grade ? ` (Grade ${escapeHtml(grade)}, ${escapeHtml(school)})` : ""}</p>
              <p><strong>When:</strong> ${when} · ${sessionType} (${length} min)${capacity > 1 ? " · " + (info.booked + 1) + " of " + capacity + " spots filled" : ""}</p>
              <p><strong>Parent:</strong> ${p} · ${escapeHtml(email)}${phone ? ` · ${escapeHtml(phone)}` : ""}</p>
              <p><strong>Payment:</strong> ${hasPass ? `Pass holder, ${sessionsLeft} session(s) left after this one${length === 90 ? ". 90 minute session: confirm whether a top-up is due." : "."}` : `E-transfer pending, $${price}.00`}</p>
              ${details ? `<p><strong>Notes:</strong> ${escapeHtml(details)}</p>` : ""}
              <p style="color:#666;font-size:13px;">${capacity > 1 ? "Semi-private: up to " + capacity + " athletes can share this time." : "Private session: this time is now fully booked."}</p>
            `,
          }),
        ]);
      } catch (emailErr) {
        console.error("PRO booking email error (booking saved):", emailErr);
      }
    }

    return NextResponse.json({ success: true, date, label, length, price, hasPass, sessionsLeft });
  } catch (err) {
    console.error("PRO booking API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
