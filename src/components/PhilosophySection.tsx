import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const manifestoLines = [
  { text: "Yağmur yağıyor olabilir.", weight: "light" },
  { text: "Moralin bozuk olabilir.", weight: "light" },
  { text: "İçinde hiçbir şey hissetmiyor olabilirsin.", weight: "light" },
  { text: "Ama önemli değil.", weight: "medium" },
  { text: "YAP.", weight: "heavy" },
];

const PhilosophySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const layer1Y = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-32 md:py-48 overflow-hidden"
    >
      {/* Base */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />

      {/* Parallax orbs */}
      <motion.div style={{ y: layer1Y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(16 100% 50% / 0.03) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(0 80% 40% / 0.04) 0%, transparent 70%)" }}
        />
      </motion.div>

      {/* Parallax horizontal lines */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0 opacity-[0.012] pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute left-0 right-0 h-[1px] bg-white" style={{ top: `${10 + i * 9}%` }} />
        ))}
      </motion.div>

      {/* Vertical accent lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[8%] w-[1px] h-full bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="absolute top-0 right-[8%] w-[1px] h-full bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      </div>

      {/* Content */}
      <motion.div style={{ opacity: sectionOpacity }} className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-32 md:mb-40"
        >
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.5em] text-primary/35 uppercase mb-8">
            <span className="w-8 h-[1px] bg-primary/20" />
            Manifesto
            <span className="w-8 h-[1px] bg-primary/20" />
          </span>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 80 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display text-7xl md:text-9xl lg:text-[11rem] text-foreground tracking-wider"
            >
              THE ANVIL
            </motion.h2>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-20 h-[1px] bg-primary/30 mx-auto mt-10"
          />
        </motion.div>

        {/* Manifesto Lines - Cinematic Stamp */}
        <div className="space-y-8 md:space-y-12 mb-32 md:mb-40">
          {manifestoLines.map((line, index) => {
            const isHeavy = line.weight === "heavy";
            const isMedium = line.weight === "medium";

            return (
              <div key={index} className="overflow-hidden">
                <motion.div
                  initial={{ y: 60, opacity: 0, scale: isHeavy ? 1.5 : 1 }}
                  whileInView={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    duration: isHeavy ? 0.8 : 0.6,
                    delay: index * 0.08,
                    ease: isHeavy ? [0.34, 1.56, 0.64, 1] : [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true, margin: "-40px" }}
                  className="text-center"
                >
                  <p className={`font-display tracking-wider leading-tight ${
                    isHeavy
                      ? "text-7xl md:text-9xl lg:text-[10rem] text-primary"
                      : isMedium
                      ? "text-3xl md:text-5xl lg:text-6xl text-foreground"
                      : "text-xl md:text-3xl text-muted-foreground/40"
                  }`}
                  style={isHeavy ? {
                    textShadow: "0 0 60px hsl(16 100% 50% / 0.4), 0 0 120px hsl(16 100% 50% / 0.2)",
                  } : undefined}
                  >
                    {line.text}
                  </p>

                  {isHeavy && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="w-28 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Philosophy Quote - Premium Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl p-10 md:p-14 overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(0 0% 8% / 0.6) 0%, hsl(0 0% 4% / 0.8) 100%)",
              backdropFilter: "blur(24px)",
              border: "1px solid hsl(0 0% 100% / 0.04)",
            }}
          >
            {/* Accent corner */}
            <div className="absolute top-0 left-0 w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/40 to-transparent" />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-primary/40 to-transparent" />
            </div>

            {/* Glowing left border */}
            <div className="absolute left-0 top-10 bottom-10 w-[2px]">
              <div className="w-full h-full bg-gradient-to-b from-primary/0 via-primary/70 to-primary/0" />
              <div className="absolute inset-0 w-[8px] -left-[3px] animate-pulse"
                style={{
                  background: "linear-gradient(to bottom, transparent, hsl(16 100% 50% / 0.3), transparent)",
                  filter: "blur(6px)",
                }}
              />
            </div>

            <div className="pl-8 md:pl-10">
              <blockquote className="text-xl md:text-2xl lg:text-3xl text-foreground/85 leading-relaxed mb-8 font-light">
                "Demirci demiri sevdiği için dövmez.
                <br />
                <span className="text-primary font-normal">
                  Çekiç vurmadan demir şekil almaz.
                </span>"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-10 h-[1px] bg-primary/25" />
                <p className="text-muted-foreground/40 text-[10px] tracking-[0.4em] uppercase">
                  THE FORGE Felsefesi
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-32 h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default PhilosophySection;
