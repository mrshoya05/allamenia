"use client";
import { STATS } from "@/lib/constants";

const ICONS = ["👤", "📝", "🌍", "⚡"];

export function StatsSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="p-5 sm:p-9 text-center bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 w-10 h-10 sm:w-13 sm:h-13 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              {ICONS[i]}
            </div>
            <div className="text-3xl sm:text-5xl font-bold text-emerald-500 leading-none mb-1 sm:mb-2">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
