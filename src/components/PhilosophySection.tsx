import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const manifestoLines = [
  "Yağmur yağıyor olabilir.",
  "Moralin bozuk olabilir.",
  "İçinde hiçbir şey hissetmiyor olabilirsin.",
  "Ama önemli değil.",
  "YAP.",
];

const PhilosophySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const layer1Y = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-32 md:py-44 overflow-hidden"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Parallax Background Layer 1 - Large diffuse orbs */}
      <motion.div style={{ y: layer1Y }} className="absolute inset-0">
        <div
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(16 100% 50% / 0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(0 80% 40% / 0.05) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Parallax Background Layer 2 */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        <div
          className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(30 100% 60% / 0.03) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Parallax Background Layer 3 - horizontal lines */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0 opacity-[0.015]">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-[1px] bg-white"
            style={{ top: `${15 + i * 10}%` }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: sectionOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-4"
      >
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-28 md:mb-36"
        >
          <span className="inline-block text-[10px] tracking-[0.5em] text-primary/40 uppercase mb-6">
            Manifesto
          </span>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground">
            THE ANVIL
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-16 h-[1px] bg-primary/40 mx-auto mt-8"
          />
        </motion.div>

        {/* Manifesto Lines - Stamp Effect */}
        <div className="space-y-6 md:space-y-10 mb-28 md:mb-36">
          {manifestoLines.map((line, index) => {
            const isLast = index === manifestoLines.length - 1;
            const isSecondLast = index === manifestoLines.length - 2;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.8, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                className="text-center"
              >
                <p
                  className={`font-display tracking-wider leading-tight ${
                    isLast
                      ? "text-6xl md:text-8xl lg:text-9xl text-primary forge-glow"
                      : isSecondLast
                      ? "text-3xl md:text-5xl text-foreground"
                      : "text-2xl md:text-3xl text-muted-foreground/50"
                  }`}
                >
                  {line}
                </p>

                {/* Accent line under "YAP." */}
                {isLast && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Philosophy Quote - Glassmorphism blockquote */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Glassmorphism container */}
          <div
            className="relative rounded-2xl p-8 md:p-12 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid hsl(0 0% 100% / 0.04)",
            }}
          >
            {/* Ember-glowing left border */}
            <div className="absolute left-0 top-8 bottom-8 w-[2px]">
              <div className="w-full h-full bg-gradient-to-b from-primary/0 via-primary/80 to-primary/0" />
              {/* Pulsing glow */}
              <div
                className="absolute inset-0 w-[6px] -left-[2px] animate-pulse"
                style={{
                  background: "linear-gradient(to bottom, transparent, hsl(16 100% 50% / 0.4), transparent)",
                  filter: "blur(4px)",
                }}
              />
            </div>

            <div className="pl-6 md:pl-8">
              <blockquote className="text-xl md:text-2xl lg:text-3xl text-foreground/90 leading-relaxed mb-6 font-light">
                "Demirci demiri sevdiği için dövmez.
                <br />
                <span className="text-primary font-normal">
                  Çekiç vurmadan demir şekil almaz.
                </span>
                "
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-primary/30" />
                <p className="text-muted-foreground/50 text-xs tracking-[0.3em] uppercase">
                  — THE FORGE Felsefesi
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-28 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default PhilosophySection;
