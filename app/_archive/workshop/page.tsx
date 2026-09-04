"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const BLUE = "#073c8d";
const BG = "#e8e5e4";

const WORKSHOP_HIGHLIGHTS = [
  "Improved skill and confidence",
  "Better basketball IQ and decision-making",
  "Competitive, game-ready reps",
  "A clear blueprint for continued development",
];

const TRAINERS = [
  {
    name: "Kaden Hruska",
    title: "SFU MBB Assistant Coach",
    focus: "Skill Development for the Modern Game",
    desc: "Scoring off advantages and advantage creation — reading and attacking the way the modern college game demands.",
    points: ["Ball Screen Reads & Techniques", "Off-Ball Advantage Creation", "College-Level Foundations"],
  },
  {
    name: "Devin Thandi",
    title: "UBC MPT Student",
    focus: "Kinesiology & Movement Focus",
    desc: "Building explosive, resilient basketball players by prioritizing movement quality over raw weight.",
    points: [
      "Injury Resilience & Landing Mechanics",
      "Leg Power & Speed",
      "Core Stability & Contact Balance",
      "Basketball-Specific Conditioning",
    ],
  },
];

// Blueprint grid background as inline SVG data URL
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='rgba(7,60,141,0.10)' stroke-width='1'/%3E%3C/svg%3E")`;
const GRID_BG_LARGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cpath d='M 400 0 L 0 0 0 400' fill='none' stroke='rgba(7,60,141,0.16)' stroke-width='1'/%3E%3C/svg%3E")`;

function WorkshopDescription() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: `${BLUE}99` }}>
        <strong className="font-black" style={{ color: BLUE }}>The Blueprint Workshop</strong> is a one-day intensive for players who want to take their
        game to the next level through intentional skill development and high-level competition —
        run by <strong className="font-black" style={{ color: BLUE }}>LTS ELITE PREP</strong>, featuring{" "}
        <strong className="font-black" style={{ color: BLUE }}>Kaden Hruska</strong> and{" "}
        <strong className="font-black" style={{ color: BLUE }}>Devin Thandi</strong>.
      </p>

      <div className="space-y-4">
        {TRAINERS.map((t) => (
          <div key={t.name} className="rounded-2xl border p-5" style={{ borderColor: `${BLUE}1a`, background: `${BLUE}08` }}>
            <h3 className="font-black uppercase text-sm mb-1" style={{ color: BLUE }}>{t.name}</h3>
            <p className="text-xs font-bold mb-2" style={{ color: `${BLUE}99` }}>{t.title} · {t.focus}</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: `${BLUE}99` }}>{t.desc}</p>
            <ul className="space-y-1">
              {t.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs" style={{ color: `${BLUE}99` }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: BLUE }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: BLUE }}>
          Athletes will leave with
        </p>
        <ul className="space-y-1.5">
          {WORKSHOP_HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm" style={{ color: `${BLUE}99` }}>
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BLUE }} />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function WorkshopPage() {
  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteName, parentName, parentEmail }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Registration failed");
      }
      trackEvent("button_click", "/workshop", "workshop_registration");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed. Please contact info@ltseliteprep.ca");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: BG }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: BLUE }}>
            <Check className="w-10 h-10" style={{ color: BG }} />
          </div>
          <h2
            className="text-4xl mb-4 uppercase"
            style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif', color: BLUE }}
          >
            Registration Sent
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: `${BLUE}99` }}>
            We've received your registration for the Blueprint Workshop. Check the parent's email for payment instructions.
          </p>
          <Link href="/" className="font-bold px-10 py-4 rounded-2xl" style={{ background: BLUE, color: BG }}>
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: BG,
        backgroundImage: `${GRID_BG_LARGE}, ${GRID_BG}`,
        backgroundSize: "400px 400px, 80px 80px",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 pt-32 pb-24 lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:items-start">

        {/* ── Left: Hero ───────────────────────────────────── */}
        <div className="relative lg:sticky lg:top-32">
          {/* Decorative basketball sketch */}
          <svg
            className="absolute right-[-60px] top-12 opacity-[0.12] pointer-events-none"
            width="420"
            height="420"
            viewBox="0 0 420 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="210" cy="210" r="200" stroke={BLUE} strokeWidth="2" />
            <circle cx="210" cy="210" r="140" stroke={BLUE} strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="210" cy="210" r="70" stroke={BLUE} strokeWidth="1" />
            <path d="M 210 10 Q 310 110 310 210 Q 310 310 210 410" stroke={BLUE} strokeWidth="1.5" fill="none" />
            <path d="M 210 10 Q 110 110 110 210 Q 110 310 210 410" stroke={BLUE} strokeWidth="1.5" fill="none" />
            <line x1="10" y1="210" x2="410" y2="210" stroke={BLUE} strokeWidth="1" />
            <line x1="200" y1="10" x2="220" y2="10" stroke={BLUE} strokeWidth="1" />
            <line x1="200" y1="410" x2="220" y2="410" stroke={BLUE} strokeWidth="1" />
            <line x1="10" y1="200" x2="10" y2="220" stroke={BLUE} strokeWidth="1" />
            <line x1="410" y1="200" x2="410" y2="220" stroke={BLUE} strokeWidth="1" />
            <line x1="205" y1="210" x2="215" y2="210" stroke={BLUE} strokeWidth="2" />
            <line x1="210" y1="205" x2="210" y2="215" stroke={BLUE} strokeWidth="2" />
          </svg>

          <div className="absolute top-28 left-[-8px] opacity-20 pointer-events-none hidden sm:block">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
              <line x1="0" y1="0" x2="120" y2="0" stroke={BLUE} strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="60" stroke={BLUE} strokeWidth="0.5" />
              <line x1="8" y1="8" x2="30" y2="8" stroke={BLUE} strokeWidth="0.5" />
              <line x1="8" y1="8" x2="8" y2="30" stroke={BLUE} strokeWidth="0.5" />
            </svg>
          </div>

          <div className="relative z-10 max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase mb-10 transition-all"
              style={{ color: `${BLUE}80` }}
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: `${BLUE}80` }}>
              August 27, 2026 · Featuring Kaden Hruska &amp; Devin Thandi
            </p>
            <h1
              className="text-6xl sm:text-7xl mb-3 uppercase tracking-tighter leading-none"
              style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif', color: BLUE }}
            >
              Blueprint
              <br />
              Workshop
            </h1>
            <p className="text-sm mb-5 max-w-sm" style={{ color: `${BLUE}99` }}>
              One day. One session. Built to elevate your game.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
                style={{ background: `${BLUE}0d`, borderColor: `${BLUE}26` }}
              >
                <span className="text-sm">📍</span>
                <p className="text-xs font-bold" style={{ color: BLUE }}>The Hoop · 11111 Twigg Pl #1061, Richmond, BC</p>
              </div>
            </div>

            <a
              href="#register"
              className="lg:hidden inline-flex items-center gap-2 font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl transition-all active:scale-95"
              style={{ background: BLUE, color: BG }}
            >
              Register Now
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="hidden lg:block mt-8">
              <WorkshopDescription />
            </div>
          </div>
        </div>

        {/* ── Right: Details + Registration ─────────────────── */}
        <div className="max-w-xl mt-16 lg:mt-0">

          <div className="lg:hidden mb-8">
            <WorkshopDescription />
          </div>

          <div id="register" className="bg-white rounded-2xl overflow-hidden mb-8 border" style={{ borderColor: `${BLUE}1a`, scrollMarginTop: "8rem" }}>
            <div className="px-5 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${BLUE}1a` }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${BLUE}80` }}>
                  Date &amp; Time
                </p>
                <p className="text-sm font-bold" style={{ color: BLUE }}>Thursday, August 27</p>
                <p className="text-xs" style={{ color: `${BLUE}80` }}>12:00 PM – 3:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${BLUE}80` }}>
                  Price
                </p>
                <p className="text-2xl font-black" style={{ color: BLUE }}>$79.99</p>
                <p className="text-xs" style={{ color: `${BLUE}80` }}>per athlete</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${BLUE}80` }}>
                Location
              </p>
              <p className="text-sm font-bold" style={{ color: BLUE }}>The Hoop — 11111 Twigg Pl #1061, Richmond, BC</p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: "Athlete Full Name", placeholder: "JORDAN SMITH", value: athleteName, set: setAthleteName, type: "text" },
                { label: "Parent Full Name", placeholder: "MICHAEL SMITH", value: parentName, set: setParentName, type: "text" },
                { label: "Parent Email (for invoice)", placeholder: "PARENT@EXAMPLE.COM", value: parentEmail, set: setParentEmail, type: "email" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: `${BLUE}80` }}>
                    {f.label}
                  </label>
                  <input
                    required
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full bg-white border rounded-2xl px-6 py-5 font-bold outline-none transition-colors"
                    style={{ borderColor: `${BLUE}1a`, color: BLUE }}
                  />
                </div>
              ))}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!athleteName || !parentName || !parentEmail || loading}
                className="w-full font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 mt-2"
                style={{ background: BLUE, color: BG }}
              >
                {loading ? "SENDING..." : "REGISTER — $79.99"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs pt-1" style={{ color: `${BLUE}66` }}>
                Payment instructions sent to parent's email. Your spot is held for 48 hours.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Program video ──────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pb-24">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: `${BLUE}80` }}>
            See LTS Elite Prep in Action
          </p>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${BLUE}1a` }}>
            <video
              src="https://5ojyea0xbkq67l1r.public.blob.vercel-storage.com/videos/langston-pro.mp4"
              controls
              preload="none"
              playsInline
              className="w-full aspect-video bg-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
