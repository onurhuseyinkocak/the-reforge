import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, CheckSquare, Swords, Target, ChevronRight, X } from "lucide-react";

const ONBOARDING_KEY = "onboarding_completed";

interface Step {
  icon: React.ElementType;
  iconGradient: string;
  iconGlow: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Flame,
    iconGradient: "from-orange-500 to-amber-500",
    iconGlow: "rgba(255,69,0,0.4)",
    title: "Hos geldin! THE FORGE'a katildin.",
    description:
      "Burada kendini dovecek, disiplinini kuracak ve gercek potansiyelini ortaya cikaracaksin. 24 haftalik donusum yolculuguna hazir misin?",
  },
  {
    icon: CheckSquare,
    iconGradient: "from-emerald-400 to-teal-500",
    iconGlow: "rgba(52,211,153,0.4)",
    title: "Her gun check-in yap",
    description:
      "Sabah ve aksam check-in yaparak gunluk rutinini takip et. Her check-in sana XP kazandirir ve serinini buyutur.",
  },
  {
    icon: Swords,
    iconGradient: "from-violet-400 to-purple-500",
    iconGlow: "rgba(139,92,246,0.4)",
    title: "Bir loncaya katil",
    description:
      "Loncan senin takim arkadaslarin. Birlikte gorevler tamamla, birbirinizi motive edin ve lonca siralama tablosunda yukseltin.",
  },
  {
    icon: Target,
    iconGradient: "from-red-400 to-orange-500",
    iconGlow: "rgba(239,68,68,0.4)",
    title: "Hedefine odaklan",
    description:
      "3 faz boyunca ilerle: Foundation, Pressure ve Tempering. Sonunda 'Forged' duvarinda yerini al — gercek donusumun kaniti.",
  },
];

const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        // Small delay so the dashboard loads first
        const timer = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available, skip onboarding
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleComplete}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0B]/90 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

            {/* Glow blob */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: step.iconGlow.replace("0.4", "0.1") }}
            />

            {/* Skip button */}
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-8 pt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.iconGradient} flex items-center justify-center mb-6`}
                    style={{ boxShadow: `0 0 40px ${step.iconGlow}` }}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h2 className="font-display text-2xl text-white tracking-wide mb-3">
                    {step.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 mt-8 mb-6">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 h-2 bg-gradient-to-r from-orange-500 to-amber-500"
                        : i < currentStep
                          ? "w-2 h-2 bg-orange-500/40"
                          : "w-2 h-2 bg-white/10"
                    }`}
                    layout
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {currentStep < steps.length - 1 && (
                  <button
                    onClick={handleComplete}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-white/30 hover:text-white/50 hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200"
                  >
                    Atla
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:from-[#FF5500] hover:to-[#FF9C10] shadow-[0_0_30px_rgba(255,69,0,0.3)] hover:shadow-[0_0_40px_rgba(255,69,0,0.5)] transition-all duration-300 flex items-center justify-center gap-2 ${
                    currentStep === steps.length - 1 ? "w-full" : ""
                  }`}
                >
                  {currentStep === steps.length - 1 ? (
                    "Basla!"
                  ) : (
                    <>
                      Devam <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
