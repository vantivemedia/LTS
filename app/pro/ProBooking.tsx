"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Loader2 } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";
import {
  PRO_LENGTHS, formatTime, longDate, slotInfo, startsFor,
  type ProLength, type ProTaken, type ProWindow,
} from "@/lib/pro-slots";

const INPUT =
  "w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors";
const LABEL = "text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block";

type Data = { windows: ProWindow[]; taken: ProTaken[]; now: { date: string; minutes: number } };
type Option = { windowId: string; start: number; end: number; booked: number; left: number; capacity: number };
type Done = { athlete: string; email: string; date: string; label: string; length: number; price: number; hasPass: boolean; sessionsLeft: number | null };

export default function ProBooking() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState("");
  const [length, setLength] = useState<ProLength>(60);
  const [date, setDate] = useState("");
  const [start, setStart] = useState<number | null>(null);

  const [hasPass, setHasPass] = useState(false);
  const [athleteName, setAthleteName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/pro-slots", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLoadError("");
    } catch {
      setLoadError("We couldn't load available times. Please refresh, or use the request form below.");
    }
  }
  useEffect(() => { load(); }, []);

  // Every bookable start time for the chosen session length, grouped by date.
  const byDate = useMemo(() => {
    const map = new Map<string, Option[]>();
    if (!data) return map;
    for (const w of data.windows) {
      for (const s of startsFor(w, length)) {
        const e = s + length;
        if (w.date === data.now.date && s <= data.now.minutes) continue; // already started today
        const info = slotInfo(w.date, s, e, data.taken);
        if (!info.available) continue;
        const list = map.get(w.date) || [];
        list.push({ windowId: w.id, start: s, end: e, booked: info.booked, left: info.left, capacity: info.capacity });
        map.set(w.date, list);
      }
    }
    for (const list of map.values()) list.sort((a, b) => a.start - b.start);
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [data, length]);

  const dates = [...byDate.keys()];
  const options = byDate.get(date) || [];
  const picked = options.find((o) => o.start === start) || null;
  const { price, name: sessionType } = PRO_LENGTHS[length];

  // Drop a chosen date/time that no longer exists (e.g. after switching length or a refresh).
  useEffect(() => {
    if (date && !byDate.has(date)) { setDate(""); setStart(null); }
    else if (start !== null && !options.some((o) => o.start === start)) setStart(null);
  }, [byDate, date, start, options]);

  const canSubmit = !!picked && !!email && (hasPass || (athleteName && school && grade && parentName && phone));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pro-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date, start: picked.start, length, hasPass, athleteName, school, grade, parentName, email, phone, details,
          sessionId: getSessionId(), attribution: getAttribution(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.code === "NO_PASS_FOUND") { setHasPass(false); setError(d.error); return; }
        if (d.code === "SLOT_TAKEN") { setStart(null); await load(); }
        throw new Error(d.error || "Booking failed");
      }
      trackEvent("button_click", "/pro", "pro_booked");
      setDone({ athlete: athleteName || "your athlete", email, date: d.date, label: d.label, length: d.length, price: d.price, hasPass: d.hasPass, sessionsLeft: d.sessionsLeft });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email info@ltseliteprep.ca");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[#111] border border-white/5 rounded-3xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-black" />
        </div>
        <h3 className="text-3xl font-black uppercase mb-3">You&rsquo;re booked</h3>
        <p className="text-white/60 leading-relaxed mb-1">
          <strong className="text-white">{longDate(done.date)}</strong>
        </p>
        <p className="text-white/60 mb-5">{done.label} &middot; {done.length === 90 ? "Semi-private" : "Private"}, {done.length} min &middot; The Hoop, Richmond</p>
        {done.hasPass ? (
          <p className="text-white/50 text-sm">1 session taken from your LTS PRO pass{done.sessionsLeft !== null ? ` (${done.sessionsLeft} left)` : ""}.</p>
        ) : (
          <div className="bg-black border border-white/10 rounded-2xl p-5 text-sm text-left max-w-sm mx-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">To confirm your time</p>
            <p className="text-white/80 leading-relaxed">
              E-transfer <strong className="text-white">${done.price}</strong> to <strong className="text-white">info@ltseliteprep.ca</strong> within 48 hours. Note: &ldquo;{done.athlete} &mdash; LTS PRO&rdquo;.
            </p>
          </div>
        )}
        <p className="text-white/30 text-xs mt-4">Details are on their way to {done.email}.</p>
        <Link href="/" className="inline-block mt-6 text-white/50 hover:text-white text-xs font-bold uppercase underline underline-offset-4">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-10">
      {/* 1. length */}
      <p className={LABEL}>1. Session type</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {(Object.keys(PRO_LENGTHS) as unknown as ProLength[]).map((l) => {
          const on = Number(l) === length;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLength(Number(l) as ProLength)}
              className={`rounded-2xl px-5 py-4 text-left border transition-all ${on ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"}`}
            >
              <span className="block font-black uppercase text-sm">{PRO_LENGTHS[Number(l) as ProLength].name}</span>
              <span className={`block text-xs font-bold ${on ? "text-black/60" : "text-white/50"}`}>
                {PRO_LENGTHS[Number(l) as ProLength].label} &middot; ${PRO_LENGTHS[Number(l) as ProLength].price}
              </span>
              <span className={`block text-[11px] mt-1 ${on ? "text-black/50" : "text-white/30"}`}>{PRO_LENGTHS[Number(l) as ProLength].blurb}</span>
            </button>
          );
        })}
      </div>

      {/* 2. date */}
      <p className={LABEL}>2. Pick a day</p>
      {!data && !loadError && (
        <p className="flex items-center gap-2 text-white/40 text-sm mb-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading times...</p>
      )}
      {loadError && <p className="text-red-400 text-sm font-bold mb-8">{loadError}</p>}
      {data && dates.length === 0 && (
        <p className="text-white/50 text-sm mb-8">No open times right now for a {sessionType.toLowerCase()} session. Send us your availability with the request form below.</p>
      )}
      {dates.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-8">
          {dates.map((d) => {
            const on = d === date;
            const dt = new Date(d + "T12:00:00");
            return (
              <button
                key={d}
                type="button"
                onClick={() => { setDate(d); setStart(null); trackEvent("button_click", "/pro", "pro_pick_date"); }}
                className={`rounded-2xl py-3 text-center border transition-all ${on ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"}`}
              >
                <span className={`block text-[10px] font-black uppercase tracking-widest ${on ? "text-black/50" : "text-white/40"}`}>
                  {dt.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="block text-lg font-black leading-tight">{dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. time */}
      {date && (
        <>
          <p className={LABEL}>3. Pick a time &middot; {longDate(date)}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-2">
            {options.map((o) => {
              const on = o.start === start;
              return (
                <button
                  key={o.start}
                  type="button"
                  onClick={() => { setStart(o.start); setError(""); }}
                  className={`rounded-2xl py-3 px-2 text-center border transition-all ${on ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"}`}
                >
                  <span className="block font-black text-sm">{formatTime(o.start)}</span>
                  {o.booked > 0 && (
                    <span className={`block text-[10px] font-bold mt-0.5 ${on ? "text-black/50" : "text-white/40"}`}>
                      {o.left} spot{o.left === 1 ? "" : "s"} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {picked && (
            <p className="flex items-center gap-2 text-white/50 text-xs mb-8">
              <Clock className="w-3.5 h-3.5" /> {formatTime(picked.start)} &ndash; {formatTime(picked.end)} &middot; {sessionType}, {length} min
              {picked.capacity > 1 ? (picked.booked > 0 ? ` · small group, ${picked.booked} of ${picked.capacity} spots taken` : ` · small group, up to ${picked.capacity} athletes`) : " · just your athlete"}
            </p>
          )}
          {!picked && <div className="mb-8" />}
        </>
      )}

      {/* 4. details */}
      {picked && (
        <form onSubmit={submit} className="space-y-5 border-t border-white/5 pt-8">
          <p className={LABEL}>4. Your info</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: true, title: "I Have a PRO Pass", sub: "Just need your email" },
              { v: false, title: "Single Session", sub: `$${price} · ${sessionType.toLowerCase()}` },
            ].map((o) => (
              <button
                key={o.title}
                type="button"
                onClick={() => { setHasPass(o.v); setError(""); }}
                className={`rounded-2xl px-5 py-4 text-left border transition-all ${hasPass === o.v ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"}`}
              >
                <span className="block font-black uppercase text-sm">{o.title}</span>
                <span className={`block text-xs font-bold ${hasPass === o.v ? "text-black/50" : "text-white/40"}`}>{o.sub}</span>
              </button>
            ))}
          </div>

          {hasPass ? (
            <div>
              <label className={LABEL}>Email Address</label>
              <input required type="email" placeholder="PARENT@EXAMPLE.COM" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
              <p className="text-[10px] text-white/25 mt-2 leading-relaxed">
                Use the email you bought your pass with. One session is taken from your pass when you book.
                {length === 90 ? " 90 minute sessions may include a small top-up; Coach Paolo will confirm." : ""}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL}>Athlete Name</label>
                <input required type="text" placeholder="JORDAN SMITH" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} className={INPUT} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>School</label>
                  <input required type="text" placeholder="RICHMOND SECONDARY" value={school} onChange={(e) => setSchool(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Grade</label>
                  <input required type="text" placeholder="GRADE 10" value={grade} onChange={(e) => setGrade(e.target.value)} className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Parent Name</label>
                <input required type="text" placeholder="MICHAEL SMITH" value={parentName} onChange={(e) => setParentName(e.target.value)} className={INPUT} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Email Address</label>
                  <input required type="email" placeholder="PARENT@EXAMPLE.COM" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Parent Phone Number</label>
                  <input required type="tel" placeholder="604-000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={LABEL}>Anything we should know? (Optional)</label>
            <textarea rows={2} placeholder="POSITION, GOALS, SKILLS TO WORK ON" value={details} onChange={(e) => setDetails(e.target.value)} className={`${INPUT} resize-none`} />
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
          >
            {submitting ? "BOOKING..." : hasPass ? "BOOK WITH MY PASS" : `CONFIRM BOOKING — $${price}`}
            {!submitting && <ArrowRight className="w-5 h-5" />}
          </button>
          <p className="text-center text-xs text-white/20 leading-relaxed">
            Single sessions are paid by e-transfer after booking. No-shows without 24 hours&rsquo; notice are still charged a session. See our{" "}
            <Link href="/policies" className="underline hover:text-white/40">cancellation policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}
