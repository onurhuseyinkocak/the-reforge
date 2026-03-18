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

  const glowScale = useTransform(scrollYProgress, [0.2, 0.6], [0.3, 1.5]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.12, 0.03]);

  const particles = useMemo(
    () =>
      [...Array(25)].map((_, i) => ({
        id: i,
        startX: Math.random() * 100,
        startY: 100 + Math.random() * 20,
        duration: 5 + Math.random() * 4,
        delay: Math.random() * 5,
        size: Math.random() * 2.5 + 0.5,
        hue: 16 + Math.random() * 20,
      })),
    []
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.01]" style={{
        backgroundImage: "linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Scroll-linked glow */}
      <motion.div
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none"
      >
        <div className="w-full h-full rounded-full" style={{
          background: "radial-gradient(circle, hsl(16 100% 50% / 0.35) 0%, hsl(0 80% 40% / 0.15) 30%, transparent 70%)",
        }} />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: `hsl(${p.hue} 100% ${55 + Math.random() * 15}%)`,
              boxShadow: `0 0 ${p.size * 5}px hsl(16 100% 50% / 0.3)`,
            }}
            initial={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              opacity: 0,
            }}
            animate={{
              left: ["initial", "50%"],
              top: ["initial", "50%"],
              opacity: [0, 0.7, 0.5, 0],
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
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-lg md:text-2xl text-muted-foreground/40 mb-12 font-light"
        >
          Bahanelerin burada bitiyor.
        </motion.p>

        {/* Main Headline */}
        <div className="mb-16">
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 100 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] text-foreground tracking-wider leading-[0.9]"
            >
              OCAĞA
            </motion.h2>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 100 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] text-primary tracking-wider leading-[0.9]"
              style={{ textShadow: "0 0 60px hsl(16 100% 50% / 0.3), 0 0 120px hsl(16 100% 50% / 0.15)" }}
            >
              GİRMEYE
            </motion.h2>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 100 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] text-foreground tracking-wider leading-[0.9]"
            >
              HAZIR MISIN?
            </motion.h2>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link to="/apply">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 80px hsl(16 100% 50% / 0.35)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden font-display text-xl md:text-2xl tracking-[0.3em] px-16 py-7 bg-primary text-[hsl(0,0%,4%)] transition-all duration-700"
            >
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.15), transparent)" }}
              />

              {/* Gradient overlay */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, hsl(0 80% 40%), hsl(16 100% 50%), hsl(30 100% 60%))" }}
              />

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
          className="mt-8 text-sm text-muted-foreground/35"
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
          <Link to="/pricing"
            className="text-sm text-primary/50 hover:text-primary transition-colors duration-300 tracking-wider"
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
          className="mt-20 flex flex-wrap justify-center gap-8 md:gap-12"
        >
          {["Sınırlı kontenjan", "Birebir mentorluk", "Sonuç garantili"].map((text, index) => (
            <span key={index} className="flex items-center gap-3 text-[10px] text-muted-foreground/25 tracking-[0.25em] uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/30 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/30" />
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
        <p className="font-display text-primary/15 tracking-[0.6em] text-[9px] uppercase">
          Discipline Is Fire
        </p>
      </motion.div>
    </section>
  );
};

export default CTASection;
