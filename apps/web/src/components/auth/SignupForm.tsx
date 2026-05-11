"use client";
import { useState } from "react";
import Link from "next/link";

const STEPS = [
  { label: "Account", hint: "Email & password" },
  { label: "Profile", hint: "Name & username" },
  { label: "Interests", hint: "Personalize feed" },
];

const INTERESTS = [
  "Technology", "Design", "Music", "Art", "Gaming", "Science",
  "Travel", "Food", "Sports", "Finance", "Photography", "Writing",
  "Film", "Fashion", "Health", "Crypto", "Anime", "Books",
];

function StrengthBar({ value }: { value: string }) {
  if (!value) return null;
  const score = Math.min(4, Math.floor(value.length / 3));
  const colors = ["#ef4444", "#f97316", "#eab308", "#10b981"];
  const labels = ["Too short", "Weak", "Fair", "Strong", "Secure"];
  return (
    <div className="mt-3">
      <div className="flex gap-1.5 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? colors[score - 1] : "var(--border)",
              boxShadow: i <= score ? `0 0 6px ${colors[score - 1]}40` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: score > 0 ? colors[score - 1] : "var(--text-dim)" }}>
        {labels[score]}
      </span>
    </div>
  );
}

export function SignupForm() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", full_name: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = (item: string) =>
    setInterests((p) => (p.includes(item) ? p.filter((i) => i !== item) : [...p, item]));

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const signupRes = await fetch(`${apiUrl}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          username: form.username,
          full_name: form.full_name || undefined,
        }),
      });
      if (!signupRes.ok) {
        const err = await signupRes.json();
        let errMsg = "Signup failed";
        if (Array.isArray(err.detail)) {
          errMsg = err.detail.map((e: any) => e.msg).join(", ");
        } else if (err.detail) {
          errMsg = err.detail;
        }
        throw new Error(errMsg);
      }

      const loginRes = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!loginRes.ok) {
        window.location.href = "/login";
        return;
      }

      const tokenData = await loginRes.json();
      localStorage.setItem("allamenia_access_token", tokenData.access_token);
      localStorage.setItem("allamenia_refresh_token", tokenData.refresh_token);

      await fetch(`${apiUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({ ai_interests: interests }),
      });

      window.location.href = "/feed";
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md anim-fade-up">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full transition-all duration-300"
                style={{
                  background: i < step ? "var(--accent)" : i === step ? "var(--bg-card)" : "var(--bg-card)",
                  color: i < step ? "#0a0f14" : i === step ? "var(--accent)" : "var(--text-dim)",
                  border: i === step ? "2px solid var(--accent)" : i < step ? "2px solid var(--accent)" : "1px solid var(--border)",
                  boxShadow: i <= step ? "0 0 15px var(--accent-glow)" : "none",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i === step && <span className="text-sm font-semibold text-slate-100 tracking-wide">{s.label}</span>}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-7 h-0.5 mx-2 rounded-full transition-all duration-300"
                style={{
                  background: i < step ? "var(--accent)" : "var(--border)",
                  boxShadow: i < step ? "0 0 8px var(--accent-glow)" : "none",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={next}>
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-2">
                Create account<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-slate-400">
                Already have one?{" "}
                <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
            <div className="mt-1">
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 pr-16 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 hover:text-emerald-500 tracking-widest transition-colors"
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
              <StrengthBar value={form.password} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5 anim-fade-up">
            <div>
              <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-2">
                Your profile<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-slate-400">How should people find you?</p>
            </div>
            <div className="mt-1">
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                Full name
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm font-semibold">
                  @
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  placeholder="yourhandle"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })
                  }
                  className="w-full pl-9 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">Letters, numbers, _ and . only</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="anim-fade-up">
            <div className="mb-7">
              <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-2">
                Your interests<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-slate-400">Pick at least 3 to personalize your feed.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {INTERESTS.map((item) => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggle(item)}
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{
                      background: active ? "var(--accent)" : "rgba(15, 20, 25, 0.6)",
                      color: active ? "#0a0f14" : "var(--text-secondary)",
                      border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                      boxShadow: active ? "0 0 20px var(--accent-glow)" : "none",
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-600">
              {interests.length} selected{interests.length < 3 && ` — ${3 - interests.length} more needed`}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 px-4 py-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading || (step === 2 && interests.length < 3)}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-35 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            {loading && <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full anim-spin" />}
            {loading ? "Creating..." : step < 2 ? "Continue →" : "Create account →"}
          </button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-sm text-slate-500 hover:text-slate-400 py-2.5 text-center transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
