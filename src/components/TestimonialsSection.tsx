import { motion } from "framer-motion";
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
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            DÖNÜŞÜM
          </h2>
          <p className="text-xl text-muted-foreground">
            Şekil Alan Demir
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full bg-card border border-border/50 rounded-sm p-8 transition-all duration-500 hover:border-primary/30 hover:box-glow">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors duration-500" />
                </div>

                {/* Quote Text */}
                <blockquote className="text-lg text-foreground leading-relaxed mb-8">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="pt-6 border-t border-border/50">
                  <p className="font-display text-xl text-primary tracking-wider mb-1">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {testimonial.title}
                  </p>
                  
                  {/* Transformation Tag */}
                  <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm">
                    <span className="text-xs text-primary tracking-wider">
                      {testimonial.transformation}
                    </span>
                  </div>
                </div>

                {/* Glow overlay on hover */}
                <div 
                  className="absolute inset-0 rounded-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(ellipse at 50% 0%, hsl(var(--ember) / 0.1) 0%, transparent 60%)"
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
