"use client";
import { STATS } from "@/lib/constants";

const ICONS = ["👤", "📝", "🌍", "⚡"];

export function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="p-9 text-center bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all">
            <div className="text-3xl mb-4 w-13 h-13 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              {ICONS[i]}
            </div>
            <div className="text-5xl font-bold text-emerald-500 leading-none mb-2">{s.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
