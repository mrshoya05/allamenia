import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#0a0f14] relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed pointer-events-none rounded-full top-[-25%] left-[10%] w-[min(600px,80vw)] h-[min(600px,80vw)] bg-[rgba(167,139,250,0.07)] blur-[100px]" />
      <div className="fixed pointer-events-none rounded-full bottom-[-20%] right-[20%] w-[min(400px,60vw)] h-[min(400px,60vw)] bg-[rgba(103,232,249,0.04)] blur-[80px]" />

      {/* ── Left panel — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 xl:p-14 border-r border-white/[0.06] relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-slate-50 tracking-[-0.04em]">ALLAMENIA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-3 animate-pulse shadow-lg shadow-emerald-500/50" />
        </Link>

        {/* Quote card */}
        <div className="my-auto max-w-[440px]">
          <div className="relative p-10 bg-[#0f1419] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-0.5 bg-emerald-500 opacity-60 rounded" />
            <div className="text-5xl text-emerald-500/30 font-serif leading-none mb-2">&ldquo;</div>
            <blockquote className="text-2xl font-bold text-slate-50 leading-tight tracking-tight mb-7">
              The only platform where I actually enjoy scrolling.
            </blockquote>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0">
                SK
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Sarah Kim</p>
                <p className="text-xs text-slate-500">@sarah_k · 1.2M followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex border-t border-white/[0.06] pt-8">
          {[
            ["12M+", "Active users", "text-emerald-400"],
            ["190+", "Countries", "text-cyan-400"],
            ["99.9%", "Uptime", "text-green-400"],
          ].map(([v, l, color], i) => (
            <div
              key={l}
              className={`flex-1 ${i > 0 ? "pl-7 border-l border-white/[0.06]" : ""} ${i < 2 ? "pr-7" : ""}`}
            >
              <div className={`text-2xl font-bold tracking-tight ${color}`}>{v}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex flex-col w-full lg:w-auto lg:flex-none lg:min-w-[480px] xl:min-w-[560px] items-center justify-center px-5 sm:px-10 py-10 relative z-10">
        {/* Logo — always visible, prominent on mobile */}
        <div className="w-full max-w-md mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-50 tracking-[-0.04em]">ALLAMENIA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-2 animate-pulse shadow-lg shadow-emerald-500/50" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
