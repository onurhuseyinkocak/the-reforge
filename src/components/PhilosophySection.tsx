import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const manifestoLines = [
  "Yağmur yağıyor olabilir.",
  "Moralin bozuk olabilir.",
  "İçinde hiçbir şey hissetmiyor olabilirsin.",
  "Ama önemli değil.",
  "YAP."
];

const PhilosophySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax for background layers
  const layer1Y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="relative min-h-screen py-32 overflow-hidden">
      {/* Parallax Background Layers */}
      <motion.div
        style={{ y: layer1Y }}
        className="absolute inset-0 opacity-5"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ember-dark/30 rounded-full blur-2xl" />
      </motion.div>

      <motion.div
        style={{ y: layer2Y }}
        className="absolute inset-0 opacity-10"
      >
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-ember-glow/20 rounded-full blur-xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            THE ANVIL
          </h2>
          <div className="w-24 h-[2px] bg-primary mx-auto" />
        </motion.div>

        {/* Manifesto Lines - Stamp Effect */}
        <div className="space-y-8 mb-24">
          {manifestoLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.15,
                ease: [0.34, 1.56, 0.64, 1] // Bouncy
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center"
            >
              <p className={`font-display tracking-wider ${
                index === manifestoLines.length - 1 
                  ? "text-5xl md:text-7xl text-primary ember-glow"
                  : index === manifestoLines.length - 2
                    ? "text-3xl md:text-4xl text-foreground"
                    : "text-2xl md:text-3xl text-muted-foreground"
              }`}>
                {line}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Philosophy Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="border-l-2 border-primary/50 pl-8 py-4">
            <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-4">
              "Demirci demiri sevdiği için dövmez.
              <br />
              <span className="text-primary">Çekiç vurmadan demir şekil almaz.</span>"
            </blockquote>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              — THE FORGE Felsefesi
            </p>
          </div>
        </motion.div>

        {/* Visual Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-24 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      </div>
    </section>
  );
};

export default PhilosophySection;
