"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SCHEDULE = {
  September: [
    { date: "Sept 11", time: "6:30 – 8:00 PM" },
    { date: "Sept 12", time: "3:30 – 5:00 PM" },
    { date: "Sept 13", time: "12:00 – 1:30 PM" },
    { date: "Sept 14", time: "5:00 – 6:30 PM" },
    { date: "Sept 16", time: "6:00 – 7:30 PM" },
    { date: "Sept 18", time: "6:30 – 8:00 PM" },
    { date: "Sept 19", time: "4:00 – 5:30 PM" },
    { date: "Sept 20", time: "6:00 – 7:30 PM" },
    { date: "Sept 25", time: "6:30 – 8:00 PM" },
    { date: "Sept 26", time: "4:00 – 5:30 PM" },
    { date: "Sept 27", time: "12:00 – 1:30 PM" },
  ],
  October: [
    { date: "Oct 2", time: "6:30 – 8:00 PM" },
    { date: "Oct 3", time: "4:00 – 5:30 PM" },
  ],
};

const PRICING = [
  {
    name: "Drop-In",
    price: "$55",
    desc: "Attend any available individual session.",
    href: "/book?program=fall-academy",
  },
  {
    name: "5-Session Academy Pass",
    price: "$249",
    desc: "Choose any 5 Phase 1 sessions.",
    href: "/buy-pass?program=fall-academy",
  },
  {
    name: "10-Session Academy Pass",
    price: "$449",
    desc: "Choose any 10 Phase 1 sessions.",
    href: "/buy-pass?program=fall-academy",
  },
  {
    name: "Full Phase 1 Access",
    price: "$499",
    desc: "Access all 13 training opportunities. Attend as many sessions as your schedule allows.",
    href: "/buy-pass?program=fall-academy",
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
  encodeURIComponent("Fall Academy Phase 1 — Reservation") +
  "&body=" +
  encodeURIComponent("Athlete Name: \nGrade: \nPreferred Package: \n");

export default function FallProgrammingPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="mb-14">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>

          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">
            September 11 – October 3
          </p>
          <h1
            className="text-6xl sm:text-7xl mb-4 uppercase tracking-tighter leading-none"
            style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
          >
            Fall Academy
            <br />
            <span className="text-white/20">Phase 1</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed max-w-2xl mb-2">
            13 training opportunities. 19.5 hours of development. A flexible format built around busy school,
            team, and family schedules.
          </p>
          <p className="text-white/30 text-sm max-w-2xl mb-2">
            You do not need to attend every session — choose the package that fits your schedule, and pick the
            dates that work best for you.
          </p>
          <p className="flex items-center gap-1.5 text-white/40 text-sm mb-8">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            The Hoop — 11111 Twigg Pl #1061, Richmond, BC
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/book?program=fall-academy"
              onClick={() => trackEvent("button_click", "/fall-programming", "fall_book_session")}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
            >
              Book a Session
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/buy-pass?program=fall-academy"
              onClick={() => trackEvent("button_click", "/fall-programming", "fall_buy_pass")}
              className="inline-flex items-center justify-center gap-2 bg-[#111] border border-white/10 text-white font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:border-white/30 transition-all active:scale-95"
            >
              Buy a Package
            </Link>
          </div>

          <Link
            href="/pop-up-camp"
            onClick={() => trackEvent("button_click", "/fall-programming", "fall_pop_up_camp_click")}
            className="mt-6 flex items-center justify-between gap-3 bg-white/3 border border-white/8 rounded-2xl px-5 py-4 hover:border-white/20 transition-all group"
          >
            <p className="text-sm text-white/50">
              Not sure Fall Academy is right for you? <span className="text-white font-bold">Try it free at our HS Pop-Up Camp</span> — Sept 7.
            </p>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors shrink-0" />
          </Link>
        </div>

        {/* Schedule */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Phase 1 Schedule</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(SCHEDULE).map(([month, sessions]) => (
              <div key={month}>
                <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">{month}</p>
                <div className="divide-y divide-white/5 bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                  {sessions.map((s) => (
                    <div key={s.date} className="flex items-center justify-between px-4 py-3">
                      <span className="font-bold text-white text-sm">{s.date}</span>
                      <span className="text-white/40 text-xs font-bold">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-14">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Pricing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRICING.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                onClick={() => trackEvent("button_click", "/fall-programming", `fall_pricing_${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`)}
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
            Phase 1 progresses through four areas — skill development, shooting, finishing, footwork,
            decision-making, live play and competitive application. Each session has its own focus, so athletes
            still benefit even if they can&rsquo;t attend every date.
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
            Phase 1 is also the bridge into the next chapter of LTS Academy programming at our new facility.
            Spots will be limited.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/30 text-sm mb-5">
            Spots are limited — book a session or grab a package to lock in your dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book?program=fall-academy"
              onClick={() => trackEvent("button_click", "/fall-programming", "fall_book_session")}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
            >
              Book a Session
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={MAILTO}
              onClick={() => trackEvent("button_click", "/fall-programming", "fall_reserve_email")}
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
