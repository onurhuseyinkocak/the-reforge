import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Users } from "lucide-react";

const brothers = [
  { id: 1, initials: "AK", role: "Girişimci" },
  { id: 2, initials: "ME", role: "Mühendis" },
  { id: 3, initials: "BY", role: "Avukat" },
  { id: 4, initials: "CT", role: "Doktor" },
  { id: 5, initials: "FZ", role: "Sanatçı" },
  { id: 6, initials: "HS", role: "Sporcu" },
  { id: 7, initials: "KD", role: "Yönetici" },
  { id: 8, initials: "LM", role: "Öğretmen" },
];

const stats = [
  { label: "Aktif Üye", value: "250+", suffix: "" },
  { label: "Tamamlanan Dönüşüm", value: "180+", suffix: "" },
  { label: "Ülke", value: "12", suffix: "" },
];

const BrotherhoodSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Parallax ambient glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse, hsl(16 100% 50% / 0.04) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-block text-[10px] tracking-[0.5em] text-primary/40 uppercase mb-6">
            Topluluk
          </span>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground mb-6">
            BROTHERHOOD
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/60 max-w-lg mx-auto">
            Aynı Ateşte Dövülenler
          </p>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-24 max-w-2xl mx-auto"
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl text-foreground/80 font-light leading-relaxed">
            "Yalnız değilsin.
            <br />
            <span className="text-primary font-normal">
              Aynı ocakta dövülen bir kardeşlik seni bekliyor.
            </span>
            "
          </blockquote>
        </motion.div>

        {/* Brotherhood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-24 max-w-3xl mx-auto">
          {brothers.map((brother, index) => (
            <motion.div
              key={brother.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredId(brother.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() =>
                setHoveredId((prev) =>
                  prev === brother.id ? null : brother.id
                )
              }
              className="relative aspect-square cursor-pointer"
            >
              <div
                className={`
                  absolute inset-0 rounded-2xl transition-all duration-600 flex flex-col items-center justify-center
                  border overflow-hidden
                  ${
                    hoveredId === brother.id
                      ? "border-primary/25 shadow-[0_0_30px_hsl(16_100%_50%/0.08)]"
                      : "border-white/[0.04] hover:border-white/[0.08]"
                  }
                `}
                style={{
                  background:
                    hoveredId === brother.id
                      ? "linear-gradient(135deg, hsl(0 0% 100% / 0.04) 0%, hsl(16 100% 50% / 0.02) 100%)"
                      : "linear-gradient(135deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Radial glow on hover */}
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-600 ${
                    hoveredId === brother.id ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle at 50% 40%, hsl(16 100% 50% / 0.08) 0%, transparent 70%)",
                  }}
                />

                {/* Avatar */}
                <div
                  className={`
                    w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center mb-3 transition-all duration-500
                    border
                    ${
                      hoveredId === brother.id
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-white/[0.03] border-white/[0.06] text-muted-foreground/40"
                    }
                  `}
                >
                  <span className="font-display text-lg md:text-xl tracking-wider">
                    {brother.initials}
                  </span>
                </div>

                {/* Role */}
                <span
                  className={`text-xs tracking-[0.2em] transition-colors duration-500 ${
                    hoveredId === brother.id
                      ? "text-primary/70"
                      : "text-muted-foreground/30"
                  }`}
                >
                  {brother.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-0">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center px-8 md:px-16 relative"
              >
                {/* Divider between stats */}
                {index > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/[0.06]" />
                )}

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="font-display text-5xl md:text-6xl text-primary mb-2 forge-glow"
                >
                  {stat.value}
                </motion.p>
                <p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div
            className="p-5 rounded-full"
            style={{
              background: "hsl(16 100% 50% / 0.06)",
              border: "1px solid hsl(16 100% 50% / 0.12)",
            }}
          >
            <Users className="w-7 h-7 text-primary/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrotherhoodSection;
