// ============================================================
// ナビゲーションバー (components/Navbar.tsx)
// カジュアル・フレンドリーなデザインに刷新
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

const LOGO = {
  badge: "LTS",
  name: "Elite Prep",
};

type NavLink = {
  label: string;
  href?: string;
  children?: { href: string; label: string }[];
};

const NAV_LINKS: NavLink[] = [
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/buy-pass", label: "Buy Pass" },
  { href: "/book", label: "Book" },
  {
    label: "Fall Programming",
    children: [
      { href: "/fall-programming", label: "Phase 1" },
      { href: "/phase-2", label: "Phase 2" },
    ],
  },
  { href: "/college-contact", label: "College" },
  { href: "/policies", label: "Policies" },
  { href: "/admin", label: "Admin" },
];

const DESKTOP_LINK_CLASS = `text-sm font-medium text-white/50
                             hover:text-white transition-colors tracking-wide
                             relative after:absolute after:bottom-[-4px] after:left-0
                             after:w-0 after:h-[2px] after:bg-white
                             after:transition-all after:duration-300
                             hover:after:w-full`;

const CTA = {
  href: "/book",
  label: "TRAIN NOW",
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-500 nav-glass
        ${scrolled
          ? "bg-[#0a0a0a]/90 border-b border-white/5 py-0"
          : "bg-transparent border-b border-transparent py-1"}
      `}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8
                      flex items-center justify-between h-16 md:h-20">

        {/* ── ロゴ ── */}
        <Link href="/" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 group">
          <Image 
            src="/logo/logo1.png" 
            alt="LTS ELITE PREP" 
            width={180} 
            height={60} 
            className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] brightness-0 invert"
            priority
          />
        </Link>

        {/* ── デスクトップナビ ── */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  aria-expanded={openDropdown === link.label}
                  className="flex items-center gap-1 text-sm font-medium text-white/50
                             hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === link.label ? "rotate-180" : ""}`}
                  />
                </button>
                {/* pt-3 bridges the gap so the menu doesn't close while moving the cursor down */}
                <div
                  className={`absolute left-0 top-full pt-3 transition-all duration-150 ${
                    openDropdown === link.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                  }`}
                >
                  <div className="min-w-[160px] bg-[#0a0a0a]/95 nav-glass border border-white/10 rounded-xl p-1.5 shadow-2xl">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/60
                                   hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={link.href} href={link.href!} className={DESKTOP_LINK_CLASS}>
                {link.label}
              </Link>
            )
          )}
          <Link href={CTA.href}
                className="bg-white text-black font-black text-sm
                           px-6 py-3 rounded-xl active:scale-95 transition-all
                           hover:bg-white/90 hover:scale-105">
            {CTA.label}
          </Link>
        </nav>

        {/* ── モバイルハンバーガー ── */}
        <button
          className="md:hidden p-2 text-white/50 hover:text-white transition-colors relative z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── モバイルドロワー ── */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300
        bg-[#0a0a0a]/98 nav-glass border-b border-white/5
        ${menuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
      `}>
        <nav className="flex flex-col px-5 pt-2 pb-8 gap-1">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.label} className="border-b border-white/5">
                <p className="pt-4 pb-2 text-white/50 font-medium">{link.label}</p>
                <div className="pb-3 pl-4 flex flex-col">
                  {link.children.map((child) => (
                    <Link key={child.href} href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className="py-2.5 text-white/40 hover:text-white font-medium transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={link.href} href={link.href!}
                    onClick={() => setMenuOpen(false)}
                    className="py-4 text-white/50 hover:text-white font-medium
                               transition-colors border-b border-white/5 last:border-0">
                {link.label}
              </Link>
            )
          )}
          <Link href={CTA.href}
                onClick={() => setMenuOpen(false)}
                className="mt-6 bg-white text-black font-black py-4 rounded-xl
                           text-center hover:bg-white/90">
            {CTA.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
