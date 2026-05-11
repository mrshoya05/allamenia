import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="p-18 bg-slate-900/50 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute -top-40 -right-10 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-7xl font-bold text-slate-50 tracking-tight leading-[0.92] mb-6">
                READY<br />
                TO BE<br />
                <span className="italic text-emerald-500 text-[1.1em]">REAL?</span>
              </h2>
              <p className="text-base text-slate-400 leading-relaxed max-w-md">
                Free forever. No ads. No credit card. Takes less than 2 minutes.
              </p>
            </div>

            <div className="flex flex-col gap-6 items-start">
              <Link href="/signup" className="inline-flex items-center gap-2.5 px-11 py-4.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Create free account <span className="text-xl">→</span>
              </Link>
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-400 border-b border-slate-800 pb-0.5 transition-colors">
                Already have an account? Sign in
              </Link>

              <div className="mt-1 flex gap-6 flex-wrap">
                {[["✓", "No credit card", "#10b981"], ["✓", "No ads ever", "#06b6d4"], ["✓", "Cancel anytime", "#10b981"]].map(([icon, text, color]) => (
                  <span key={text} className="text-xs text-slate-500 flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                      {icon}
                    </span>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
