"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type PackageType = "weekend-1" | "weekend-2" | "both";

const BLUE = "#073c8d";
const BG = "#e8e5e4";

const SESSIONS = [
  {
    id: "jul11",
    date: "July 11 (Sat)",
    time: "2:00–5:00 PM",
    type: "BUILD" as const,
    weekend: 1,
    desc: "Building the mechanics",
  },
  {
    id: "jul12",
    date: "July 12 (Sun)",
    time: "4:00–7:00 PM",
    type: "PERFORM" as const,
    weekend: 1,
    desc: "Using the mechanics in game",
  },
  {
    id: "jul18",
    date: "July 18 (Sat)",
    time: "2:00–5:00 PM",
    type: "BUILD" as const,
    weekend: 2,
    desc: "Building the mechanics",
  },
  {
    id: "jul19",
    date: "July 19 (Sun)",
    time: "2:00–5:00 PM",
    type: "PERFORM" as const,
    weekend: 2,
    desc: "Using the mechanics in game",
  },
];

const PACKAGES: { id: PackageType; name: string; price: string; originalPrice?: string; desc: string; sessions: string; soldOut?: boolean }[] = [
  {
    id: "weekend-1",
    name: "Weekend 1",
    price: "$249.99",
    desc: "Jul 11 (BUILD) + Jul 12 (PERFORM)",
    sessions: "2 sessions",
    soldOut: true,
  },
  {
    id: "weekend-2",
    name: "Weekend 2",
    price: "$249.99",
    originalPrice: "$350",
    desc: "Jul 18 (BUILD) + Jul 19 (PERFORM)",
    sessions: "2 sessions",
  },
  {
    id: "both",
    name: "Both Weekends",
    price: "$399.99",
    desc: "All 4 sessions — Jul 11, 12, 18 & 19",
    sessions: "4 sessions",
    soldOut: true,
  },
];

// Blueprint grid background as inline SVG data URL
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='rgba(7,60,141,0.10)' stroke-width='1'/%3E%3C/svg%3E")`;
const GRID_BG_LARGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cpath d='M 400 0 L 0 0 0 400' fill='none' stroke='rgba(7,60,141,0.16)' stroke-width='1'/%3E%3C/svg%3E")`;

const REGISTRATION_DEADLINE = new Date(2026, 6, 16, 19, 0, 0).getTime(); // Thu Jul 16, 2026, 7:00 PM

const CAMP_HIGHLIGHTS = [
  "Improved skill and confidence",
  "Better basketball IQ and decision-making",
  "Increased competitiveness and game readiness",
  "A clear blueprint for continued development",
];

function CampDescription() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{ color: `${BLUE}99` }}>
        <strong className="font-black" style={{ color: BLUE }}>The Blueprint Series</strong> is designed for players who want to take their game to the next level
        through intentional skill development and high-level competition. Each session combines elite
        instruction, game-based learning, and competitive environments that challenge players to think,
        adapt, and perform.
      </p>

      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: BLUE }}>
          Week 1: BUILD
        </p>
        <p className="text-sm leading-relaxed" style={{ color: `${BLUE}99` }}>
          Establish the foundation of your game by developing footwork, ball handling, finishing,
          shooting mechanics, and decision-making habits.
        </p>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: BLUE }}>
          Week 2: PERFORM
        </p>
        <p className="text-sm leading-relaxed" style={{ color: `${BLUE}99` }}>
          Apply your skills in live situations through small-sided games, competitive drills, and
          game-like scenarios that translate directly to performance on the court.
        </p>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: BLUE }}>
          Players will leave camp with
        </p>
        <ul className="space-y-1.5">
          {CAMP_HIGHLIGHTS.map((h) => (
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

function formatCountdown(ms: number) {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function CampPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [pkg, setPkg] = useState<PackageType>("weekend-2");

  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, REGISTRATION_DEADLINE - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, REGISTRATION_DEADLINE - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedPkg = PACKAGES.find((p) => p.id === pkg)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName,
          parentName,
          parentEmail,
          campId: "blueprint-2026-july",
          campName: "Blueprint Series",
          campPrice: selectedPkg.price,
          packageType: pkg,
          dropinSession: null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Registration failed");
      }
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
            We've received your registration for the Blueprint Series. Check the parent's email for payment instructions.
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
            {/* ball seam lines */}
            <path d="M 210 10 Q 310 110 310 210 Q 310 310 210 410" stroke={BLUE} strokeWidth="1.5" fill="none" />
            <path d="M 210 10 Q 110 110 110 210 Q 110 310 210 410" stroke={BLUE} strokeWidth="1.5" fill="none" />
            <line x1="10" y1="210" x2="410" y2="210" stroke={BLUE} strokeWidth="1" />
            {/* measurement ticks */}
            <line x1="200" y1="10" x2="220" y2="10" stroke={BLUE} strokeWidth="1" />
            <line x1="200" y1="410" x2="220" y2="410" stroke={BLUE} strokeWidth="1" />
            <line x1="10" y1="200" x2="10" y2="220" stroke={BLUE} strokeWidth="1" />
            <line x1="410" y1="200" x2="410" y2="220" stroke={BLUE} strokeWidth="1" />
            {/* crosshair center */}
            <line x1="205" y1="210" x2="215" y2="210" stroke={BLUE} strokeWidth="2" />
            <line x1="210" y1="205" x2="210" y2="215" stroke={BLUE} strokeWidth="2" />
          </svg>

          {/* Corner annotation lines */}
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
              July 2026 · High School
            </p>
            <h1
              className="text-6xl sm:text-7xl mb-3 uppercase tracking-tighter leading-none"
              style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif', color: BLUE }}
            >
              Blueprint
              <br />
              Series
            </h1>
            <p className="text-sm mb-2 max-w-sm" style={{ color: `${BLUE}99` }}>
              4 sessions across 2 weekends.
            </p>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider mb-5" style={{ color: `${BLUE}80` }}>
              <span>BUILD — the mechanics</span>
              <span style={{ color: `${BLUE}30` }}>·</span>
              <span>PERFORM — in game</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
                style={{ background: `${BLUE}0d`, borderColor: `${BLUE}26` }}
              >
                <span className="text-sm">📍</span>
                <p className="text-xs font-bold" style={{ color: BLUE }}>The Hoop · 11111 Twigg Pl #1061, Richmond, BC</p>
              </div>
            </div>

            <div className="hidden lg:block mt-8">
              <CampDescription />
            </div>
          </div>
        </div>

        {/* ── Right: Schedule + Registration ──────────────── */}
        <div className="max-w-xl mt-16 lg:mt-0">

        {/* Schedule */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8 border" style={{ borderColor: `${BLUE}1a` }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: `${BLUE}1a` }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${BLUE}80` }}>Schedule</p>
          </div>
          {SESSIONS.map((s, i) => (
            <div
              key={s.id}
              className="px-5 py-4 flex items-center justify-between"
              style={i < SESSIONS.length - 1 ? { borderBottom: `1px solid ${BLUE}1a` } : undefined}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 text-[9px] font-black px-2 py-0.5 rounded shrink-0 w-[62px] text-center"
                  style={
                    s.type === "BUILD"
                      ? { background: BLUE, color: BG }
                      : { background: `${BLUE}1a`, color: `${BLUE}b3` }
                  }
                >
                  {s.type}
                </span>
                <div>
                  <p className="text-sm font-bold tabular-nums" style={{ color: BLUE }}>{s.date}</p>
                  <p className="text-xs" style={{ color: `${BLUE}80` }}>{s.desc}</p>
                </div>
              </div>
              <span className="text-xs font-bold shrink-0 ml-4 tabular-nums" style={{ color: `${BLUE}80` }}>{s.time}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: `${BLUE}80` }}>
              Choose Your Package
            </p>

            {PACKAGES.map((p) => (
              <div key={p.id}>
              {p.id === "weekend-2" && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                    style={{ background: "rgba(220,38,38,0.5)", borderColor: "rgba(220,38,38,0.5)" }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                      Register before
                    </p>
                    <p className="text-xs font-black tabular-nums text-white/80">
                      {formatCountdown(timeLeft)}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1" style={{ borderColor: `${BLUE}26` }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: BLUE }}>
                      4 spots remaining
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                disabled={p.soldOut}
                onClick={() => !p.soldOut && setPkg(p.id)}
                className="w-full text-left p-5 rounded-2xl border transition-all disabled:cursor-not-allowed"
                style={
                  p.soldOut
                    ? { background: `${BLUE}08`, color: `${BLUE}66`, borderColor: `${BLUE}1a` }
                    : pkg === p.id
                    ? { background: BLUE, color: BG, borderColor: BLUE }
                    : { background: "#ffffff", color: BLUE, borderColor: `${BLUE}1a` }
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black uppercase">{p.name}</h3>
                      {!p.soldOut && pkg === p.id && <Check className="w-4 h-4" />}
                      {p.soldOut && (
                        <span
                          className="text-[9px] font-black px-2 py-0.5 rounded"
                          style={{ background: `${BLUE}1a`, color: `${BLUE}99` }}
                        >
                          SOLD OUT
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: p.soldOut ? `${BLUE}66` : pkg === p.id ? `${BG}bf` : `${BLUE}99` }}>
                      {p.desc}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {!p.soldOut && p.originalPrice && (
                      <p
                        className="text-lg font-bold line-through"
                        style={{ color: pkg === p.id ? `${BG}80` : `${BLUE}66` }}
                      >
                        {p.originalPrice}
                      </p>
                    )}
                    <p className={`text-2xl font-black ${p.soldOut ? "line-through" : ""}`}>{p.price}</p>
                    <p className="text-[10px]" style={{ color: p.soldOut ? `${BLUE}66` : pkg === p.id ? `${BG}99` : `${BLUE}80` }}>
                      {p.sessions}
                    </p>
                  </div>
                </div>
              </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full font-black py-5 rounded-2xl flex items-center justify-center gap-2 mt-4 disabled:opacity-30"
              style={{ background: BLUE, color: BG }}
            >
              CONTINUE — {selectedPkg.price}
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs pt-1" style={{ color: `${BLUE}66` }}>
              Payment via e-transfer after registration. High school athletes only. Spots are limited — the other two packages already sold out.
            </p>

            <div className="lg:hidden pt-6">
              <CampDescription />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-[10px] font-black uppercase mb-8 transition-all"
              style={{ color: `${BLUE}99` }}
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            {/* Package summary */}
            <div className="bg-white border rounded-2xl p-5 mb-4 flex items-center justify-between" style={{ borderColor: `${BLUE}1a` }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${BLUE}80` }}>
                  Selected Package
                </p>
                <p className="font-black text-lg uppercase" style={{ color: BLUE }}>{selectedPkg.name}</p>
                <p className="text-xs" style={{ color: `${BLUE}99` }}>{selectedPkg.desc}</p>
              </div>
              <p className="text-3xl font-black" style={{ color: BLUE }}>{selectedPkg.price}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{ background: "rgba(220,38,38,0.5)", borderColor: "rgba(220,38,38,0.5)" }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                  Register before
                </p>
                <p className="text-xs font-black tabular-nums text-white/80">
                  {formatCountdown(timeLeft)}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1" style={{ borderColor: `${BLUE}26` }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: BLUE }}>
                  4 spots remaining
                </p>
              </div>
            </div>

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
                {loading ? "SENDING..." : `REGISTER — ${selectedPkg.price}`}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-xs pt-1" style={{ color: `${BLUE}66` }}>
                Payment instructions sent to parent's email. Your spot is held for 48 hours.
              </p>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
