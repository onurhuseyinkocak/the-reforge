import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with radial gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, hsl(var(--ember) / 0.2) 0%, transparent 50%)"
        }}
      />

      {/* Animated particles flowing toward center */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: typeof window !== "undefined" ? window.innerHeight + 100 : 1000,
              opacity: 0,
            }}
            animate={{
              x: "50vw",
              y: "50vh",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        {/* Pre-text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-xl md:text-2xl text-muted-foreground mb-8"
        >
          Bahanelerin burada bitiyor.
        </motion.p>

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-12 tracking-wider"
        >
          OCAĞA
          <br />
          <span className="text-gradient-ember ember-glow-strong">GİRMEYE</span>
          <br />
          HAZIR MISIN?
        </motion.h2>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            className="
              group relative overflow-hidden
              font-display text-xl md:text-2xl tracking-widest
              px-12 py-8 h-auto
              bg-primary hover:bg-primary
              text-primary-foreground
              border-2 border-primary
              transition-all duration-500
              hover:shadow-[0_0_40px_hsl(var(--ember)/0.5)]
            "
          >
            {/* Background glow animation */}
            <span 
              className="absolute inset-0 bg-gradient-to-r from-ember-dark via-primary to-ember-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <span className="relative z-10 flex items-center gap-3">
              OCAĞA GİR
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 text-sm text-muted-foreground"
        >
          24 haftalık dönüşüm programına başvur
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary/50 rounded-full" />
            Sınırlı kontenjan
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary/50 rounded-full" />
            Birebir mentor
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary/50 rounded-full" />
            Sonuç garantisi
          </span>
        </motion.div>
      </div>

      {/* Bottom motto */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="font-display text-primary/50 tracking-[0.3em] text-sm">
          DİSİPLİN ATEŞTİR
        </p>
      </motion.div>
    </section>
  );
};

export default CTASection;
