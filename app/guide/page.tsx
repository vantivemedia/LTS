import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { guidebookExists } from "@/lib/guidebook";
import GuideForm from "./GuideForm";

export const metadata: Metadata = {
  title: "Free Guidebook | LTS Elite Prep",
  description: "Get the free LTS Elite Prep guidebook from Coach Paolo. Download the PDF or have it sent to your inbox.",
};

export default function GuidePage() {
  // Until the PDF is added to /private, show a holding message instead of a form that
  // would collect emails with nothing to send back.
  if (!guidebookExists()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Free Guidebook</p>
          <h1
            className="text-5xl mb-4 uppercase tracking-tighter leading-none"
            style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
          >
            Coming Soon
          </h1>
          <p className="text-white/40 mb-8 leading-relaxed">The LTS Elite Prep guidebook is on its way. Check back shortly.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase transition-all">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <GuideForm />;
}
