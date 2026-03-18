import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const glowScale = useTransform(scrollYProgress, [0.2, 0.6], [0.5, 1.2]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.15, 0.05]);

  // Pre-calculate particle positions for SSR safety
  const particles = useMemo(
    () =>
      [...Array(30)].map((_, i) => ({
        id: i,
        startX: Math.random() * 100,
        startY: 100 + Math.random() * 20,
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 4,
        size: Math.random() * 2 + 0.5,
      })),
    []
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scroll-linked radial glow */}
      <motion.div
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(16 100% 50% / 0.4) 0%, hsl(0 80% 40% / 0.2) 30%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Animated particles converging to center */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: `hsl(${16 + Math.random() * 20} 100% ${50 + Math.random() * 20}%)`,
              boxShadow: `0 0 ${p.size * 4}px hsl(16 100% 50% / 0.4)`,
            }}
            initial={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              opacity: 0,
            }}
            animate={{
              left: ["initial", "50%"],
              top: ["initial", "50%"],
              opacity: [0, 0.8, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Pre-text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-lg md:text-2xl text-muted-foreground/50 mb-10 font-light"
        >
          Bahanelerin burada bitiyor.
        </motion.p>

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] text-foreground mb-14 tracking-wider leading-[0.9]"
        >
          OCAĞA
          <br />
          <span className="text-primary forge-glow">GİRMEYE</span>
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
          <Link to="/apply">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="
                group relative overflow-hidden
                font-display text-xl md:text-2xl tracking-[0.3em]
                px-14 py-6
                bg-primary
                text-[hsl(0,0%,4%)]
                transition-all duration-700
                hover:shadow-[0_0_80px_hsl(16_100%_50%/0.4)]
              "
            >
              {/* Shimmer effect */}
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.15), transparent)",
                }}
              />

              {/* Gradient overlay on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-ember-dark via-primary to-ember-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="relative z-10 flex items-center gap-4">
                OCAĞA GİR
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 text-sm text-muted-foreground/40"
        >
          24 haftalık dönüşüm programına başvur
        </motion.p>

        {/* Pricing link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-4"
        >
          <Link
            to="/pricing"
            className="text-sm text-primary/60 hover:text-primary transition-colors duration-300 tracking-wider"
          >
            Fiyatlandırma &rarr;
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {[
            "Sınırlı kontenjan",
            "Birebir mentorluk",
            "Sonuç garantili",
          ].map((text, index) => (
            <span
              key={index}
              className="flex items-center gap-3 text-xs text-muted-foreground/30 tracking-[0.2em] uppercase"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/40" />
              </span>
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom motto */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-10 left-0 right-0 text-center"
      >
        <p className="font-display text-primary/20 tracking-[0.5em] text-[10px] uppercase">
          Discipline Is Fire
        </p>
      </motion.div>
    </section>
  );
};

export default CTASection;
