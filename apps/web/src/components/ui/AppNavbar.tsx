"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { useWs } from "@/contexts/WebSocketContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
interface NavProfile { username: string; full_name: string | null; avatar_url: string | null; }

function NavAvatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40" />;
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/40 bg-emerald-500/20 text-emerald-400">
      {initials}
    </div>
  );
}

export function AppNavbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const { unreadMessages } = useWs();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("allamenia_access_token") : null;
    if (!token) return;
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null).then((d) => d && setProfile(d)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("allamenia_access_token");
    localStorage.removeItem("allamenia_refresh_token");
    router.replace("/login");
  };

  const displayName = profile?.full_name || profile?.username || "Me";

  return (
    <header className="fixed top-3 left-4 right-4 z-50 h-14 flex items-center px-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 text-xs font-black">A</div>
          <span className="text-base font-bold tracking-tight text-slate-100">Allamenia</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <input type="text" placeholder="Search…" className="w-full px-3.5 py-2 text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all backdrop-blur-sm" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/messages" className="p-2.5 rounded-xl hover:bg-[#1d1f23] transition-all group relative">
            <MessageCircle className="w-5 h-5 text-[#71767b] group-hover:text-[#e7e9ea] transition-colors" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#1d9bf0] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 cursor-pointer">
              <NavAvatar name={displayName} url={profile?.avatar_url} />
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-slate-900/95 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 anim-fade-up z-50 overflow-hidden">
                {/* Header with gradient */}
                <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <NavAvatar name={displayName} url={profile?.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{displayName}</p>
                      {profile?.username && <p className="text-xs text-slate-500 truncate">@{profile.username}</p>}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2">
                  {[
                    { href: "/profile", icon: "👤", label: "View profile", desc: "See your public profile" },
                    { href: "/profile", icon: "✏️", label: "Edit profile", desc: "Update your info" },
                    { href: "/feed", icon: "🏠", label: "Home feed", desc: "Back to timeline" },
                    { href: "#", icon: "⚙️", label: "Settings", desc: "Preferences & privacy" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-slate-800/60 transition-all group"
                    >
                      <span className="text-lg mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-slate-700/50 py-2 bg-slate-950/30">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Log out</p>
                      <p className="text-xs text-slate-600 mt-0.5">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
