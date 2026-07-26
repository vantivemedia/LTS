// ============================================================
// ポリシーページ (app/policies/page.tsx)
// Refund policy for session passes & PRO packages
// ============================================================

import Link from "next/link";
import { ArrowRight, Ban, Clock, CalendarClock, Mail } from "lucide-react";

const RULES = [
  {
    icon: Ban,
    title: "Used Passes Are Non-Refundable",
    desc: "Once one or more sessions from a pass or package (Micro Academy 5/10-session pass, or PRO 5-session package) have been used, that pass is no longer eligible for a refund — even if sessions remain on it.",
  },
  {
    icon: Clock,
    title: "24-Hour Cutoff",
    desc: "Refund requests must be submitted at least 24 hours before your next scheduled session. Requests made within 24 hours of a session cannot be refunded.",
  },
  {
    icon: CalendarClock,
    title: "Program Cut-Off",
    desc: "All passes and packages must be used by the program end date listed at the time of purchase. We reserve the right to close out a membership once that date passes, regardless of sessions remaining.",
  },
  {
    icon: Mail,
    title: "How to Request a Refund",
    desc: "Email info@ltseliteprep.ca with the athlete's name, the email used at purchase, and the reason for your request. We'll confirm eligibility and process approved refunds within 5–7 business days.",
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase border border-white/10 text-white/50 rounded-full px-3.5 py-1.5 mb-5">
            Policies
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase mb-4">
            Refund <span className="text-white/20">Policy</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Please review our refund terms before purchasing a session pass or PRO package.
          </p>
        </div>

        {/* Rules */}
        <div className="space-y-4 mb-14">
          {RULES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8 flex gap-5">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight mb-2">{title}</h3>
                <p className="text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary card */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 sm:p-10 mb-14">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">In Short</h2>
          <ul className="space-y-3 text-white/50 leading-relaxed list-disc list-inside">
            <li>Unused passes: refundable if requested 24+ hours before your next session.</li>
            <li>Once you&rsquo;ve used at least one session from a pass: no refund, regardless of timing.</li>
            <li>Requests inside the 24-hour window: not eligible, regardless of usage.</li>
            <li>All passes must be used by the program end date — memberships close out after that, sessions remaining or not.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/30 text-sm mb-5">Questions about a specific booking or pass?</p>
          <a
            href="mailto:info@ltseliteprep.ca"
            className="inline-flex items-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
