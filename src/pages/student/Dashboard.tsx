import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  CheckCircle2,
  Clock,
  MessageSquare,
  Target,
  Sun,
  Compass,
  UsersRound,
  Brain,
  AlertCircle,
  Zap,
  ArrowRight,
  TrendingUp,
  Moon,
  Activity,
  ChevronRight,
  Star,
  UserPlus,
  Search,
  X,
  Send,
  UserCheck,
  UserX,
} from "lucide-react";
import NotificationBanner from "@/components/NotificationBanner";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const MOTIVATIONS = [
  "Disiplin, motivasyonun bittiği yerde başlar.",
  "Bugün yaptığın seçimler, yarının seni yaratır.",
  "Güçlü bir adam, kolay zamanlardan değil, zor günlerden doğar.",
  "Her gün %1 daha iyi ol. 365 gün sonra 37 kat daha iyi olursun.",
  "Rahatlık bölgesi güzel ama orada hiçbir şey yetişmez.",
  "Seni izleyen kimse olmasa bile aynı disiplini koru.",
  "Başarı bir alışkanlıktır. Mükemmellik tekrardır.",
  "Bugün vazgeçersen, dünkü acıların boşa gitmiş olur.",
  "Asıl güç, yapmak istemediğinde yapabilmektir.",
  "Ateşten geçmeyen çelik, kılıç olamaz.",
];

const AREA_LABELS: Record<string, string> = {
  physical: "Fiziksel",
  mental: "Zihinsel",
  style: "Stil",
  environment: "Çevre",
  social: "Sosyal",
  career: "Kariyer",
  finance: "Finans",
};

// Animated number counter component
const AnimatedCounter = ({
  value,
  duration = 1.2,
}: {
  value: number;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = ref.current ?? 0;
    const end = value;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplayValue(end);
        ref.current = end;
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

// Stagger container and item variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const glassCard =
  "relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const [areaScores, setAreaScores] = useState<
    { area: string; score: number }[]
  >([]);
  const [weekActivity, setWeekActivity] = useState<boolean[]>([]);
  const [latestAI, setLatestAI] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Buddy system state
  const [buddyPair, setBuddyPair] = useState<any>(null);
  const [buddyProfile, setBuddyProfile] = useState<any>(null);
  const [pendingBuddyRequest, setPendingBuddyRequest] = useState<any>(null);
  const [pendingRequesterProfile, setPendingRequesterProfile] = useState<any>(null);
  const [buddySearchQuery, setBuddySearchQuery] = useState("");
  const [buddySearchResults, setBuddySearchResults] = useState<any[]>([]);
  const [buddySearching, setBuddySearching] = useState(false);
  const [buddySending, setBuddySending] = useState(false);

  const dailyMotivation =
    MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");

    supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .then(({ data }) => setTodayCheckin(data));
    supabase
      .from("student_tasks")
      .select("*, tasks(*)")
      .eq("user_id", user.id)
      .in("status", ["pending", "in_progress"])
      .limit(5)
      .then(({ data }) => setPendingTasks(data || []));
    supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setLatestMessage(data?.[0]));

    supabase
      .from("life_area_entries")
      .select("area, metrics")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .then(({ data }) => {
        const scores = Object.keys(AREA_LABELS).map((key) => {
          const entry = (data || []).find((d) => d.area === key);
          if (!entry) return { area: AREA_LABELS[key], score: 0 };
          const m = (entry.metrics as Record<string, any>) || {};
          const nums = Object.values(m).filter(
            (v) => typeof v === "number"
          ) as number[];
          const avg =
            nums.length > 0
              ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
              : 0;
          return { area: AREA_LABELS[key], score: Math.min(avg, 10) };
        });
        setAreaScores(scores);
      });

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(new Date(Date.now() - (6 - i) * 86400000), "yyyy-MM-dd")
    );
    supabase
      .from("checkins")
      .select("checkin_date")
      .eq("user_id", user.id)
      .in("checkin_date", weekDates)
      .then(({ data }) => {
        const dates = new Set((data || []).map((d) => d.checkin_date));
        setWeekActivity(weekDates.map((d) => dates.has(d)));
      });

    supabase
      .from("ai_analysis_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setLatestAI(data?.[0]));

    supabase
      .from("checkins")
      .select("checkin_type, checkin_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentActivity(data || []));

    // Fetch buddy pairs
    fetchBuddyData(user.id);
  }, [user]);

  const fetchBuddyData = async (userId: string) => {
    // Check for active buddy pair
    const { data: activePairs } = await supabase
      .from("buddy_pairs")
      .select("*")
      .eq("status", "active")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .limit(1);

    if (activePairs && activePairs.length > 0) {
      const pair = activePairs[0];
      setBuddyPair(pair);
      const buddyId = pair.user_a === userId ? pair.user_b : pair.user_a;
      const { data: bp } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", buddyId)
        .maybeSingle();
      setBuddyProfile(bp);
      setPendingBuddyRequest(null);
      return;
    }

    // Check for pending request where I am user_b (incoming)
    const { data: pendingIncoming } = await supabase
      .from("buddy_pairs")
      .select("*")
      .eq("status", "pending")
      .eq("user_b", userId)
      .limit(1);

    if (pendingIncoming && pendingIncoming.length > 0) {
      const req = pendingIncoming[0];
      setPendingBuddyRequest(req);
      const { data: rp } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", req.user_a)
        .maybeSingle();
      setPendingRequesterProfile(rp);
      setBuddyPair(null);
      setBuddyProfile(null);
      return;
    }

    // Check for pending request where I am user_a (outgoing)
    const { data: pendingOutgoing } = await supabase
      .from("buddy_pairs")
      .select("*")
      .eq("status", "pending")
      .eq("user_a", userId)
      .limit(1);

    if (pendingOutgoing && pendingOutgoing.length > 0) {
      setPendingBuddyRequest(pendingOutgoing[0]);
      setPendingRequesterProfile(null);
      setBuddyPair(null);
      setBuddyProfile(null);
      return;
    }

    setBuddyPair(null);
    setBuddyProfile(null);
    setPendingBuddyRequest(null);
    setPendingRequesterProfile(null);
  };

  const searchBuddies = async (query: string) => {
    setBuddySearchQuery(query);
    if (query.trim().length < 2) {
      setBuddySearchResults([]);
      return;
    }
    setBuddySearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, streak")
      .ilike("full_name", `%${query.trim()}%`)
      .neq("user_id", user!.id)
      .limit(5);
    setBuddySearchResults(data || []);
    setBuddySearching(false);
  };

  const sendBuddyRequest = async (targetUserId: string) => {
    if (!user) return;
    setBuddySending(true);
    const { error } = await supabase.from("buddy_pairs").insert({
      user_a: user.id,
      user_b: targetUserId,
    });
    if (error) {
      if (error.code === "23505") {
        // duplicate
        // Try reverse
        const { error: err2 } = await supabase.from("buddy_pairs").insert({
          user_a: targetUserId,
          user_b: user.id,
        });
        if (err2) toast.error("Bu kisiyle zaten bir buddy isteginiz var.");
        else {
          toast.success("Istek gonderildi!");
          fetchBuddyData(user.id);
        }
      } else {
        toast.error("Hata: " + error.message);
      }
    } else {
      toast.success("Buddy istegi gonderildi!");
      fetchBuddyData(user.id);
    }
    setBuddySending(false);
    setBuddySearchQuery("");
    setBuddySearchResults([]);
  };

  const acceptBuddyRequest = async (pairId: string) => {
    const { error } = await supabase
      .from("buddy_pairs")
      .update({ status: "active" })
      .eq("id", pairId);
    if (error) toast.error("Hata: " + error.message);
    else {
      toast.success("Buddy kabul edildi!");
      if (user) fetchBuddyData(user.id);
    }
  };

  const rejectBuddyRequest = async (pairId: string) => {
    const { error } = await supabase
      .from("buddy_pairs")
      .update({ status: "ended" })
      .eq("id", pairId);
    if (error) toast.error("Hata: " + error.message);
    else {
      toast.success("Istek reddedildi.");
      if (user) fetchBuddyData(user.id);
    }
  };

  const endBuddy = async (pairId: string) => {
    const { error } = await supabase
      .from("buddy_pairs")
      .update({ status: "ended" })
      .eq("id", pairId);
    if (error) toast.error("Hata: " + error.message);
    else {
      toast.success("Buddy sonlandirildi.");
      if (user) fetchBuddyData(user.id);
    }
  };

  const totalWeeks = 24;
  const currentWeek = profile?.current_week || 1;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);
  const hasMorning = todayCheckin?.some(
    (c: any) => c.checkin_type === "morning"
  );
  const hasEvening = todayCheckin?.some(
    (c: any) => c.checkin_type === "evening"
  );
  const phaseNames = ["The Foundation", "The Pressure", "The Tempering"];
  const currentPhase = profile?.current_phase || 1;
  const dayNames = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Günaydın"
      : greetingHour < 18
        ? "İyi günler"
        : "İyi akşamlar";

  return (
    <motion.div
      className="relative min-h-screen space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Notification Banner */}
      <NotificationBanner />

      {/* Background Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-500/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -right-48 h-[500px] w-[500px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-red-600/[0.04] blur-[100px]" />
      </div>

      {/* ── Welcome Header ── */}
      <motion.div variants={itemVariants} className="relative">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/40">
              {greeting}
            </p>
            <h1 className="font-display text-4xl tracking-wide text-white mt-1">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                {profile?.full_name || "Savasci"}
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-white/40">
              {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-2"
            whileHover={{ scale: 1.02 }}
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">
              <AnimatedCounter value={profile?.streak || 0} />
            </span>
            <span className="text-xs text-white/40">gun serisi</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Motivation Quote ── */}
      <motion.div variants={itemVariants}>
        <div
          className={`${glassCard} p-5`}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,69,0,0.08) 0%, rgba(255,69,0,0.02) 50%, rgba(245,158,11,0.06) 100%)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 ring-1 ring-orange-500/20">
              <Zap className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/70 mb-1.5">
                Gunun Sozleri
              </p>
              <p className="text-sm leading-relaxed text-white/70 italic">
                "{dailyMotivation}"
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Flame,
            value: profile?.streak || 0,
            label: "Gun Serisi",
            gradient: "from-orange-500 to-amber-500",
            glowColor: "rgba(249,115,22,0.15)",
            iconBg: "from-orange-500/20 to-amber-500/10",
            isNumber: true,
          },
          {
            icon: Target,
            value: currentPhase,
            label: phaseNames[currentPhase - 1],
            gradient: "from-red-500 to-orange-500",
            glowColor: "rgba(239,68,68,0.12)",
            iconBg: "from-red-500/20 to-orange-500/10",
            prefix: "Faz ",
            isNumber: false,
          },
          {
            icon: TrendingUp,
            value: currentWeek,
            label: `/ ${totalWeeks} hafta`,
            gradient: "from-emerald-400 to-green-500",
            glowColor: "rgba(52,211,153,0.12)",
            iconBg: "from-emerald-500/20 to-green-500/10",
            prefix: "Hafta ",
            isNumber: false,
          },
          {
            icon: Clock,
            value: pendingTasks.length,
            label: "Bekleyen Gorev",
            gradient: "from-violet-400 to-purple-500",
            glowColor: "rgba(139,92,246,0.12)",
            iconBg: "from-violet-500/20 to-purple-500/10",
            isNumber: true,
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group"
          >
            <div className={`${glassCard} p-5`}>
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${s.glowColor.replace("0.12", "0.6").replace("0.15", "0.6")}, transparent)`,
                }}
              />
              <div
                className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-100"
                style={{ backgroundColor: s.glowColor }}
              />
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.iconBg} ring-1 ring-white/[0.06]`}
                >
                  <s.icon
                    className={`h-5 w-5 bg-gradient-to-r ${s.gradient} bg-clip-text`}
                    style={{
                      color:
                        s.gradient.includes("orange")
                          ? "#f97316"
                          : s.gradient.includes("red")
                            ? "#ef4444"
                            : s.gradient.includes("emerald")
                              ? "#34d399"
                              : "#8b5cf6",
                    }}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {s.prefix || ""}
                    {s.isNumber ? (
                      <AnimatedCounter value={s.value as number} />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── XP & Level ── */}
      <motion.div variants={itemVariants}>
        <div className={`${glassCard} p-5`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 ring-1 ring-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-yellow-400/70">
                  Seviye {profile?.level || 1}
                </p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={profile?.xp || 0} /> <span className="text-sm font-normal text-white/30">XP</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">Sonraki seviye</p>
              <p className="text-sm font-bold text-yellow-400">
                {((profile?.level || 1) + 1) * 100} XP
              </p>
            </div>
          </div>
          {/* XP Progress bar to next level */}
          <div className="relative h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((profile?.xp || 0) % 100))}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-400/30 to-amber-400/10 blur-sm"
              style={{ width: `${Math.min(100, ((profile?.xp || 0) % 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-white/20 mt-1.5 text-right">
            {(profile?.xp || 0) % 100} / 100 XP
          </p>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-3 gap-3"
      >
        {[
          {
            to: "/check-in",
            icon: Sun,
            label: "Sabah Check-in",
            color: "#f97316",
          },
          {
            to: "/life-areas",
            icon: Compass,
            label: "Yasam Alani Gir",
            color: "#f59e0b",
          },
          {
            to: "/community",
            icon: UsersRound,
            label: "Toplulukta Paylas",
            color: "#ef4444",
          },
        ].map((action, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Link to={action.to}>
              <motion.div
                className={`${glassCard} group cursor-pointer p-5 text-center transition-colors hover:bg-white/[0.06]`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${action.color}80, transparent)`,
                  }}
                />
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${action.color}20, ${action.color}08)`,
                    boxShadow: `0 0 20px ${action.color}10`,
                  }}
                >
                  <action.icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <p className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors">
                  {action.label}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Progress Bar ── */}
      <motion.div variants={itemVariants}>
        <div className={`${glassCard} p-6`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 ring-1 ring-white/[0.06]">
                <Activity className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-sm font-medium text-white/60">
                Genel Ilerleme
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                <AnimatedCounter value={progressPercent} />
              </span>
              <span className="text-sm text-white/30">%</span>
            </div>
          </div>
          <div className="relative h-3 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-400/30 to-amber-400/10 blur-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-[10px] uppercase tracking-[0.15em]">
            <span className={`${currentPhase >= 1 ? "text-orange-400/70" : "text-white/20"}`}>
              Faz 1
            </span>
            <span className={`${currentPhase >= 2 ? "text-orange-400/70" : "text-white/20"}`}>
              Faz 2
            </span>
            <span className={`${currentPhase >= 3 ? "text-orange-400/70" : "text-white/20"}`}>
              Faz 3
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Radar Chart + Week Heatmap Row ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div variants={itemVariants}>
          <div className={`${glassCard} p-6`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-white/[0.06]">
                <Target className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-white">
                Yasam Alani Dengesi
              </h3>
            </div>
            {areaScores.some((s) => s.score > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={areaScores}>
                  <PolarGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="#f97316"
                    fill="url(#radarGradient)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient
                      id="radarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] gap-3">
                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Target className="h-7 w-7 text-white/10" />
                </div>
                <p className="text-sm text-white/30">
                  Bugun henuz veri yok
                </p>
                <Link
                  to="/life-areas"
                  className="text-xs text-orange-400/70 hover:text-orange-400 transition-colors"
                >
                  Veri girmek icin tikla
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Week Activity Heatmap + Check-in Status */}
        <motion.div variants={itemVariants}>
          <div className={`${glassCard} p-6`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10 ring-1 ring-white/[0.06]">
                <Flame className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-white">
                Haftalik Seri
              </h3>
              <span className="ml-auto text-xs font-medium text-emerald-400/70 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {weekActivity.filter(Boolean).length}/7 gun
              </span>
            </div>

            <div className="flex gap-2.5 justify-center mb-6">
              {weekActivity.map((active, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    className={`relative h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20 ring-1 ring-orange-500/30"
                        : "bg-white/[0.03] border border-white/[0.06]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-orange-500/10 blur-md" />
                    )}
                    {active ? (
                      <Flame className="h-5 w-5 text-orange-400 relative z-10" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-white/10" />
                    )}
                  </motion.div>
                  <span
                    className={`text-[10px] ${active ? "text-orange-400/70" : "text-white/20"}`}
                  >
                    {dayNames[i]}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Today's Check-in Status */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-3">
                Bugunun Check-in Durumu
              </p>
              <Link to="/check-in">
                <motion.div
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${
                    hasMorning
                      ? "bg-emerald-500/[0.06] border border-emerald-500/10"
                      : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <Sun
                      className={`h-4 w-4 ${hasMorning ? "text-emerald-400" : "text-white/20"}`}
                    />
                    <span
                      className={`text-sm ${hasMorning ? "text-emerald-400" : "text-white/50"}`}
                    >
                      Sabah
                    </span>
                  </div>
                  {hasMorning ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Tamamlandi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-white/30">
                      <span className="text-[10px]">Bekliyor</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              </Link>
              <Link to="/check-in">
                <motion.div
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${
                    hasEvening
                      ? "bg-emerald-500/[0.06] border border-emerald-500/10"
                      : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <Moon
                      className={`h-4 w-4 ${hasEvening ? "text-emerald-400" : "text-white/20"}`}
                    />
                    <span
                      className={`text-sm ${hasEvening ? "text-emerald-400" : "text-white/50"}`}
                    >
                      Aksam
                    </span>
                  </div>
                  {hasEvening ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Tamamlandi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-white/30">
                      <span className="text-[10px]">Bekliyor</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AI Summary + Pending Tasks ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {latestAI && (
          <motion.div variants={itemVariants}>
            <div
              className={`${glassCard} p-6 ${latestAI.risk_level === "high" ? "border-red-500/20" : ""}`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    latestAI.risk_level === "high"
                      ? "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)"
                      : latestAI.risk_level === "medium"
                        ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)",
                }}
              />
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/[0.06] ${
                    latestAI.risk_level === "high"
                      ? "bg-gradient-to-br from-red-500/20 to-red-600/10"
                      : latestAI.risk_level === "medium"
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10"
                        : "bg-gradient-to-br from-emerald-500/20 to-green-500/10"
                  }`}
                >
                  <Brain
                    className={`h-4 w-4 ${
                      latestAI.risk_level === "high"
                        ? "text-red-400"
                        : latestAI.risk_level === "medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }`}
                  />
                </div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  AI Analiz Ozeti
                </h3>
                <span
                  className={`ml-auto text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                    latestAI.risk_level === "high"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : latestAI.risk_level === "medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {latestAI.risk_level === "high"
                    ? "Yuksek Risk"
                    : latestAI.risk_level === "medium"
                      ? "Orta"
                      : "Dusuk"}
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                {latestAI.summary}
              </p>
              <Link
                to="/progress"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-orange-400/70 hover:text-orange-400 transition-colors group"
              >
                Detaylari Gor
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <div className={`${glassCard} p-6`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/10 ring-1 ring-white/[0.06]">
                  <Clock className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  Yaklasan Gorevler
                </h3>
              </div>
              <Link
                to="/tasks"
                className="text-[10px] uppercase tracking-[0.1em] text-orange-400/60 hover:text-orange-400 transition-colors"
              >
                Tumu
              </Link>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400/40" />
                </div>
                <p className="text-sm text-white/30">Bekleyen gorev yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 4).map((st, idx) => (
                  <motion.div
                    key={st.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 shrink-0" />
                    <span className="text-sm text-white/60 flex-1 truncate group-hover:text-white/80 transition-colors">
                      {st.tasks?.title || "Gorev"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Activity ── */}
      <AnimatePresence>
        {recentActivity.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className={`${glassCard} p-6`}>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.06]">
                  <Activity className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  Son Aktiviteler
                </h3>
              </div>
              <div className="space-y-1">
                {recentActivity.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.04 }}
                    className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        a.checkin_type === "morning"
                          ? "bg-amber-500/10"
                          : "bg-indigo-500/10"
                      }`}
                    >
                      {a.checkin_type === "morning" ? (
                        <Sun className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <Moon className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                        {a.checkin_type === "morning" ? "Sabah" : "Aksam"}{" "}
                        Check-in
                      </span>
                    </div>
                    <span className="text-[11px] text-white/25 shrink-0">
                      {format(new Date(a.created_at), "d MMM HH:mm", {
                        locale: tr,
                      })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hesap Ortagi (Buddy System) ── */}
      <motion.div variants={itemVariants}>
        <div className={`${glassCard} p-6`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 ring-1 ring-orange-500/20">
              <UserPlus className="h-4 w-4 text-orange-400" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-white">
              Hesap Ortagi
            </h3>
          </div>

          {/* Active buddy */}
          {buddyPair && buddyPair.status === "active" && buddyProfile && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/[0.06] to-amber-500/[0.03] border border-orange-500/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-display text-lg shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  {buddyProfile.avatar_url ? (
                    <img src={buddyProfile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    buddyProfile.full_name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{buddyProfile.full_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-orange-400/70">
                      <Flame className="h-3 w-3" /> {buddyProfile.streak || 0} gun serisi
                    </span>
                    <span className="text-[10px] text-white/25">
                      Hafta {buddyProfile.current_week || 1}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/messages"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    <Send className="h-3 w-3" /> Mesaj
                  </Link>
                </div>
              </div>
              <button
                onClick={() => endBuddy(buddyPair.id)}
                className="text-[10px] text-white/20 hover:text-red-400/60 transition-colors"
              >
                Buddy'yi sonlandir
              </button>
            </div>
          )}

          {/* Pending incoming request */}
          {!buddyPair && pendingBuddyRequest && pendingBuddyRequest.user_b === user?.id && pendingRequesterProfile && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-display text-sm">
                  {pendingRequesterProfile.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">
                    <span className="font-medium text-white">{pendingRequesterProfile.full_name}</span>{" "}
                    seni buddy olarak secti
                  </p>
                  <p className="text-[10px] text-amber-400/60 mt-0.5 uppercase tracking-wider">Bekleyen istek</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => acceptBuddyRequest(pendingBuddyRequest.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Kabul Et
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => rejectBuddyRequest(pendingBuddyRequest.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <UserX className="h-3.5 w-3.5" /> Reddet
                </motion.button>
              </div>
            </div>
          )}

          {/* Pending outgoing request */}
          {!buddyPair && pendingBuddyRequest && pendingBuddyRequest.user_a === user?.id && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-400/60" />
              </div>
              <div>
                <p className="text-sm text-white/50">Buddy istegin gonderildi</p>
                <p className="text-[10px] text-white/20 mt-0.5">Karsi tarafin kabul etmesini bekliyorsun</p>
              </div>
            </div>
          )}

          {/* No buddy - search */}
          {!buddyPair && !pendingBuddyRequest && (
            <div className="space-y-3">
              <p className="text-sm text-white/40">
                Bir hesap ortagi sec, birbirinizi motive edin.
              </p>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  value={buddySearchQuery}
                  onChange={(e) => searchBuddies(e.target.value)}
                  placeholder="Isim ile ara..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/20 transition-all"
                />
                {buddySearchQuery && (
                  <button
                    onClick={() => { setBuddySearchQuery(""); setBuddySearchResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {buddySearching && (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {buddySearchResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {buddySearchResults.map((p) => (
                    <motion.div
                      key={p.user_id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-white/40 text-sm font-display">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          p.full_name?.charAt(0)?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{p.full_name}</p>
                        <span className="flex items-center gap-1 text-[10px] text-orange-400/50">
                          <Flame className="h-2.5 w-2.5" /> {p.streak || 0}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={buddySending}
                        onClick={() => sendBuddyRequest(p.user_id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="h-3 w-3" /> Istek Gonder
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
              {buddySearchQuery.length >= 2 && !buddySearching && buddySearchResults.length === 0 && (
                <p className="text-xs text-white/20 text-center py-2">Sonuc bulunamadi</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Mentor Message ── */}
      <AnimatePresence>
        {latestMessage && (
          <motion.div variants={itemVariants}>
            <div className={`${glassCard} p-6`}>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-amber-500/10 ring-1 ring-white/[0.06]">
                  <MessageSquare className="h-4 w-4 text-orange-400" />
                </div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  Son Mentor Mesaji
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                {latestMessage.content}
              </p>
              <Link
                to="/messages"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-orange-400/70 hover:text-orange-400 transition-colors group"
              >
                Mesajlara Git
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
