import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pacificNow, parseTimeLabel, toMinutes, type ProTaken, type ProWindow } from "@/lib/pro-slots";

// Open LTS PRO availability for the booking page: Coach Paolo's windows plus which times are already
// booked. Only dates, times and counts are returned, never any booking details.
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ windows: [], taken: [], now: pacificNow() });
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = pacificNow();

  const [{ data: classes, error: cErr }, { data: bookings, error: bErr }] = await Promise.all([
    supabase.from("classes").select("id, class_date, start_time, end_time").eq("program", "pro").gte("class_date", now.date).order("class_date").order("start_time"),
    supabase.from("bookings").select("preferred_date, preferred_time").eq("program", "pro").neq("status", "cancelled").gte("preferred_date", now.date),
  ]);
  if (cErr || bErr) {
    console.error("pro-slots error:", cErr || bErr);
    return NextResponse.json({ error: "Could not load times" }, { status: 500 });
  }

  const windows: ProWindow[] = (classes || []).map((c) => ({
    id: c.id,
    date: c.class_date,
    start: toMinutes(c.start_time),
    end: toMinutes(c.end_time),
  }));

  const counts = new Map<string, ProTaken>();
  for (const b of bookings || []) {
    const range = parseTimeLabel(b.preferred_time);
    if (!b.preferred_date || !range) continue;
    const key = `${b.preferred_date}|${range[0]}|${range[1]}`;
    const cur = counts.get(key) || { date: b.preferred_date, start: range[0], end: range[1], count: 0 };
    cur.count += 1;
    counts.set(key, cur);
  }

  return NextResponse.json({ windows, taken: [...counts.values()], now }, { headers: { "Cache-Control": "no-store" } });
}
