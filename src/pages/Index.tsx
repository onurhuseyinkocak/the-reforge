import EmberParticles from "@/components/EmberParticles";
import FloatingNav from "@/components/FloatingNav";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import PhilosophySection from "@/components/PhilosophySection";
import ProgramSection from "@/components/ProgramSection";
import BrotherhoodSection from "@/components/BrotherhoodSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import AmbientSound from "@/components/AmbientSound";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden grain-overlay">
      {/* Floating Navigation */}
      <FloatingNav />

      {/* Global Ember Particles */}
      <EmberParticles />

      {/* Ambient Forge Sound */}
      <AmbientSound />

      {/* Main Content */}
      <main className="relative z-0">
        <HeroSection />
        <div id="manifesto">
          <ProblemSection />
          <PhilosophySection />
        </div>
        <div id="program">
          <ProgramSection />
        </div>
        <div id="brotherhood">
          <BrotherhoodSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-12 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <p className="font-display text-2xl text-primary tracking-wider">
                THE FORGE
              </p>
              <div className="w-8 h-[1px] bg-primary/20" />
              <p className="text-[10px] tracking-[0.3em] text-primary/30 uppercase">
                Discipline Is Fire
              </p>
            </div>
            <p className="text-xs text-muted-foreground/30 tracking-wider">
              © {new Date().getFullYear()} THE FORGE. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
