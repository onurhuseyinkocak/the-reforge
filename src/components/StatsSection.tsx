import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { target: 500, suffix: "+", label: "Dövülen Kardeş", prefix: "" },
  { target: 24, suffix: "", label: "Hafta Program", prefix: "" },
  { target: 96, suffix: "%", label: "Başarı Oranı", prefix: "" },
  { target: 4, suffix: "", label: "Yaşam Alanı", prefix: "" },
];

const StatsSection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(0,0%,5%)]" />

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(16 100% 50% / 0.04) 0%, transparent 60%)",
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.5em] text-primary/50 uppercase">
            <span className="w-8 h-[1px] bg-primary/30" />
            Rakamlar
            <span className="w-8 h-[1px] bg-primary/30" />
          </span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="relative">
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-white/[0.06]" />
              )}
              <AnimatedCounter
                target={stat.target}
                suffix={stat.suffix}
                prefix={stat.prefix}
                label={stat.label}
                duration={2 + i * 0.3}
                className="font-display text-5xl md:text-7xl text-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
