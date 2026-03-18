import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const manifestoWords = [
  "Motivasyon bir yalan.",
  "Disiplin tek gerçek.",
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.6]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[120vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial glow - deep ember core */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 70%, hsl(16 100% 50% / 0.12) 0%, hsl(0 80% 40% / 0.06) 40%, transparent 70%)",
        }}
      />

      {/* Grid lines for depth */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Dark scroll overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-[hsl(0,0%,4%)] z-[5] pointer-events-none"
      />

      {/* Content */}
      <motion.div
        style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
        className="relative z-20 text-center px-4 max-w-7xl mx-auto"
      >
        {/* Pre-title accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-10"
        />

        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <h1 className="font-display text-[5rem] md:text-[10rem] lg:text-[14rem] xl:text-[16rem] leading-[0.85] tracking-wider text-primary forge-glow">
            THE
            <br />
            FORGE
          </h1>
        </motion.div>

        {/* Motto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="font-display text-2xl md:text-4xl lg:text-5xl text-primary/80 tracking-[0.4em]">
            DİSİPLİN ATEŞTİR
          </p>
        </motion.div>

        {/* Manifesto Lines - staggered reveal */}
        <motion.div
          style={{ y: subtitleY }}
          className="space-y-3 mb-16"
        >
          {manifestoWords.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: 1 + index * 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p
                className={`${
                  index === 0
                    ? "text-xl md:text-3xl font-light text-smoke/60"
                    : "text-2xl md:text-4xl font-medium text-foreground"
                } leading-relaxed`}
              >
                {line}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Link to="/apply">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="
                relative group overflow-hidden
                font-display text-lg md:text-xl tracking-[0.3em]
                px-12 py-5
                bg-transparent
                text-primary
                border border-primary/40
                transition-all duration-700
                hover:border-primary hover:shadow-[0_0_60px_hsl(16_100%_50%/0.3)]
              "
            >
              {/* Sweep fill on hover */}
              <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10 group-hover:text-[hsl(0,0%,4%)] transition-colors duration-500">
                OCAGA GIR
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-4 cursor-pointer group">
          <span className="text-[10px] text-muted-foreground/60 tracking-[0.5em] uppercase group-hover:text-primary/80 transition-colors duration-500">
            Aşağı kaydır. Ateşe adım at.
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Glowing line */}
            <div className="w-[1px] h-12 bg-gradient-to-b from-primary/60 to-transparent" />
            <ChevronDown className="w-4 h-4 text-primary/40 absolute -bottom-4 left-1/2 -translate-x-1/2" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[hsl(0,0%,4%)] via-[hsl(0,0%,4%)/0.8] to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
