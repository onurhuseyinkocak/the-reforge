import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
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
   ForgotPassword Component
   ────────────────────────────────────────────── */
const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email girin"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast.error(error.message);
    else setSent(true);
  };

  return (
    <div className="relative min-h-screen bg-[#060608] flex items-center justify-center p-4 overflow-hidden">
      {/* ═══ Background Effects ═══ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow Orbs */}
      <GlowOrb size={400} color="rgba(255,69,0,0.07)" top="-10%" left="50%" delay={0} />
      <GlowOrb size={300} color="rgba(255,69,0,0.05)" top="60%" left="-5%" delay={2} />
      <GlowOrb size={250} color="rgba(255,140,0,0.04)" top="30%" left="80%" delay={4} />
      <GlowOrb size={200} color="rgba(255,69,0,0.06)" top="80%" left="60%" delay={1} duration={8} />

      {/* Ember Particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <EmberParticle key={i} index={i} />
      ))}

      {/* ═══ Main Content ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,69,0,0.3), 0 0 60px rgba(255,69,0,0.1)",
                    "0 0 30px rgba(255,69,0,0.5), 0 0 80px rgba(255,69,0,0.15)",
                    "0 0 20px rgba(255,69,0,0.3), 0 0 60px rgba(255,69,0,0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4500] via-[#FF6B35] to-[#FF8C00] flex items-center justify-center"
              >
                <Flame className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl border border-[#FF4500]/20"
                style={{ margin: "-4px" }}
              />
            </motion.div>
            <div>
              <h1 className="font-display text-4xl text-white tracking-[0.15em]">THE FORGE</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent mt-2"
              />
            </div>
          </Link>
          <motion.p variants={itemVariants} className="text-white/30 text-sm mt-3 tracking-wide">
            Sifreni sifirla
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />

          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-6 py-4"
              >
                {/* Animated Checkmark */}
                <div className="relative mx-auto w-20 h-20">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF4500]/20 to-[#FF6B35]/10 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-[#FF4500]" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(255,69,0,0)",
                        "0 0 30px rgba(255,69,0,0.3)",
                        "0 0 0px rgba(255,69,0,0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl text-white tracking-wide">
                    Link Gonderildi!
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Sifre sifirlama linki gonderildi.<br />
                    Email kutunu kontrol et.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-[#FF4500]/70 hover:text-[#FF4500] transition-colors duration-300 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Giris sayfasina don
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-xs text-white/40 uppercase tracking-wider font-medium">
                    Email
                  </Label>
                  <div className="relative group">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        focused ? "bg-[#FF4500]/15" : "bg-white/[0.04]"
                      }`}
                    >
                      <Mail
                        className={`w-4 h-4 transition-colors duration-300 ${
                          focused ? "text-[#FF4500]" : "text-white/25"
                        }`}
                      />
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      className="h-12 pl-14 pr-4 bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/15 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="ornek@email.com"
                    />
                    {focused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          boxShadow: "0 0 20px rgba(255,69,0,0.08), inset 0 0 20px rgba(255,69,0,0.03)",
                        }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm border-0 shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300 group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                    />
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <span className="relative z-10">Sifirlama Linki Gonder</span>
                    )}
                  </Button>
                </motion.div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Back to Login */}
        {!sent && (
          <motion.div variants={itemVariants} className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-white/25 hover:text-[#FF4500]/80 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" /> Giris sayfasina don
            </Link>
          </motion.div>
        )}

        {/* Bottom decorative line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex justify-center"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
