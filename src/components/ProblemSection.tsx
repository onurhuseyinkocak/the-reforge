import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const lies = [
  { id: 1, text: "\"Sadece kendine inan, başarı gelecek.\"", subtext: "Yıllardır inanıyorsun. Nerede başarı?" },
  { id: 2, text: "\"Pozitif düşün, pozitif ol.\"", subtext: "Düşünce eylemi değiştirmez. Eylem düşünceyi değiştirir." },
  { id: 3, text: "\"Motivasyonunu bul.\"", subtext: "Motivasyon geçicidir. Yağmurda eriyip gider." },
  { id: 4, text: "\"Kendini sev, olduğun gibi.\"", subtext: "Potansiyelinin çok altındasın. Ve bunu biliyorsun." },
  { id: 5, text: "\"Hissettiğinde yap.\"", subtext: "Hissetmiyorsun. Hiç hissetmeyeceksin. Yine de yap." },
];

const ProblemSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Section Title */}
      <motion.div
        style={{ opacity }}
        className="text-center mb-20 px-4"
      >
        <h2 className="font-display text-5xl md:text-7xl text-foreground mb-4">
          UNTEMPERED STEEL
        </h2>
        <p className="text-xl text-muted-foreground">
          Motivasyon endüstrisinin sana sattığı yalanlar
        </p>
      </motion.div>

      {/* Horizontal Scroll Cards */}
      <div className="relative">
        <div className="flex gap-6 px-8 pb-8 overflow-x-auto horizontal-scroll snap-x snap-mandatory">
          <div className="flex-shrink-0 w-8" /> {/* Spacer */}
          
          {lies.map((lie, index) => (
            <motion.div
              key={lie.id}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex-shrink-0 w-80 md:w-96 snap-center"
            >
              <div className="relative h-64 bg-card border border-border/50 rounded-sm p-8 flex flex-col justify-between group hover:border-primary/30 transition-all duration-500">
                {/* Crack overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Number */}
                <span className="absolute top-4 right-4 font-display text-6xl text-primary/10 group-hover:text-primary/20 transition-colors">
                  {String(lie.id).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="relative z-10">
                  <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed mb-4">
                    {lie.text}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    {lie.subtext}
                  </p>
                </div>

                {/* Bottom line */}
                <div className="w-12 h-[2px] bg-primary/30 group-hover:w-full group-hover:bg-primary/50 transition-all duration-700" />
              </div>
            </motion.div>
          ))}

          {/* Final Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-80 md:w-96 snap-center"
          >
            <div className="h-64 border-2 border-primary/50 rounded-sm p-8 flex flex-col items-center justify-center text-center box-glow">
              <p className="font-display text-3xl md:text-4xl text-primary mb-4">
                YET YOU
              </p>
              <p className="text-xl text-foreground">
                remain unforged.
              </p>
              <div className="w-16 h-[2px] bg-primary mt-6" />
            </div>
          </motion.div>

          <div className="flex-shrink-0 w-8" /> {/* Spacer */}
        </div>

        {/* Scroll hint gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default ProblemSection;
