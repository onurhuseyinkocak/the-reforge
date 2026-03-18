import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { X } from "lucide-react";

const lies = [
  {
    id: 1,
    text: "\"Sadece kendine inan, başarı gelecek.\"",
    subtext: "Yıllardır inanıyorsun. Nerede başarı?",
  },
  {
    id: 2,
    text: "\"Pozitif düşün, pozitif ol.\"",
    subtext: "Düşünce eylemi değiştirmez. Eylem düşünceyi değiştirir.",
  },
  {
    id: 3,
    text: "\"Motivasyonunu bul.\"",
    subtext: "Motivasyon geçicidir. Yağmurda eriyip gider.",
  },
  {
    id: 4,
    text: "\"Kendini sev, olduğun gibi.\"",
    subtext: "Potansiyelinin çok altındasın. Ve bunu biliyorsun.",
  },
  {
    id: 5,
    text: "\"Hissettiğinde yap.\"",
    subtext: "Hissetmiyorsun. Hiç hissetmeyeceksin. Yine de yap.",
  },
];

const ProblemSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [80, 0]);
  const counterY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />

      {/* Gradient atmosphere */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(0 80% 30% / 0.06) 0%, transparent 60%)",
      }} />

      {/* Large background number */}
      <motion.div style={{ y: counterY }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="font-display text-[30rem] md:text-[50rem] leading-none text-white/[0.01]">
          05
        </span>
      </motion.div>

      {/* Section Title */}
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="text-center mb-24 md:mb-32 px-4 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.5em] text-primary/40 uppercase">
            <span className="w-8 h-[1px] bg-primary/20" />
            Sana Satılan Yalanlar
            <span className="w-8 h-[1px] bg-primary/20" />
          </span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: 100 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="font-display text-7xl md:text-9xl lg:text-[11rem] text-foreground tracking-wider"
          >
            UNTEMPERED
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: 100 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="font-display text-7xl md:text-9xl lg:text-[11rem] text-primary/20 tracking-wider"
          >
            STEEL
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-base md:text-lg text-muted-foreground/50 max-w-md mx-auto mt-8"
        >
          Motivasyon endüstrisinin sana sattığı yalanlar
        </motion.p>
      </motion.div>

      {/* Horizontal Scroll Cards */}
      <div className="relative">
        <div className="flex gap-5 md:gap-8 px-6 md:px-12 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex-shrink-0 w-4 md:w-24" />

          {lies.map((lie, index) => (
            <motion.div
              key={lie.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-50px" }}
              onHoverStart={() => setHoveredCard(lie.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="flex-shrink-0 w-[320px] md:w-[400px] snap-center"
              style={{ perspective: "1000px" }}
            >
              <motion.div
                animate={{
                  rotateY: hoveredCard === lie.id ? 2 : 0,
                  rotateX: hoveredCard === lie.id ? -2 : 0,
                }}
                transition={{ duration: 0.4 }}
                className="relative h-[340px] md:h-[380px] group cursor-default"
              >
                {/* Card background */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.04] group-hover:border-primary/15 transition-all duration-700"
                  style={{
                    background: "linear-gradient(145deg, hsl(0 0% 8% / 0.8) 0%, hsl(0 0% 5% / 0.9) 100%)",
                    backdropFilter: "blur(24px)",
                  }}
                />

                {/* Top accent line */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent group-hover:via-primary/20 transition-all duration-700" />

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 0%, hsl(16 100% 50% / 0.06) 0%, transparent 60%)",
                  }}
                />

                {/* Number */}
                <span className="absolute top-6 right-8 font-display text-[8rem] md:text-[9rem] leading-none text-white/[0.015] group-hover:text-primary/[0.05] transition-colors duration-700 select-none">
                  {String(lie.id).padStart(2, "0")}
                </span>

                {/* X icon on hover */}
                <motion.div
                  initial={false}
                  animate={{ opacity: hoveredCard === lie.id ? 1 : 0, y: hoveredCard === lie.id ? 0 : 8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-6 left-8"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                    background: "hsl(0 70% 50% / 0.1)",
                    border: "1px solid hsl(0 70% 50% / 0.2)",
                  }}>
                    <X className="w-3.5 h-3.5 text-red-400/70" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
                  <div className="pt-8">
                    <p className="text-lg md:text-xl text-foreground/85 font-medium leading-relaxed mb-5 relative">
                      {lie.text}
                      {/* Strikethrough on hover */}
                      <motion.span
                        initial={false}
                        animate={{ scaleX: hoveredCard === lie.id ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-1/2 w-full h-[2px] bg-red-500/50 origin-left"
                      />
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/50 leading-relaxed">
                      {lie.subtext}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={false}
                      animate={{ width: hoveredCard === lie.id ? 48 : 24 }}
                      transition={{ duration: 0.5 }}
                      className="h-[1px] bg-primary/20 group-hover:bg-primary/40"
                    />
                    <span className="text-[9px] tracking-[0.3em] text-primary/25 group-hover:text-primary/50 transition-colors duration-500 uppercase">
                      Yalan #{lie.id}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Final Card - The Truth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[320px] md:w-[400px] snap-center"
          >
            <div className="relative h-[340px] md:h-[380px] rounded-2xl overflow-hidden group cursor-default">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "linear-gradient(135deg, hsl(16 100% 50% / 0.2) 0%, hsl(0 80% 40% / 0.1) 50%, hsl(16 100% 50% / 0.2) 100%)",
              }} />
              <div className="absolute inset-[1px] rounded-2xl bg-[hsl(0,0%,4%)]" />

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: "radial-gradient(ellipse at 50% 100%, hsl(16 100% 50% / 0.08) 0%, transparent 60%)",
              }} />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="font-display text-5xl md:text-6xl text-primary mb-3" style={{
                    textShadow: "0 0 40px hsl(16 100% 50% / 0.4), 0 0 80px hsl(16 100% 50% / 0.2)",
                  }}>
                    YET YOU
                  </p>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-foreground/60 font-light tracking-wider"
                >
                  remain unforged.
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent mt-8"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex-shrink-0 w-4 md:w-24" />
        </div>

        {/* Edge fades */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[hsl(0,0%,3%)] to-transparent pointer-events-none z-10" />
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[hsl(0,0%,3%)] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default ProblemSection;
