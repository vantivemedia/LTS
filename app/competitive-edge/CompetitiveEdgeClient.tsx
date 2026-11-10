"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, MapPin, Users } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";

// White is the main colour; black carries the weight; dark red is a quiet accent (numbers, thin rules,
// the "almost full" tag), used far less than black.
const INK = "#0b0b0b";
const RED = "#7a0f1a";

const CAPACITY = 12;
const PRICE = 85;

const GROUPS = [
  { n: 1, grades: "Grades 7–9", time: "11:00 AM – 12:30 PM" },
  { n: 2, grades: "Grades 10–12", time: "1:00 PM – 2:30 PM" },
] as const;

const QUALITIES = [
  { n: "01", title: "Mental Toughness" },
  { n: "02", title: "Resilience" },
  { n: "03", title: "Competitive Confidence" },
];

const EXPERIENCE = [
  "30-minute interactive seminar",
  "60-minute on-court application",
  "Small-group environment",
  "Guided learning, competition, and personal development",
];

const GRADES = [7, 8, 9, 10, 11, 12];

const FIELD =
  "w-full bg-neutral-100 border-2 border-black/10 rounded-xl px-5 py-3.5 font-bold outline-none focus:border-black focus:bg-white transition-colors placeholder:text-black/30";
const LABEL = "text-[11px] font-black uppercase tracking-[0.18em] mb-1.5 block";

function groupForGrade(g: number): 1 | 2 | null {
  if (g >= 7 && g <= 9) return 1;
  if (g >= 10 && g <= 12) return 2;
  return null;
}

export default function CompetitiveEdgeClient() {
  const [counts, setCounts] = useState<{ 1: number; 2: number } | null>(null);
  const [athleteName, setAthleteName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ athlete: string; email: string; group: 1 | 2 } | null>(null);

  useEffect(() => {
    fetch("/api/competitive-edge")
      .then((r) => r.json())
      .then((d) => setCounts({ 1: d.session1 ?? 0, 2: d.session2 ?? 0 }))
      .catch(() => {});
  }, []);

  const left = (n: 1 | 2) => (counts ? Math.max(0, CAPACITY - counts[n]) : null);
  const totalLeft = counts ? left(1)! + left(2)! : null;
  const group = grade ? groupForGrade(parseInt(grade, 10)) : null;
  const groupInfo = group ? GROUPS[group - 1] : null;
  const groupFull = group ? left(group) === 0 : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitive-edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName, grade, school, parentName, parentEmail, parentPhone,
          sessionId: getSessionId(), attribution: getAttribution(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.code === "SESSION_FULL" && group) setCounts((c) => ({ ...(c || { 1: 0, 2: 0 }), [group]: CAPACITY }));
        throw new Error(d.error || "Registration failed");
      }
      trackEvent("button_click", "/competitive-edge", "competitive_edge_registered");
      setDone({ athlete: athleteName, email: parentEmail, group: d.session ?? group });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email info@ltseliteprep.ca");
    } finally {
      setLoading(false);
    }
  }

  const spotsBadge = (n: 1 | 2) => {
    const l = left(n);
    if (l === null) return null;
    // Older group (Grades 10-12): no spots-left count shown, only "Full" once it fills
    if (n === 2 && l > 0) return null;
    if (l === 0) return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: INK }}>Full</span>;
    if (l <= 4) return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border-2" style={{ borderColor: RED, color: RED }}>Only {l} left</span>;
    return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border-2" style={{ borderColor: INK }}>{l} spots left</span>;
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-10 px-1.5 sm:px-3">
      <div className="max-w-6xl mx-auto rounded-[22px] overflow-hidden bg-white shadow-2xl" style={{ color: INK }}>
        {/* ── Header ─────────────────────────────────── */}
        <header className="px-5 sm:px-12 pt-12 sm:pt-16 pb-12 text-center">
          <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em]" style={{ color: "rgba(11,11,11,0.55)" }}>
            The Next Rep Workshop Series
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 mb-4">
            <span className="h-px w-10 sm:w-16" style={{ background: RED }} />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.35em]" style={{ color: RED }}>Workshop III</span>
            <span className="h-px w-10 sm:w-16" style={{ background: RED }} />
          </div>

          <h1 className="text-[3rem] sm:text-8xl md:text-9xl tracking-tight leading-[0.92]" style={{ color: INK }}>
            The Competitive
            <br />
            Edge
          </h1>

          <p className="mt-6 text-xl sm:text-3xl font-black tracking-tight">Your response is your competitive edge.</p>

          <a
            href="#register"
            onClick={() => trackEvent("button_click", "/competitive-edge", "competitive_edge_cta_top")}
            className="animate-ce-pulse inline-flex items-center justify-center gap-2 mt-9 text-white font-black uppercase tracking-wide text-sm px-9 py-4 rounded-full active:scale-95 hover:bg-black"
            style={{ background: INK }}
          >
            Register Now <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(11,11,11,0.5)" }}>
            Wednesday, November 11 &middot; Grades 7&ndash;12
          </p>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(11,11,11,0.5)" }}>
            <MapPin className="w-3.5 h-3.5" /> The Hoop &middot; Richmond, BC
          </p>
        </header>

        {/* ── Intro + photo ──────────────────────────── */}
        <section className="px-5 sm:px-12 md:px-16 pb-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:items-center">
          <div className="max-w-xl">
            <p className="text-lg sm:text-xl font-bold leading-snug mb-5">
              Every athlete experiences adversity.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-5" style={{ color: "rgba(11,11,11,0.75)" }}>
              Missed opportunities. Difficult moments. Self-doubt. Failure.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-5" style={{ color: "rgba(11,11,11,0.75)" }}>
              But what separates athletes isn&rsquo;t simply their ability to perform when things are going well.
            </p>
            <p className="text-xl sm:text-2xl font-black leading-snug pl-4 border-l-4" style={{ borderColor: RED }}>
              It&rsquo;s how they respond when things aren&rsquo;t.
            </p>
          </div>

          <div className="relative mt-10 lg:mt-0 aspect-[4/5] max-w-md mx-auto lg:mx-0 lg:ml-auto w-full overflow-hidden rounded-2xl" style={{ background: INK }}>
            <Image
              src="/images/nextrep-hero-v3.jpg"
              alt="Coach Paolo talking with athletes during a Next Rep workshop"
              fill
              className="object-cover object-[center_72%] grayscale contrast-[1.05]"
              sizes="(max-width: 1024px) 90vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
        </section>

        {/* ── Three qualities ────────────────────────── */}
        <section className="px-5 sm:px-12 md:px-16 pb-14">
          <p className="text-center text-base sm:text-lg font-bold max-w-2xl mx-auto mb-7">
            This Remembrance Day, we&rsquo;re turning our attention toward three qualities essential to both basketball and life:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {QUALITIES.map((q) => (
              <div key={q.n} className="rounded-2xl p-6 sm:p-7 text-white" style={{ background: INK }}>
                <p className="text-xs font-black tracking-[0.25em] mb-5" style={{ color: "#b3434f" }}>{q.n}</p>
                <p className="text-3xl sm:text-4xl uppercase leading-[0.95]" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>{q.title}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mt-8" style={{ color: "rgba(11,11,11,0.75)" }}>
            Through an engaging combination of mental performance education and competitive basketball training, athletes
            will be challenged to explore their mindset, embrace adversity, and discover what it means to respond with purpose.
          </p>
        </section>

        {/* ── Workshop details ───────────────────────── */}
        <section className="px-5 sm:px-12 md:px-16 pb-14">
          <div className="rounded-3xl overflow-hidden" style={{ border: `2px solid ${INK}` }}>
            <div className="px-6 py-5 text-center text-white" style={{ background: INK }}>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Workshop Details</p>
              <p className="text-3xl sm:text-4xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>
                Wednesday, November 11, 2026
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.25em] mt-2" style={{ color: "#b3434f" }}>Remembrance Day</p>
              <p className="flex items-center justify-center gap-2 text-sm font-bold mt-4 text-white/85">
                <MapPin className="w-4 h-4 shrink-0" /> The Hoop &mdash; 11111 Twigg Pl #1061, Richmond, BC
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-px" style={{ background: "rgba(11,11,11,0.12)" }}>
              {GROUPS.map((g) => (
                <div key={g.n} className="bg-white p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(11,11,11,0.55)" }}>Group {g.n}</p>
                    {spotsBadge(g.n)}
                  </div>
                  <p className="text-4xl sm:text-5xl uppercase leading-none mb-3" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>{g.grades}</p>
                  <p className="flex items-center gap-2 font-bold text-lg"><Clock className="w-4 h-4" /> {g.time}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-px" style={{ background: "rgba(11,11,11,0.12)" }}>
              <div className="bg-white p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(11,11,11,0.55)" }}>Investment</p>
                <p className="text-5xl leading-none" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>${PRICE}</p>
                <p className="text-sm font-bold mt-1" style={{ color: "rgba(11,11,11,0.6)" }}>per athlete</p>
              </div>
              <div className="bg-white p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(11,11,11,0.55)" }}>Capacity</p>
                <p className="text-5xl leading-none" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>{CAPACITY}</p>
                <p className="text-sm font-bold mt-1" style={{ color: "rgba(11,11,11,0.6)" }}>athletes per group</p>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-xl mx-auto">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-center mb-4" style={{ color: RED }}>The Experience</p>
            <ul className="space-y-3">
              {EXPERIENCE.map((x) => (
                <li key={x} className="flex items-start gap-3 font-bold leading-snug">
                  <span className="mt-1.5 w-2.5 h-2.5 shrink-0" style={{ background: INK }} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Statement ──────────────────────────────── */}
        <section className="px-5 sm:px-12 md:px-16 pb-14 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              This isn&rsquo;t just about becoming a better basketball player.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mt-4" style={{ color: "rgba(11,11,11,0.75)" }}>
              It&rsquo;s about developing the confidence and resilience to navigate challenges both on and off the court.
            </p>
            <p className="inline-flex items-center gap-2 mt-7 text-sm font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full text-white" style={{ background: INK }}>
              <Users className="w-4 h-4" />
              {totalLeft === null ? "24 total spots available" : totalLeft === 0 ? "Sold out" : `${totalLeft} of 24 spots left`}
            </p>
          </div>
        </section>

        {/* ── Register ───────────────────────────────── */}
        <section id="register" className="px-5 sm:px-12 md:px-16 pb-16 scroll-mt-24">
          <h2 className="text-4xl sm:text-5xl text-center mb-2">Reserve Your Spot</h2>
          <p className="text-center text-sm font-bold mb-7" style={{ color: "rgba(11,11,11,0.6)" }}>
            Small groups. {CAPACITY} athletes each. Registration is first come, first served.
          </p>

          <div className="max-w-2xl mx-auto">
            {done ? (
              <div className="text-center rounded-3xl p-8 text-white" style={{ background: INK }}>
                <div className="w-14 h-14 rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
                  <Check className="w-7 h-7" style={{ color: INK }} />
                </div>
                <h3 className="text-3xl mb-3">You&rsquo;re on the list</h3>
                <p className="leading-relaxed mb-5 text-white/80">
                  <strong className="text-white">{done.athlete}</strong> is registered for{" "}
                  <strong className="text-white">{GROUPS[done.group - 1].grades} · {GROUPS[done.group - 1].time}</strong> on Wednesday, November 11, at The Hoop in Richmond.
                </p>
                <div className="rounded-2xl p-5 text-sm text-left max-w-sm mx-auto" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <p className="font-black uppercase tracking-wider text-[11px] mb-2" style={{ color: "#b3434f" }}>To confirm your spot</p>
                  <p className="text-white/85">
                    E-transfer <strong className="text-white">${PRICE}</strong> to <strong className="text-white">info@ltseliteprep.ca</strong> within 48 hours.
                    Note: &ldquo;{done.athlete} &mdash; Competitive Edge&rdquo;.
                  </p>
                </div>
                <p className="text-sm mt-4 text-white/50">We sent the details to {done.email}.</p>
                <Link href="/" className="inline-block mt-6 font-black uppercase text-sm underline underline-offset-4 text-white/80 hover:text-white">Back to home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl p-5 sm:p-8" style={{ border: `2px solid ${INK}` }}>
                <div>
                  <label className={LABEL}>Athlete Name</label>
                  <input required type="text" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} placeholder="Jordan Smith" className={FIELD} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Grade</label>
                    <select required value={grade} onChange={(e) => setGrade(e.target.value)} className={FIELD}>
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>School</label>
                    <input required type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Richmond Secondary" className={FIELD} />
                  </div>
                </div>

                {groupInfo && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between gap-3 flex-wrap"
                    style={{ background: groupFull ? "rgba(122,15,26,0.08)" : "rgba(11,11,11,0.05)", border: `1.5px dashed ${groupFull ? RED : INK}` }}
                  >
                    <span>Your group: {groupInfo.grades} · {groupInfo.time}</span>
                    {groupFull ? <span style={{ color: RED }}>Full. Email us for the waitlist.</span> : spotsBadge(groupInfo.n)}
                  </div>
                )}

                <div>
                  <label className={LABEL}>Parent Name</label>
                  <input required type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Michael Smith" className={FIELD} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Parent Email</label>
                    <input required type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Parent Phone</label>
                    <input required type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="604-000-0000" className={FIELD} />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl p-4 text-sm font-bold text-center text-white" style={{ background: RED }}>{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading || groupFull || !athleteName || !grade || !school || !parentName || !parentEmail || !parentPhone}
                  className="w-full font-black uppercase tracking-wide py-4 rounded-full flex items-center justify-center gap-2 text-white disabled:opacity-40 active:scale-[0.99] transition-transform"
                  style={{ background: INK }}
                >
                  {loading ? "Reserving..." : `Register Now — $${PRICE}`}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-center text-xs leading-relaxed" style={{ color: "rgba(11,11,11,0.6)" }}>
                  You&rsquo;ll get an e-transfer invoice by email. Please send payment within 48 hours to hold your spot.
                  All sales are final, and no-shows without 24 hours&rsquo; notice are still charged. See our{" "}
                  <Link href="/policies" className="underline">cancellation policy</Link>.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ── Sign-off ───────────────────────────────── */}
        <footer className="px-5 sm:px-12 py-12 text-center text-white" style={{ background: INK }}>
          <p className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">Because the next rep isn&rsquo;t always physical.</p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight leading-snug" style={{ color: "#b3434f" }}>Sometimes, it&rsquo;s mental.</p>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-white/60">LTS Elite Prep</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/40">The Next Rep Workshop Series &mdash; Developing the person behind the player.</p>
        </footer>
      </div>
    </div>
  );
}
