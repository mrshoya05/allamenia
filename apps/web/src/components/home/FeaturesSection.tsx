"use client";
import { FEATURES } from "@/lib/constants";

const ICONS = ["⚡", "🛡️", "🔴", "🎨"];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 sm:mb-5 text-xs font-bold tracking-widest text-emerald-500 uppercase bg-slate-900/50 border border-slate-800 rounded-xl">
            <span>✦</span> Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-50 tracking-tight leading-tight mb-3 sm:mb-4">
            Built different, by design.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Every feature designed to put you first. No compromises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.number} className="p-6 sm:p-9 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-15 h-0.5 bg-emerald-500 opacity-50 rounded" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    {ICONS[i]}
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900">{f.number}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-2 sm:mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
