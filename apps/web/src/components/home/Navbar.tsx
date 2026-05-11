"use client";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50 h-15 px-6 flex items-center bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-slate-50 tracking-tight">ALLAMENIA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-3 animate-pulse shadow-lg shadow-emerald-500/50" />
        </Link>

        <nav className="flex items-center gap-0.5">
          {["Features", "Community", "About"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 transition-all">
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/login" className="px-5 py-2 text-sm font-medium bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition-all">
            Sign in
          </Link>
          <Link href="/signup" className="px-6 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
            Get started →
          </Link>
        </div>
      </div>
    </header>
  );
}
