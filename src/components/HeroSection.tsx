import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.8]);
  const lineWidth = useTransform(scrollYProgress, [0, 0.3], ["0%", "100%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[130vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Deep black base */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />

      {/* Animated gradient mesh - follows mouse subtly */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 60%, hsl(16 100% 50% / 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 30% 40%, hsl(0 80% 40% / 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 30% 40% at 70% 30%, hsl(30 100% 50% / 0.04) 0%, transparent 50%)
            `,
          }}
        />
      </motion.div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Diagonal decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute top-0 left-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="absolute top-0 right-[40%] w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      </div>

      {/* Dark scroll overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-[hsl(0,0%,3%)] z-[5] pointer-events-none"
      />

      {/* Content */}
      <motion.div
        style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        className="relative z-20 text-center px-4 max-w-7xl mx-auto"
      >
        {/* Pre-title label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.6em] text-primary/40 uppercase">
            <span className="w-12 h-[1px] bg-primary/30" />
            Disiplin Ocagi
            <span className="w-12 h-[1px] bg-primary/30" />
          </span>
        </motion.div>

        {/* Main Title - Staggered character reveal */}
        <div className="mb-8 overflow-hidden">
          <motion.h1
            initial={{ y: 120, rotateX: 40 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="font-display text-[6rem] md:text-[12rem] lg:text-[16rem] xl:text-[18rem] leading-[0.82] tracking-wider text-primary"
            style={{
              textShadow: "0 0 80px hsl(16 100% 50% / 0.3), 0 0 160px hsl(16 100% 50% / 0.1)",
            }}
          >
            THE
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 120, rotateX: 40 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="font-display text-[6rem] md:text-[12rem] lg:text-[16rem] xl:text-[18rem] leading-[0.82] tracking-wider text-foreground"
          >
            FORGE
          </motion.h1>
        </div>

        {/* Subtitle with line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 mb-16 flex items-center justify-center gap-6"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-transparent to-primary/50 origin-left"
          />
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="font-display text-xl md:text-3xl lg:text-4xl text-primary/70"
          >
            DISIPLIN ATESTIR
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 md:w-24 h-[1px] bg-gradient-to-l from-transparent to-primary/50 origin-right"
          />
        </motion.div>

        {/* Manifesto lines */}
        <motion.div className="space-y-2 mb-16">
          {["Motivasyon bir yalan.", "Disiplin tek gercek."].map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${i === 0 ? "text-lg md:text-2xl font-light text-foreground/40" : "text-xl md:text-3xl font-medium text-foreground/90"}`}
              >
                {line}
              </motion.p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button - Premium with sweep + glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <Link to="/apply">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px hsl(16 100% 50% / 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="relative group overflow-hidden font-display text-lg md:text-xl tracking-[0.3em] px-14 py-6 bg-transparent text-primary border border-primary/30 transition-all duration-700 hover:border-primary"
            >
              <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{
                background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.1), transparent)",
              }} />
              <span className="relative z-10 group-hover:text-[hsl(0,0%,4%)] transition-colors duration-500">
                OCAGA GIR
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - Minimalist */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-[9px] text-muted-foreground/40 tracking-[0.6em] uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-primary/40 to-transparent" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[hsl(0,0%,3%)] via-[hsl(0,0%,3%)/0.7] to-transparent z-10 pointer-events-none" />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 z-20 opacity-20">
        <div className="w-12 h-[1px] bg-primary/50" />
        <div className="w-[1px] h-12 bg-primary/50" />
      </div>
      <div className="absolute top-8 right-8 z-20 opacity-20">
        <div className="w-12 h-[1px] bg-primary/50 ml-auto" />
        <div className="w-[1px] h-12 bg-primary/50 ml-auto" />
      </div>
    </section>
  );
};

export default HeroSection;
