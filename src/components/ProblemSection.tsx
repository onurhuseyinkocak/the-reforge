import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [60, 0]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background - dark with subtle top glow */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-64"
        style={{
          background: "linear-gradient(to bottom, hsl(0 80% 40% / 0.04), transparent)",
        }}
      />

      {/* Section Title */}
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="text-center mb-20 md:mb-28 px-4 relative z-10"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="inline-block text-[10px] tracking-[0.5em] text-primary/50 uppercase mb-6"
        >
          Sana Satilan Yalanlar
        </motion.span>

        <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground mb-6 relative">
          <span className="relative">
            UNTEMPERED
            <br />
            STEEL
          </span>
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground/70 max-w-md mx-auto">
          Motivasyon endüstrisinin sana sattığı yalanlar
        </p>
      </motion.div>

      {/* Horizontal Scroll Cards */}
      <div className="relative" ref={scrollContainerRef}>
        <div className="flex gap-5 md:gap-8 px-6 md:px-12 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex-shrink-0 w-4 md:w-16" />

          {lies.map((lie, index) => (
            <motion.div
              key={lie.id}
              initial={{ opacity: 0, y: 60, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex-shrink-0 w-[300px] md:w-[380px] snap-center"
              style={{ perspective: "1000px" }}
            >
              <div className="relative h-[320px] md:h-[360px] group cursor-default">
                {/* Glassmorphism card */}
                <div
                  className="absolute inset-0 rounded-2xl border border-white/[0.06] transition-all duration-700 group-hover:border-primary/20"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(0 0% 100% / 0.03) 0%, hsl(0 0% 100% / 0.01) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, hsl(16 100% 50% / 0.06) 0%, transparent 70%)",
                  }}
                />

                {/* Number watermark */}
                <span className="absolute top-6 right-8 font-display text-[7rem] md:text-[8rem] leading-none text-white/[0.02] group-hover:text-primary/[0.06] transition-colors duration-700 select-none">
                  {String(lie.id).padStart(2, "0")}
                </span>

                {/* X icon */}
                <div className="absolute top-6 left-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <X className="w-5 h-5 text-red-500/60" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
                  <div className="pt-4">
                    <p className="text-lg md:text-xl text-foreground/90 font-medium leading-relaxed mb-5">
                      {lie.text}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground/60 leading-relaxed">
                      {lie.subtext}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-primary/20 group-hover:w-16 group-hover:bg-primary/40 transition-all duration-700" />
                    <span className="text-[10px] tracking-[0.3em] text-primary/30 group-hover:text-primary/50 transition-colors duration-500 uppercase">
                      Yalan #{lie.id}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Final Card - The Truth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[300px] md:w-[380px] snap-center"
          >
            <div className="relative h-[320px] md:h-[360px] rounded-2xl overflow-hidden group cursor-default">
              {/* Animated border glow */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(16 100% 50% / 0.15) 0%, hsl(0 80% 40% / 0.1) 50%, hsl(16 100% 50% / 0.15) 100%)",
                }}
              />
              <div
                className="absolute inset-[1px] rounded-2xl"
                style={{
                  background: "hsl(0 0% 6%)",
                }}
              />

              {/* Inner glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 100%, hsl(16 100% 50% / 0.1) 0%, transparent 60%)",
                }}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="font-display text-4xl md:text-5xl text-primary mb-4 forge-glow"
                >
                  YET YOU
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-foreground/70 font-light"
                >
                  remain unforged.
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mt-8"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex-shrink-0 w-4 md:w-16" />
        </div>

        {/* Edge fade gradients */}
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[hsl(0,0%,4%)] to-transparent pointer-events-none z-10" />
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[hsl(0,0%,4%)] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default ProblemSection;
