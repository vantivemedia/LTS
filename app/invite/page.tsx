"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const BLUE = "#073c8d";
const BG = "#e8e5e4";

const DETAILS = [
  { label: "Date", value: "Thursday, August 27" },
  { label: "Time", value: "12:00 PM – 3:00 PM" },
  { label: "Location", value: "The Hoop — 11111 Twigg Pl #1061, Richmond, BC" },
  { label: "Price", value: "$79.99 per athlete" },
];

const WHY = [
  "1-on-1 attention in a small, invite-only group",
  "Skill work led by Kaden Hruska, SFU MBB Assistant Coach",
  "Movement & injury-prevention training led by Devin Thandi, UBC MPT Student",
];

// Blueprint grid background as inline SVG data URL
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='rgba(7,60,141,0.10)' stroke-width='1'/%3E%3C/svg%3E")`;
const GRID_BG_LARGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cpath d='M 400 0 L 0 0 0 400' fill='none' stroke='rgba(7,60,141,0.16)' stroke-width='1'/%3E%3C/svg%3E")`;

export default function InvitePage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{
        background: BG,
        backgroundImage: `${GRID_BG_LARGE}, ${GRID_BG}`,
        backgroundSize: "400px 400px, 80px 80px",
      }}
    >
      <div className="max-w-xl mx-auto px-5 pt-28 pb-32 w-full text-center">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border mb-6"
          style={{ background: `${BLUE}0d`, borderColor: `${BLUE}26`, color: BLUE }}
        >
          Exclusive Invitation
        </span>

        <h1
          className="text-5xl sm:text-6xl mb-5 uppercase tracking-tighter leading-none"
          style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif', color: BLUE }}
        >
          You&rsquo;ve Been
          <br />
          Selected
        </h1>

        <p className="text-sm sm:text-base leading-relaxed mb-10 max-w-md mx-auto" style={{ color: `${BLUE}99` }}>
          You&rsquo;ve been personally selected to attend the <strong style={{ color: BLUE }}>Blueprint Workshop</strong> —
          LTS Elite Prep&rsquo;s exclusive one-day intensive. This invite is limited to a small group of athletes.
        </p>

        <div className="bg-white rounded-2xl border p-6 mb-8 text-left" style={{ borderColor: `${BLUE}1a` }}>
          {DETAILS.map((d, i) => (
            <div
              key={d.label}
              className="flex items-center justify-between py-2.5"
              style={i < DETAILS.length - 1 ? { borderBottom: `1px solid ${BLUE}1a` } : undefined}
            >
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${BLUE}80` }}>{d.label}</span>
              <span className="text-sm font-bold text-right ml-4" style={{ color: BLUE }}>{d.value}</span>
            </div>
          ))}
        </div>

        <ul className="space-y-2 mb-10 text-left max-w-sm mx-auto">
          {WHY.map((w) => (
            <li key={w} className="flex items-start gap-2 text-sm" style={{ color: `${BLUE}99` }}>
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BLUE }} />
              {w}
            </li>
          ))}
        </ul>

        <p className="text-xs" style={{ color: `${BLUE}66` }}>
          Spots are limited and reserved for invited athletes.
        </p>
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 px-5 pt-4 border-t"
        style={{ background: `${BG}f2`, borderColor: `${BLUE}1a`, backdropFilter: "blur(8px)", paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Link
          href="/workshop#register"
          onClick={() => trackEvent("button_click", "/invite", "invite_claim_spot")}
          className="animate-pulse-ring-blue w-full max-w-xl mx-auto flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wide px-10 py-4 rounded-2xl transition-all active:scale-95"
          style={{ background: BLUE, color: BG }}
        >
          Claim Your Spot
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
