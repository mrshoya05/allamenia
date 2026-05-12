"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Link2, Calendar, Mail, BadgeCheck, Lock,
  Pencil, ShieldCheck, LogOut, Save, KeyRound,
  AlertTriangle, CheckCircle, Sparkles, ArrowLeft,
} from "lucide-react";
import { AppNavbar } from "@/components/ui/AppNavbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Profile {
  id: string; username: string; full_name: string | null; bio: string | null;
  avatar_url: string | null; cover_url: string | null; website: string | null;
  location: string | null; is_verified: boolean; is_private: boolean;
  followers_count: number; following_count: number; posts_count: number;
  email: string; role: string; ai_interests: string[] | null;
  last_seen: string | null; created_at: string;
}
interface EditForm {
  full_name: string; bio: string; website: string; location: string;
  avatar_url: string; cover_url: string; date_of_birth: string;
  is_private: boolean; ai_interests: string;
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("allamenia_access_token") : null;
}

function Avatar({ name, url, size = 96 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const base = "rounded-full shrink-0 ring-[3px] ring-slate-950 shadow-2xl";
  const sty = { width: size, height: size, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.5)" };
  if (url) return <img src={url} alt={name} className={`${base} object-cover block`} style={sty} />;
  return (
    <div className={`${base} flex items-center justify-center font-bold bg-emerald-500/20 text-emerald-400`}
      style={{ ...sty, fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return <label className="block mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{children}</label>;
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/20">
      <button type="button" onClick={onChange}
        className="relative shrink-0 rounded-full transition-all duration-300 cursor-pointer border-0 w-11 h-6"
        style={{ background: checked ? "#10b981" : "rgba(255,255,255,0.1)", boxShadow: checked ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none" }}>
        <span className="absolute top-[3px] block w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-300"
          style={{ left: checked ? 23 : 3 }} />
      </button>
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs mt-0.5 text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

export function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [tab, setTab] = useState<"edit" | "security">("edit");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<EditForm>({
    full_name: "", bio: "", website: "", location: "",
    avatar_url: "", cover_url: "", date_of_birth: "", is_private: false, ai_interests: "",
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) { router.replace("/login"); return; }
        if (!res.ok) throw new Error("Failed to load profile");
        const d: Profile = await res.json();
        setProfile(d);
        setForm({ full_name: d.full_name || "", bio: d.bio || "", website: d.website || "", location: d.location || "", avatar_url: d.avatar_url || "", cover_url: d.cover_url || "", date_of_birth: "", is_private: d.is_private, ai_interests: d.ai_interests?.join(", ") || "" });
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaveError(""); setSaving(true); setSaveSuccess(false);
    const token = getToken();
    try {
      const payload: Record<string, unknown> = { full_name: form.full_name || null, bio: form.bio || null, website: form.website || null, location: form.location || null, avatar_url: form.avatar_url || null, cover_url: form.cover_url || null, is_private: form.is_private, ai_interests: form.ai_interests ? form.ai_interests.split(",").map((s) => s.trim()).filter(Boolean) : null };
      if (form.date_of_birth) payload.date_of_birth = new Date(form.date_of_birth).toISOString();
      const res = await fetch(`${API}/users/me`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(Array.isArray(err.detail) ? err.detail.map((d: { msg: string }) => d.msg).join(", ") : err.detail || "Update failed"); }
      setProfile(await res.json()); setSaveSuccess(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setPwError(""); setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    if (pwForm.new_password.length < 6) { setPwError("Min. 6 characters"); return; }
    setPwSaving(true);
    try {
      const res = await fetch(`${API}/users/me/password`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Failed"); }
      setPwSuccess(true); setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (e: unknown) { setPwError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setPwSaving(false); }
  };

  const handleLogout = () => { localStorage.removeItem("allamenia_access_token"); localStorage.removeItem("allamenia_refresh_token"); router.replace("/login"); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="anim-spin w-10 h-10 rounded-full border-2 border-slate-800 border-t-emerald-500" />
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="p-10 text-center max-w-sm bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm mb-5 text-red-400">{fetchError}</p>
        <Link href="/feed" className="inline-flex items-center gap-2 px-7 py-2.5 text-sm bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-800 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to feed
        </Link>
      </div>
    </div>
  );

  if (!profile) return null;

  const displayName = profile.full_name || profile.username;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const coverStyle = profile.cover_url
    ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(236, 72, 153, 0.2) 100%)" };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed pointer-events-none rounded-full -z-0 -top-[20%] -right-[5%] w-[500px] h-[500px] bg-emerald-500/8 blur-[100px]" />
      <div className="fixed pointer-events-none rounded-full -z-0 -bottom-[15%] left-[5%] w-96 h-96 bg-cyan-500/6 blur-[80px]" />

      <AppNavbar />

      {/* Full width container */}
      <div className="relative z-10 w-full pt-20 pb-12">
        {/* Cover Section - Full Width */}
        <div className="relative w-full h-48 sm:h-64 md:h-80" style={coverStyle}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-pink-500 opacity-70" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24">
          {/* Profile Header Card */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl p-5 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar name={displayName} url={profile.avatar_url} size={96} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">{displayName}</h1>
                  {profile.is_verified && (
                    <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 fill-emerald-400/20 shrink-0" />
                  )}
                  {profile.is_private && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{profile.role}</span>
                </div>

                <p className="text-sm sm:text-base mb-3 sm:mb-4 text-slate-500">@{profile.username}</p>
                {profile.bio && <p className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 max-w-2xl text-slate-300">{profile.bio}</p>}

                <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 mb-4 sm:mb-6 text-xs sm:text-sm text-slate-400">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 shrink-0" />
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Joined {joinDate}
                  </span>
                  <span className="flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {profile.email}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-5 sm:gap-8">
                  {[
                    { val: profile.posts_count, label: "Posts", color: "text-emerald-400", href: null },
                    { val: profile.followers_count, label: "Followers", color: "text-cyan-400", href: `/profile/${profile.username}/followers?tab=followers` },
                    { val: profile.following_count, label: "Following", color: "text-pink-400", href: `/profile/${profile.username}/followers?tab=following` },
                  ].map(({ val, label, color, href }) => (
                    href ? (
                      <Link key={label} href={href} className="text-center group cursor-pointer">
                        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${color} group-hover:underline`}>
                          {(val as number).toLocaleString()}
                        </div>
                        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1 text-slate-600 group-hover:text-slate-400">{label}</div>
                      </Link>
                    ) : (
                      <div key={label} className="text-center">
                        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${color}`}>
                          {(val as number).toLocaleString()}
                        </div>
                        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1 text-slate-600">{label}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => { setTab("edit"); setSaveError(""); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-800 hover:border-emerald-500/50 transition-all flex-shrink-0 self-start"
              >
                <Pencil className="w-4 h-4" /> Edit profile
              </button>
            </div>
          </div>

          {/* AI Interests */}
          {profile.ai_interests && profile.ai_interests.length > 0 && (
            <div className="px-5 sm:px-8 py-5 sm:py-6 mb-6 bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Interests
              </p>
              <div className="flex flex-wrap gap-2.5">
                {profile.ai_interests.map((t) => (
                  <span
                    key={t}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="anim-fade-up flex items-center gap-3 px-5 py-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">Profile updated successfully</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["edit", "security"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                  tab === t
                    ? "bg-emerald-500/10 border-2 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-900/50 border-2 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                }`}
              >
                {t === "edit" ? <><Pencil className="w-4 h-4" /> Edit Profile</> : <><ShieldCheck className="w-4 h-4" /> Security</>}
              </button>
            ))}
          </div>

          {/* Edit form */}
          {tab === "edit" && (
            <div className="p-5 sm:p-10 bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl anim-fade-up">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <Pencil className="w-5 h-5 text-emerald-400" /> Edit Your Profile
              </h2>
              <form onSubmit={handleSave} className="flex flex-col gap-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FL>Display name</FL>
                  <input type="text" maxLength={60} placeholder="Your full name" value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="field-glass" />
                </div>
                <div>
                  <FL>Location</FL>
                  <input type="text" maxLength={60} placeholder="City, Country" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} className="field-glass" />
                </div>
              </div>

              <div>
                <FL>Bio <span className="normal-case font-normal tracking-normal text-slate-600">({form.bio.length}/160)</span></FL>
                <textarea maxLength={160} rows={3} placeholder="Tell the world about yourself…" value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="field-glass" style={{ resize: "vertical", lineHeight: 1.7 }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FL>Website</FL>
                  <input type="text" placeholder="https://yoursite.com" value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })} className="field-glass" />
                </div>
                <div>
                  <FL>Date of birth</FL>
                  <input type="date" value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="field-glass" style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FL>Avatar URL</FL>
                  <input type="url" placeholder="https://…/avatar.jpg" value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="field-glass" />
                </div>
                <div>
                  <FL>Cover photo URL</FL>
                  <input type="url" placeholder="https://…/cover.jpg" value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })} className="field-glass" />
                </div>
              </div>

              <div>
                <FL>AI interests <span className="normal-case font-normal tracking-normal text-slate-600">(comma-separated)</span></FL>
                <input type="text" placeholder="e.g. AI, design, web3, music" value={form.ai_interests}
                  onChange={(e) => setForm({ ...form, ai_interests: e.target.value })} className="field-glass" />
              </div>

              <Toggle checked={form.is_private} onChange={() => setForm({ ...form, is_private: !form.is_private })}
                label="Private account" hint="Only approved followers can see your posts" />

              {saveError && (
                <div className="px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-sm text-red-400">{saveError}</div>
              )}

              <div className="flex gap-4 justify-end pt-2">
                <button
                  type="button"
                  className="px-8 py-3 text-sm font-semibold bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-all"
                  onClick={() => setSaveError("")}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving
                    ? <><span className="anim-spin w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950" /> Saving…</>
                    : <><Save className="w-4 h-4" /> Save changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

          {/* Security tab */}
          {tab === "security" && (
            <div className="p-5 sm:p-10 bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl anim-fade-up">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Security Settings
              </h2>
              <p className="text-sm mb-8 text-slate-400">Change your password. You'll stay logged in on this device.</p>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-md">
              <div>
                <FL>Current password</FL>
                <div className="relative">
                  <input type={showCurrent ? "text" : "password"} required placeholder="••••••••"
                    value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                    className="field-glass pr-16" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer">
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <FL>New password</FL>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} required minLength={6} placeholder="Min. 6 characters"
                    value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    className="field-glass pr-16" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer">
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <FL>Confirm new password</FL>
                <input type="password" required placeholder="Repeat new password"
                  value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="field-glass" />
              </div>

              {pwError && <div className="px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-sm text-red-400">{pwError}</div>}
              {pwSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Password updated successfully
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="px-8 py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2 w-fit"
              >
                {pwSaving
                  ? <><span className="anim-spin w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950" /> Updating…</>
                  : <><KeyRound className="w-4 h-4" /> Update password</>
                }
              </button>
            </form>

              {/* Danger zone */}
              <div className="mt-12 pt-8 border-t border-slate-700/50">
                <p className="text-xs font-bold uppercase tracking-widest mb-5 text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Danger zone
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="text-base font-semibold text-slate-200 mb-1">Log out everywhere</p>
                    <p className="text-sm text-slate-500">Clears all tokens and redirects to login</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all shrink-0"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
