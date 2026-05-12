import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account" };

const PERKS = [
  { icon: "⚡", text: "AI-powered feed that learns your taste", color: "#10b981" },
  { icon: "🛡️", text: "No ads. No data selling. Ever.", color: "#06b6d4" },
  { icon: "🔴", text: "Real-time updates across all devices", color: "#ec4899" },
  { icon: "🎨", text: "Post text, images, video, polls and more", color: "#10b981" },
  { icon: "🔒", text: "Private accounts with granular controls", color: "#10b981" },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-[#0a0f14] relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed pointer-events-none rounded-full bottom-[-25%] right-[5%] w-[min(600px,80vw)] h-[min(600px,80vw)] bg-[rgba(103,232,249,0.05)] blur-[100px]" />
      <div className="fixed pointer-events-none rounded-full top-[-20%] left-[30%] w-[min(400px,60vw)] h-[min(400px,60vw)] bg-[rgba(244,114,182,0.04)] blur-[80px]" />

      {/* ── Left panel — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 xl:p-14 border-r border-white/[0.06] relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-slate-50 tracking-[-0.04em]">ALLAMENIA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-3 animate-pulse shadow-lg shadow-emerald-500/50" />
        </Link>

        {/* Perks */}
        <div className="my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span>✦</span> Why join
          </div>
          <h2 className="text-4xl font-bold text-slate-50 tracking-tight leading-tight mb-10">
            Join 12 million<br />people already<br />here<span className="text-emerald-500">.</span>
          </h2>
          <ul className="flex flex-col gap-5">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{
                    background: `${p.color}15`,
                    border: `1px solid ${p.color}25`,
                    boxShadow: `0 0 15px ${p.color}20`,
                  }}
                >
                  {p.icon}
                </div>
                <span className="text-sm text-slate-400 leading-relaxed">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative p-7 bg-[#0f1419] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-12 h-0.5 bg-cyan-500 opacity-50 rounded" />
          <p className="text-sm text-slate-400 leading-relaxed mb-5 italic">
            &ldquo;Switched from Twitter 8 months ago. Haven&apos;t looked back once.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
              AM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">Arjun Mehta</p>
              <p className="text-xs text-slate-500">@arjun.dev · 89k followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex flex-col w-full lg:w-auto lg:flex-none lg:min-w-[480px] xl:min-w-[560px] items-center justify-center px-5 sm:px-10 py-10 relative z-10">
        {/* Logo */}
        <div className="w-full max-w-md mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-50 tracking-[-0.04em]">ALLAMENIA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-2 animate-pulse shadow-lg shadow-emerald-500/50" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
