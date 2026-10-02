"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Mail, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SCHEDULE = {
  October: [
    { date: "Oct 6", day: "Tue", time: "4:30 – 6:00 PM", focus: "Handle Under Pressure" },
    { date: "Oct 9", day: "Fri", time: "5:30 – 7:00 PM", focus: "Shooting Lab" },
    { date: "Oct 10", day: "Sat", time: "2:00 – 3:30 PM", focus: "Finishing School" },
    { date: "Oct 11", day: "Sun", time: "6:30 – 8:00 PM", focus: "Complete Player" },
    { date: "Oct 13", day: "Tue", time: "4:30 – 6:00 PM", focus: "Creating Separation" },
    { date: "Oct 16", day: "Fri", time: "5:30 – 7:00 PM", focus: "Shooting Off the Dribble" },
    { date: "Oct 17", day: "Sat", time: "2:00 – 3:30 PM", focus: "Pick & Roll Reads" },
    { date: "Oct 18", day: "Sun", time: "6:30 – 8:00 PM", focus: "Complete Player" },
    { date: "Oct 20", day: "Tue", time: "4:30 – 6:00 PM", focus: "Off Ball Scoring" },
    { date: "Oct 23", day: "Fri", time: "5:30 – 7:00 PM", focus: "On-Ball Defence" },
    { date: "Oct 24", day: "Sat", time: "4:00 – 5:30 PM", focus: "Pick & Roll Reads" },
    { date: "Oct 25", day: "Sun", time: "6:30 – 8:00 PM", focus: "Complete Player" },
    { date: "Oct 27", day: "Tue", time: "4:30 – 6:00 PM", focus: "Scoring Under Pressure" },
    { date: "Oct 30", day: "Fri", time: "5:30 – 7:00 PM", focus: "Offensive Actions" },
  ],
  November: [
    { date: "Nov 3", day: "Tue", time: "4:30 – 6:00 PM", focus: "Complete Player" },
  ],
};

const PRICING = [
  {
    name: "Drop-In",
    price: "$55",
    desc: "Attend any available individual session.",
    href: "/book?program=phase-2",
  },
  {
    name: "5-Session Pass",
    price: "$249.99",
    desc: "Choose any 5 Phase 2 sessions.",
    href: "/buy-pass?program=phase-2",
  },
  {
    name: "10-Session Pass",
    price: "$449.99",
    desc: "Choose any 10 Phase 2 sessions.",
    href: "/buy-pass?program=phase-2",
  },
  {
    name: "Full Access",
    price: "$549.99",
    desc: "Access all 15 training opportunities. Attend as many sessions as your schedule allows.",
    href: "/buy-pass?program=phase-2",
    featured: true,
  },
];

const PHASES = [
  { letter: "B", word: "Build" },
  { letter: "L", word: "Load" },
  { letter: "A", word: "Apply" },
  { letter: "T", word: "Test" },
];

const MAILTO =
  "mailto:info@ltseliteprep.ca?subject=" +
  encodeURIComponent("LTS Academy Phase 2 — Reservation") +
  "&body=" +
  encodeURIComponent("Athlete Name: \nGrade: \nI'd like to reserve a spot for Phase 2.\n");

export default function Phase2Page() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="mb-14">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>

          <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:items-center">
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">
                LTS Academy
              </p>
              <h1
                className="text-6xl sm:text-7xl mb-4 uppercase tracking-tighter leading-none"
                style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
              >
                Phase 2
              </h1>
              <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-4">
                October 6 – November 3, 2026
              </p>
              <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-6">
                Build / Load / Apply / Test
              </p>
              <p className="text-white/40 text-lg leading-relaxed mb-2">
                15 sessions. 90 minutes each. The next chapter of LTS Academy training, building directly on
                everything covered in Phase 1.
              </p>
              <p className="flex items-center gap-1.5 text-white/40 text-sm mb-8">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                The Hoop — 11111 Twigg Pl #1061, Richmond, BC
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/book?program=phase-2"
                  onClick={() => trackEvent("button_click", "/phase-2", "phase2_book_session")}
                  className="inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
                >
                  Book a Session
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/buy-pass?program=phase-2"
                  onClick={() => trackEvent("button_click", "/phase-2", "phase2_buy_pass")}
                  className="inline-flex items-center justify-center gap-2 bg-[#111] border border-white/10 text-white font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:border-white/30 transition-all active:scale-95"
                >
                  Buy a Package
                </Link>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 relative rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-[3/4] border border-white/5">
              <Image
                src="/images/fall-academy-training.jpg"
                alt="LTS Elite Prep athletes in a live 1-on-1 drill at The Hoop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Phase 2 Schedule</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(SCHEDULE).map(([month, sessions]) => (
              <div key={month}>
                <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">{month}</p>
                <div className="divide-y divide-white/5 bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                  {sessions.map((s) => (
                    <div key={s.date} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-xs font-black uppercase tracking-wide">{s.day}, {s.date}</span>
                        <span className="text-white/30 text-xs font-bold">{s.time}</span>
                      </div>
                      <p className="text-white font-bold text-base leading-snug">{s.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs mt-4">
            15 Sessions · 90 Minutes Each · All Times Pacific. Please note: October 24 starts at 4:00 PM.
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Pricing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRICING.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                onClick={() => trackEvent("button_click", "/phase-2", `phase2_pricing_${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`)}
                className={`rounded-2xl p-6 relative transition-all active:scale-95 ${p.featured ? "bg-white text-black hover:bg-white/90" : "bg-[#111] border border-white/5 hover:border-white/20"}`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-4 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    🔥 Best Value
                  </span>
                )}
                <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${p.featured ? "text-black/50" : "text-white/30"}`}>
                  {p.name}
                </p>
                <p className="text-3xl font-black mb-2">{p.price}</p>
                <p className={`text-xs leading-relaxed ${p.featured ? "text-black/60" : "text-white/40"}`}>{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* The Training */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">The Training</p>
          <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-2xl">
            Phase 2 progresses through the same four areas as Phase 1 — skill development, shooting, finishing,
            footwork, decision-making, live play and competitive application — at a more advanced level. Each
            session has its own focus, so athletes still benefit even if they can&rsquo;t attend every date.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PHASES.map((p, i) => (
              <div key={p.letter} className="bg-[#111] border border-white/5 rounded-2xl p-5 text-center relative">
                <span className="text-3xl font-black block mb-1">{p.letter}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">{p.word}</span>
                {i < PHASES.length - 1 && (
                  <span className="hidden sm:block absolute top-1/2 -right-2.5 -translate-y-1/2 text-white/15 text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-14">
          <p className="text-white/40 text-sm leading-relaxed">
            Phase 2 builds directly on everything covered in Phase 1. Spots will be limited.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/30 text-sm mb-5">
            Spots are limited — book a session or grab a package to lock in your dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book?program=phase-2"
              onClick={() => trackEvent("button_click", "/phase-2", "phase2_book_session")}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
            >
              Book a Session
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={MAILTO}
              onClick={() => trackEvent("button_click", "/phase-2", "phase2_reserve_email")}
              className="inline-flex items-center justify-center gap-2 bg-[#111] border border-white/10 text-white font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl hover:border-white/30 transition-all active:scale-95"
            >
              <Mail className="w-4 h-4" />
              Email Coach Paolo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
