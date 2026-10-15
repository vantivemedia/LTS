"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Download, FileText, Lock, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const INPUT_CLASS =
  "w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20 transition-colors";
const LABEL_CLASS = "text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block";

const PERKS = [
  "A simple 3 step system: Recognize, Reset, Respond",
  "Real game examples: missed shots, turnovers, and bigger defenders",
  "How to read the game so it feels slower",
  "A page to fill in and save for your next game",
];

export default function GuideForm() {
  const [parentName, setParentName] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // set once the form is submitted — this is what "unlocks" the guide
  const [token, setToken] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent">("idle");
  const [emailError, setEmailError] = useState("");

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/guidebook/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentName, athleteName, email, website }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Something went wrong");
      if (!d.token) throw new Error("Something went wrong. Please try again.");
      trackEvent("button_click", "/nextrep", "guidebook_unlocked");
      setSentTo(d.email || email);
      setToken(d.token);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please email info@ltseliteprep.ca");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail() {
    setEmailState("sending");
    setEmailError("");
    try {
      const res = await fetch("/api/guidebook/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not send the email");
      setEmailState("sent");
    } catch (err: any) {
      setEmailError(err.message || "Could not send the email. Please use the download button.");
      setEmailState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-5">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase mb-10 transition-all">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>

        <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:items-center">
          {/* ── Left: pitch ── */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Free Player Guide</p>
            <h1
              className="text-5xl sm:text-6xl mb-5 uppercase tracking-tighter leading-none"
              style={{ fontFamily: '"Vanguard CF Heavy Oblique", sans-serif' }}
            >
              The Next
              <br />
              <span className="text-white">Rep</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-md">
              One bad play does not define you. What you do next does. A free 6 page playbook for basketball players from LTS Elite Prep. Enter your info to unlock it.
            </p>

            <ul className="space-y-3 mb-8">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/60">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md border border-white/5 hidden lg:block">
              <Image
                src="/images/nextrep-hero.jpg"
                alt="LTS Elite Prep athlete in a ball handling stance at The Hoop"
                fill
                className="object-cover object-[center_55%]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>

          {/* ── Right: gate / unlocked ── */}
          <div className="mt-10 lg:mt-0">
            <div className="bg-[#111] p-6 sm:p-8 rounded-3xl border border-white/5">
              {!token ? (
                <form onSubmit={handleUnlock} className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-wide">Unlock the Guide</p>
                      <p className="text-xs text-white/30">Takes about 10 seconds</p>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Parent Name</label>
                    <input
                      required
                      type="text"
                      placeholder="MICHAEL SMITH"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Athlete Name</label>
                    <input
                      required
                      type="text"
                      placeholder="JORDAN SMITH"
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Parent Email</label>
                    <input
                      required
                      type="email"
                      placeholder="PARENT@EXAMPLE.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* honeypot: hidden from people, tempting to bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="absolute -left-[9999px] w-px h-px opacity-0"
                  />

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold p-4 rounded-xl text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!parentName || !athleteName || !email || loading}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {loading ? "UNLOCKING..." : "UNLOCK THE GUIDE"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                  <p className="text-center text-xs text-white/20">
                    Your info stays with LTS Elite Prep and is used to send your guide and follow up with you.
                  </p>
                </form>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="text-2xl font-black uppercase mb-2">Guide Unlocked</h2>
                  <p className="text-white/40 text-sm mb-7">Choose how you would like to get it.</p>

                  <div className="space-y-3">
                    <a
                      href={`/api/guidebook/download?token=${encodeURIComponent(token)}`}
                      onClick={() => trackEvent("button_click", "/nextrep", "guidebook_download")}
                      className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      DOWNLOAD THE PDF
                    </a>

                    {emailState === "sent" ? (
                      <div className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm">
                        <Check className="w-4 h-4" />
                        Sent to {sentTo}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEmail}
                        disabled={emailState === "sending"}
                        className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/30 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Mail className="w-5 h-5" />
                        {emailState === "sending" ? "SENDING..." : "EMAIL IT TO THE PARENT"}
                      </button>
                    )}
                  </div>

                  {emailError && <p className="text-red-400 text-xs font-bold mt-3">{emailError}</p>}
                  {emailState !== "sent" && (
                    <p className="text-white/25 text-xs mt-3">We will send it to {sentTo}.</p>
                  )}

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-white/40 text-sm mb-4">Ready to train with us?</p>
                    <Link
                      href="/phase-2"
                      onClick={() => trackEvent("button_click", "/nextrep", "guidebook_to_phase2")}
                      className="inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-wide hover:text-white/70 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      See Fall Academy Phase 2
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
