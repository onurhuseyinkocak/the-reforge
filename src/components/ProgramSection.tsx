import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Dumbbell, Brain, Briefcase, Heart } from "lucide-react";

const pillars = [
  {
    id: 1,
    title: "PHYSICAL",
    icon: Dumbbell,
    description: "Bedenini bir savaşçı gibi inşa et. Güç, dayanıklılık, disiplin.",
    details: ["Kişiselleştirilmiş antrenman programı", "Beslenme planı", "Uyku optimizasyonu", "Düzenli check-in'ler"],
  },
  {
    id: 2,
    title: "MENTAL",
    icon: Brain,
    description: "Zihnini çelikleştir. Odak, netlik, kararlılık.",
    details: ["Günlük rutinler", "Meditasyon & mindfulness", "Hedef belirleme", "Öz-disiplin pratikleri"],
  },
  {
    id: 3,
    title: "CAREER",
    icon: Briefcase,
    description: "Profesyonel yaşamında iz bırak. Liderlik, strateji, icra.",
    details: ["Kariyer yol haritası", "Networking stratejileri", "Sunum becerileri", "Finansal planlama"],
  },
  {
    id: 4,
    title: "RELATIONSHIPS",
    icon: Heart,
    description: "Derin, anlamlı bağlar kur. Saygı, güven, etki.",
    details: ["İletişim becerileri", "Sınır koyma", "Sosyal dinamikler", "Liderlik aurası"],
  },
];

const ProgramSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressWidth = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            24 WEEKS
          </h2>
          <p className="text-xl text-muted-foreground">
            Birebir mentorluk ile dönüşüm
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-secondary rounded-full mb-20 overflow-hidden max-w-2xl mx-auto">
          <motion.div
            style={{ width: progressWidth }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-ember-dark via-primary to-ember-glow rounded-full"
          />
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-[2px] h-full bg-background/50" />
            ))}
          </div>
        </div>

        {/* Transformation Labels */}
        <div className="flex justify-between max-w-2xl mx-auto mb-20 px-4">
          <span className="text-sm text-muted-foreground">Raw Iron</span>
          <span className="text-sm text-primary font-medium">Sharp Steel</span>
        </div>

        {/* Four Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setActivePillar(pillar.id)}
              onHoverEnd={() => setActivePillar(null)}
              className={`relative group cursor-pointer ${
                activePillar === pillar.id ? "z-10" : ""
              }`}
            >
              <div className={`
                relative h-full bg-card border rounded-sm p-8 transition-all duration-500
                ${activePillar === pillar.id 
                  ? "border-primary/50 box-glow scale-[1.02]" 
                  : "border-border/50 hover:border-primary/30"
                }
              `}>
                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-sm flex items-center justify-center mb-6 transition-all duration-500
                  ${activePillar === pillar.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground group-hover:text-primary"
                  }
                `}>
                  <pillar.icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3 tracking-wider">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Details - Reveal on hover */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: activePillar === pillar.id ? "auto" : 0,
                    opacity: activePillar === pillar.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 pt-4 border-t border-border/50">
                    {pillar.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Corner accent */}
                <div className={`
                  absolute top-0 right-0 w-12 h-12 transition-opacity duration-500
                  ${activePillar === pillar.id ? "opacity-100" : "opacity-0"}
                `}>
                  <div className="absolute top-0 right-0 w-full h-[2px] bg-primary" />
                  <div className="absolute top-0 right-0 w-[2px] h-full bg-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mentor Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/30 rounded-sm">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary tracking-wider uppercase">
              Her adımda yanında bir mentor
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramSection;
