"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SEEN_KEY = "lts_pro_promo_seen";
const SHOW_DELAY_MS = 2000;

export default function ProPromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
      trackEvent("button_click", "/", "pro_promo_shown");
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-5"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-up"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase border border-white/10 text-white/50 rounded-full px-3.5 py-1.5 mb-5">
          Limited Summer Spots
        </span>

        <h2
          className="text-4xl sm:text-5xl uppercase tracking-tighter leading-none mb-4"
          style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
        >
          LTS <span className="text-white">PRO</span>
        </h2>

        <p className="text-white/50 leading-relaxed mb-6">
          Private 1-on-1 (or 1-on-2) training built around your athlete&rsquo;s position, skill level, and goals — coached by Paolo Labrador.
        </p>

        <div className="flex items-center gap-3 mb-8 text-sm">
          <span className="font-black text-white">$85/session</span>
          <span className="text-white/20">·</span>
          <span className="font-black text-white">5 for $399.99</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pro"
            onClick={() => {
              trackEvent("button_click", "/", "pro_promo_click");
              setOpen(false);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black font-black text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-95"
          >
            Explore LTS PRO
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
