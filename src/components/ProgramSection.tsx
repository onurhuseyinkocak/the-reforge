import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Dumbbell, Brain, Briefcase, Heart } from "lucide-react";

const pillars = [
  {
    id: 1,
    title: "PHYSICAL",
    subtitle: "Beden",
    icon: Dumbbell,
    description: "Bedenini bir savaşçı gibi inşa et. Güç, dayanıklılık, disiplin.",
    details: ["Kişiselleştirilmiş antrenman programı", "Beslenme planı", "Uyku optimizasyonu", "Düzenli check-in'ler"],
    accentColor: "16 100% 50%",
  },
  {
    id: 2,
    title: "MENTAL",
    subtitle: "Zihin",
    icon: Brain,
    description: "Zihnini çelikleştir. Odak, netlik, kararlılık.",
    details: ["Günlük rutinler", "Meditasyon & mindfulness", "Hedef belirleme", "Öz-disiplin pratikleri"],
    accentColor: "30 100% 50%",
  },
  {
    id: 3,
    title: "CAREER",
    subtitle: "Kariyer",
    icon: Briefcase,
    description: "Profesyonel yaşamında iz bırak. Liderlik, strateji, icra.",
    details: ["Kariyer yol haritası", "Networking stratejileri", "Sunum becerileri", "Finansal planlama"],
    accentColor: "40 100% 50%",
  },
  {
    id: 4,
    title: "RELATIONSHIPS",
    subtitle: "İlişkiler",
    icon: Heart,
    description: "Derin, anlamlı bağlar kur. Saygı, güven, etki.",
    details: ["İletişim becerileri", "Sınır koyma", "Sosyal dinamikler", "Liderlik aurası"],
    accentColor: "0 80% 50%",
  },
];

const phases = [
  { label: "Kırılma", week: "1-6", icon: "I" },
  { label: "Şekillenme", week: "7-12", icon: "II" },
  { label: "Sertleşme", week: "13-18", icon: "III" },
  { label: "Keskinlik", week: "19-24", icon: "IV" },
];

const ProgramSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressWidth = useTransform(scrollYProgress, [0.15, 0.7], ["0%", "100%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const handlePillarToggle = (id: number) => {
    setActivePillar((prev) => (prev === id ? null : id));
  };

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,3%)]" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 40%, hsl(16 100% 50% / 0.03) 0%, transparent 60%)",
        }} />
      </motion.div>

      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="absolute top-0 right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      </div>

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
            Program
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
              24 WEEKS
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-base md:text-lg text-muted-foreground/50 mt-6"
          >
            Birebir mentorluk ile dönüşüm
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-6 mt-20">
          <div className="relative h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              style={{ width: progressWidth }}
              className="absolute inset-y-0 left-0 rounded-full"
            >
              <div className="w-full h-full rounded-full" style={{
                background: "linear-gradient(90deg, hsl(0 80% 40%), hsl(16 100% 50%), hsl(30 100% 60%))",
              }} />
            </motion.div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between max-w-3xl mx-auto mb-6 px-1">
          <span className="text-[9px] tracking-[0.3em] text-muted-foreground/30 uppercase font-display">Raw Iron</span>
          <span className="text-[9px] tracking-[0.3em] text-primary/50 uppercase font-display">Sharp Steel</span>
        </div>

        {/* Phase markers */}
        <div className="max-w-3xl mx-auto mb-28">
          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="font-display text-lg text-primary/20 mb-2 group-hover:text-primary/40 transition-colors duration-300">
                  {phase.icon}
                </div>
                <div className="text-[9px] tracking-[0.2em] text-muted-foreground/25 mb-1">
                  Hafta {phase.week}
                </div>
                <div className="text-xs text-foreground/40 font-display tracking-wider">
                  {phase.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Four Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {pillars.map((pillar, index) => {
            const isActive = activePillar === pillar.id;
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true }}
                onHoverStart={() => setActivePillar(pillar.id)}
                onHoverEnd={() => setActivePillar(null)}
                onClick={() => handlePillarToggle(pillar.id)}
                className={`relative group cursor-pointer ${isActive ? "z-10" : ""}`}
              >
                <div className={`
                  relative h-full rounded-2xl p-8 md:p-10 transition-all duration-700 overflow-hidden border
                  ${isActive
                    ? "border-primary/20 shadow-[0_0_50px_hsl(16_100%_50%/0.06)]"
                    : "border-white/[0.03] hover:border-white/[0.06]"
                  }
                `}
                style={{
                  background: isActive
                    ? "linear-gradient(145deg, hsl(0 0% 9% / 0.9) 0%, hsl(0 0% 5% / 0.95) 100%)"
                    : "linear-gradient(145deg, hsl(0 0% 7% / 0.8) 0%, hsl(0 0% 4% / 0.9) 100%)",
                  backdropFilter: "blur(24px)",
                }}>
                  {/* Top accent line on active */}
                  <motion.div
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-center"
                  />

                  {/* Background glow */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
                    style={{
                      background: `radial-gradient(ellipse at 30% 20%, hsl(${pillar.accentColor} / 0.06) 0%, transparent 60%)`,
                    }}
                  />

                  {/* Icon */}
                  <div className={`
                    relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-500
                    ${isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary/60"}
                  `}
                  style={{
                    background: isActive ? "hsl(16 100% 50% / 0.1)" : "hsl(0 0% 100% / 0.02)",
                    border: `1px solid ${isActive ? "hsl(16 100% 50% / 0.2)" : "hsl(0 0% 100% / 0.04)"}`,
                  }}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <div className="relative z-10 mb-2">
                    <h3 className="font-display text-3xl md:text-4xl text-foreground tracking-wider">
                      {pillar.title}
                    </h3>
                    <span className="text-[9px] tracking-[0.3em] text-primary/25 uppercase">
                      {pillar.subtitle}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="relative z-10 text-muted-foreground/50 leading-relaxed mb-6 text-sm">
                    {pillar.description}
                  </p>

                  {/* Details - expand */}
                  <motion.div
                    initial={false}
                    animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden relative z-10"
                  >
                    <ul className="space-y-3 pt-6 border-t border-white/[0.04]">
                      {pillar.details.map((detail, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex items-center gap-3 text-sm text-foreground/60"
                        >
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full flex-shrink-0" />
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Corner accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary/30 to-transparent" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary/30 to-transparent" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mentor Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full"
            style={{
              background: "hsl(16 100% 50% / 0.04)",
              border: "1px solid hsl(16 100% 50% / 0.1)",
            }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs text-primary/70 tracking-[0.25em] uppercase">
              Her adımda yanında bir mentor
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramSection;
