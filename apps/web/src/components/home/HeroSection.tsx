"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { TICKER_WORDS } from "@/lib/constants";

export function HeroSection() {
  const topicPills = Array.from(new Set(TICKER_WORDS)).slice(0, 14);

  return (
    <section className="pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6 sm:mb-9 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">12M+ creators online now</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[0.92] tracking-tight text-slate-50 mb-5 sm:mb-7"
          >
            POST YOUR<br />
            <span className="italic text-emerald-500 text-[1.05em]">UNFILTERED</span><br />
            REALITY<span className="text-emerald-500">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-8 sm:mb-10"
          >
            Allamenia is the social platform that doesn&apos;t pretend to be neutral.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm sm:text-base">
              Start for free <span className="text-lg">→</span>
            </Link>
            <Link href="/login" className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-900/50 border border-slate-800 text-slate-200 font-medium rounded-xl hover:bg-slate-900/70 transition-all text-sm sm:text-base">
              Sign in
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative p-5 sm:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm mt-4 lg:mt-0"
        >
          <div className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4 sm:mb-6">🔥 Trending now</div>
          {[
            { rank: "01", tag: "#buildinpublic", count: "24.5k" },
            { rank: "02", tag: "#AItools", count: "18.2k" },
            { rank: "03", tag: "#designsystems", count: "9.8k" },
          ].map((t) => (
            <div key={t.rank} className="flex items-center gap-3 sm:gap-3.5 px-3 py-3 sm:py-3.5 mb-1 rounded-xl">
              <span className="text-xs font-mono font-bold text-slate-600">{t.rank}</span>
              <span className="text-sm sm:text-base font-semibold text-slate-100 flex-1">{t.tag}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">{t.count}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-12 sm:mt-20 py-8 sm:py-10 px-4 sm:px-6">
        <p className="text-center text-xs font-bold tracking-widest text-slate-600 uppercase mb-6 sm:mb-8">Explore Topics</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
          {topicPills.map((w) => (
            <div key={w} className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-400 bg-slate-900/50 border border-slate-800 rounded-full">
              <span className="text-emerald-500 mr-1.5">#</span>{w}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
