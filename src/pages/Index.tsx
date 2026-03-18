import EmberParticles from "@/components/EmberParticles";
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
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Global Ember Particles */}
      <EmberParticles />
      
      {/* Ambient Forge Sound */}
      <AmbientSound />

      {/* Main Content */}
      <main className="relative z-0">
        <HeroSection />
        <ProblemSection />
        <PhilosophySection />
        <ProgramSection />
        <BrotherhoodSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl text-primary tracking-wider">
            THE FORGE
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} THE FORGE. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
