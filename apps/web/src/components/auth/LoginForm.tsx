"use client";
import { useState } from "react";
import Link from "next/link";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        let errMsg = "Invalid email or password.";
        if (Array.isArray(err.detail)) {
          errMsg = err.detail.map((e: any) => e.msg).join(", ");
        } else if (err.detail) {
          errMsg = err.detail;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      localStorage.setItem("allamenia_access_token", data.access_token);
      localStorage.setItem("allamenia_refresh_token", data.refresh_token);
      window.location.href = "/feed";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md anim-fade-up">
      <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-2">
        Welcome back<span className="text-emerald-500">.</span>
      </h1>
      <p className="text-slate-400 mb-9">
        No account?{" "}
        <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
          Sign up free
        </Link>
      </p>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          ["G", "Google", "text-emerald-500"],
          ["⌥", "GitHub", "text-cyan-500"],
        ].map(([icon, name, color]) => (
          <button
            key={name}
            className="flex items-center justify-center gap-2.5 py-3.5 text-sm font-medium text-slate-300 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-900/70 hover:border-slate-700 transition-all backdrop-blur-sm"
          >
            <span className={`font-bold ${color} text-base`}>{icon}</span> {name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600 font-bold tracking-widest px-3 py-1 rounded-full bg-slate-900/50">
          OR
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
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
          <div className="flex justify-between mb-2.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
              Forgot?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder="••••••••"
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
        </div>

        {error && (
          <div className="px-4 py-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          {loading && <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full anim-spin" />}
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </form>
    </div>
  );
}
