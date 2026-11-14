// ============================================================
// トップページ (app/page.tsx) — "Community & Growth" デザイン
//
// 親しみやすく・温かみのある・カジュアルなデザインに刷新
// - 暖色アクセント（オレンジ）
// - より会話的なコピー
// - Instagram フィード埋め込み
// - コーチの顔が見えるセクション
// ============================================================

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Trophy, Calendar, Star } from "lucide-react";
import FallPromoModal from "@/components/FallPromoModal";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HERO = {
  badge: "FALL ACADEMY PHASE 2 · OCT 9 – OCT 30",
  heading: ["TRAIN.", "LEARN.", "COMPETE."],
  subtext:
    "Small groups. High intent. Flexibility. The premium basketball experience in Vancouver. Register for a pass, pay later.",
  primaryBtn: "TRAIN NOW",
  secondaryBtn: "View Schedule",
};

const TICKER = [
  "LTS FUTURES",
  "LTS HIGH",
  "LTS COLLEGE",
  "VANCOUVER BC",
  "#PACT",
  "COMMUNITY",
  "GROWTH",
];

const STATS = [
  { value: "200+", label: "Athletes Trained", icon: Users },
  { value: "3", label: "Programs", icon: Trophy },
  { value: "5+", label: "Years Running", icon: Calendar },
  { value: "4.9", label: "Rating", icon: Star },
];

const PROGRAMS = [
  {
    id: "fall-academy",
    name: "LTS Fall Academy",
    tagline: "Phase 2 · Oct 9 – Oct 30",
    badge: "Now Open",
    featured: true,
    desc: "10 training opportunities and 15 hours of development — the next chapter of Fall Academy, built around busy school, team, and family schedules.",
    features: [
      "Skill Development, Shooting & Finishing",
      "Footwork & Decision-Making",
      "Live Play & Competitive Application",
      "$55/Session or 10-Session Pass for $449.99",
    ],
    href: "/phase-2",
    cta: "EXPLORE FALL ACADEMY",
  },
  {
    id: "pro",
    name: "LTS PRO",
    tagline: "Private Training",
    badge: "Book Online",
    desc: "Premium private (1-on-1) and semi-private (up to 6 athletes) training with Coach Paolo, customized to the athlete’s position, skill level, and goals. Pick an open time slot and book online.",
    features: [
      "Individualized skill development",
      "Private (60 min) or semi-private (60 or 90 min)",
      "Private $85 · Semi-private from $65",
      "Click into open time slots online",
    ],
    href: "/pro",
    cta: "BOOK A SESSION",
  },
  {
    id: "college",
    name: "LTS College",
    tagline: "College-Level Athletes",
    badge: "Elite Only",
    desc: "High-intensity training for players ready to compete at the next level. No shortcuts. Specialized for recruitment.",
    features: [
      "Elite-level conditioning",
      "Position-specific training",
      "Recruiting & Film support",
      "Data-driven tracking",
    ],
    href: "/college-contact",
    cta: "INQUIRE NOW",
  },
];

const PACT = [
  {
    letter: "P",
    word: "Purposeful",
    desc: "Every rep, every drill — done with intention.",
  },
  {
    letter: "A",
    word: "Alert",
    desc: "Stay present, read the game, make smart decisions.",
  },
  {
    letter: "C",
    word: "Conscious",
    desc: "Understand your body, your game, your growth.",
  },
  {
    letter: "T",
    word: "Technical",
    desc: "Precision and craft in every aspect of your game.",
  },
];

const COACHES = [
  {
    name: "Paolo Labrador",
    role: "Head Coach & Founder",
    bio: "Douglas College Royals MBB Asst. Coach · Magee Secondary Head Coach. “It is my personal mission to ensure that my athletes achieve their goals”",
    photo: "/images/DSC03301.jpg",
    initial: "PL",
    imageClass: "object-cover object-top scale-[1.1] origin-top",
  },
  {
    name: "Mikyle Malabuyoc",
    role: "Coach",
    bio: "",
    photo: "/images/mikyle-new.jpg",
    initial: "MM",
    imageClass: "object-cover object-top scale-[1.45] origin-top",
  },
  {
    name: "Thomas Manganini",
    role: "Coach",
    bio: "",
    photo: "/images/IMG_1872.webp",
    initial: "TM",
    imageClass: "object-cover object-top scale-[1.0]",
  },
  {
    name: "Enrique Garcia",
    role: "Coach",
    bio: "",
    photo: "/images/enrique-new.jpg",
    initial: "EG",
    imageClass: "object-cover object-top",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "IMPROVED NOT JUST STRICT BAG AND SKILL WORK BUT BOTH OFF BALL MOVEMENT AND PASSING. BEING ABLE TO READ DEFENSES WHILE PLAYING THROUGH CONTACT. WORKING AGAINST MULTIPLE DEFENDERS GUARDING ME AT ONCE TO MAKE A READ AND BE ABLE TO SCORE WHILE DOUBLE TEAMED TO MAKE IN GAME SITUATIONS EASIER AND SLOWS DOWN THE GAME WHEN IN HIGH PRESSURE SITUATIONS.",
    author: "Andres Garcia",
    role: "UPREP CANADA, Vancouver College 2025",
    stars: 5,
  },
  {
    quote:
      "VERY HIGH LEVEL SKILLS TRAINING. ALSO IMPROVING PHYSICAL AND MENTAL ASPECTS OF THE GAME THROUGHOUT DRILLS THAT INCLUDE REAL GAME LIKE SCENARIOS. CONDITIONING AT LTS HAS ALSO BEEN A KEY PART OF GROWTH THIS SUMMER. THROUGHOUT MY TRAINING SESSIONS WITH LTS I AM CONFIDENT ENOUGH TO SAY THAT I HAVE GROWN BOTH MENTALLY AND PHYSICALLY THROUGHOUT THE GAME OF BASKETBALL.",
    author: "Vincent Velasquez",
    role: "Vancouver College / University of the Fraser Valley",
    stars: 5,
  },
  {
    quote:
      "I MET COACH PAOLO THROUGH THE BASKETBALL COMMUNITY. HIS TRAINING HELPED ME IMPROVE IN ALL ASPECTS OF THE GAME. COACH PAOLO SHOWED CARE FOR EVERY LITTLE DETAIL AND MADE SURE TO KEEP ME RIGHT DURING MY OFF SEASON BEFORE COLLEGE BASKETBALL.",
    author: "Justin Pamintuan",
    role: "Byrne Creek / Capilano University",
    stars: 5,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// スクロール reveal hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DISPLAY = { fontFamily: "var(--font-anton), Anton, sans-serif" } as const;

export default function Home() {
  useReveal();
  return (
    <>
      <FallPromoModal />
      <HeroSection />
      <TickerSection />
      <StatsSection />
      <ProgramsSection />
      <PactSection />
      <CoachesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

// Section eyebrow: a short rule and small caps, not a pill
function SectionLabel({ text, index }: { text: string; index?: string }) {
  return (
    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase text-white/60 mb-5">
      {index && <span className="text-white/35 tabular-nums">{index}</span>}
      <span className="h-px w-8 bg-white/35" />
      {text}
    </p>
  );
}

// ── Hero ─────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      <Image
        src="/images/DSC00881.jpg"
        alt="Basketball training at LTS ELITE PREP"
        fill
        priority
        className="object-cover opacity-40"
        sizes="100vw"
      />
      {/* readability scrim: heavier at the bottom-left where the type sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-16 sm:pb-24">
        <p className="opacity-0 animate-fade-up delay-100 flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-white/75 mb-6">
          <span className="h-px w-10 bg-white/50" />
          {HERO.badge}
        </p>

        <h1
          className="mb-8 text-6xl sm:text-7xl md:text-8xl xl:text-[10rem]
                     leading-[0.9] opacity-0 animate-fade-up delay-200"
        >
          {HERO.heading.map((line, i) => (
            <span key={i} className={`block ${i === 1 ? "text-white/40" : "text-white"}`}>
              {line}
            </span>
          ))}
        </h1>

        <p className="text-white/70 text-lg sm:text-xl max-w-xl leading-relaxed mb-10 opacity-0 animate-fade-up delay-300">
          {HERO.subtext}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-up delay-500">
          <Link
            href="/book"
            className="group flex items-center justify-center gap-2 btn-accent font-bold
                       text-base tracking-wide px-9 py-4 rounded-sm"
          >
            {HERO.primaryBtn}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/schedule"
            className="flex items-center justify-center border border-white/40
                       hover:border-white hover:bg-white hover:text-black text-white font-bold
                       text-base tracking-wide px-9 py-4 rounded-sm transition-colors"
          >
            {HERO.secondaryBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Ticker ───────────────────────────────────────────────────
function TickerSection() {
  return (
    <div className="border-y border-white/10 bg-black py-4 overflow-hidden" aria-hidden="true">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((i) => (
          <span key={i} className="flex gap-12 mr-12">
            {TICKER.map((item) => (
              <span key={item} className="text-xl tracking-[0.2em] text-white/55" style={DISPLAY}>
                {item}
                <span className="ml-12 text-white/25">/</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Stats ────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section className="bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-white/10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="reveal border-r border-b lg:border-b-0 border-white/10 px-5 sm:px-8 py-10">
              <p className="text-6xl sm:text-7xl leading-none text-white mb-3" style={DISPLAY}>
                {value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Programs ─────────────────────────────────────────────────
function ProgramsSection() {
  return (
    <section id="programs" className="py-24 lg:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-14 reveal max-w-2xl">
          <SectionLabel text="Programs" index="01" />
          <h2 className="text-5xl sm:text-7xl mb-4">Find Your Level</h2>
          <p className="text-white/65 text-lg">
            Programs built for where you are — and where you want to go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-white/15">
          {PROGRAMS.map((program, i) => (
            <div
              key={program.id}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`reveal flex flex-col p-7 lg:p-9
                          ${i > 0 ? "border-t md:border-t-0 md:border-l border-white/15" : ""}
                          ${program.featured ? "bg-white text-black" : "bg-black text-white"}`}
            >
              <p
                className={`mb-8 flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase
                  ${program.featured ? "text-black" : "text-white/70"}`}
              >
                <span className={`w-2 h-2 ${program.featured ? "bg-black" : "bg-white/70"}`} />
                {program.badge}
              </p>

              <h3 className="text-4xl lg:text-5xl mb-2">{program.name}</h3>
              <p className={`text-sm font-semibold mb-5 uppercase tracking-wider ${program.featured ? "text-black/60" : "text-white/55"}`}>
                {program.tagline}
              </p>
              <p className={`text-[15px] leading-relaxed mb-8 ${program.featured ? "text-black/75" : "text-white/70"}`}>
                {program.desc}
              </p>

              <ul className="mb-10 flex-1">
                {program.features.map((f) => (
                  <li
                    key={f}
                    className={`py-3 text-sm border-t ${program.featured ? "border-black/15 text-black/85" : "border-white/15 text-white/75"}`}
                  >
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={program.href}
                className={`group flex items-center justify-between font-bold text-sm tracking-wide
                            px-5 py-4 rounded-sm transition-colors
                            ${program.featured
                              ? "bg-black text-white hover:bg-black/85"
                              : "border border-white/40 text-white hover:bg-white hover:text-black"}`}
              >
                {program.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PACT ─────────────────────────────────────────────────────
function PactSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0b0b0b] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="reveal">
            <SectionLabel text="Our Philosophy" index="02" />
            <div className="mb-8">
              <Image
                src="/logo/logo1.png"
                alt="LTS ELITE PREP Logo"
                width={180}
                height={60}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white/80 text-xl leading-relaxed mb-4">
              Every athlete at LTS ELITE PREP makes a personal commitment — a
              PACT to their own development.
            </p>
            <p className="text-white/60 text-base leading-relaxed mb-9">
              It&rsquo;s not just about basketball. It&rsquo;s about discipline,
              growth, and becoming the best version of yourself — on and off the
              court.
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 bg-white text-black font-bold
                         px-7 py-3.5 rounded-sm text-sm tracking-wide hover:bg-white/90 transition-colors"
            >
              Make Your PACT
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 border-l border-t border-white/15">
            {PACT.map(({ letter, word, desc }, i) => (
              <div
                key={letter}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="reveal border-r border-b border-white/15 p-6 sm:p-8"
              >
                <span className="block text-7xl sm:text-8xl leading-none text-white mb-4" style={DISPLAY}>
                  {letter}
                </span>
                <p className="font-bold text-lg mb-1">{word}</p>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Coaches ──────────────────────────────────────────────────
function CoachesSection() {
  return (
    <section className="py-24 lg:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-14 reveal max-w-2xl">
          <SectionLabel text="The Team" index="03" />
          <h2 className="text-5xl sm:text-7xl mb-4">
            Coaches Who&rsquo;ve Been There
          </h2>
          <p className="text-white/65 text-lg">
            Real players turned real coaches. They know what it takes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {COACHES.map((coach, i) => (
            <div key={coach.name} style={{ transitionDelay: `${i * 80}ms` }} className="reveal">
              <div className="relative aspect-[4/5] bg-[#111] overflow-hidden">
                {coach.photo ? (
                  <Image
                    src={coach.photo}
                    alt={coach.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={coach.imageClass || "object-cover object-top"}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl text-white/15" style={DISPLAY}>
                      {coach.initial}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2 border-white mt-4">
                <h3 className="text-2xl mb-1">{coach.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  {coach.role}
                </p>
                {coach.bio && (
                  <p className="text-white/70 text-sm leading-relaxed mt-3 line-clamp-4">
                    {coach.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0b0b0b] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-14 reveal max-w-2xl">
          <SectionLabel text="What Players Say" index="04" />
          <h2 className="text-5xl sm:text-7xl">Straight From the Athletes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/15">
          {TESTIMONIALS.map(({ quote, author, role }, i) => (
            <figure
              key={author}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`reveal flex flex-col py-8 md:py-10 md:px-8 first:md:pl-0 last:md:pr-0
                          ${i > 0 ? "border-t md:border-t-0 md:border-l border-white/15" : ""}`}
            >
              <span className="block text-7xl leading-[0.6] text-white/25 mb-4 h-8" style={DISPLAY} aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="text-white/75 text-[15px] leading-relaxed mb-8 flex-1">
                {quote}
              </blockquote>
              <figcaption>
                <p className="font-bold text-base">{author}</p>
                <p className="text-sm text-white/55 mt-0.5">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-24 lg:py-32 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 reveal">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
          <div>
            <SectionLabel text="Get Started" index="05" />
            <h2 className="text-6xl sm:text-8xl lg:text-[9rem] leading-[0.9]">
              Ready to
              <br />
              Level Up?
            </h2>
          </div>

          <div>
            <p className="text-white/70 text-lg mb-8 max-w-md">
              Your first session is on us. Come out, meet the coaches, and see what
              LTS is about. No commitment, no pressure.
            </p>

            <Link
              href="/book"
              className="group inline-flex items-center gap-3 btn-accent font-bold text-lg tracking-wide
                         px-10 py-5 rounded-sm"
            >
              TRAIN NOW
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-white/50 text-xs mt-6 font-semibold tracking-[0.2em]">
              REGISTER FOR A PASS · PAY LATER
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
