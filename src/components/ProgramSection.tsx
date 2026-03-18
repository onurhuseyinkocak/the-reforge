import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Dumbbell, Brain, Briefcase, Heart } from "lucide-react";

const pillars = [
  {
    id: 1,
    title: "PHYSICAL",
    subtitle: "Beden",
    icon: Dumbbell,
    description:
      "Bedenini bir savaşçı gibi inşa et. Güç, dayanıklılık, disiplin.",
    details: [
      "Kişiselleştirilmiş antrenman programı",
      "Beslenme planı",
      "Uyku optimizasyonu",
      "Düzenli check-in'ler",
    ],
    gradient: "from-orange-500/10 to-red-500/5",
  },
  {
    id: 2,
    title: "MENTAL",
    subtitle: "Zihin",
    icon: Brain,
    description: "Zihnini çelikleştir. Odak, netlik, kararlılık.",
    details: [
      "Günlük rutinler",
      "Meditasyon & mindfulness",
      "Hedef belirleme",
      "Öz-disiplin pratikleri",
    ],
    gradient: "from-amber-500/10 to-orange-500/5",
  },
  {
    id: 3,
    title: "CAREER",
    subtitle: "Kariyer",
    icon: Briefcase,
    description:
      "Profesyonel yaşamında iz bırak. Liderlik, strateji, icra.",
    details: [
      "Kariyer yol haritası",
      "Networking stratejileri",
      "Sunum becerileri",
      "Finansal planlama",
    ],
    gradient: "from-yellow-500/10 to-amber-500/5",
  },
  {
    id: 4,
    title: "RELATIONSHIPS",
    subtitle: "İlişkiler",
    icon: Heart,
    description: "Derin, anlamlı bağlar kur. Saygı, güven, etki.",
    details: [
      "İletişim becerileri",
      "Sınır koyma",
      "Sosyal dinamikler",
      "Liderlik aurası",
    ],
    gradient: "from-red-500/10 to-orange-500/5",
  },
];

const phases = [
  { label: "Kırılma", week: "1-6" },
  { label: "Şekillenme", week: "7-12" },
  { label: "Sertleşme", week: "13-18" },
  { label: "Keskinlik", week: "19-24" },
];

const ProgramSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressWidth = useTransform(
    scrollYProgress,
    [0.15, 0.7],
    ["0%", "100%"]
  );

  // Mobile touch support: toggle on tap
  const handlePillarToggle = (id: number) => {
    setActivePillar((prev) => (prev === id ? null : id));
  };

  return (
    <section ref={containerRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 50%, hsl(16 100% 50% / 0.03) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

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
            Program
          </span>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground mb-6">
            24 WEEKS
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/70">
            Birebir mentorluk ile dönüşüm
          </p>
        </motion.div>

        {/* Progress Bar - Scroll-linked */}
        <div className="max-w-3xl mx-auto mb-6 mt-16">
          <div className="relative h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              style={{ width: progressWidth }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ember-dark via-primary to-ember-glow"
            />

            {/* Tick marks */}
            <div className="absolute inset-0 flex justify-between">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-[1px] h-full bg-[hsl(0,0%,4%)]/60"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Transformation Labels */}
        <div className="flex justify-between max-w-3xl mx-auto mb-6 px-1">
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground/40 uppercase">
            Raw Iron
          </span>
          <span className="text-[10px] tracking-[0.3em] text-primary/60 uppercase">
            Sharp Steel
          </span>
        </div>

        {/* Phase markers */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground/30 mb-1">
                  Hafta {phase.week}
                </div>
                <div className="text-xs text-foreground/50 font-display tracking-wider">
                  {phase.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Four Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {pillars.map((pillar, index) => {
            const isActive = activePillar === pillar.id;

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
                className={`relative group cursor-pointer ${
                  isActive ? "z-10" : ""
                }`}
              >
                {/* Card */}
                <div
                  className={`
                    relative h-full rounded-2xl p-8 md:p-10 transition-all duration-700 overflow-hidden
                    border
                    ${
                      isActive
                        ? "border-primary/30 shadow-[0_0_40px_hsl(16_100%_50%/0.08)]"
                        : "border-white/[0.04] hover:border-white/[0.08]"
                    }
                  `}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, hsl(0 0% 100% / 0.04) 0%, hsl(16 100% 50% / 0.02) 100%)"
                      : "linear-gradient(135deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Background gradient on active */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} transition-opacity duration-700 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Icon */}
                  <div
                    className={`
                      relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-500
                      ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-white/[0.04] text-muted-foreground/50 group-hover:text-primary/60"
                      }
                    `}
                  >
                    <pillar.icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <div className="relative z-10 mb-2">
                    <h3 className="font-display text-3xl md:text-4xl text-foreground tracking-wider">
                      {pillar.title}
                    </h3>
                    <span className="text-[10px] tracking-[0.3em] text-primary/30 uppercase">
                      {pillar.subtitle}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="relative z-10 text-muted-foreground/60 leading-relaxed mb-6 text-sm md:text-base">
                    {pillar.description}
                  </p>

                  {/* Details - Reveal on hover/tap */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isActive ? "auto" : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden relative z-10"
                  >
                    <ul className="space-y-3 pt-6 border-t border-white/[0.06]">
                      {pillar.details.map((detail, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={
                            isActive
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -10 }
                          }
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex items-center gap-3 text-sm text-foreground/70"
                        >
                          <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Corner accent */}
                  <div
                    className={`absolute top-0 right-0 w-16 h-16 transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary/40 to-transparent" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary/40 to-transparent" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mentor Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div
            className="inline-flex items-center gap-4 px-8 py-4 rounded-full"
            style={{
              background: "hsl(16 100% 50% / 0.06)",
              border: "1px solid hsl(16 100% 50% / 0.12)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm text-primary/80 tracking-[0.2em] uppercase">
              Her adımda yanında bir mentor
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramSection;
