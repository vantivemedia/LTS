"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Clock, Users } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SESSIONS = [
  { id: "session-1", label: "12:30 PM – 1:45 PM" },
  { id: "session-2", label: "2:00 PM – 3:15 PM" },
];

export default function PopUpCampPage() {
  const [athleteName, setAthleteName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [session, setSession] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
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
        body: JSON.stringify({ athleteName, age, grade, school, session, parentName, parentPhone, parentEmail }),
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
          <h2 className="text-4xl font-black mb-4 uppercase">You're In!</h2>
          <p className="text-white/40 mb-4 leading-relaxed">
            Check your email for confirmation. No payment needed — just show up ready to play.
          </p>
          <p className="text-white/30 text-sm mb-10">
            Monday, September 7 · {SESSIONS.find((s) => s.id === session)?.label} · The Hoop Vancouver
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
                Free · Labour Day · HS Athletes
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
                Not sure if Fall Academy is right for you? Come experience it for free this Monday, September 7th
                from 12:30–1:45 or 2:00–3:15 at our Phase 1 location, The Hoop Vancouver.
              </p>

              <a
                href="#register"
                onClick={() => trackEvent("button_click", "/pop-up-camp", "camp_reserve_spot")}
                className="inline-flex items-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Reserve Your Free Spot
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-14">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Monday, September 7, 2026</p>
                <p className="text-white/30 text-xs">Labour Day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">12:30 PM – 3:00 PM</p>
                <p className="text-white/30 text-xs">Choose either 12:30–1:45 or 2:00–3:15</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">The Hoop Vancouver</p>
                <p className="text-white/30 text-xs">11111 Twigg Pl #1061, Richmond, BC</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">High School Athletes</p>
                <p className="text-white/30 text-xs">A preview of what Fall Academy training looks like</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest font-bold mb-2 text-white/30">Cost</p>
            <p className="text-3xl font-black mb-1">FREE</p>
            <p className="text-xs text-white/40 leading-relaxed">
              No payment required. Spots are limited — reserve yours below.
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

      {/* ── Registration Form ── */}
      <div id="register" className="max-w-4xl mx-auto mt-20 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Free · Limited Spots</p>
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

            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Session</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SESSIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSession(s.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      session === s.id
                        ? "bg-white text-black border-white"
                        : "bg-[#0a0a0a] text-white border-white/10 hover:border-white/25"
                    }`}
                  >
                    <p className="font-black text-sm uppercase">{s.label}</p>
                  </button>
                ))}
              </div>
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                !athleteName || !age || !grade || !school || !session || !parentName || !parentPhone || !parentEmail || loading
              }
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
            >
              {loading ? "REGISTERING..." : "RESERVE MY FREE SPOT"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-center text-xs text-white/20 pt-1">
              This session is completely free. Spots are limited to HS athletes.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
