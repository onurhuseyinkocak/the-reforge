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

const principles = [
  { label: "Disiplin", value: "HER GÜN" },
  { label: "Hesap Verebilirlik", value: "HER AN" },
  { label: "Kardeşlik", value: "SONSUZA DEK" },
];

const BrotherhoodSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />

      {/* Ambient glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{ background: "radial-gradient(ellipse, hsl(16 100% 50% / 0.03) 0%, transparent 70%)" }}
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
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.5em] text-primary/35 uppercase mb-8">
            <span className="w-8 h-[1px] bg-primary/20" />
            Topluluk
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
              BROTHERHOOD
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-base md:text-lg text-muted-foreground/45 mt-6"
          >
            Aynı Ateşte Dövülenler
          </motion.p>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-28 max-w-2xl mx-auto"
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl text-foreground/75 font-light leading-relaxed">
            "Yalnız değilsin.
            <br />
            <span className="text-primary font-normal">
              Aynı ocakta dövülen bir kardeşlik seni bekliyor.
            </span>"
          </blockquote>
        </motion.div>

        {/* Brotherhood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-28 max-w-3xl mx-auto">
          {brothers.map((brother, index) => {
            const isHovered = hoveredId === brother.id;
            return (
              <motion.div
                key={brother.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredId(brother.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => setHoveredId((prev) => (prev === brother.id ? null : brother.id))}
                className="relative aspect-square cursor-pointer"
              >
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-500 flex flex-col items-center justify-center
                  border overflow-hidden
                  ${isHovered ? "border-primary/20 shadow-[0_0_40px_hsl(16_100%_50%/0.06)]" : "border-white/[0.03] hover:border-white/[0.06]"}
                `}
                style={{
                  background: isHovered
                    ? "linear-gradient(145deg, hsl(0 0% 9%) 0%, hsl(0 0% 5%) 100%)"
                    : "linear-gradient(145deg, hsl(0 0% 7%) 0%, hsl(0 0% 4%) 100%)",
                }}>
                  {/* Glow on hover */}
                  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
                    style={{ background: "radial-gradient(circle at 50% 30%, hsl(16 100% 50% / 0.07) 0%, transparent 70%)" }}
                  />

                  {/* Avatar */}
                  <div className={`
                    w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 border
                    ${isHovered ? "bg-primary/10 border-primary/25 text-primary" : "bg-white/[0.02] border-white/[0.05] text-muted-foreground/35"}
                  `}>
                    <span className="font-display text-lg md:text-xl tracking-wider">{brother.initials}</span>
                  </div>

                  <span className={`text-[10px] tracking-[0.2em] transition-colors duration-500 ${isHovered ? "text-primary/60" : "text-muted-foreground/25"}`}>
                    {brother.role}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-0">
            {principles.map((item, index) => (
              <div key={index} className="text-center px-8 md:px-16 relative">
                {index > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/[0.04]" />
                )}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="font-display text-4xl md:text-5xl text-primary mb-2"
                  style={{ textShadow: "0 0 30px hsl(16 100% 50% / 0.3)" }}
                >
                  {item.value}
                </motion.p>
                <p className="text-[9px] text-muted-foreground/35 tracking-[0.3em] uppercase">
                  {item.label}
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
          <div className="p-5 rounded-full" style={{
            background: "hsl(16 100% 50% / 0.04)",
            border: "1px solid hsl(16 100% 50% / 0.1)",
          }}>
            <Users className="w-7 h-7 text-primary/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrotherhoodSection;
