// LTS PRO bookable time slots, shared by the booking page and the API routes.
//
// Coach Paolo adds availability "windows" (e.g. Tuesday 4:00-6:00 PM) as classes with
// program = "pro" (Admin -> Schedule). Families book a 60 or 90 minute session that starts on a
// 30-minute mark inside a window.
//   60 min = Private ($85): one athlete, the time is exclusive.
//   90 min = Semi-private ($105): up to 6 athletes can share the exact same session.
// Any other overlapping time is treated as taken so the coach is never double-booked.

export const PRO_STEP = 30;
export const PRO_LENGTHS = {
  60: { label: "60 minutes", name: "Private", price: 85, capacity: 1, blurb: "1-on-1 with Coach Paolo" },
  90: { label: "90 minutes", name: "Semi-private", price: 105, capacity: 6, blurb: "Small group, up to 6 athletes" },
} as const;
export type ProLength = keyof typeof PRO_LENGTHS;
export const PRO_TIMEZONE = "America/Vancouver";

export type ProWindow = { id: string; date: string; start: number; end: number };
export type ProTaken = { date: string; start: number; end: number; count: number };
export type SlotInfo = { available: boolean; booked: number; left: number; capacity: number };

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Stored in bookings.preferred_time, same style as the other programs ("4:00 PM - 5:30 PM").
export function timeLabel(start: number, end: number): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function parseTimeLabel(label?: string | null): [number, number] | null {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM) - (\d{1,2}):(\d{2}) (AM|PM)/.exec(label || "");
  if (!m) return null;
  const conv = (h: string, min: string, ap: string) => ((Number(h) % 12) + (ap === "PM" ? 12 : 0)) * 60 + Number(min);
  return [conv(m[1], m[2], m[3]), conv(m[4], m[5], m[6])];
}

// Valid start times (minutes) for a session of `length` minutes inside a window.
export function startsFor(w: { start: number; end: number }, length: number): number[] {
  const out: number[] = [];
  for (let s = w.start; s + length <= w.end; s += PRO_STEP) out.push(s);
  return out;
}

export function slotInfo(date: string, start: number, end: number, taken: ProTaken[]): SlotInfo {
  const capacity = PRO_LENGTHS[(end - start) as ProLength]?.capacity ?? 1;
  let booked = 0;
  for (const t of taken) {
    if (t.date !== date) continue;
    if (t.start === start && t.end === end) booked += t.count;
    else if (t.start < end && start < t.end) return { available: false, booked: 0, left: 0, capacity }; // overlaps a different session
  }
  const left = Math.max(0, capacity - booked);
  return { available: left > 0, booked, left, capacity };
}

// Today's date + minutes since midnight in Pacific time (the gym's clock, not the visitor's).
export function pacificNow(now = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PRO_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function longDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
