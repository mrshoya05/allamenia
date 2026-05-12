import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-3 sm:mx-6 mb-4 sm:mb-6 px-5 sm:px-9 py-5 sm:py-7 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-base font-bold text-slate-100 tracking-tight">ALLAMENIA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-1.5 animate-pulse shadow-lg shadow-emerald-500/50" />
        </Link>
        <p className="text-xs text-slate-600">© 2026 Allamenia, Inc.</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          {["Privacy", "Terms", "Contact", "Status"].map((l) => (
            <a key={l} href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
