// ============================================================
// ポリシーページ (app/policies/page.tsx)
// Strict no-refund, cancellation, and pass carry-forward policy
// ============================================================

import Link from "next/link";
import { ArrowRight, Ban, Clock, RefreshCw, Mail, UserX } from "lucide-react";

const RULES = [
  {
    icon: Ban,
    title: "All Sales Are Final",
    desc: "Every booking, pass, and camp registration is non-refundable once purchased — no exceptions, regardless of how many sessions remain unused or how far in advance you ask. This applies to drop-ins, 5/10-session passes, Full Access / Full Phase passes, and camp registrations alike.",
  },
  {
    icon: UserX,
    title: "No-Shows Are Charged",
    desc: "Once you've registered for a session or camp through the website, you're responsible for it. If you don't cancel or reschedule at least 24 hours in advance, you'll still be charged — or, for pass holders, the session will still be deducted — whether or not you show up.",
  },
  {
    icon: Clock,
    title: "24-Hour Reschedule Window",
    desc: "Need to change your date? Let us know at least 24 hours before your scheduled session or camp and we'll move you to another available date at no extra cost. This does not entitle you to a refund — it just means that session isn't wasted.",
  },
  {
    icon: RefreshCw,
    title: "Unused Sessions Carry Forward",
    desc: "Sessions remaining on a pass when its set or phase ends automatically carry forward into the next set or phase of the same program (e.g. a Fall Academy Phase 1 pass carries into Phase 2). Carry-forward only applies within the same program and session type — sessions cannot be exchanged or transferred between different programs (e.g. Fall Academy sessions cannot be used toward PRO sessions, or vice versa).",
  },
  {
    icon: Mail,
    title: "How to Cancel or Reschedule",
    desc: "Email info@ltseliteprep.ca at least 24 hours in advance with the athlete's name, the email used at registration, and your session or camp date. We'll confirm your new date — remember, this reschedules your spot, it does not refund your payment.",
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
            No-Refund & Cancellation <span className="text-white/20">Policy</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            All sales are final. Please review our cancellation and carry-forward terms before booking a session, purchasing a pass, or registering for a camp.
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
            <li>All sales are final — no refunds, ever, regardless of usage or notice given.</li>
            <li>No-shows without 24+ hours&rsquo; notice: you&rsquo;re still charged for the session or camp, no exceptions.</li>
            <li>24+ hours&rsquo; notice gets you a reschedule to another date — not a refund.</li>
            <li>Sessions left on a pass when its set or phase ends carry forward into the next set or phase of the same program and session type — they don&rsquo;t expire, and they don&rsquo;t transfer to a different program.</li>
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
