"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle, Search, X, User, Pencil, Home,
  Settings, LogOut, Loader2,
} from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { useWs } from "@/contexts/WebSocketContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface NavProfile { username: string; full_name: string | null; avatar_url: string | null; }
interface SearchUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  followers_count?: number;
}

function NavAvatar({ name, url, size = 36 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (url) return (
    <img src={url} alt={name} className="rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/40 bg-emerald-500/20 text-emerald-400 shrink-0"
      style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

function SearchResultItem({ user, onSelect }: { user: SearchUser; onSelect: () => void }) {
  const initials = (user.full_name || user.username).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Link
      href={`/profile/${user.username}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors group"
    >
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.username}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0 ring-1 ring-slate-700">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
            {user.full_name || user.username}
          </span>
          {user.is_verified && (
            <svg className="w-3.5 h-3.5 text-[#1d9bf0] shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
            </svg>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">@{user.username}</p>
      </div>
      {user.followers_count !== undefined && user.followers_count > 0 && (
        <span className="text-xs text-slate-600 shrink-0">
          {user.followers_count >= 1000
            ? `${(user.followers_count / 1000).toFixed(1)}K`
            : user.followers_count} followers
        </span>
      )}
    </Link>
  );
}

function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/users/search?q=${encodeURIComponent(q)}&limit=8`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || data.users || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(() => search(query), 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  const clear = () => { setQuery(""); setResults([]); setLoading(false); };

  return { query, setQuery, results, loading, clear };
}

export function AppNavbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopDropRef = useRef<HTMLDivElement>(null);
  const { unreadMessages } = useWs();

  const desktop = useSearch();
  const mobile = useSearch();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("allamenia_access_token") : null;
    if (!token) return;
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null).then((d) => d && setProfile(d)).catch(() => {});
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close desktop search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopDropRef.current && !desktopDropRef.current.contains(e.target as Node)) {
        setDesktopFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => mobileSearchRef.current?.focus(), 50);
  }, [searchOpen]);

  const logout = () => {
    localStorage.removeItem("allamenia_access_token");
    localStorage.removeItem("allamenia_refresh_token");
    router.replace("/login");
  };

  const displayName = profile?.full_name || profile?.username || "Me";
  const showDesktopDrop = desktopFocused && (desktop.query.trim().length > 0);

  return (
    <>
      <header className="fixed top-3 left-3 right-3 z-50 h-14 flex items-center px-3 sm:px-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 text-xs font-black">A</div>
            <span className="text-base font-bold tracking-tight text-slate-100 hidden sm:block">Allamenia</span>
          </Link>

          {/* Desktop Search */}
          <div className="flex-1 max-w-sm hidden sm:block relative" ref={desktopDropRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                ref={desktopSearchRef}
                type="text"
                value={desktop.query}
                onChange={(e) => desktop.setQuery(e.target.value)}
                onFocus={() => setDesktopFocused(true)}
                placeholder="Search people…"
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              />
              {desktop.query && (
                <button onClick={() => { desktop.clear(); desktopSearchRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop results dropdown */}
            {showDesktopDrop && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-slate-900/95 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                {desktop.loading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Searching…</span>
                  </div>
                ) : desktop.results.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    No users found for &ldquo;{desktop.query}&rdquo;
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">People</p>
                    </div>
                    {desktop.results.map((u) => (
                      <SearchResultItem key={u.id} user={u} onSelect={() => {
                        desktop.clear();
                        setDesktopFocused(false);
                      }} />
                    ))}
                    <div className="border-t border-slate-800 px-4 py-2.5">
                      <Link
                        href={`/people?q=${encodeURIComponent(desktop.query)}`}
                        onClick={() => { desktop.clear(); setDesktopFocused(false); }}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                      >
                        See all results for &ldquo;{desktop.query}&rdquo; →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2.5 rounded-xl hover:bg-slate-800/50 transition-all text-slate-400 hover:text-slate-200"
            >
              <Search className="w-5 h-5" />
            </button>

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
                <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-slate-900/95 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 anim-fade-up z-50 overflow-hidden">
                  <div className="px-4 py-4 border-b border-slate-700/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                      <NavAvatar name={displayName} url={profile?.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">{displayName}</p>
                        {profile?.username && <p className="text-xs text-slate-500 truncate">@{profile.username}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    {[
                      { href: "/profile", icon: User, label: "View profile", desc: "See your public profile" },
                      { href: "/profile", icon: Pencil, label: "Edit profile", desc: "Update your info" },
                      { href: "/feed", icon: Home, label: "Home feed", desc: "Back to timeline" },
                      { href: "#", icon: Settings, label: "Settings", desc: "Preferences & privacy" },
                    ].map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800/60 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                          <item.icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors text-[13px]">{item.label}</p>
                          <p className="text-[11px] text-slate-600 truncate">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-slate-700/50 py-1.5 bg-slate-950/30">
                    <button onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-[13px]">Log out</p>
                        <p className="text-[11px] text-slate-600">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/98 backdrop-blur-xl sm:hidden flex flex-col">
          {/* Search input bar */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                ref={mobileSearchRef}
                type="text"
                value={mobile.query}
                onChange={(e) => mobile.setQuery(e.target.value)}
                placeholder="Search people…"
                className="w-full pl-9 pr-8 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-sm"
              />
              {mobile.query && (
                <button onClick={() => mobile.clear()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => { setSearchOpen(false); mobile.clear(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all shrink-0">
              Cancel
            </button>
          </div>

          {/* Mobile results */}
          <div className="flex-1 overflow-y-auto">
            {!mobile.query.trim() ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-sm">Search by name or username</p>
              </div>
            ) : mobile.loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Searching…</span>
              </div>
            ) : mobile.results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                <p className="text-sm">No users found for &ldquo;{mobile.query}&rdquo;</p>
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">People</p>
                </div>
                {mobile.results.map((u) => (
                  <SearchResultItem key={u.id} user={u} onSelect={() => {
                    setSearchOpen(false);
                    mobile.clear();
                  }} />
                ))}
                <div className="border-t border-slate-800 px-4 py-3 mt-2">
                  <Link
                    href={`/people?q=${encodeURIComponent(mobile.query)}`}
                    onClick={() => { setSearchOpen(false); mobile.clear(); }}
                    className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                  >
                    See all results for &ldquo;{mobile.query}&rdquo; →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
