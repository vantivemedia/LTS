"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SKILLS = [
  "Ball Handling",
  "Shooting",
  "Finishing",
  "Footwork",
  "Decision Making",
  "Game Application",
];

const OPTIONS = [
  { id: "60", length: "60 Minutes", price: "$85", desc: "Focused one-hour private session." },
  { id: "90", length: "90 Minutes", price: "$105", desc: "Extended session for deeper work and more reps.", featured: true },
];

const INPUT_CLASS =
  "w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors";
const LABEL_CLASS = "text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block";

export default function ProPage() {
  const [hasPass, setHasPass] = useState(false);
  const [athleteName, setAthleteName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionLength, setSessionLength] = useState("60");
  const [availability, setAvailability] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pro-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasPass, athleteName, school, grade, parentName, email, phone, sessionLength, availability, details }),
      });
      if (!res.ok) {
        const d = await res.json();
        if (d.code === "NO_PASS_FOUND") {
          // No active PRO pass for that email — drop them into the full request form (email stays filled in).
          setHasPass(false);
          setError(d.error);
          setLoading(false);
          return;
        }
        throw new Error(d.error || "Request failed");
      }
      trackEvent("button_click", "/pro", "pro_request_submitted");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email us directly at info@ltseliteprep.ca");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase">Request Received</h2>
          <p className="text-white/40 mb-4 leading-relaxed">
            Thanks! Coach Paolo will reach out shortly to confirm a session time that works for you. A copy of your request is on its way to your email.
          </p>
          <p className="text-white/30 text-sm mb-10">
            Payment is by e-transfer once your time is confirmed.
          </p>
          <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-4 rounded-2xl">
            HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:items-start">

        {/* ── Left: Info ─────────────────────────────────────── */}
        <div className="lg:sticky lg:top-32">

          {/* Header */}
          <div className="mb-14 relative -mx-5 px-5 -mt-32 pt-40 pb-8 rounded-b-3xl overflow-hidden lg:mx-0 lg:px-0 lg:mt-0 lg:pt-0 lg:pb-0 lg:rounded-none lg:overflow-visible">
            {/* mobile-only background photo, hidden on desktop where the photo has its own column */}
            <div className="absolute inset-0 lg:hidden">
              <Image
                src="/images/pro-training-1on1.jpg"
                alt="1-on-1 private basketball training at LTS PRO"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/85 to-black" />
            </div>

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
                <ArrowLeft className="w-3 h-3" /> Back
              </Link>

              <h1
                className="text-[4.125rem] sm:text-[4.95rem] mb-4 uppercase tracking-tighter leading-none"
                style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
              >
                LTS <span className="text-white">PRO</span>
              </h1>
              <p className="text-white/40 text-lg leading-relaxed max-w-xl mb-2">
                Our premium <strong className="text-white font-bold">private training</strong> experience — individualized development in a focused environment.
              </p>
              <p className="flex items-center gap-1.5 text-white/40 text-sm mb-8">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                The Hoop — 11111 Twigg Pl #1061, Richmond, BC
              </p>

              <a
                href="#request"
                onClick={() => trackEvent("button_click", "/pro", "pro_request_scroll")}
                className="inline-flex items-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Request a Session
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-3 mt-6 text-xs font-bold uppercase tracking-wider text-white/30">
                <span>200+ Athletes Trained</span>
                <span className="text-white/10">·</span>
                <span>5+ Years Running</span>
              </div>
            </div>
          </div>

          {/* Training Format */}
          <div className="mb-14">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Training Format</p>
            <div className="mb-6">
              <div className="bg-[#111] border border-white/5 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black mb-1">1 : 2</p>
                <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Coach : Athlete</p>
              </div>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Each session is customized to the athlete&rsquo;s position, skill level, and goals with an emphasis on:
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span key={s} className="bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="mb-14">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Scheduling</p>
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <p className="font-black text-white uppercase tracking-wide mb-1">By Request</p>
              <p className="text-white/40 text-sm leading-relaxed">
                LTS PRO has no fixed dates. Send us your availability and Coach Paolo will confirm a time that works for you.
              </p>
              <p className="text-white/60 text-sm leading-relaxed mt-3">
                <span className="font-black text-white">Tuesdays:</span> private and semi-private sessions are available on Tuesdays by request.
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {OPTIONS.map((o) => (
                <div
                  key={o.id}
                  className={`rounded-2xl p-6 ${o.featured ? "bg-white text-black" : "bg-[#111] border border-white/5"}`}
                >
                  <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${o.featured ? "text-black/50" : "text-white/30"}`}>
                    {o.length}
                  </p>
                  <p className="text-3xl font-black mb-2">{o.price}</p>
                  <p className={`text-xs leading-relaxed ${o.featured ? "text-black/60" : "text-white/40"}`}>{o.desc}</p>
                </div>
              ))}
            </div>
            <a
              href="#request"
              onClick={() => trackEvent("button_click", "/pro", "pro_request_scroll")}
              className="inline-flex items-center justify-center gap-2 w-full bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
            >
              Request a Session
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ── Right: Photo (desktop only — mobile uses it as the header background instead) ── */}
        <div className="hidden lg:block relative rounded-3xl lg:rounded-l-none overflow-hidden lg:aspect-auto lg:h-[calc(100vh-11rem)]">
          <Image
            src="/images/pro-training-1on1.jpg"
            alt="1-on-1 private basketball training at LTS PRO"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {/* fade into the page background on the edges so it doesn't read as a boxed-in photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none hidden lg:block" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── Request Form ── */}
      <div id="request" className="max-w-4xl mx-auto mt-20 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">By Request</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">Request a Session</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Already have a PRO pass? Choose &ldquo;I Have a PRO Pass&rdquo; and just enter your email. Tell us what works for you and Coach Paolo will confirm a time.
          </p>
        </div>

        <div className="bg-[#111] p-6 sm:p-10 rounded-3xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, title: "I Have a PRO Pass", sub: "Just need your email" },
                { value: false, title: "New Request", sub: "$85 / 60 min · $105 / 90 min" },
              ].map((o) => (
                <button
                  key={o.title}
                  type="button"
                  onClick={() => { setHasPass(o.value); setError(""); }}
                  className={`rounded-2xl px-5 py-4 text-left border transition-all ${
                    hasPass === o.value ? "bg-white text-black border-white" : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="block font-black uppercase text-sm">{o.title}</span>
                  <span className={`block text-xs font-bold ${hasPass === o.value ? "text-black/50" : "text-white/40"}`}>{o.sub}</span>
                </button>
              ))}
            </div>

            {hasPass ? (
              <div>
                <label className={LABEL_CLASS}>Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="PARENT@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
                <p className="text-[10px] text-white/25 mt-2 leading-relaxed">
                  Use the email you bought your pass with. Your session is taken from your pass once Coach Paolo confirms a time.
                </p>
              </div>
            ) : (
              <>
            <div>
              <label className={LABEL_CLASS}>Athlete Name</label>
              <input
                required
                type="text"
                placeholder="JORDAN SMITH"
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>School</label>
                <input
                  required
                  type="text"
                  placeholder="RICHMOND SECONDARY"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Grade</label>
                <input
                  required
                  type="text"
                  placeholder="GRADE 10"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Parent Name</label>
              <input
                required
                type="text"
                placeholder="MICHAEL SMITH"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="PARENT@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Parent Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="604-000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

              </>
            )}

            <div>
              <label className={LABEL_CLASS}>Session Length</label>
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSessionLength(o.id)}
                    className={`rounded-2xl px-5 py-4 text-left border transition-all ${
                      sessionLength === o.id
                        ? "bg-white text-black border-white"
                        : "bg-[#0a0a0a] text-white border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="block font-black uppercase text-sm">{o.length}</span>
                    <span className={`block text-xs font-bold ${sessionLength === o.id ? "text-black/50" : "text-white/40"}`}>
                      {o.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Preferred Days &amp; Times</label>
              <textarea
                required
                rows={3}
                placeholder="E.G. WEEKDAYS AFTER 5 PM, SATURDAY MORNINGS"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Anything Else We Should Know (Optional)</label>
              <textarea
                rows={2}
                placeholder="POSITION, GOALS, SKILLS TO WORK ON"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={(hasPass ? !email : !athleteName || !parentName || !email || !phone || !school || !grade) || !availability || loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
            >
              {loading ? "SENDING..." : "REQUEST A SESSION"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-center text-xs text-white/20 pt-1">
              {hasPass
                ? "We’ll email you to confirm a time. Your session comes off your pass once it’s confirmed."
                : "We’ll email you to confirm a time. Payment is by e-transfer once your session is confirmed."}
            </p>
            <p className="text-center text-xs text-white/20">
              No-shows without 24 hours&rsquo; notice are still charged a session. See our{" "}
              <Link href="/policies" className="underline hover:text-white/40">cancellation policy</Link>.
            </p>
          </form>
        </div>

        {/* Coach credibility + testimonial */}
        <div className="mt-8 bg-[#111] border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex gap-0.5 mb-3 text-white">{"★★★★★"}</div>
          <p className="text-white/60 text-sm italic leading-relaxed mb-4">
            &ldquo;I met Coach Paolo through the basketball community. His training helped me improve in all aspects of the game. Coach Paolo showed care for every little detail and made sure to keep me right during my off season before college basketball.&rdquo;
          </p>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
            Justin Pamintuan — Byrne Creek / Capilano University
          </p>
          <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/5">
            LTS PRO sessions are led by <span className="text-white/60 font-bold">Paolo Labrador</span> — Douglas College Royals Asst. Coach · Magee Secondary Head Coach.
          </p>
        </div>

      </div>
    </div>
  );
}
