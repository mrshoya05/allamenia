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
      {/* Ambient orbs */}
      <div style={{ position:"fixed", top:"-30%", right:"-15%", width:"min(800px, 80vw)", height:"min(800px, 80vw)", background:"rgba(167,139,250,0.06)", borderRadius:"50%", filter:"blur(120px)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-30%", left:"-15%", width:"min(700px, 70vw)", height:"min(700px, 70vw)", background:"rgba(103,232,249,0.04)", borderRadius:"50%", filter:"blur(120px)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:"40%", left:"50%", width:"min(500px, 60vw)", height:"min(500px, 60vw)", background:"rgba(244,114,182,0.03)", borderRadius:"50%", filter:"blur(100px)", pointerEvents:"none", zIndex:0 }} />

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
