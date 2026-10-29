"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";

// Bold poster palette: black + white with one hot accent.
const ACCENT = "#ff5b14";
const DISPLAY = { fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' } as const;
// The Vanguard demo font stamps a watermark on the "$" glyph, so prices use the regular heading font.
const PRICE = { fontFamily: "var(--font-anton), Anton, sans-serif" } as const;

const SESSIONS = [
  { id: "nov3", day: "Tue", date: "Nov 3", iso: "2026-11-03" },
  { id: "nov10", day: "Tue", date: "Nov 10", iso: "2026-11-10" },
  { id: "nov17", day: "Tue", date: "Nov 17", iso: "2026-11-17" },
] as const;

const DROP_IN = 65;
const ALL_THREE = 150;
const GRADES = [7, 8, 9];

const TICKER = ["Surrey, we are coming", "Grades 7 to 9", "Nov 3 / 10 / 17", "Limited spots", "Train. Compete. Prepare."];

const INPUT =
  "w-full bg-black border-2 border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-[#ff5b14] transition-colors placeholder:text-white/25";
const LABEL = "text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 block";

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

  // sticky mobile "Register" bar: shown once the hero is scrolled past, hidden while the form is on screen
  const heroRef = useRef<HTMLElement>(null);
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
    // the form only counts as "on screen" once it reaches the top half of the viewport
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
    <div className="bg-black text-white overflow-x-clip">
      {/* ── Hero: full-bleed photo, huge stacked type ─────────────── */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <Image
          src="/images/fall-academy-training.jpg"
          alt="LTS Elite Prep athletes in a live 1-on-1 drill"
          fill
          priority
          className="object-cover object-[center_38%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent hidden lg:block" />

        <div className="relative max-w-6xl w-full mx-auto px-5 pt-36 pb-12 sm:pb-16">
          <span
            className="inline-block text-black font-black text-xs sm:text-sm uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-5 -rotate-2"
            style={{ background: ACCENT }}
          >
            Surrey &middot; Grades 7 to 9
          </span>

          <h1 className="uppercase leading-[0.86] tracking-tighter mb-6" style={DISPLAY}>
            <span className="block text-[3.6rem] sm:text-[6.5rem] lg:text-[9rem]">Transition</span>
            <span className="block text-[3.6rem] sm:text-[6.5rem] lg:text-[9rem]">to High</span>
            <span className="block text-[3.6rem] sm:text-[6.5rem] lg:text-[9rem]" style={{ color: ACCENT }}>School</span>
          </h1>

          <p className="text-white/80 text-base sm:text-xl font-bold uppercase tracking-[0.12em] mb-8">
            Basketball Training Series
          </p>

          <div className="flex flex-wrap gap-2.5 mb-8">
            {SESSIONS.map((s) => (
              <div key={s.id} className="border-2 border-white rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{s.day}</p>
                <p className="text-xl sm:text-2xl font-black leading-none uppercase" style={DISPLAY}>{s.date}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold px-1">
              <Clock className="w-4 h-4" style={{ color: ACCENT }} /> 8:00 &ndash; 9:30 PM
            </div>
          </div>

          <p className="flex items-center gap-2 text-white/70 text-sm sm:text-base mb-8">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: ACCENT }} /> Princess Margaret Secondary School, Surrey
          </p>

          <a
            href="#register"
            onClick={() => trackEvent("button_click", "/surrey", "surrey_cta_top")}
            className="inline-flex items-center justify-center gap-3 text-black font-black text-base sm:text-lg uppercase tracking-wide px-8 py-4 sm:px-10 sm:py-5 rounded-full hover:brightness-110 active:scale-95 transition-all"
            style={{ background: ACCENT }}
          >
            Register Now <span className="opacity-70">from $65</span> <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ── Ticker ────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-3.5 border-y-2 border-black" style={{ background: ACCENT }}>
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {TICKER.map((t) => (
                <span key={`${copy}-${t}`} className="flex items-center text-black font-black uppercase tracking-[0.15em] text-sm sm:text-base whitespace-nowrap">
                  {t}
                  <span className="mx-6 sm:mx-8 text-xl leading-none">&#9679;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Pitch + pricing ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
        <div className="lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-center">
          <div className="mb-12 lg:mb-0">
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-4" style={{ color: ACCENT }}>The next level starts here</p>
            <h2 className="text-4xl sm:text-6xl uppercase leading-[0.95] tracking-tighter mb-6" style={DISPLAY}>
              Three nights. <br />One big step up.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              LTS Elite Prep is bringing our Transition to High School Basketball training series to Surrey this November.
              Three opportunities to train, compete, and prepare for the demands of high school basketball, designed
              specifically for Grade 7 to 9 athletes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border-2 border-white/15 p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-3">Drop-In</p>
              <p className="text-6xl leading-none mb-2" style={PRICE}>$65</p>
              <p className="text-white/50 text-sm font-semibold">Per night. Pick any night that works.</p>
            </div>
            <div className="relative rounded-3xl p-7 text-black" style={{ background: ACCENT }}>
              <span className="absolute -top-3 -right-2 rotate-6 bg-black text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2" style={{ borderColor: ACCENT }}>
                Save $45
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60 mb-3">All 3 Sessions</p>
              <p className="text-6xl leading-none mb-2" style={PRICE}>$150</p>
              <p className="text-black/70 text-sm font-semibold">Nov 3, 10 &amp; 17. The best way to do it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Register ──────────────────────────────────────────────── */}
      <section id="register" className="bg-[#0d0d0d] border-t border-white/5 scroll-mt-0">
        <div ref={formRef} className="max-w-2xl mx-auto px-5 py-16 sm:py-24">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>Limited spots</p>
            <h2 className="text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tighter" style={DISPLAY}>Lock in your spot</h2>
          </div>

          {done ? (
            <div className="text-center rounded-3xl border-2 p-8" style={{ borderColor: ACCENT }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: ACCENT }}>
                <Check className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-4xl uppercase mb-3" style={DISPLAY}>You are in</h3>
              <p className="text-white/60 leading-relaxed mb-5">
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
                <input required type="text" placeholder="Jordan Smith" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} className={INPUT} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Grade</label>
                  <select required value={grade} onChange={(e) => setGrade(e.target.value)} className={INPUT}>
                    <option value="">Select grade</option>
                    {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>School</label>
                  <input required type="text" placeholder="Your school" value={school} onChange={(e) => setSchool(e.target.value)} className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Parent Name</label>
                <input required type="text" placeholder="Michael Smith" value={parentName} onChange={(e) => setParentName(e.target.value)} className={INPUT} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Parent Email</label>
                  <input required type="email" placeholder="parent@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Parent Phone</label>
                  <input required type="tel" placeholder="604-000-0000" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className={INPUT} />
                </div>
              </div>

              <div>
                <label className={LABEL}>Choose Your Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "all", title: "All 3 Sessions", sub: `$${ALL_THREE} · save $45` },
                    { id: "dropin", title: "Drop-In", sub: `$${DROP_IN} per night` },
                  ] as const).map((o) => {
                    const on = plan === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setPlan(o.id)}
                        className={`rounded-xl px-5 py-4 text-left border-2 transition-all ${on ? "text-black" : "bg-black text-white border-white/10 hover:border-white/30"}`}
                        style={on ? { background: ACCENT, borderColor: ACCENT } : undefined}
                      >
                        <span className="block font-black uppercase text-sm">{o.title}</span>
                        <span className={`block text-xs font-bold ${on ? "text-black/60" : "text-white/40"}`}>{o.sub}</span>
                      </button>
                    );
                  })}
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
                          className={`w-full flex items-center justify-between rounded-xl px-5 py-4 border-2 text-left transition-all disabled:opacity-30 ${on ? "text-black" : "bg-black text-white border-white/10 hover:border-white/30"}`}
                          style={on ? { background: ACCENT, borderColor: ACCENT } : undefined}
                        >
                          <span className="font-black">{s.day}, {s.date} <span className={`font-bold text-xs ml-2 ${on ? "text-black/60" : "text-white/40"}`}>8:00 &ndash; 9:30 PM</span></span>
                          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${on ? "bg-black border-black" : "border-white/25"}`}>
                            {on && <Check className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {dates.length === SESSIONS.length && (
                    <p className="text-xs text-white/60 mt-2">All three nights is our $150 series price, so we&rsquo;ve applied it.</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-4 rounded-xl text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full text-black font-black text-lg uppercase tracking-wide py-5 rounded-full flex items-center justify-center gap-2 disabled:opacity-30 hover:brightness-110 active:scale-[0.99] transition-all"
                style={{ background: ACCENT }}
              >
                {loading ? "Registering..." : `Register${price ? ` — $${price}` : ""}`}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs text-white/30 leading-relaxed">
                You&rsquo;ll receive an e-transfer invoice by email. Please send payment within 48 hours to hold your spot.
                All sales are final, and no-shows without 24 hours&rsquo; notice are still charged. See our{" "}
                <Link href="/policies" className="underline hover:text-white/60">cancellation policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Sticky register bar (phones) ──────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <a
          href="#register"
          tabIndex={showBar ? 0 : -1}
          onClick={() => trackEvent("button_click", "/surrey", "surrey_cta_sticky")}
          className="flex items-center justify-center gap-2 text-black font-black uppercase tracking-wide py-4 rounded-full shadow-2xl active:scale-95 transition-transform"
          style={{ background: ACCENT }}
        >
          Register <span className="opacity-70">from $65</span> <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
