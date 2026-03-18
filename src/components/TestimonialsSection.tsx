import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "6 ay önce kendimden nefret ediyordum. Şimdi aynaya baktığımda gördüğüm adamla gurur duyuyorum.",
    author: "E.K.",
    title: "32, Yazılım Mühendisi",
    transformation: "18 kg kas, terfi, ilk ciddi ilişki",
  },
  {
    id: 2,
    quote:
      "Motivasyon kitaplarına binlerce lira harcadım. THE FORGE'da ilk hafta onlardan daha çok şey öğrendim.",
    author: "A.Y.",
    title: "28, Girişimci",
    transformation: "Şirket kuruluşu, fitness dönüşümü",
  },
  {
    id: 3,
    quote:
      "Disiplin gerçekten ateş. Ve o ateş içindeki her şeyi yakıp, seni yeniden şekillendiriyor.",
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

  const bgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

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

      {/* Ambient glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse, hsl(16 100% 50% / 0.03) 0%, transparent 70%)",
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
          className="text-center mb-24"
        >
          <span className="inline-block text-[10px] tracking-[0.5em] text-primary/40 uppercase mb-6">
            Dönüşümler
          </span>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground mb-6">
            REFORGED
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/60">
            Steel Becomes Blade
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
              <div
                className="relative h-full rounded-2xl p-8 md:p-10 transition-all duration-700 border border-white/[0.04] hover:border-primary/20 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% -20%, hsl(16 100% 50% / 0.08) 0%, transparent 60%)",
                  }}
                />

                {/* Quote Icon */}
                <div className="mb-8 relative z-10">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500"
                    style={{
                      background: "hsl(16 100% 50% / 0.06)",
                      border: "1px solid hsl(16 100% 50% / 0.1)",
                    }}
                  >
                    <Quote className="w-4 h-4 text-primary/50 group-hover:text-primary/80 transition-colors duration-500" />
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="relative z-10 text-lg md:text-xl text-foreground/80 leading-relaxed mb-10 font-light">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="relative z-10 pt-6 border-t border-white/[0.04]">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar placeholder */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-display tracking-wider transition-all duration-500"
                      style={{
                        background: "hsl(16 100% 50% / 0.08)",
                        border: "1px solid hsl(16 100% 50% / 0.15)",
                        color: "hsl(16 100% 50% / 0.7)",
                      }}
                    >
                      {testimonial.author}
                    </div>
                    <div>
                      <p className="font-display text-lg text-primary/80 tracking-wider">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-muted-foreground/40">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>

                  {/* Transformation Tag */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 group-hover:border-primary/20"
                    style={{
                      background: "hsl(16 100% 50% / 0.04)",
                      border: "1px solid hsl(16 100% 50% / 0.08)",
                    }}
                  >
                    <span className="w-1 h-1 bg-primary/50 rounded-full" />
                    <span className="text-[10px] text-primary/60 tracking-[0.15em] uppercase">
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
