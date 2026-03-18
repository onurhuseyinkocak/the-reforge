import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Home } from "lucide-react";
import { motion } from "framer-motion";

/* ──────────────────────────────────────────────
   Floating Glow Orbs
   ────────────────────────────────────────────── */
const GlowOrb = ({
  size,
  color,
  top,
  left,
  delay = 0,
  duration = 6,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.12, 0.25, 0.12] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, background: color, top, left }}
  />
);

/* ──────────────────────────────────────────────
   Ember Particle
   ────────────────────────────────────────────── */
const EmberParticle = ({ index }: { index: number }) => {
  const startX = 10 + Math.random() * 80;
  const size = 2 + Math.random() * 3;
  const duration = 6 + Math.random() * 8;
  const delay = Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        bottom: "-5%",
        background: `radial-gradient(circle, rgba(255,69,0,${0.6 + Math.random() * 0.4}), transparent)`,
        boxShadow: `0 0 ${size * 2}px rgba(255,69,0,0.3)`,
      }}
      animate={{
        y: [0, -window.innerHeight * (0.7 + Math.random() * 0.3)],
        x: [0, (Math.random() - 0.5) * 120],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0.5, 1.2, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
};

/* ──────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ──────────────────────────────────────────────
   ApplicationSubmitted Component
   ────────────────────────────────────────────── */
const ApplicationSubmitted = () => (
  <div className="relative min-h-screen bg-[#060608] flex items-center justify-center p-4 overflow-hidden">
    {/* ═══ Background Effects ═══ */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.06)_0%,transparent_70%)]" />

    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />

    {/* Glow Orbs */}
    <GlowOrb size={500} color="rgba(255,69,0,0.08)" top="-15%" left="45%" delay={0} />
    <GlowOrb size={300} color="rgba(255,69,0,0.05)" top="60%" left="-5%" delay={2} />
    <GlowOrb size={250} color="rgba(255,140,0,0.04)" top="30%" left="80%" delay={4} />
    <GlowOrb size={200} color="rgba(255,69,0,0.06)" top="80%" left="60%" delay={1} duration={8} />

    {/* Ember Particles */}
    {Array.from({ length: 15 }, (_, i) => (
      <EmberParticle key={i} index={i} />
    ))}

    {/* ═══ Main Content ═══ */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 w-full max-w-md text-center"
    >
      {/* Animated Fire Icon */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 150 }}
            className="relative"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 30px rgba(255,69,0,0.3), 0 0 80px rgba(255,69,0,0.15)",
                  "0 0 50px rgba(255,69,0,0.5), 0 0 120px rgba(255,69,0,0.2)",
                  "0 0 30px rgba(255,69,0,0.3), 0 0 80px rgba(255,69,0,0.15)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF4500] via-[#FF6B35] to-[#FF8C00] flex items-center justify-center"
            >
              <Flame className="w-12 h-12 text-white" />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl border-2 border-[#FF4500]/30"
              style={{ margin: "-8px" }}
            />

            {/* Second ring */}
            <motion.div
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.25, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 rounded-3xl border border-[#FF4500]/15"
              style={{ margin: "-16px" }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />

        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-10 space-y-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/30 to-transparent" />

          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 justify-center"
          >
            <Flame className="w-5 h-5 text-[#FF4500]" />
            <span className="font-display text-xl text-white tracking-[0.15em]">THE FORGE</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="font-display text-3xl text-white tracking-wide"
          >
            Basvurun Alindi!
          </motion.h2>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
            className="h-[2px] bg-gradient-to-r from-[#FF4500] to-[#FF8C00] mx-auto rounded-full"
          />

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto"
          >
            Başvurun incelemeye alındı. Onaylandığında e-posta adresine şifre oluşturma linki gönderilecek.
            Bu süreç genellikle 24-48 saat içinde tamamlanır.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link to="/">
              <Button className="relative h-12 px-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-300 group">
                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Ana Sayfaya Don
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 flex justify-center"
      >
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>
    </motion.div>
  </div>
);

export default ApplicationSubmitted;
