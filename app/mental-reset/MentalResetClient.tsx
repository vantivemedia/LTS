"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MapPin, Clock, Users } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";

// ── Poster palette (sampled from the graphic) ─────────────────
const INK = "#1a110c";
const RED = "#c71c24";
const PAPER = "#e8ddc7";

// halftone-dot "paper" texture, like the graphic
const paperStyle: React.CSSProperties = {
  backgroundColor: PAPER,
  backgroundImage: "radial-gradient(rgba(50,36,22,0.2) 0.9px, transparent 1.3px)",
  backgroundSize: "3.5px 3.5px",
  color: INK,
};
const halftoneOverlay: React.CSSProperties = {
  backgroundImage: "radial-gradient(rgba(40,28,18,0.55) 0.9px, transparent 1.4px)",
  backgroundSize: "3.5px 3.5px",
  mixBlendMode: "multiply",
};

const CAPACITY = 10;

const SESSIONS = [
  { n: 1, grades: "Grades 7–9", time: "10:30 AM – 12:00 PM", price: "$85" },
  { n: 2, grades: "Grades 10–12", time: "12:30 PM – 2:00 PM", price: "$85" },
] as const;

const LEARN = [
  "Recognizing and managing emotions during competition",
  "Responding positively to mistakes and setbacks",
  "Developing effective mental reset strategies",
  "Building confidence through progressive learning",
  "Maintaining focus and composure under pressure",
];

const GRADES = [7, 8, 9, 10, 11, 12];

const FIELD =
  "w-full bg-[#f4ecda] border-2 rounded-xl px-5 py-3.5 font-bold outline-none focus:bg-white transition-colors placeholder:text-[#1a110c]/30";
const LABEL = "text-[11px] font-black uppercase tracking-[0.18em] mb-1.5 block";

function sessionForGrade(g: number): 1 | 2 | null {
  if (g >= 7 && g <= 9) return 1;
  if (g >= 10 && g <= 12) return 2;
  return null;
}

export default function MentalResetClient({ serifClass }: { serifClass: string }) {
  const [counts, setCounts] = useState<{ 1: number; 2: number } | null>(null);
  const [athleteName, setAthleteName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [withAcademy, setWithAcademy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ athlete: string; email: string; price: number; session: 1 | 2 } | null>(null);

  useEffect(() => {
    fetch("/api/mental-reset")
      .then((r) => r.json())
      .then((d) => setCounts({ 1: d.session1 ?? 0, 2: d.session2 ?? 0 }))
      .catch(() => {});
  }, []);

  const left = (n: 1 | 2) => (counts ? Math.max(0, CAPACITY - counts[n]) : null);
  const session = grade ? sessionForGrade(parseInt(grade, 10)) : null;
  const sessionInfo = session ? SESSIONS[session - 1] : null;
  const sessionFull = session ? left(session) === 0 : false;
  const price = withAcademy ? 125 : 85;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mental-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName, grade, school, parentName, parentEmail, parentPhone, withAcademy,
          sessionId: getSessionId(), attribution: getAttribution(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.code === "SESSION_FULL" && session) setCounts((c) => ({ ...(c || { 1: 0, 2: 0 }), [session]: CAPACITY }));
        throw new Error(d.error || "Registration failed");
      }
      trackEvent("button_click", "/mental-reset", "mental_reset_registered");
      setDone({ athlete: athleteName, email: parentEmail, price, session: d.session ?? session });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email info@ltseliteprep.ca");
    } finally {
      setLoading(false);
    }
  }

  const spotsBadge = (n: 1 | 2) => {
    const l = left(n);
    if (l === null) return null;
    if (l === 0) return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: INK }}>Full</span>;
    if (l <= 4) return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: RED }}>Only {l} spot{l === 1 ? "" : "s"} left</span>;
    return <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border-2" style={{ borderColor: INK }}>{l} spots left</span>;
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-3 sm:px-5">
      <div className="max-w-3xl mx-auto rounded-[22px] overflow-hidden shadow-2xl" style={paperStyle}>
        {/* ── Poster ─────────────────────────────────────── */}
        <header className="px-5 sm:px-10 pt-10 sm:pt-14 text-center">
          <p className="font-black uppercase tracking-[0.12em] text-sm sm:text-lg mb-1">The Next Rep:</p>
          <h1 className="flex flex-nowrap items-baseline justify-center gap-x-2.5 sm:gap-x-5 leading-[0.95]" style={{ color: INK }}>
            <span className="text-[2.1rem] sm:text-7xl tracking-tight">The</span>
            <span
              className={`${serifClass} normal-case text-[2.8rem] sm:text-[6.5rem] font-bold tracking-tight`}
              style={{ color: RED }}
            >
              Mental
            </span>
            <span className="text-[2.1rem] sm:text-7xl tracking-tight">Reset</span>
          </h1>

          <div className="relative mx-auto mt-8 sm:mt-10 max-w-sm sm:max-w-md aspect-[4/5] overflow-hidden" style={{ border: `3px solid ${INK}` }}>
            <Image
              src="/images/nextrep-hero-v3.jpg"
              alt="Coach Paolo talking with athletes at The Hoop"
              fill
              priority
              className="object-cover object-[center_72%] sepia-[0.25] contrast-[1.05]"
              sizes="(max-width: 640px) 90vw, 448px"
            />
            <div className="absolute inset-0 pointer-events-none" style={halftoneOverlay} />
          </div>

          <div className="mx-auto max-w-sm sm:max-w-md mt-5 flex items-start justify-between gap-4 text-left">
            <p className="text-2xl sm:text-4xl font-black uppercase leading-[0.95]">Friday,<br className="sm:hidden" /> Oct 23</p>
            <p className="text-2xl sm:text-4xl font-black uppercase leading-[0.95] text-right">The Hoop<br />Richmond</p>
          </div>

          <a
            href="#register"
            onClick={() => trackEvent("button_click", "/mental-reset", "mental_reset_cta_top")}
            className="inline-flex items-center justify-center gap-2 mt-8 text-[#f4ecda] font-black uppercase tracking-wide text-sm px-8 py-4 rounded-full active:scale-95 transition-transform"
            style={{ background: INK }}
          >
            Reserve a Spot <ArrowRight className="w-4 h-4" />
          </a>
        </header>

        <div className="px-5 sm:px-10 pb-12 sm:pb-14">
          {/* ── Intro ───────────────────────────────────── */}
          <section className="mt-12 text-center max-w-xl mx-auto">
            <p className="text-lg leading-relaxed font-medium">
              Basketball is more than physical skill. An athlete&rsquo;s ability to respond to mistakes, manage frustration,
              and perform under pressure plays an important role in their development.
            </p>
            <p className="mt-4 leading-relaxed" style={{ color: "rgba(26,17,12,0.75)" }}>
              This <strong>90-minute workshop</strong> combines interactive discussions with on-court activities to help
              athletes develop confidence, emotional awareness, resilience, and mental discipline.
            </p>
          </section>

          {/* ── Sessions ────────────────────────────────── */}
          <section className="mt-12">
            <h2 className="text-3xl sm:text-4xl mb-5 text-center">Workshop Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {SESSIONS.map((s) => (
                <div key={s.n} className="p-5 rounded-2xl" style={{ border: `2px solid ${INK}`, background: "rgba(244,236,218,0.6)" }}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em]">Session {s.n}</p>
                    {spotsBadge(s.n)}
                  </div>
                  <p className="text-3xl font-black uppercase leading-none mb-3" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>{s.grades}</p>
                  <p className="flex items-center gap-2 font-bold"><Clock className="w-4 h-4" /> {s.time}</p>
                  <p className="text-2xl font-black mt-2">{s.price} <span className="text-xs font-bold uppercase tracking-wider opacity-60">per athlete</span></p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-bold">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> The Hoop · 11111 Twigg Pl #1061, Richmond, BC</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Max {CAPACITY} athletes per session</span>
            </div>
          </section>

          {/* ── What athletes learn ─────────────────────── */}
          <section className="mt-12">
            <h2 className="text-3xl sm:text-4xl mb-5 text-center">What Athletes Will Learn</h2>
            <ul className="space-y-3 max-w-xl mx-auto">
              {LEARN.map((item) => (
                <li key={item} className="flex items-start gap-3 font-semibold leading-snug">
                  <span className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: RED }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* ── Academy special ─────────────────────────── */}
          <section className="mt-12 rounded-2xl p-6 sm:p-8 text-center" style={{ background: INK, color: "#f4ecda" }}>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Workshop + Academy Special</p>
            <p className="text-5xl sm:text-6xl font-black leading-none" style={{ fontFamily: "var(--font-anton), Anton, sans-serif" }}>
              $125 <span className="text-xl sm:text-2xl opacity-50 line-through font-bold">$140</span>
            </p>
            <p className="mt-3 leading-relaxed opacity-85 max-w-md mx-auto">
              Our regular LTS Academy runs <strong>5:30 – 7:00 PM</strong> that evening. Attend both programs and save $15.
            </p>
          </section>

          {/* ── Register ────────────────────────────────── */}
          <section id="register" className="mt-14 scroll-mt-28">
            <h2 className="text-3xl sm:text-4xl mb-2 text-center">Reserve Your Spot</h2>
            <p className="text-center text-sm font-semibold mb-6 opacity-70">Registration is limited to {CAPACITY} athletes per session.</p>

            {done ? (
              <div className="text-center rounded-2xl p-7" style={{ border: `2px solid ${INK}`, background: "rgba(244,236,218,0.7)" }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: RED }}>
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl mb-3">You&rsquo;re on the list</h3>
                <p className="leading-relaxed mb-4">
                  <strong>{done.athlete}</strong> is registered for <strong>{SESSIONS[done.session - 1].grades} · {SESSIONS[done.session - 1].time}</strong> on Friday, October 23.
                </p>
                <div className="rounded-xl p-4 text-sm text-left max-w-sm mx-auto" style={{ background: INK, color: "#f4ecda" }}>
                  <p className="font-black uppercase tracking-wider text-[11px] opacity-60 mb-2">To confirm your spot</p>
                  <p>E-transfer <strong>${done.price}</strong> to <strong>info@ltseliteprep.ca</strong> within 48 hours. Note: &ldquo;{done.athlete} — Mental Reset&rdquo;.</p>
                </div>
                <p className="text-sm mt-4 opacity-70">We sent the details to {done.email}.</p>
                <Link href="/" className="inline-block mt-6 font-black uppercase text-sm underline underline-offset-4">Back to home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5 sm:p-8" style={{ border: `2px solid ${INK}`, background: "rgba(244,236,218,0.6)" }}>
                <div>
                  <label className={LABEL}>Athlete Name</label>
                  <input required type="text" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} placeholder="Jordan Smith" className={FIELD} style={{ borderColor: INK }} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Grade</label>
                    <select required value={grade} onChange={(e) => setGrade(e.target.value)} className={FIELD} style={{ borderColor: INK }}>
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>School</label>
                    <input required type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Richmond Secondary" className={FIELD} style={{ borderColor: INK }} />
                  </div>
                </div>

                {sessionInfo && (
                  <div className="rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between gap-3 flex-wrap" style={{ background: sessionFull ? "rgba(199,28,36,0.12)" : "rgba(26,17,12,0.07)", border: `1.5px dashed ${sessionFull ? RED : INK}` }}>
                    <span>
                      Your session: {sessionInfo.grades} · {sessionInfo.time}
                    </span>
                    {sessionFull ? <span style={{ color: RED }}>Full. Email us for the waitlist.</span> : spotsBadge(sessionInfo.n)}
                  </div>
                )}

                <div>
                  <label className={LABEL}>Parent Name</label>
                  <input required type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Michael Smith" className={FIELD} style={{ borderColor: INK }} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Parent Email</label>
                    <input required type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" className={FIELD} style={{ borderColor: INK }} />
                  </div>
                  <div>
                    <label className={LABEL}>Parent Phone</label>
                    <input required type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="604-000-0000" className={FIELD} style={{ borderColor: INK }} />
                  </div>
                </div>

                <label
                  className="flex items-start gap-3 rounded-xl p-4 cursor-pointer transition-colors"
                  style={{ border: `2px solid ${withAcademy ? RED : INK}`, background: withAcademy ? "rgba(199,28,36,0.08)" : "transparent" }}
                >
                  <input type="checkbox" checked={withAcademy} onChange={(e) => setWithAcademy(e.target.checked)} className="mt-1 w-5 h-5 accent-[#c71c24]" />
                  <span className="leading-snug">
                    <span className="block font-black uppercase tracking-wide">Add LTS Academy that evening (5:30 – 7:00 PM)</span>
                    <span className="block text-sm opacity-75">Workshop + Academy for $125 instead of $140.</span>
                  </span>
                </label>

                {error && (
                  <div className="rounded-xl p-4 text-sm font-bold text-center text-white" style={{ background: RED }}>{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading || sessionFull || !athleteName || !grade || !school || !parentName || !parentEmail || !parentPhone}
                  className="w-full font-black uppercase tracking-wide py-4 rounded-full flex items-center justify-center gap-2 text-[#f4ecda] disabled:opacity-40 active:scale-[0.99] transition-transform"
                  style={{ background: INK }}
                >
                  {loading ? "Reserving..." : `Reserve My Spot — $${price}`}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-center text-xs opacity-65 leading-relaxed">
                  You&rsquo;ll get an e-transfer invoice by email. Please send payment within 48 hours to hold your spot.
                  All sales are final, and no-shows without 24 hours&rsquo; notice are still charged. See our{" "}
                  <Link href="/policies" className="underline">cancellation policy</Link>.
                </p>
              </form>
            )}
          </section>

          <p className="mt-12 text-center text-xs font-black uppercase tracking-[0.2em] opacity-60">
            Purposeful &nbsp;/&nbsp; Alert &nbsp;/&nbsp; Conscious &nbsp;/&nbsp; Technical
          </p>
        </div>
      </div>
    </div>
  );
}
