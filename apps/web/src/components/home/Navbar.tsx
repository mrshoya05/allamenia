"use client";
import { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-3 left-3 right-3 z-50 px-4 sm:px-6 flex items-center h-14 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-lg sm:text-xl font-bold text-slate-50 tracking-tight">ALLAMENIA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-3 animate-pulse shadow-lg shadow-emerald-500/50" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {["Features", "Community", "About"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 transition-all">
                {l}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="px-5 py-2 text-sm font-medium bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition-all">
              Sign in
            </Link>
            <Link href="/signup" className="px-5 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
              Get started →
            </Link>
          </div>

          {/* Mobile: sign in + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="px-4 py-1.5 text-sm font-medium bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition-all">
              Sign in
            </Link>
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-1" onClick={() => setMobileOpen(false)}>
              <span className="text-xl font-bold text-slate-50 tracking-tight">ALLAMENIA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-3 animate-pulse" />
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-6">
            {["Features", "Community", "About"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-slate-300 hover:text-slate-100 rounded-xl hover:bg-slate-800/50 transition-all">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 px-6 mt-auto pb-10">
            <Link href="/signup" onClick={() => setMobileOpen(false)}
              className="w-full py-4 text-center text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Get started →
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="w-full py-4 text-center text-base font-medium bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-800 transition-all">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
