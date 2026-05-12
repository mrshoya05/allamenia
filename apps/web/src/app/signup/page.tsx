import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account" };

const PERKS = [
  { icon:"⚡", text:"AI-powered feed that learns your taste", color:"var(--accent)" },
  { icon:"🛡️", text:"No ads. No data selling. Ever.", color:"var(--cyan)" },
  { icon:"🔴", text:"Real-time updates across all devices", color:"var(--pink)" },
  { icon:"🎨", text:"Post text, images, video, polls and more", color:"var(--green)" },
  { icon:"🔒", text:"Private accounts with granular controls", color:"var(--accent)" },
];

export default function SignupPage() {
  return (
    <div className="noise" style={{ minHeight:"100vh", display:"flex", background:"var(--bg)", position:"relative", overflow:"hidden" }}>
      {/* Ambient orbs */}
      <div style={{ position:"fixed", bottom:"-25%", right:"5%", width:600, height:600, background:"rgba(103,232,249,0.05)", borderRadius:"50%", filter:"blur(100px)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", top:"-20%", left:"30%", width:400, height:400, background:"rgba(244,114,182,0.04)", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none" }} />

      {/* ── Left panel (hidden on mobile) ── */}
      <div style={{ flex:1, flexDirection:"column", justifyContent:"space-between", padding:"48px 56px", position:"relative", borderRight:"1px solid var(--border)" }}
        className="auth-left hidden lg:flex">

        <Link href="/" style={{ display:"flex", alignItems:"center", gap:4, position:"relative", zIndex:1 }}>
          <span style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-heading)" }}>ALLAMENIA</span>
          <span className="glow-dot" style={{ marginBottom:8 }} />
        </Link>

        <div style={{ position:"relative", zIndex:1, marginTop:"auto", marginBottom:"auto" }}>
          <div className="glass" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", marginBottom:24, fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"var(--accent)", textTransform:"uppercase" }}>
            <span>✦</span> Why join
          </div>
          <h2 style={{ fontSize:38, fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:40, fontFamily:"var(--font-heading)" }}>
            Join 12 million<br />people already<br />here<span style={{ color:"var(--accent)" }}>.</span>
          </h2>
          <ul style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {PERKS.map((p)=>(
              <li key={p.text} style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:42, height:42, borderRadius:"var(--radius-sm)", background:`${p.color}15`, border:`1px solid ${p.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, boxShadow:`0 0 15px ${p.color}20` }}>{p.icon}</div>
                <span style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.5 }}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="neo-glow" style={{ padding:"28px 28px", position:"relative", zIndex:1, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, width:48, height:2, background:"var(--cyan)", opacity:0.5 }} />
          <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.7, marginBottom:18, fontStyle:"italic" }}>
            &ldquo;Switched from Twitter 8 months ago. Haven&apos;t looked back once.&rdquo;
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--cyan-dim)", border:"1px solid rgba(103,232,249,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"var(--cyan)", boxShadow:"0 0 10px var(--cyan-glow)" }}>AM</div>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>Arjun Mehta</p>
              <p style={{ fontSize:12, color:"var(--text-muted)" }}>@arjun.dev · 89k followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 lg:max-w-[560px] flex flex-col items-center justify-center px-5 sm:px-10 lg:px-14 py-10 relative z-1 w-full">
        <div className="w-full max-w-md mb-8 lg:mb-10">
          <Link href="/" className="inline-flex items-center gap-1">
            <span style={{ fontSize:16, fontWeight:700, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-heading)" }}>ALLAMENIA</span>
            <span className="glow-dot" style={{ width:6, height:6, marginBottom:6 }} />
          </Link>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
