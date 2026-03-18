import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { motion } from "framer-motion";

const schema = z.object({
  email: z.string().trim().email("Gecerli bir email girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
});

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
   Login Component
   ────────────────────────────────────────────── */
const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email veya sifre hatali"
          : error.message
      );
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060608] flex items-center justify-center p-4 overflow-hidden">
      {/* ═══ Background Effects ═══ */}

      {/* Gradient base */}
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
      <GlowOrb
        size={200}
        color="rgba(255,69,0,0.06)"
        top="80%"
        left="60%"
        delay={1}
        duration={8}
      />

      {/* Ember Particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <EmberParticle key={i} index={i} />
      ))}

      {/* ═══ Login Card ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            {/* Logo icon with ember glow */}
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

              {/* Subtle ring */}
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl border border-[#FF4500]/20"
                style={{ margin: "-4px" }}
              />
            </motion.div>

            <div>
              <h1 className="font-display text-4xl text-white tracking-[0.15em]">
                THE FORGE
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent mt-2"
              />
            </div>
          </Link>

          <motion.p
            variants={itemVariants}
            className="text-white/30 text-sm mt-3 tracking-wide"
          >
            Hesabina giris yap
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={itemVariants} className="relative">
          {/* Card glow border */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />

          <form
            onSubmit={handleSubmit}
            className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6"
          >
            {/* Inner top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider font-medium">
                Email
              </Label>
              <div className="relative group">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    focused === "email"
                      ? "bg-[#FF4500]/15"
                      : "bg-white/[0.04]"
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 transition-colors duration-300 ${
                      focused === "email" ? "text-[#FF4500]" : "text-white/25"
                    }`}
                  />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="h-12 pl-14 pr-4 bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/15 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300"
                  placeholder="ornek@email.com"
                />
                {/* Focus glow */}
                {focused === "email" && (
                  <motion.div
                    layoutId="inputGlow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: "0 0 20px rgba(255,69,0,0.08), inset 0 0 20px rgba(255,69,0,0.03)",
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-xs text-white/40 uppercase tracking-wider font-medium">
                Sifre
              </Label>
              <div className="relative group">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    focused === "password"
                      ? "bg-[#FF4500]/15"
                      : "bg-white/[0.04]"
                  }`}
                >
                  <Lock
                    className={`w-4 h-4 transition-colors duration-300 ${
                      focused === "password"
                        ? "text-[#FF4500]"
                        : "text-white/25"
                    }`}
                  />
                </div>
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="h-12 pl-14 pr-12 bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/15 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 transition-all duration-200"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {/* Focus glow */}
                {focused === "password" && (
                  <motion.div
                    layoutId="inputGlow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: "0 0 20px rgba(255,69,0,0.08), inset 0 0 20px rgba(255,69,0,0.03)",
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-white/25 hover:text-[#FF4500]/80 transition-colors duration-300"
              >
                Sifremi unuttum
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm border-0 shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300 group overflow-hidden"
              >
                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />

                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    Giris Yap
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
              <span className="text-[10px] text-white/15 uppercase tracking-widest">
                veya
              </span>
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
            </div>
          </form>
        </motion.div>

        {/* Apply link */}
        <motion.p
          variants={itemVariants}
          className="text-center mt-6 text-sm text-white/25"
        >
          Hesabin yok mu?{" "}
          <Link
            to="/apply"
            className="text-[#FF4500]/70 hover:text-[#FF4500] transition-colors duration-300 font-medium"
          >
            Basvur
          </Link>
        </motion.p>

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

export default Login;
