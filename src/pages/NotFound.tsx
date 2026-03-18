import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.06)_0%,transparent_60%)]" />

      {/* Animated ember orbs */}
      <motion.div
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FF4500]/[0.05] blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#FF8C00]/[0.04] blur-[80px] pointer-events-none"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-6"
      >
        {/* 404 Number with ember glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 150, damping: 20 }}
          className="relative mb-6"
        >
          <h1
            className="font-display text-[10rem] sm:text-[14rem] font-bold leading-none tracking-widest select-none"
            style={{
              background: "linear-gradient(180deg, #FF4500 0%, #FF8C00 40%, #FF450033 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(255,69,0,0.3))",
            }}
          >
            404
          </h1>

          {/* Pulsing glow behind the number */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-48 h-48 rounded-full bg-[#FF4500]/10 blur-3xl" />
          </motion.div>
        </motion.div>

        {/* Flame icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,69,0,0.3)",
                "0 0 40px rgba(255,69,0,0.5)",
                "0 0 20px rgba(255,69,0,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4500] to-[#FF8C00] flex items-center justify-center"
          >
            <Flame className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-white/60 text-xl sm:text-2xl font-display tracking-wide mb-2"
        >
          Kaybolmus gorunuyorsun
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white/25 text-sm mb-10 max-w-md mx-auto"
        >
          Bu sayfa artik mevcut degil veya hic olmadi. Ocaga geri don ve yoluna devam et.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Ocaga Don
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />
      </motion.div>
    </div>
  );
};

export default NotFound;
