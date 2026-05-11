"use client";
import { useState } from "react";
import { AppNavbar } from "@/components/ui/AppNavbar";

interface Post {
  id: number;
  handle: string;
  name: string;
  verified: boolean;
  time: string;
  content: string;
  likes: number;
  comments: number;
}
interface Props {
  initialPosts: Post[];
  trending: { tag: string; posts: string }[];
  suggestions: { handle: string; name: string; followers: string }[];
}

const AVATAR_COLORS = ["#10b981", "#06b6d4", "#ec4899", "#10b981"];

function Avatar({ name, size = 38, index = 0 }: { name: string; size?: number; index?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 10px ${color}20`,
      }}
    >
      {initials}
    </div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="p-6 mb-3 flex gap-3.5 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm hover:border-slate-700 transition-all">
      <Avatar name={post.name} index={index} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-bold text-slate-100">{post.name}</span>
          {post.verified && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-[9px] font-bold flex-shrink-0 shadow-lg shadow-emerald-500/30">
              ✓
            </span>
          )}
          <span className="text-sm text-slate-600">@{post.handle}</span>
          <span className="text-xs text-slate-600 ml-auto">{post.time}</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{post.content}</p>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1.5 text-sm transition-all"
            style={{
              color: liked ? "#10b981" : "var(--text-dim)",
              fontWeight: liked ? 600 : 400,
            }}
          >
            {liked ? "♥" : "♡"} {(post.likes + (liked ? 1 : 0)).toLocaleString()}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-400 transition-colors">
            ◎ {post.comments}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-400 transition-colors">
            ↺ Repost
          </button>
          <button className="ml-auto text-sm text-slate-600 hover:text-slate-400 transition-colors">↗</button>
        </div>
      </div>
    </article>
  );
}

export function FeedClient({ initialPosts, trending, suggestions }: Props) {
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const [postText, setPostText] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="fixed pointer-events-none rounded-full top-[-15%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/7 blur-[100px] z-0" />
      <div className="fixed pointer-events-none rounded-full bottom-[-15%] left-[10%] w-96 h-96 bg-cyan-500/5 blur-[80px] z-0" />

      <AppNavbar />

      <div className="max-w-7xl mx-auto px-8 pt-22 pb-12 grid lg:grid-cols-[1fr_340px] gap-5 relative z-10">
        <div>
          {/* Compose */}
          <div className="p-6 mb-4 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
            <div className="flex gap-3.5">
              <Avatar name="Me" size={40} index={0} />
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={2}
                  className="w-full bg-transparent border-none outline-none resize-none text-base text-slate-100 placeholder:text-slate-600 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <div className="flex gap-1">
                    {[["🖼", "#10b981"], ["😊", "#06b6d4"], ["📊", "#ec4899"]].map(([icon, color]) => (
                      <button
                        key={icon}
                        className="px-3 py-1.5 text-base rounded-lg text-slate-600 hover:bg-opacity-15 transition-all"
                        style={{
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${color}15`;
                          e.currentTarget.style.boxShadow = `0 0 10px ${color}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!postText.trim()}
                    className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all ${
                      postText.trim()
                        ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-800/50 border border-slate-700 text-slate-500 opacity-35"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-4 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
            {(["foryou", "following"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-4 text-sm font-semibold uppercase tracking-wider relative transition-all"
                style={{
                  color: tab === t ? "var(--text)" : "var(--text-dim)",
                  background: tab === t ? "rgba(16, 185, 129, 0.08)" : "transparent",
                }}
              >
                {t === "foryou" ? "For you" : "Following"}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-emerald-500 rounded shadow-lg shadow-emerald-500/50" />
                )}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div>
            {initialPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Trending */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm overflow-hidden">
            <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-4.5 flex items-center gap-2">
              <span>🔥</span> Trending
            </p>
            <div className="flex flex-col gap-0">
              {trending.map((t, i) => (
                <div
                  key={t.tag}
                  className="px-2.5 py-3 cursor-pointer flex justify-between items-center hover:bg-slate-800/30 rounded-lg transition-all"
                  style={{ borderBottom: i < trending.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{t.tag}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{t.posts}</p>
                  </div>
                  <span className="text-xs text-slate-600 font-mono bg-slate-800/50 px-2 py-0.5 rounded-full">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Who to follow */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
            <p className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-4.5 flex items-center gap-2">
              <span>✦</span> Who to follow
            </p>
            <div className="flex flex-col gap-4.5">
              {suggestions.map((s, i) => (
                <div key={s.handle} className="flex items-center gap-3">
                  <Avatar name={s.name} size={36} index={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      @{s.handle} · {s.followers}
                    </p>
                  </div>
                  <button className="px-4.5 py-1.5 text-xs font-medium bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition-all flex-shrink-0">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5.5 py-4.5 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-slate-600 leading-loose">
              {["Privacy", "Terms", "About", "Help"].map((l, i, arr) => (
                <span key={l}>
                  <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors">
                    {l}
                  </a>
                  {i < arr.length - 1 && " · "}
                </span>
              ))}
            </p>
            <p className="text-xs text-slate-600 mt-1 opacity-40">© 2026 Allamenia, Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
