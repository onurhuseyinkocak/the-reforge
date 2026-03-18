import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, CheckCircle2, Calendar, Trophy, Star, Camera, Zap, Target, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { motion } from "framer-motion";

const AREA_LABELS: Record<string, string> = {
  physical: "Fiziksel", mental: "Zihinsel", style: "Stil",
  environment: "Çevre", social: "Sosyal", career: "Kariyer", finance: "Finans",
};

const ACHIEVEMENTS = [
  { key: "streak_7", label: "7 Gün Serisi", icon: Flame, desc: "7 gün ard arda check-in", color: "text-orange-400", bg: "from-orange-500/20 to-orange-600/5", border: "border-orange-500/20", glow: "#f97316" },
  { key: "streak_30", label: "30 Gün Serisi", icon: Flame, desc: "30 gün ard arda check-in", color: "text-red-400", bg: "from-red-500/20 to-red-600/5", border: "border-red-500/20", glow: "#ef4444" },
  { key: "checkins_100", label: "100 Check-in", icon: CheckCircle2, desc: "Toplam 100 check-in tamamla", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", glow: "#10b981" },
  { key: "all_areas", label: "Tüm Alanlar", icon: Star, desc: "Bir günde 7 alanı da doldur", color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/5", border: "border-yellow-500/20", glow: "#eab308" },
  { key: "first_photo", label: "İlk Fotoğraf", icon: Camera, desc: "İlk fotoğraf kanıtını yükle", color: "text-pink-400", bg: "from-pink-500/20 to-pink-600/5", border: "border-pink-500/20", glow: "#ec4899" },
  { key: "task_master", label: "Görev Ustası", icon: Trophy, desc: "10 görevi tamamla", color: "text-purple-400", bg: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20", glow: "#a855f7" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function AnimatedCounter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : parseInt(String(value)) || 0;
    if (isNaN(target)) { setDisplay(0); return; }
    const start = ref.current;
    const diff = target - start;
    const duration = 800;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}{suffix}</>;
}

const ProgressPage = () => {
  const { user, profile } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });
  const [areaScores, setAreaScores] = useState<{ area: string; score: number }[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: true }).limit(60).then(({ data }) => setCheckins(data || []));
    supabase.from("student_tasks").select("status").eq("user_id", user.id).then(({ data }) => {
      const total = data?.length || 0;
      const completed = data?.filter(t => t.status === "approved").length || 0;
      setTaskStats({ total, completed });
    });
    supabase.from("achievements").select("achievement_key").eq("user_id", user.id).then(({ data }) => {
      setUnlockedAchievements(new Set((data || []).map(a => a.achievement_key)));
    });

    // Area scores from last 7 days
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    supabase.from("life_area_entries").select("area, metrics").eq("user_id", user.id).gte("entry_date", weekAgo).then(({ data }) => {
      const areaAvgs: Record<string, number[]> = {};
      (data || []).forEach(d => {
        const m = d.metrics as Record<string, any> || {};
        const nums = Object.values(m).filter(v => typeof v === "number") as number[];
        if (nums.length > 0) {
          if (!areaAvgs[d.area]) areaAvgs[d.area] = [];
          areaAvgs[d.area].push(nums.reduce((a, b) => a + b, 0) / nums.length);
        }
      });
      setAreaScores(Object.keys(AREA_LABELS).map(key => ({
        area: AREA_LABELS[key],
        score: areaAvgs[key] ? Math.round(areaAvgs[key].reduce((a, b) => a + b, 0) / areaAvgs[key].length) : 0,
      })));
    });
  }, [user]);

  const totalWeeks = 24;
  const currentWeek = profile?.current_week || 1;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);
  const phases = [
    { name: "The Foundation", weeks: "1-8", active: (profile?.current_phase || 1) >= 1, icon: "🔨", color: "#10b981", phaseNum: 1 },
    { name: "The Pressure", weeks: "9-16", active: (profile?.current_phase || 1) >= 2, icon: "🔥", color: "#f97316", phaseNum: 2 },
    { name: "The Tempering", weeks: "17-24", active: (profile?.current_phase || 1) >= 3, icon: "⚔️", color: "#ef4444", phaseNum: 3 },
  ];
  const currentPhase = profile?.current_phase || 1;
  const energyData = checkins.filter(c => c.energy_rating).map(c => ({
    date: c.checkin_date.slice(5), energy: c.energy_rating, sleep: c.sleep_rating,
  }));
  const uniqueDays = new Set(checkins.map(c => c.checkin_date)).size;
  const checkinRate = Math.min(100, Math.round((uniqueDays / 14) * 100));

  const statsData = [
    { icon: Flame, value: profile?.streak || 0, label: "Gün Serisi", color: "#f97316", isNumber: true },
    { icon: CheckCircle2, value: `${taskStats.completed}/${taskStats.total}`, label: "Görev Tamamlama", color: "#10b981", isNumber: false },
    { icon: Calendar, value: checkinRate, label: "Check-in Oranı", color: "#FF4500", isNumber: true, suffix: "%" },
    { icon: Zap, value: energyData.length > 0 ? energyData[energyData.length - 1].energy : 0, label: "Son Enerji", color: "#eab308", isNumber: true },
  ];

  return (
    <div className="relative min-h-screen pb-8">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 -left-40 w-80 h-80 bg-[#FF4500]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-[#FF4500]/[0.02] rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* 24 Week Progress - Hero Card */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#FF4500]/[0.06] rounded-full blur-[80px]" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-600/[0.04] rounded-full blur-[60px]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF4500]/20 to-orange-600/10 flex items-center justify-center border border-[#FF4500]/20">
                      <Target className="w-5 h-5 text-[#FF4500]" />
                    </div>
                    <div className="absolute -inset-1 bg-[#FF4500]/10 rounded-xl blur-md -z-10" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-white tracking-wide">24 Haftalık İlerleme</h3>
                    <p className="text-xs text-white/30 mt-0.5">Forge dönüşüm yolculuğun</p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.span
                    className="text-3xl font-bold bg-gradient-to-r from-[#FF4500] to-orange-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <AnimatedCounter value={progressPercent} suffix="%" />
                  </motion.span>
                  <p className="text-[11px] text-white/30 mt-0.5">Hafta {currentWeek}/{totalWeeks}</p>
                </div>
              </div>

              {/* Custom progress bar */}
              <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF4500] to-orange-500"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF4500]/50 to-orange-500/50 blur-sm"
                />
              </div>

              {/* Week markers */}
              <div className="flex justify-between mt-2 px-0.5">
                {[1, 8, 16, 24].map(w => (
                  <span key={w} className={`text-[10px] ${currentWeek >= w ? "text-[#FF4500]/60" : "text-white/15"}`}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phase Timeline */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {phases.map((p, i) => {
            const isCurrentPhase = currentPhase === p.phaseNum;
            const isPast = currentPhase > p.phaseNum;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 text-center transition-all duration-300 ${
                  isCurrentPhase
                    ? "bg-white/[0.06] border border-white/[0.1]"
                    : p.active
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "bg-white/[0.02] border border-white/[0.04]"
                }`}>
                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${p.color}${isCurrentPhase ? "cc" : "40"}, transparent)`,
                      opacity: p.active ? 1 : 0.3,
                    }}
                  />

                  {/* Active glow */}
                  {isCurrentPhase && (
                    <>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-16 rounded-full blur-[30px]" style={{ backgroundColor: `${p.color}20` }} />
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-12 rounded-full blur-[20px]"
                        style={{ backgroundColor: `${p.color}30` }}
                      />
                    </>
                  )}

                  <div className="relative">
                    <span className="text-xl mb-2 block">{p.icon}</span>
                    <p className={`font-display text-base tracking-wide ${
                      isCurrentPhase ? "text-white" : p.active ? "text-white/70" : "text-white/30"
                    }`}>
                      {p.name}
                    </p>
                    <p className={`text-[11px] mt-1 ${isCurrentPhase ? "text-white/40" : "text-white/20"}`}>
                      Hafta {p.weeks}
                    </p>
                    {isCurrentPhase && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                        style={{
                          color: p.color,
                          backgroundColor: `${p.color}15`,
                          border: `1px solid ${p.color}25`,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: p.color }} />
                        Aktif
                      </motion.div>
                    )}
                    {isPast && (
                      <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/15">
                        <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsData.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-5 text-center transition-all duration-300 group-hover:bg-white/[0.05] group-hover:border-white/[0.1]">
                <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-12 rounded-full blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${s.color}15` }} />

                <div className="relative">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {s.isNumber ? <AnimatedCounter value={s.value as number} suffix={s.suffix || ""} /> : s.value}
                  </p>
                  <p className="text-[11px] text-white/30">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Radar Chart - Life Area Balance */}
        {areaScores.some(s => s.score > 0) && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-[#FF4500]/[0.04] rounded-full blur-[80px]" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#FF4500]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-white tracking-wide">Yaşam Alanı Dengesi</h3>
                    <p className="text-[11px] text-white/30">Son 7 gün</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={areaScores}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4500" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#FF4500" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Radar
                      dataKey="score"
                      stroke="#FF4500"
                      fill="url(#radarGradient)"
                      fillOpacity={1}
                      strokeWidth={2}
                      dot={{ fill: "#FF4500", strokeWidth: 0, r: 4 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievement Badges */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <div className="absolute -top-16 right-10 w-40 h-32 bg-yellow-500/[0.04] rounded-full blur-[60px]" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-white tracking-wide">Başarı Rozetleri</h3>
                  <p className="text-[11px] text-white/30">
                    {unlockedAchievements.size}/{ACHIEVEMENTS.length} rozet kazanıldı
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((a, i) => {
                  const unlocked = unlockedAchievements.has(a.key);
                  return (
                    <motion.div
                      key={a.key}
                      whileHover={unlocked ? { y: -3, scale: 1.03 } : {}}
                      transition={{ duration: 0.2 }}
                      className="relative group"
                    >
                      <div className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                        unlocked
                          ? `bg-gradient-to-b ${a.bg} border ${a.border}`
                          : "bg-white/[0.02] border border-white/[0.04] opacity-50"
                      }`}>
                        {/* Glow effect for unlocked */}
                        {unlocked && (
                          <>
                            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${a.glow}50, transparent)` }} />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-8 rounded-full blur-[16px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${a.glow}30` }} />
                          </>
                        )}

                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                            unlocked ? "" : "bg-white/[0.04]"
                          }`} style={unlocked ? { backgroundColor: `${a.glow}15`, border: `1px solid ${a.glow}25` } : {}}>
                            <a.icon className={`w-5 h-5 ${unlocked ? a.color : "text-white/20"}`} />
                          </div>
                          <p className={`text-xs font-medium ${unlocked ? "text-white" : "text-white/30"}`}>
                            {a.label}
                          </p>
                          <p className={`text-[10px] mt-0.5 leading-snug ${unlocked ? "text-white/40" : "text-white/15"}`}>
                            {a.desc}
                          </p>
                          {unlocked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: i * 0.05 }}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${a.glow}20`, border: `1px solid ${a.glow}30` }}
                            >
                              <CheckCircle2 className="w-3 h-3" style={{ color: a.glow }} />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Energy & Sleep Trend */}
        {energyData.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              <div className="absolute -bottom-16 -right-16 w-48 h-40 bg-[#FF4500]/[0.04] rounded-full blur-[70px]" />
              <div className="absolute -top-12 -left-12 w-36 h-32 bg-amber-500/[0.03] rounded-full blur-[50px]" />

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white tracking-wide">Enerji & Uyku Trendi</h3>
                      <p className="text-[11px] text-white/30">Son {energyData.length} kayıt</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#FF4500]" />
                      <span className="text-[10px] text-white/40">Enerji</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] text-white/40">Uyku</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4500" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.15)"
                      fontSize={11}
                      tick={{ fill: "rgba(255,255,255,0.3)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      stroke="rgba(255,255,255,0.15)"
                      fontSize={11}
                      tick={{ fill: "rgba(255,255,255,0.3)" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,10,10,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        fontSize: 12,
                        padding: "8px 12px",
                      }}
                      cursor={{ stroke: "rgba(255,255,255,0.06)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#FF4500"
                      fill="url(#energyGradient)"
                      strokeWidth={2.5}
                      name="Enerji"
                      dot={false}
                      activeDot={{ fill: "#FF4500", strokeWidth: 0, r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#f59e0b"
                      fill="url(#sleepGradient)"
                      strokeWidth={2}
                      name="Uyku"
                      dot={false}
                      activeDot={{ fill: "#f59e0b", strokeWidth: 0, r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressPage;
