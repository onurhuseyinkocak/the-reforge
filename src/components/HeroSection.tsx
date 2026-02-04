import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      
      {/* Radial glow from center */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 50% 70%, hsl(var(--ember) / 0.3) 0%, transparent 50%)"
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="font-display text-7xl md:text-9xl lg:text-[12rem] tracking-wider ember-glow-premium text-primary">
            THE FORGE
          </h1>
        </motion.div>

        {/* Motto */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display text-2xl md:text-4xl text-primary tracking-widest mb-12"
        >
          DISCIPLINE IS FIRE.
        </motion.p>

        {/* Manifesto Line */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-4"
        >
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-smoke leading-relaxed">
            Motivasyon bir yalan.
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
            Disiplin tek gerçek.
          </p>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="w-32 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-16"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-3 cursor-pointer group">
          <span className="text-sm text-muted-foreground tracking-widest uppercase group-hover:text-primary transition-colors">
            Aşağı kaydır. Ateşe adım at.
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
