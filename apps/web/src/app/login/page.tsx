import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="noise" style={{ minHeight:"100vh", display:"flex", background:"var(--bg)", position:"relative", overflow:"hidden" }}>
      {/* Ambient orbs */}
      <div style={{ position:"fixed", top:"-25%", left:"10%", width:600, height:600, background:"rgba(167,139,250,0.07)", borderRadius:"50%", filter:"blur(100px)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-20%", right:"20%", width:400, height:400, background:"rgba(103,232,249,0.04)", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none" }} />

      {/* ── Left — glass panel (hidden on mobile) ── */}
      <div style={{ flex:1, flexDirection:"column", justifyContent:"space-between", padding:"48px 56px", position:"relative", borderRight:"1px solid var(--border)" }}
        className="auth-left hidden lg:flex">

        <Link href="/" style={{ display:"flex", alignItems:"center", gap:4, position:"relative", zIndex:1 }}>
          <span style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-heading)" }}>ALLAMENIA</span>
          <span className="glow-dot" style={{ marginBottom:8 }} />
        </Link>

        <div style={{ position:"relative", zIndex:1, marginTop:"auto", marginBottom:"auto" }}>
          {/* Quote card */}
          <div className="neo-glow dot-grid" style={{ padding:"40px 32px", position:"relative", overflow:"hidden", maxWidth:440 }}>
            <div style={{ position:"absolute", top:0, left:0, width:80, height:2, background:"var(--accent)", opacity:0.6 }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:48, color:"var(--accent)", opacity:0.3, marginBottom:8, fontFamily:"serif", lineHeight:1 }}>&ldquo;</div>
              <blockquote style={{ fontSize:28, fontWeight:700, color:"var(--text)", lineHeight:1.2, letterSpacing:"-0.03em", marginBottom:28, fontFamily:"var(--font-heading)" }}>
                The only platform where I actually enjoy scrolling.
              </blockquote>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--accent-dim)", border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:"var(--accent)", boxShadow:"0 0 15px var(--accent-glow)" }}>SK</div>
                <div>
                  <p style={{ fontSize:15, fontWeight:600, color:"var(--text)" }}>Sarah Kim</p>
                  <p style={{ fontSize:13, color:"var(--text-muted)" }}>@sarah_k · 1.2M followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:0, borderTop:"1px solid var(--border)", paddingTop:32, position:"relative", zIndex:1 }}>
          {[["12M+","Active users","var(--accent)"],["190+","Countries","var(--cyan)"],["99.9%","Uptime","var(--green)"]].map(([v,l,color],i)=>(
            <div key={l} style={{ flex:1, paddingRight:28, borderRight: i<2 ? "1px solid var(--border)" : "none", paddingLeft: i>0 ? 28 : 0 }}>
              <div style={{ fontSize:24, fontWeight:700, color:color as string, letterSpacing:"-0.03em", fontFamily:"var(--font-heading)", textShadow:`0 0 20px ${color}40` }}>{v}</div>
              <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 lg:max-w-[560px] flex flex-col items-center justify-center px-5 sm:px-10 lg:px-14 py-10 relative z-1 w-full">
        {/* Logo (visible on mobile) */}
        <div className="w-full max-w-md mb-8 lg:mb-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span style={{ fontSize:16, fontWeight:700, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-heading)" }}>ALLAMENIA</span>
            <span className="glow-dot" style={{ width:6, height:6, marginBottom:6 }} />
          </Link>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
