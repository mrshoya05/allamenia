import { MOCK_POSTS } from "@/lib/constants";

export function AppPreviewSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-[1fr_500px] gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-bold tracking-widest text-cyan-500 uppercase bg-slate-900/50 border border-slate-800 rounded-xl">
            <span>◎</span> Preview
          </div>
          <h2 className="text-6xl font-bold text-slate-50 tracking-tight leading-[0.95] mb-6">
            See what&apos;s<br />
            <span className="text-cyan-500">inside.</span>
          </h2>
          <p className="text-base text-slate-400 leading-relaxed max-w-md">
            A feed that actually works for you. No algorithmic manipulation, no rage-bait.
          </p>

          <div className="flex gap-3 mt-10 flex-wrap">
            {[["800M+", "Posts shared", "📝"], ["4.9★", "App rating", "⭐"], ["<50ms", "Latency", "⚡"]].map(([v, l, icon]) => (
              <div key={l} className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl flex-1 min-w-[120px]">
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-2xl font-bold text-slate-100 mb-1">{v}</div>
                <div className="text-xs text-slate-500 tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-800 flex items-center gap-2.5 bg-slate-900/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 max-w-[200px] mx-auto px-3.5 py-1 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-slate-600 font-mono">allamenia.app/feed</span>
            </div>
          </div>

          {MOCK_POSTS.slice(0, 3).map((post, i) => (
            <div key={post.id} className="px-5 py-4 border-b border-slate-800 last:border-b-0 flex gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500 flex-shrink-0">
                {post.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm font-bold text-slate-100">{post.name}</span>
                  {post.verified && <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-[8px] font-bold">✓</span>}
                  <span className="text-xs text-slate-600">@{post.handle}</span>
                  <span className="text-xs text-slate-600 ml-auto">{post.time}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{post.content}</p>
                <div className="flex gap-4 mt-2.5">
                  <span className="text-xs text-slate-600">♡ {post.likes.toLocaleString()}</span>
                  <span className="text-xs text-slate-600">◎ {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
