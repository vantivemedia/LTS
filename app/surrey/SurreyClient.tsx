"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import { trackEvent, getSessionId, getAttribution } from "@/lib/analytics";

// Minimal + liquid glass: the photo is a soft fixed backdrop, content sits on frosted panels.
const SANS = { fontFamily: "var(--font-inter), system-ui, sans-serif", textTransform: "none" as const };

const SESSIONS = [
  { id: "nov3", day: "Tue", date: "Nov 3", iso: "2026-11-03" },
  { id: "nov10", day: "Tue", date: "Nov 10", iso: "2026-11-10" },
  { id: "nov17", day: "Tue", date: "Nov 17", iso: "2026-11-17" },
] as const;

const DROP_IN = 65;
const ALL_THREE = 150;
const GRADES = [7, 8, 9];

const LABEL = "text-[11px] font-medium text-white/60 uppercase tracking-[0.2em] mb-2 block";

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

  // Sticky phone bar: appears once the intro is scrolled past, hides while the form is on screen.
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const watch = (el: Element | null, set: (v: boolean) => void, rootMargin = "0px") => {
      if (!el) return () => {};
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.05, rootMargin });
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(introRef.current, setIntroVisible);
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

  const showBar = !introVisible && !formVisible && !done;

  return (
    <div className="relative min-h-screen text-white bg-black overflow-x-clip">
      {/* ── Backdrop: soft photo + drifting light ───────────────── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/fall-academy-training.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_40%] scale-110 blur-[2px]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="lg-blob absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="lg-blob absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-violet-300/20 blur-[100px]" style={{ animationDelay: "-6s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-32 pb-28 lg:pb-24 lg:grid lg:grid-cols-[1fr_30rem] lg:gap-14 lg:items-start">
        {/* ── Left: intro + details ─────────────────────────────── */}
        <section ref={introRef} className="mb-10 lg:mb-0">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/60 mb-5">LTS Elite Prep &middot; Surrey</p>
          <h1
            className="text-[2.9rem] sm:text-7xl leading-[1.02] font-semibold mb-5"
            style={{ ...SANS, letterSpacing: "-0.035em" }}
          >
            Transition to
            <br />
            High School
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md mb-10">
            A three night basketball training series for Grade 7 to 9 athletes preparing for the next level.
          </p>

          <div className="lg-glass rounded-[2rem] p-6 sm:p-8 max-w-xl">
            <div className="relative space-y-6">
              <div>
                <p className={LABEL}>Dates &middot; 8:00 &ndash; 9:30 PM</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {SESSIONS.map((s) => (
                    <div key={s.id} className="lg-glass-soft rounded-2xl py-3.5 text-center">
                      <p className="text-[11px] uppercase tracking-widest text-white/60">{s.day}</p>
                      <p className="text-lg sm:text-xl font-semibold tracking-tight">{s.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 text-white/80 text-sm leading-relaxed">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/50" />
                <span>Princess Margaret Secondary School, Surrey</span>
              </div>
              <div className="flex items-start gap-3 text-white/80 text-sm leading-relaxed">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-white/50" />
                <span>Three opportunities to train, compete, and prepare for the demands of high school basketball. Limited spots.</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="lg-glass-soft rounded-2xl p-4">
                  <p className="text-[11px] uppercase tracking-widest text-white/60 mb-1">Drop-in</p>
                  <p className="text-3xl font-semibold tracking-tight">$65</p>
                  <p className="text-xs text-white/50 mt-0.5">per night</p>
                </div>
                <div className="rounded-2xl p-4 bg-white/90 text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)]">
                  <p className="text-[11px] uppercase tracking-widest text-black/60 mb-1">All 3 sessions</p>
                  <p className="text-3xl font-semibold tracking-tight">$150</p>
                  <p className="text-xs text-black/60 mt-0.5">save $45</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right: registration ───────────────────────────────── */}
        <section ref={formRef} id="register" className="lg:sticky lg:top-28 scroll-mt-24">
          <div className="lg-glass rounded-[2rem] p-6 sm:p-8">
            <div className="relative">
              {done ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-5">
                    <Check className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-3" style={{ ...SANS, letterSpacing: "-0.02em" }}>You&rsquo;re registered</h2>
                  <p className="text-white/70 leading-relaxed mb-5 text-sm">
                    <strong className="text-white">{done.athlete}</strong> is signed up for {done.dates} at Princess Margaret Secondary, 8:00 &ndash; 9:30 PM.
                  </p>
                  <div className="lg-glass-soft rounded-2xl p-5 text-sm text-left">
                    <p className="text-[11px] uppercase tracking-widest text-white/50 mb-2">To confirm your spot</p>
                    <p className="text-white/85 leading-relaxed">
                      E-transfer <strong className="text-white">${done.price}</strong> to <strong className="text-white">info@ltseliteprep.ca</strong> within 48 hours. Note: &ldquo;{done.athlete} &mdash; Surrey&rdquo;.
                    </p>
                  </div>
                  <p className="text-white/40 text-xs mt-4">We sent the details to {done.email}.</p>
                  <Link href="/" className="inline-block mt-5 text-white/60 hover:text-white text-xs uppercase tracking-widest underline underline-offset-4">Back to home</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-2">
                    <h2 className="text-2xl font-semibold" style={{ ...SANS, letterSpacing: "-0.02em" }}>Register your athlete</h2>
                    <p className="text-white/50 text-sm mt-1">Limited spots. Takes about a minute.</p>
                  </div>

                  <div>
                    <label className={LABEL}>Athlete name</label>
                    <input required type="text" placeholder="Jordan Smith" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} className="lg-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Grade</label>
                      <select required value={grade} onChange={(e) => setGrade(e.target.value)} className="lg-input">
                        <option value="">Select</option>
                        {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>School</label>
                      <input required type="text" placeholder="Your school" value={school} onChange={(e) => setSchool(e.target.value)} className="lg-input" />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Parent name</label>
                    <input required type="text" placeholder="Michael Smith" value={parentName} onChange={(e) => setParentName(e.target.value)} className="lg-input" />
                  </div>
                  <div>
                    <label className={LABEL}>Parent email</label>
                    <input required type="email" placeholder="parent@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="lg-input" />
                  </div>
                  <div>
                    <label className={LABEL}>Parent phone</label>
                    <input required type="tel" placeholder="604-000-0000" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="lg-input" />
                  </div>

                  <div>
                    <label className={LABEL}>Plan</label>
                    <div className="lg-glass-soft rounded-full p-1 grid grid-cols-2 gap-1">
                      {([
                        { id: "all", title: "All 3 · $150" },
                        { id: "dropin", title: "Drop-in · $65" },
                      ] as const).map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setPlan(o.id)}
                          className={`rounded-full py-2.5 text-sm font-medium transition-all ${
                            plan === o.id ? "bg-white text-black shadow-lg" : "text-white/70 hover:text-white"
                          }`}
                        >
                          {o.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {plan === "dropin" && (
                    <div>
                      <label className={LABEL}>Which nights?</label>
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
                              className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 text-left border transition-all disabled:opacity-30 ${
                                on ? "bg-white/90 text-black border-white" : "lg-glass-soft text-white hover:bg-white/10"
                              }`}
                            >
                              <span className="font-medium">{s.day}, {s.date} <span className={`text-xs ml-2 ${on ? "text-black/50" : "text-white/50"}`}>8:00 &ndash; 9:30 PM</span></span>
                              <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${on ? "bg-black border-black" : "border-white/30"}`}>
                                {on && <Check className="w-3 h-3 text-white" />}
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
                    <div className="bg-red-500/15 border border-red-400/30 text-red-200 text-sm font-medium p-3.5 rounded-2xl text-center">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full bg-white text-black font-semibold py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-white/90 active:scale-[0.99] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.18)]"
                  >
                    {loading ? "Registering..." : `Register${price ? ` · $${price}` : ""}`}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <p className="text-center text-[11px] text-white/40 leading-relaxed">
                    You&rsquo;ll receive an e-transfer invoice by email. Please send payment within 48 hours to hold your spot.
                    All sales are final, and no-shows without 24 hours&rsquo; notice are still charged.{" "}
                    <Link href="/policies" className="underline hover:text-white/70">Cancellation policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Sticky register bar (phones) ──────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}
      >
        <a
          href="#register"
          tabIndex={showBar ? 0 : -1}
          onClick={() => trackEvent("button_click", "/surrey", "surrey_cta_sticky")}
          className="lg-glass flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full active:scale-95 transition-transform"
        >
          <span className="relative flex items-center gap-2">
            Register <span className="text-white/60 font-medium">from $65</span> <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </div>
    </div>
  );
}
