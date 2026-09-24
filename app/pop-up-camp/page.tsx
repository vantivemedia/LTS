"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Clock, Users, Gift } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const RUN_OF_SHOW = [
  {
    time: "10:30 – 10:55",
    title: "Mental Performance + Goal Setting",
    desc: "Set goals, standards, confidence, habits, and what they want to accomplish during Phase 2.",
  },
  {
    time: "10:55 – 11:40",
    title: "Skill Repetition",
    desc: "High-volume individual development. Ball handling, finishing, footwork, shooting. Keep everyone moving and getting reps.",
  },
  {
    time: "11:40 – 12:10",
    title: "On-Court Conditioning",
    desc: "Basketball-specific conditioning with the ball where possible: repeated sprints, change of direction, transition work, finishing under fatigue.",
  },
  {
    time: "12:10 – 12:20",
    title: "Water / Reset",
    desc: "",
  },
  {
    time: "12:20 – 1:20",
    title: "Mock LTS Academy Practice",
    desc: "The centerpiece of the day — teach, rep, add decisions, live application. This is what Academy is like.",
  },
  {
    time: "1:20 – 1:30",
    title: "Close + Phase 2",
    desc: "Recap the day, announce the Phase 2 raffle, and preview what's coming next.",
  },
];

export default function PopUpCampPage() {
  const [athleteName, setAthleteName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pop-up-camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteName, age, grade, school, parentName, parentPhone, parentEmail, referredBy }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Registration failed");
      }
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
          <h2 className="text-4xl font-black mb-4 uppercase">You're Registered</h2>
          <p className="text-white/40 mb-4 leading-relaxed">
            Check your email for payment instructions. Your athlete is also entered into the Phase 2 raffle —
            get friends to name you as their referral for extra entries.
          </p>
          <p className="text-white/30 text-sm mb-10">
            Wednesday, September 30 · 10:30 AM – 1:30 PM · The Hoop
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/fall-programming" className="bg-white text-black font-bold px-8 py-4 rounded-2xl">
              EXPLORE FALL ACADEMY
            </Link>
            <Link href="/" className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl">
              HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-5">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:items-start">
        {/* ── Left: Info ─────────────────────────────────────── */}
        <div className="lg:sticky lg:top-32">
          <div className="mb-14 relative -mx-5 px-5 -mt-32 pt-40 pb-8 rounded-b-3xl overflow-hidden lg:mx-0 lg:px-0 lg:mt-0 lg:pt-0 lg:pb-0 lg:rounded-none lg:overflow-visible">
            <div className="absolute inset-0 lg:hidden">
              <Image
                src="/images/pop-up-camp-hero.jpg"
                alt="High school athletes at LTS Elite Prep training"
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

              <span className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase border border-white/10 text-white/50 rounded-full px-3.5 py-1.5 mb-5">
                $65 · Sept 30 · HS Athletes
              </span>

              <h1
                className="text-6xl sm:text-7xl mb-4 uppercase tracking-tighter leading-none"
                style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
              >
                Pop Up
                <br />
                <span className="text-white/20">Camp</span>
              </h1>

              <p className="text-white/40 text-lg leading-relaxed max-w-xl mb-8">
                A preview of what LTS Academy training looks like — mental performance, high-volume skill work,
                on-court conditioning, and a mock Academy practice, capped off with the Phase 2 raffle reveal.
              </p>

              <a
                href="#register"
                onClick={() => trackEvent("button_click", "/pop-up-camp", "camp_reserve_spot")}
                className="inline-flex items-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Reserve Your Spot
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-14">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Wednesday, September 30, 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">10:30 AM – 1:30 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">The Hoop</p>
                <p className="text-white/30 text-xs">11111 Twigg Pl #1061, Richmond, BC</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">High School Athletes</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-widest font-bold mb-2 text-white/30">Cost</p>
            <p className="text-3xl font-black mb-1">$65</p>
            <p className="text-xs text-white/40 leading-relaxed">Per athlete. Spots are limited — reserve yours below.</p>
          </div>

          <div className="bg-white text-black rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4" />
              <p className="text-xs uppercase tracking-widest font-black">Phase 2 Raffle</p>
            </div>
            <p className="text-sm leading-relaxed">
              Every registered athlete is automatically entered to win <strong>Full Phase 2 Access ($500 value)</strong>.
              Refer a friend to sign up and mention your name — every additional referral is another raffle entry.
              No limit on how many you can earn.
            </p>
          </div>
        </div>

        {/* ── Right: Photo (desktop only) ── */}
        <div className="hidden lg:block relative rounded-3xl overflow-hidden lg:h-[calc(100vh-11rem)]">
          <Image
            src="/images/pop-up-camp-hero.jpg"
            alt="High school athletes at LTS Elite Prep training"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none hidden lg:block" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── Run of Show ── */}
      <div className="max-w-4xl mx-auto mb-14">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Run of Show</p>
        <div className="divide-y divide-white/5 bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          {RUN_OF_SHOW.map((block) => (
            <div key={block.time} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-xs font-black uppercase tracking-wide">{block.time}</span>
              </div>
              <p className="text-white font-bold text-base leading-snug">{block.title}</p>
              {block.desc && <p className="text-white/30 text-xs mt-1 leading-relaxed">{block.desc}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Registration Form ── */}
      <div id="register" className="max-w-4xl mx-auto mt-20 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">$65 · Limited Spots</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">Reserve Your Spot</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Fill out the form below to register. We'll send a confirmation to the parent email you provide.
          </p>
        </div>

        <div className="bg-[#111] p-6 sm:p-10 rounded-3xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Athlete Information</p>

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Athlete Full Name</label>
              <input
                required
                type="text"
                placeholder="JORDAN SMITH"
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Age</label>
                <input
                  required
                  type="text"
                  placeholder="16"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Grade</label>
                <input
                  required
                  type="text"
                  placeholder="GRADE 11"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">High School</label>
              <input
                required
                type="text"
                placeholder="RICHMOND SECONDARY"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest pt-2">Parent / Guardian Information</p>

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Name</label>
              <input
                required
                type="text"
                placeholder="MICHAEL SMITH"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="604-000-0000"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Parent Email</label>
                <input
                  required
                  type="email"
                  placeholder="PARENT@EXAMPLE.COM"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-3.5 h-3.5 text-white/40" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Phase 2 Raffle Entry</p>
              </div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">
                Referred By (Optional)
              </label>
              <input
                type="text"
                placeholder="WHO TOLD YOU ABOUT THIS CAMP?"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
              />
              <p className="text-[10px] text-white/25 mt-2 leading-relaxed">
                Enter the name of whoever referred you — they'll get an extra entry into the Phase 2 raffle
                ($500 value) for every friend they bring.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!athleteName || !age || !grade || !school || !parentName || !parentPhone || !parentEmail || loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
            >
              {loading ? "REGISTERING..." : "RESERVE MY SPOT — $65"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-center text-xs text-white/20 pt-1">
              You'll receive an e-transfer invoice by email. Your spot is confirmed once payment is received.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
