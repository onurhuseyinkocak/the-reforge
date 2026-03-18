import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Sun,
  Moon,
  CheckCircle2,
  Flame,
  Trophy,
  Sparkles,
  Clock,
  Target,
  Dumbbell,
  Apple,
  Star,
  Heart,
  Lightbulb,
  CalendarDays,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

const tabContent = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

/* ──────────────────────────────────────────────
   Confetti Particle Component
   ────────────────────────────────────────────── */
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ["#FF4500", "#FF6B35", "#FFD700", "#FF8C00", "#FFA500"];
  const color = colors[index % colors.length];
  const x = Math.random() * 400 - 200;
  const rotation = Math.random() * 720 - 360;
  const size = Math.random() * 8 + 4;

  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [0, -120, 400],
        x: [0, x * 0.5, x],
        opacity: [1, 1, 0],
        rotate: [0, rotation / 2, rotation],
        scale: [0, 1.2, 0.6],
      }}
      transition={{ duration: 2.2, ease: "easeOut" }}
      className="absolute"
      style={{
        width: size,
        height: size * (Math.random() > 0.5 ? 1 : 2.5),
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      }}
    />
  );
};

/* ──────────────────────────────────────────────
   Glow Orb Component
   ────────────────────────────────────────────── */
const GlowOrb = ({
  size,
  color,
  top,
  left,
  delay = 0,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.15, 0.3, 0.15] }}
    transition={{ duration: 6, repeat: Infinity, delay }}
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{
      width: size,
      height: size,
      background: color,
      top,
      left,
    }}
  />
);

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
const CheckIn = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [checkedDates, setCheckedDates] = useState<Date[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Morning state
  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepRating, setSleepRating] = useState(7);
  const [energyRating, setEnergyRating] = useState(7);
  const [routineDone, setRoutineDone] = useState(false);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const [intention, setIntention] = useState("");

  // Evening state
  const [workoutDone, setWorkoutDone] = useState(false);
  const [nutritionRating, setNutritionRating] = useState(7);
  const [reflection, setReflection] = useState("");
  const [dayRating, setDayRating] = useState(7);
  const [priorityReview, setPriorityReview] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [biggestWin, setBiggestWin] = useState("");
  const [tomorrowImprovement, setTomorrowImprovement] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checkin_date", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setHistory(data || []);
        const dates = [...new Set((data || []).map((c) => c.checkin_date))].map(
          (d) => new Date(d)
        );
        setCheckedDates(dates);
      });
  }, [user]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const checkAchievements = async () => {
    if (!user) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;
      await supabase.functions.invoke("check-achievements", {
        body: { user_id: user.id },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Achievement check is non-blocking, silently fail
      console.warn("Achievement check failed:", e);
    }
  };

  const handleMorningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert(
      {
        user_id: user.id,
        checkin_date: format(new Date(), "yyyy-MM-dd"),
        checkin_type: "morning",
        wake_time: wakeTime,
        sleep_rating: sleepRating,
        energy_rating: energyRating,
        routine_done: routineDone,
        priorities: priorities.filter((p) => p.trim()),
        reflection: intention,
      },
      { onConflict: "user_id,checkin_date,checkin_type" }
    );
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else {
      // Award XP for check-in
      await supabase.rpc('add_xp', { p_user_id: user.id, p_amount: 10, p_source: 'checkin', p_description: 'Günlük check-in' });
      toast.success("Sabah check-in kaydedildi! ☀️");
      toast("+10 XP kazandin!", { icon: "⚡", duration: 2000, style: { background: "rgba(255,69,0,0.15)", border: "1px solid rgba(255,69,0,0.3)", color: "#FF4500" } });
      triggerConfetti();
      checkAchievements();
    }
  };

  const handleEveningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert(
      {
        user_id: user.id,
        checkin_date: format(new Date(), "yyyy-MM-dd"),
        checkin_type: "evening",
        workout_done: workoutDone,
        nutrition_rating: nutritionRating,
        reflection,
        day_rating: dayRating,
        priority_review: priorityReview,
        gratitude,
        biggest_win: biggestWin,
        tomorrow_improvement: tomorrowImprovement,
      },
      { onConflict: "user_id,checkin_date,checkin_type" }
    );
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else {
      // Award XP for check-in
      await supabase.rpc('add_xp', { p_user_id: user.id, p_amount: 10, p_source: 'checkin', p_description: 'Günlük check-in' });
      toast.success("Akşam check-in kaydedildi! 🌙");
      toast("+10 XP kazandin!", { icon: "⚡", duration: 2000, style: { background: "rgba(255,69,0,0.15)", border: "1px solid rgba(255,69,0,0.3)", color: "#FF4500" } });
      triggerConfetti();
      checkAchievements();
    }
  };

  const streak = profile?.streak || 0;
  const [freezesRemaining, setFreezesRemaining] = useState<number>(1);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);

  // Load streak freeze data
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("streak_freezes_remaining, streak_freeze_used_at, streak_freeze_resets_at")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          // Auto-reset freezes if a month has passed
          const resetsAt = data.streak_freeze_resets_at ? new Date(data.streak_freeze_resets_at) : null;
          if (!resetsAt || new Date() >= resetsAt) {
            // Reset freeze for new month
            const nextReset = new Date();
            nextReset.setMonth(nextReset.getMonth() + 1);
            nextReset.setDate(1);
            nextReset.setHours(0, 0, 0, 0);
            supabase
              .from("profiles")
              .update({
                streak_freezes_remaining: 1,
                streak_freeze_resets_at: nextReset.toISOString(),
              })
              .eq("id", user.id)
              .then(() => {
                setFreezesRemaining(1);
                setFreezeUsed(false);
              });
          } else {
            setFreezesRemaining(data.streak_freezes_remaining ?? 1);
            setFreezeUsed((data.streak_freezes_remaining ?? 1) === 0);
          }
        }
      });
  }, [user]);

  const handleStreakFreeze = async () => {
    if (!user || freezesRemaining <= 0) return;
    setFreezeLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        streak_freezes_remaining: 0,
        streak_freeze_used_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setFreezeLoading(false);
    if (error) {
      toast.error("Hata: " + error.message);
    } else {
      setFreezesRemaining(0);
      setFreezeUsed(true);
      toast.success("Streak donduruldu! Bugun check-in yapmasan bile streak'in korunacak.");
    }
  };

  const confettiParticles = useMemo(
    () => Array.from({ length: 40 }, (_, i) => i),
    []
  );

  /* ── Premium Rating Slider ── */
  const RatingSlider = ({
    value,
    onChange,
    label,
    icon: Icon,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    icon?: React.ElementType;
  }) => {
    const percentage = ((value - 1) / 9) * 100;

    return (
      <motion.div
        variants={fadeUp}
        className="group relative rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[#FF4500]" />
              </div>
            )}
            <Label className="text-sm text-white/70 font-medium">{label}</Label>
          </div>
          <motion.span
            key={value}
            initial={{ scale: 1.3, color: "#FF4500" }}
            animate={{ scale: 1, color: "#FF4500" }}
            className="text-lg font-display font-bold tabular-nums"
          >
            {value}/10
          </motion.span>
        </div>

        {/* Custom track */}
        <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #FF4500, #FF6B35, #FFD700)",
            }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          {/* Glow effect on track */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50"
            style={{
              background: "linear-gradient(90deg, #FF4500, #FF6B35)",
            }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Hidden native input for accessibility */}
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ top: "50%" }}
        />

        {/* Dot indicators */}
        <div className="flex justify-between mt-2 px-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i + 1 <= value
                  ? "bg-[#FF4500] shadow-[0_0_4px_rgba(255,69,0,0.5)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  /* ── Premium Input Wrapper ── */
  const ForgeInput = ({
    icon: Icon,
    label,
    children,
  }: {
    icon?: React.ElementType;
    label: string;
    children: React.ReactNode;
  }) => (
    <motion.div variants={fadeUp} className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-[#FF4500]/10 flex items-center justify-center">
            <Icon className="w-3 h-3 text-[#FF4500]" />
          </div>
        )}
        <Label className="text-sm text-white/70 font-medium">{label}</Label>
      </div>
      {children}
    </motion.div>
  );

  /* ── Premium Switch Row ── */
  const ForgeSwitch = ({
    icon: Icon,
    label,
    checked,
    onChange,
  }: {
    icon?: React.ElementType;
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <motion.div
      variants={fadeUp}
      className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              checked ? "bg-[#FF4500]/20" : "bg-white/[0.04]"
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-colors duration-300 ${
                checked ? "text-[#FF4500]" : "text-white/30"
              }`}
            />
          </div>
        )}
        <Label className="text-sm text-white/70 font-medium">{label}</Label>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#FF4500]"
      />
    </motion.div>
  );

  const inputClasses =
    "bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/20 rounded-xl h-11 focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300";

  const textareaClasses =
    "bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/20 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300 resize-none";

  return (
    <div className="relative space-y-6 max-w-2xl mx-auto pb-8">
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <GlowOrb size={300} color="rgba(255,69,0,0.08)" top="-5%" left="60%" delay={0} />
        <GlowOrb size={250} color="rgba(255,107,53,0.06)" top="40%" left="-10%" delay={2} />
        <GlowOrb size={200} color="rgba(255,140,0,0.05)" top="70%" left="70%" delay={4} />
      </div>

      {/* ═══ Confetti Overlay ═══ */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            {/* Confetti particles */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
              {confettiParticles.map((i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </div>

            {/* Center celebration */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center relative"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4500] to-[#FFD700] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(255,69,0,0.4)]">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <p className="text-3xl font-display text-white tracking-wide">
                Harika!
              </p>
              <p className="text-sm text-white/50 mt-1">Check-in tamamlandi!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Streak Banner ═══ */}
      <AnimatePresence>
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card className="relative overflow-hidden border-0 bg-transparent">
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF4500]/30 via-[#FF8C00]/20 to-[#FFD700]/30 p-[1px]">
                <div className="w-full h-full rounded-xl bg-[#0A0A0B]" />
              </div>

              <div className="relative z-10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Animated fire icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      filter: [
                        "drop-shadow(0 0 8px rgba(255,69,0,0.4))",
                        "drop-shadow(0 0 16px rgba(255,69,0,0.7))",
                        "drop-shadow(0 0 8px rgba(255,69,0,0.4))",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4500] to-[#FF8C00] flex items-center justify-center"
                  >
                    <Flame className="w-5 h-5 text-white" />
                  </motion.div>

                  <div>
                    <p className="text-white font-display text-lg tracking-wide">
                      {streak} Gun Serisi!
                    </p>
                    <p className="text-white/40 text-xs">Devam et, pes etme!</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {streak >= 7 && (
                    <motion.div initial={scaleIn.hidden} animate={scaleIn.visible}>
                      <Badge className="bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 hover:bg-[#FFD700]/20">
                        <Trophy className="w-3 h-3 mr-1" /> Haftalik
                      </Badge>
                    </motion.div>
                  )}
                  {streak >= 30 && (
                    <motion.div initial={scaleIn.hidden} animate={scaleIn.visible}>
                      <Badge className="bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/20 hover:bg-[#FF4500]/20">
                        <Trophy className="w-3 h-3 mr-1" /> Aylik
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Streak progress dots */}
              <div className="relative z-10 px-4 pb-3 flex gap-1">
                {Array.from({ length: Math.min(streak, 30) }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#FF4500] to-[#FFD700]"
                    style={{ opacity: 0.3 + (i / 30) * 0.7 }}
                  />
                ))}
              </div>

              {/* Streak Freeze Button */}
              <div className="relative z-10 px-4 pb-4">
                <button
                  onClick={handleStreakFreeze}
                  disabled={freezesRemaining <= 0 || freezeLoading}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                    freezesRemaining > 0 && !freezeUsed
                      ? "bg-sky-400/[0.06] border-sky-400/20 hover:bg-sky-400/[0.12] hover:border-sky-400/30 cursor-pointer"
                      : "bg-white/[0.02] border-white/[0.06] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        freezesRemaining > 0 && !freezeUsed
                          ? "bg-sky-400/15"
                          : "bg-white/[0.04]"
                      }`}
                    >
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          freezesRemaining > 0 && !freezeUsed
                            ? "text-sky-400"
                            : "text-white/20"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-medium ${
                          freezesRemaining > 0 && !freezeUsed
                            ? "text-sky-300"
                            : "text-white/30"
                        }`}
                      >
                        Streak Dondur
                      </p>
                      <p className="text-[11px] text-white/30">
                        {freezeUsed
                          ? "Bu ay dondurma hakkini kullandin"
                          : `${freezesRemaining} dondurma hakkin var`}
                      </p>
                    </div>
                  </div>
                  {freezeLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full"
                    />
                  )}
                </button>
                {freezeUsed && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-sky-400/50 mt-2 text-center"
                  >
                    Bugun check-in yapmasan bile streak'in korunacak
                  </motion.p>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Tabs ═══ */}
      <Tabs value={tab} onValueChange={setTab}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TabsList className="w-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-xl p-1 h-auto">
            <TabsTrigger
              value="morning"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF4500]/20 data-[state=active]:to-[#FF8C00]/10 data-[state=active]:text-[#FF4500] data-[state=active]:shadow-[0_0_20px_rgba(255,69,0,0.1)] transition-all duration-300"
            >
              <Sun className="w-4 h-4 mr-2" /> Sabah
            </TabsTrigger>
            <TabsTrigger
              value="evening"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/10 data-[state=active]:text-indigo-400 data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300"
            >
              <Moon className="w-4 h-4 mr-2" /> Aksam
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white/40 data-[state=active]:bg-white/[0.06] data-[state=active]:text-white/80 transition-all duration-300"
            >
              <CalendarDays className="w-4 h-4 mr-2" /> Gecmis
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* ─── Morning Tab ─── */}
        <AnimatePresence mode="wait">
          <TabsContent value="morning" key="morning">
            <motion.div
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-0">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-white/[0.04]">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#FF4500]/5 blur-3xl" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,165,0,0.3)]">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-wide">
                        Sabah Check-in
                      </h3>
                      <p className="text-xs text-white/30">
                        {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <motion.div
                  className="p-6 space-y-5"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                >
                  <ForgeInput icon={Clock} label="Uyanma Saati">
                    <Input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className={`${inputClasses} w-44`}
                    />
                  </ForgeInput>

                  <RatingSlider
                    value={sleepRating}
                    onChange={setSleepRating}
                    label="Uyku Kalitesi"
                    icon={Moon}
                  />

                  <RatingSlider
                    value={energyRating}
                    onChange={setEnergyRating}
                    label="Enerji Seviyesi"
                    icon={Zap}
                  />

                  <ForgeSwitch
                    icon={CheckCircle2}
                    label="Sabah Rutini Tamamlandi mi?"
                    checked={routineDone}
                    onChange={setRoutineDone}
                  />

                  <ForgeInput icon={Target} label="Bugunun Niyeti">
                    <Input
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      className={inputClasses}
                      placeholder="Bugun neye odaklanacaksin?"
                    />
                  </ForgeInput>

                  <ForgeInput icon={Star} label="Bugunun 3 Onceligi">
                    <div className="space-y-2">
                      {priorities.map((p, i) => (
                        <motion.div
                          key={i}
                          variants={fadeUp}
                          custom={i}
                          className="relative"
                        >
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FF4500]/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#FF4500]">
                              {i + 1}
                            </span>
                          </div>
                          <Input
                            value={p}
                            onChange={(e) => {
                              const np = [...priorities];
                              np[i] = e.target.value;
                              setPriorities(np);
                            }}
                            className={`${inputClasses} pl-11`}
                            placeholder={`Oncelik ${i + 1}`}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </ForgeInput>

                  {/* Submit */}
                  <motion.div variants={fadeUp}>
                    <Button
                      onClick={handleMorningSubmit}
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:from-[#FF5500] hover:to-[#FF9C10] text-white font-medium text-sm shadow-[0_0_30px_rgba(255,69,0,0.3)] hover:shadow-[0_0_40px_rgba(255,69,0,0.5)] transition-all duration-300 border-0"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          <Sun className="w-4 h-4 mr-2" />
                          Sabah Check-in Kaydet
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ─── Evening Tab ─── */}
          <TabsContent value="evening" key="evening">
            <motion.div
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-0">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-white/[0.04]">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-wide">
                        Aksam Check-in
                      </h3>
                      <p className="text-xs text-white/30">
                        {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <motion.div
                  className="p-6 space-y-5"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                >
                  <RatingSlider
                    value={dayRating}
                    onChange={setDayRating}
                    label="Günün Genel Değerlendirmesi"
                    icon={Star}
                  />

                  <ForgeSwitch
                    icon={Dumbbell}
                    label="Antrenman Yapıldı mı?"
                    checked={workoutDone}
                    onChange={setWorkoutDone}
                  />

                  <RatingSlider
                    value={nutritionRating}
                    onChange={setNutritionRating}
                    label="Beslenme Kalitesi"
                    icon={Apple}
                  />

                  <ForgeInput icon={Trophy} label="Bugünkü En Büyük Başarı">
                    <Input
                      value={biggestWin}
                      onChange={(e) => setBiggestWin(e.target.value)}
                      className={inputClasses}
                      placeholder="Bugün en çok neyi başardın?"
                    />
                  </ForgeInput>

                  <ForgeInput icon={Target} label="Önceliklerin Değerlendirmesi">
                    <Textarea
                      value={priorityReview}
                      onChange={(e) => setPriorityReview(e.target.value)}
                      className={textareaClasses}
                      rows={2}
                      placeholder="Sabah belirlediğin önceliklerde nasıl performans gösterdin?"
                    />
                  </ForgeInput>

                  <ForgeInput icon={CheckCircle2} label="Günün Değerlendirmesi">
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className={textareaClasses}
                      rows={3}
                      placeholder="Bugün neler öğrendin?"
                    />
                  </ForgeInput>

                  <ForgeInput icon={Lightbulb} label="Yarin Icin 1 Iyilestirme">
                    <Input
                      value={tomorrowImprovement}
                      onChange={(e) => setTomorrowImprovement(e.target.value)}
                      className={inputClasses}
                      placeholder="Yarin neyi daha iyi yapabilirsin?"
                    />
                  </ForgeInput>

                  <ForgeInput icon={Heart} label="Minnet / Sukur">
                    <Textarea
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      className={textareaClasses}
                      rows={2}
                      placeholder="Bugun neye minnettarsin?"
                    />
                  </ForgeInput>

                  {/* Submit */}
                  <motion.div variants={fadeUp}>
                    <Button
                      onClick={handleEveningSubmit}
                      disabled={loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium text-sm shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 border-0"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-2" />
                          Aksam Check-in Kaydet
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ─── History Tab ─── */}
          <TabsContent value="history" key="history">
            <motion.div
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {/* Calendar Card */}
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-0">
                <div className="p-6 pb-4 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-wide">
                        Check-in Gecmisi
                      </h3>
                      <p className="text-xs text-white/30">
                        {checkedDates.length} gun check-in yapildi
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={checkedDates}
                    className="text-white/80 [&_.rdp-day_selected]:!bg-[#FF4500] [&_.rdp-day_selected]:!text-white"
                    modifiersStyles={{
                      selected: {
                        backgroundColor: "#FF4500",
                        color: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 0 12px rgba(255,69,0,0.4)",
                      },
                    }}
                  />
                </div>
              </Card>

              {/* History List */}
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                <h4 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">
                  Son Kayitlar
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {history.slice(0, 14).map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          c.checkin_type === "morning"
                            ? "bg-amber-500/10"
                            : "bg-indigo-500/10"
                        }`}
                      >
                        {c.checkin_type === "morning" ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 font-medium">
                          {format(new Date(c.checkin_date), "d MMM yyyy", {
                            locale: tr,
                          })}
                        </p>
                        <p className="text-xs text-white/30">
                          {c.checkin_type === "morning" ? "Sabah" : "Aksam"}{" "}
                          Check-in
                        </p>
                      </div>

                      {c.energy_rating && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF4500]/10">
                          <Zap className="w-3 h-3 text-[#FF4500]" />
                          <span className="text-xs font-medium text-[#FF4500]">
                            {c.energy_rating}/10
                          </span>
                        </div>
                      )}
                      {c.day_rating && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10">
                          <Star className="w-3 h-3 text-indigo-400" />
                          <span className="text-xs font-medium text-indigo-400">
                            {c.day_rating}/10
                          </span>
                        </div>
                      )}

                      <CheckCircle2 className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" />
                    </motion.div>
                  ))}

                  {history.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                        <CalendarDays className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-sm text-white/30">
                        Henuz check-in kaydı yok
                      </p>
                      <p className="text-xs text-white/15 mt-1">
                        Ilk check-in'ini yaparak basla!
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default CheckIn;
