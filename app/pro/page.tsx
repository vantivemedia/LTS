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

const WINDOWS = [
  { id: "jul13", range: "July 13–17", time: "12:00 PM – 3:30 PM" },
  { id: "jul29", range: "July 29 – August 14", time: "12:00 PM – 3:30 PM" },
  { id: "aug24", range: "August 24–31", time: "12:00 PM – 3:30 PM" },
];

export default function ProPage() {
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/buy-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentName, email, phone, passType: "pass-5", program: "pro" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Purchase failed");
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
          <h2 className="text-4xl font-black mb-4 uppercase">Pass Registered</h2>
          <p className="text-white/40 mb-4 leading-relaxed">
            Check your email for payment instructions. Once payment is received, your 5-session package is active and you can start booking.
          </p>
          <p className="text-white/30 text-sm mb-10">
            Use <strong className="text-white/50">/book</strong> to schedule your sessions — we'll automatically detect your pass.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/book?program=pro" className="bg-white text-black font-bold px-8 py-4 rounded-2xl">
              BOOK A SESSION
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

              <Link
                href="/book?program=pro"
                onClick={() => trackEvent("button_click", "/pro", "pro_continue")}
                className="inline-flex items-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Book Your Sessions
                <ArrowRight className="w-4 h-4" />
              </Link>

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
              Each session is customized to the athlete's position, skill level, and goals with an emphasis on:
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span key={s} className="bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Available Training Windows */}
          <div className="mb-14">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Available Training Windows</p>
            <div className="divide-y divide-white/5">
              {WINDOWS.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-3">
                  <span className="font-bold text-white">{w.range}</span>
                  <span className="text-white/40 text-sm font-bold">{w.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-2">Per Session</p>
                <p className="text-3xl font-black">$85.00</p>
              </div>
              <div className="bg-white text-black rounded-2xl p-6 pt-8 relative">
                <span className="absolute -top-3 right-4 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  🔥 Best Value
                </span>
                <p className="text-xs text-black/50 uppercase tracking-widest font-bold mb-2">5-Session Package</p>
                <p className="text-3xl font-black">$399.99</p>
                <p className="text-xs text-black/50 font-bold mt-1">Save $25+ vs. individual sessions</p>
              </div>
            </div>
            <p className="text-white/30 text-xs leading-relaxed mb-6">
              All purchased sessions must be completed by August 31, 2026. Limited spots available throughout the summer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book?program=pro"
                onClick={() => trackEvent("button_click", "/pro", "pro_continue")}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl transition-all active:scale-95"
              >
                Book Single Session
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/buy-pass?program=pro"
                onClick={() => trackEvent("button_click", "/pro", "pro_continue")}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                Buy 5-Session Package
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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

      {/* ── Buy Package Form ── */}
      <div className="max-w-4xl mx-auto mt-20 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Best Value</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">Buy the 5-Session Package</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            $399.99 for 5 sessions — save $25+ vs. booking individually. Just need a single session? <Link href="/book?program=pro" className="text-white underline hover:no-underline">Book one instead</Link>.
          </p>
        </div>

        <div className="bg-[#111] p-6 sm:p-10 rounded-3xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                required
                type="text"
                placeholder="JORDAN SMITH"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
              />
            </div>

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
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="PARENT@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="604-000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              disabled={!name || !parentName || !email || loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
            >
              {loading ? "PROCESSING..." : "REGISTER — $399.99"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-center text-xs text-white/20 pt-1">
              You'll receive an e-transfer invoice by email. Your package activates once payment is confirmed.
            </p>
          </form>
        </div>

        {/* Coach credibility + testimonial */}
        <div className="mt-8 bg-[#111] border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex gap-0.5 mb-3 text-white">{"★★★★★"}</div>
          <p className="text-white/60 text-sm italic leading-relaxed mb-4">
            "I met Coach Paolo through the basketball community. His training helped me improve in all aspects of the game. Coach Paolo showed care for every little detail and made sure to keep me right during my off season before college basketball."
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
