"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";

// Matches the rest of the site (black + white). Liquid glass is used sparingly: the info card
// over the photo, the plan toggle, and the sticky phone bar.

const SESSIONS = [
  { id: "nov3", day: "Tue", date: "Nov 3", iso: "2026-11-03" },
  { id: "nov10", day: "Tue", date: "Nov 10", iso: "2026-11-10" },
  { id: "nov17", day: "Tue", date: "Nov 17", iso: "2026-11-17" },
] as const;

const DROP_IN = 65;
const ALL_THREE = 150;
const GRADES = [7, 8, 9];

const INPUT =
  "w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors";
const LABEL = "text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block";

export default function SurreyClient() {
  const [athleteName, setAthleteName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [plan, setPlan] = useState<"all" | "dropin">("all");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ athlete: string; email: string; price: number; dates: string } | null>(null);

  // Sticky phone bar: appears once the hero is scrolled past, hides while the form is on screen.
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const watch = (el: Element | null, set: (v: boolean) => void, rootMargin = "0px") => {
      if (!el) return () => {};
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.05, rootMargin });
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(heroRef.current, setHeroVisible);
    const b = watch(formRef.current, setFormVisible, "0px 0px -50% 0px");
    return () => { a(); b(); };
  }, []);

  // Nights that have already happened can't be picked (Pacific time).
  const today = useMemo(() => new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" }), []);
  const open = SESSIONS.filter((s) => s.iso >= today);

  // Ticking every night as a drop-in is the series, at the series price.
  const allThree = plan === "all" || dates.length === SESSIONS.length;
  const price = allThree ? ALL_THREE : DROP_IN * dates.length;
  const canSubmit =
    athleteName && grade && school && parentName && parentEmail && parentPhone && (allThree || dates.length > 0);

  const toggle = (id: string) => setDates((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/surrey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName, grade, school, parentName, parentEmail, parentPhone, plan, dates,
          sessionId: getSessionId(), attribution: getAttribution(),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Registration failed");
      trackEvent("button_click", "/surrey", "surrey_registered");
      setDone({ athlete: athleteName, email: parentEmail, price: d.price, dates: d.dates });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email info@ltseliteprep.ca");
    } finally {
      setLoading(false);
    }
  }

  const showBar = !heroVisible && !formVisible && !done;

  return (
    <div className="min-h-screen bg-black pt-32 pb-28 lg:pb-24 px-5">
      <div className="max-w-4xl mx-auto">
        {/* ── Hero ─────────────────────────────────────── */}
        <div ref={heroRef} className="mb-14 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:items-center">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Surrey &middot; Grades 7 to 9</p>
            <h1
              className="text-5xl sm:text-6xl mb-4 uppercase tracking-tighter leading-none"
              style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
            >
              Transition to
              <br />
              High School
            </h1>
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">Basketball Training Series</p>
            <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-md">
              Three opportunities to train, compete, and prepare for the demands of high school basketball.
              Designed specifically for Grade 7 to 9 athletes preparing for the next level.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#register"
                onClick={() => trackEvent("button_click", "/surrey", "surrey_cta_top")}
                className="inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-[#111] border border-white/10 text-white font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:border-white/30 transition-all active:scale-95"
              >
                See Pricing
              </a>
            </div>
          </div>

          {/* photo with a frosted glass info card (the one place glass leads) */}
          <div className="mt-10 lg:mt-0 relative rounded-3xl overflow-hidden aspect-[4/5] border border-white/5">
            <Image
              src="/images/fall-academy-training.jpg"
              alt="LTS Elite Prep athletes in a live 1-on-1 drill"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <div
              className="lg-glass rounded-2xl p-4 sm:p-5"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(0,0,0,0.38))" }}
            >
              <div className="relative">
                <div className="grid grid-cols-3 gap-2 mb-3.5">
                  {SESSIONS.map((s) => (
                    <div key={s.id} className="lg-glass-soft rounded-xl py-2 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{s.day}</p>
                      <p className="text-base sm:text-lg font-black leading-tight">{s.date}</p>
                    </div>
                  ))}
                </div>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-white/85 mb-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-white/60" /> 8:00 &ndash; 9:30 PM
                </p>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-white/85">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-white/60" /> Princess Margaret Secondary, Surrey
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* ── Pricing ──────────────────────────────────── */}
        <div id="pricing" className="mb-14 scroll-mt-28">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Pricing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest font-bold mb-2 text-white/30">Drop-In</p>
              <p className="text-3xl font-black mb-2">$65</p>
              <p className="text-xs leading-relaxed text-white/40">Per session. Pick any night that works.</p>
            </div>
            <div className="bg-white text-black rounded-2xl p-6 relative">
              <span className="absolute -top-3 right-4 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Best Value
              </span>
              <p className="text-xs uppercase tracking-widest font-bold mb-2 text-black/50">All 3 Sessions</p>
              <p className="text-3xl font-black mb-2">$150</p>
              <p className="text-xs leading-relaxed text-black/60">Nov 3, 10 &amp; 17. Save $45 versus three drop-ins.</p>
            </div>
          </div>
        </div>

        {/* ── Register ─────────────────────────────────── */}
        <div id="register" className="scroll-mt-28">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Limited Spots</p>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Register Your Athlete</h2>
          </div>

          <div ref={formRef} className="bg-[#111] p-6 sm:p-10 rounded-3xl border border-white/5 max-w-2xl mx-auto">
            {done ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-3">You&rsquo;re registered</h3>
                <p className="text-white/50 leading-relaxed mb-5">
                  <strong className="text-white">{done.athlete}</strong> is signed up for {done.dates} at Princess Margaret Secondary, 8:00 &ndash; 9:30 PM.
                </p>
                <div className="bg-black border border-white/10 rounded-2xl p-5 text-sm text-left max-w-sm mx-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">To confirm your spot</p>
                  <p className="text-white/80 leading-relaxed">
                    E-transfer <strong className="text-white">${done.price}</strong> to <strong className="text-white">info@ltseliteprep.ca</strong> within 48 hours. Note: &ldquo;{done.athlete} &mdash; Surrey&rdquo;.
                  </p>
                </div>
                <p className="text-white/30 text-xs mt-4">We sent the details to {done.email}.</p>
                <Link href="/" className="inline-block mt-6 text-white/50 hover:text-white text-xs font-bold uppercase underline underline-offset-4">Back to home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={LABEL}>Athlete Name</label>
                  <input required type="text" placeholder="JORDAN SMITH" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} className={INPUT} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Grade</label>
                    <select required value={grade} onChange={(e) => setGrade(e.target.value)} className={INPUT}>
                      <option value="">SELECT GRADE</option>
                      {GRADES.map((g) => <option key={g} value={g}>GRADE {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>School</label>
                    <input required type="text" placeholder="YOUR SCHOOL" value={school} onChange={(e) => setSchool(e.target.value)} className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Parent Name</label>
                  <input required type="text" placeholder="MICHAEL SMITH" value={parentName} onChange={(e) => setParentName(e.target.value)} className={INPUT} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Parent Email</label>
                    <input required type="email" placeholder="PARENT@EXAMPLE.COM" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Parent Phone</label>
                    <input required type="tel" placeholder="604-000-0000" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Choose Your Plan</label>
                  <div className="lg-glass-soft rounded-full p-1 grid grid-cols-2 gap-1">
                    {([
                      { id: "all", title: `All 3 · $${ALL_THREE}` },
                      { id: "dropin", title: `Drop-In · $${DROP_IN}` },
                    ] as const).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setPlan(o.id)}
                        className={`rounded-full py-3 text-sm font-black uppercase tracking-wide transition-all ${
                          plan === o.id ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                        }`}
                      >
                        {o.title}
                      </button>
                    ))}
                  </div>
                </div>

                {plan === "dropin" && (
                  <div>
                    <label className={LABEL}>Which Nights?</label>
                    <div className="space-y-2">
                      {SESSIONS.map((s) => {
                        const available = open.some((o) => o.id === s.id);
                        const on = dates.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={!available}
                            onClick={() => toggle(s.id)}
                            className={`w-full flex items-center justify-between rounded-2xl px-5 py-4 border text-left transition-all disabled:opacity-30 ${
                              on ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"
                            }`}
                          >
                            <span className="font-black">{s.day}, {s.date} <span className={`font-bold text-xs ml-2 ${on ? "text-black/50" : "text-white/40"}`}>8:00 &ndash; 9:30 PM</span></span>
                            <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${on ? "bg-black border-black" : "border-white/20"}`}>
                              {on && <Check className="w-3.5 h-3.5 text-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {dates.length === SESSIONS.length && (
                      <p className="text-xs text-white/50 mt-2">All three nights is our $150 series price, so we&rsquo;ve applied it.</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
                >
                  {loading ? "REGISTERING..." : `REGISTER${price ? ` — $${price}` : ""}`}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-center text-xs text-white/20 leading-relaxed">
                  You&rsquo;ll receive an e-transfer invoice by email. Please send payment within 48 hours to hold your spot.
                  All sales are final, and no-shows without 24 hours&rsquo; notice are still charged. See our{" "}
                  <Link href="/policies" className="underline hover:text-white/40">cancellation policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky register bar (phones), frosted glass ──────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <a
          href="#register"
          tabIndex={showBar ? 0 : -1}
          onClick={() => trackEvent("button_click", "/surrey", "surrey_cta_sticky")}
          className="lg-glass flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wide py-4 rounded-full active:scale-95 transition-transform"
        >
          <span className="relative flex items-center gap-2">
            Register <span className="text-white/60 font-bold">from $65</span> <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </div>
    </div>
  );
}
