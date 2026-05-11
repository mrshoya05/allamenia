export const revalidate = 86400;

import { Navbar }            from "@/components/home/Navbar";
import { HeroSection }       from "@/components/home/HeroSection";
import { StatsSection }      from "@/components/home/StatsSection";
import { FeaturesSection }   from "@/components/home/FeaturesSection";
import { AppPreviewSection } from "@/components/home/AppPreviewSection";
import { CTASection }        from "@/components/home/CTASection";
import { Footer }            from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="noise" style={{ background:"var(--bg)", minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      {/* Large ambient orbs for atmosphere */}
      <div style={{ position:"fixed", top:"-30%", right:"-15%", width:800, height:800, background:"rgba(167,139,250,0.06)", borderRadius:"50%", filter:"blur(120px)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-30%", left:"-15%", width:700, height:700, background:"rgba(103,232,249,0.04)", borderRadius:"50%", filter:"blur(120px)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:"40%", left:"50%", width:500, height:500, background:"rgba(244,114,182,0.03)", borderRadius:"50%", filter:"blur(100px)", pointerEvents:"none", zIndex:0 }} />

      <Navbar />
      <main style={{ paddingTop: 80, position:"relative", zIndex:1 }}>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <AppPreviewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
