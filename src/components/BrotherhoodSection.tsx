import { motion } from "framer-motion";
import { useState } from "react";
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

const BrotherhoodSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal/50 to-background" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            BROTHERHOOD
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aynı Ateşte Dövülenler
          </p>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <blockquote className="text-2xl md:text-3xl text-foreground font-light italic">
            "Yalnız değilsin.
            <br />
            <span className="text-primary not-italic font-normal">Aynı ocakta dövülen bir kardeşlik seni bekliyor.</span>"
          </blockquote>
        </motion.div>

        {/* Brotherhood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-16">
          {brothers.map((brother, index) => (
            <motion.div
              key={brother.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredId(brother.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="relative aspect-square"
            >
              <div className={`
                absolute inset-0 rounded-sm transition-all duration-500 flex flex-col items-center justify-center
                ${hoveredId === brother.id 
                  ? "bg-card border-primary/50 box-glow" 
                  : "bg-card/50 border-border/30"
                }
                border
              `}>
                {/* Avatar */}
                <div className={`
                  w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-500
                  ${hoveredId === brother.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                  }
                `}>
                  <span className="font-display text-xl md:text-2xl tracking-wider">
                    {brother.initials}
                  </span>
                </div>

                {/* Role */}
                <span className={`
                  text-sm tracking-wider transition-colors duration-500
                  ${hoveredId === brother.id ? "text-primary" : "text-muted-foreground"}
                `}>
                  {brother.role}
                </span>

                {/* Glow overlay */}
                <div className={`
                  absolute inset-0 rounded-sm pointer-events-none transition-opacity duration-500
                  ${hoveredId === brother.id ? "opacity-100" : "opacity-0"}
                `}
                  style={{
                    background: "radial-gradient(circle at 50% 50%, hsl(var(--ember) / 0.15) 0%, transparent 70%)"
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { label: "Aktif Üye", value: "250+" },
            { label: "Tamamlanan Dönüşüm", value: "180+" },
            { label: "Ülke", value: "12" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-4xl md:text-5xl text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground tracking-wider uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <div className="p-4 bg-primary/10 rounded-full border border-primary/30">
            <Users className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrotherhoodSection;
