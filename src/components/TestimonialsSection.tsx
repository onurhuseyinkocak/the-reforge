import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "6 ay önce kendimden nefret ediyordum. Şimdi aynaya baktığımda gördüğüm adamla gurur duyuyorum.",
    author: "E.K.",
    title: "32, Yazılım Mühendisi",
    transformation: "18 kg kas, terfi, ilk ciddi ilişki",
  },
  {
    id: 2,
    quote: "Motivasyon kitaplarına binlerce lira harcadım. THE FORGE'da ilk hafta onlardan daha çok şey öğrendim.",
    author: "A.Y.",
    title: "28, Girişimci",
    transformation: "Şirket kuruluşu, fitness dönüşümü",
  },
  {
    id: 3,
    quote: "Disiplin gerçekten ateş. Ve o ateş içindeki her şeyi yakıp, seni yeniden şekillendiriyor.",
    author: "M.T.",
    title: "35, Avukat",
    transformation: "Kariyer sıçraması, mental netlik",
  },
];

const TestimonialsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(0,0%,5%)]" />

      {/* Ambient glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px]"
          style={{ background: "radial-gradient(ellipse, hsl(16 100% 50% / 0.06) 0%, transparent 70%)" }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-28"
        >
          <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.5em] text-primary/60 uppercase mb-8">
            <span className="w-8 h-[1px] bg-primary/40" />
            Dönüşümler
            <span className="w-8 h-[1px] bg-primary/40" />
          </span>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 80 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display text-7xl md:text-9xl lg:text-[11rem] text-foreground tracking-wider"
            >
              REFORGED
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-base md:text-lg text-muted-foreground/70 mt-6 tracking-wider"
          >
            Steel Becomes Blade
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full rounded-2xl p-8 md:p-10 transition-all duration-700 border bg-[#111111] border-white/[0.08] hover:border-primary/20 overflow-hidden"
              >
                {/* Top accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-primary/30 transition-all duration-700" />

                {/* Top glow on hover */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: "radial-gradient(ellipse at 50% -20%, hsl(16 100% 50% / 0.06) 0%, transparent 60%)" }}
                />

                {/* Quote Icon */}
                <div className="mb-8 relative z-10">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500"
                    style={{
                      background: "hsl(16 100% 50% / 0.08)",
                      border: "1px solid hsl(16 100% 50% / 0.15)",
                    }}
                  >
                    <Quote className="w-4 h-4 text-primary/60 group-hover:text-primary/80 transition-colors duration-500" />
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="relative z-10 text-lg md:text-xl text-foreground/75 leading-relaxed mb-10 font-light">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="relative z-10 pt-6 border-t border-white/[0.08]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-display tracking-wider"
                      style={{
                        background: "hsl(16 100% 50% / 0.10)",
                        border: "1px solid hsl(16 100% 50% / 0.18)",
                        color: "hsl(16 100% 50% / 0.7)",
                      }}
                    >
                      {testimonial.author}
                    </div>
                    <div>
                      <p className="font-display text-lg text-primary/70 tracking-wider">{testimonial.author}</p>
                      <p className="text-[10px] text-muted-foreground/60">{testimonial.title}</p>
                    </div>
                  </div>

                  {/* Transformation Tag */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 group-hover:border-primary/15"
                    style={{
                      background: "hsl(16 100% 50% / 0.06)",
                      border: "1px solid hsl(16 100% 50% / 0.12)",
                    }}
                  >
                    <span className="w-1 h-1 bg-primary/60 rounded-full" />
                    <span className="text-[9px] text-primary/70 tracking-[0.15em] uppercase">
                      {testimonial.transformation}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
