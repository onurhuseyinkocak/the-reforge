import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, CheckCircle2, Clock, MessageSquare, Target, Sun, Compass, UsersRound, Brain, AlertCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const MOTIVATIONS = [
  "Disiplin, motivasyonun bittiği yerde başlar. 🔥",
  "Bugün yaptığın seçimler, yarının seni yaratır.",
  "Güçlü bir adam, kolay zamanlardan değil, zor günlerden doğar.",
  "Her gün %1 daha iyi ol. 365 gün sonra 37 kat daha iyi olursun.",
  "Rahatlık bölgesi güzel ama orada hiçbir şey yetişmez.",
  "Seni izleyen kimse olmasa bile aynı disiplini koru.",
  "Başarı bir alışkanlıktır. Mükemmellik tekrardır.",
  "Bugün vazgeçersen, dünkü acıların boşa gitmiş olur.",
  "Asıl güç, yapmak istemediğinde yapabilmektir.",
  "Ateşten geçmeyen çelik, kılıç olamaz. ⚔️",
];

const AREA_LABELS: Record<string, string> = {
  physical: "Fiziksel", mental: "Zihinsel", style: "Stil",
  environment: "Çevre", social: "Sosyal", career: "Kariyer", finance: "Finans",
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const [areaScores, setAreaScores] = useState<{ area: string; score: number }[]>([]);
  const [weekActivity, setWeekActivity] = useState<boolean[]>([]);
  const [latestAI, setLatestAI] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const dailyMotivation = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");

    supabase.from("checkins").select("*").eq("user_id", user.id).eq("checkin_date", today).then(({ data }) => setTodayCheckin(data));
    supabase.from("student_tasks").select("*, tasks(*)").eq("user_id", user.id).in("status", ["pending", "in_progress"]).limit(5).then(({ data }) => setPendingTasks(data || []));
    supabase.from("messages").select("*").eq("receiver_id", user.id).order("created_at", { ascending: false }).limit(1).then(({ data }) => setLatestMessage(data?.[0]));

    // Life area scores for radar
    supabase.from("life_area_entries").select("area, metrics").eq("user_id", user.id).eq("entry_date", today).then(({ data }) => {
      const scores = Object.keys(AREA_LABELS).map(key => {
        const entry = (data || []).find(d => d.area === key);
        if (!entry) return { area: AREA_LABELS[key], score: 0 };
        const m = entry.metrics as Record<string, any> || {};
        const nums = Object.values(m).filter(v => typeof v === "number") as number[];
        const avg = nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
        return { area: AREA_LABELS[key], score: Math.min(avg, 10) };
      });
      setAreaScores(scores);
    });

    // Week activity heatmap (last 7 days)
    const weekDates = Array.from({ length: 7 }, (_, i) => format(new Date(Date.now() - (6 - i) * 86400000), "yyyy-MM-dd"));
    supabase.from("checkins").select("checkin_date").eq("user_id", user.id).in("checkin_date", weekDates).then(({ data }) => {
      const dates = new Set((data || []).map(d => d.checkin_date));
      setWeekActivity(weekDates.map(d => dates.has(d)));
    });

    // Latest AI report
    supabase.from("ai_analysis_reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).then(({ data }) => setLatestAI(data?.[0]));

    // Recent activity
    supabase.from("checkins").select("checkin_type, checkin_date, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setRecentActivity(data || []));
  }, [user]);

  const totalWeeks = 24;
  const currentWeek = profile?.current_week || 1;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);
  const hasMorning = todayCheckin?.some((c: any) => c.checkin_type === "morning");
  const hasEvening = todayCheckin?.some((c: any) => c.checkin_type === "evening");
  const phaseNames = ["The Foundation", "The Pressure", "The Tempering"];
  const currentPhase = profile?.current_phase || 1;
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="space-y-6">
      {/* Welcome + Motivation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-2xl text-foreground tracking-wide">
          Hoş geldin, <span className="text-primary">{profile?.full_name || "Savaşçı"}</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}</p>
      </motion.div>

      {/* Motivation Box */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-r from-primary/10 via-card to-primary/5 border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground/90 italic leading-relaxed">{dailyMotivation}</p>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, value: profile?.streak || 0, label: "Gün Serisi 🔥", color: "bg-orange-500/20", iconColor: "text-orange-400" },
          { icon: Target, value: `Faz ${currentPhase}`, label: phaseNames[currentPhase - 1], color: "bg-primary/20", iconColor: "text-primary" },
          { icon: CheckCircle2, value: `Hafta ${currentWeek}`, label: `/ ${totalWeeks} hafta`, color: "bg-green-500/20", iconColor: "text-green-400" },
          { icon: Clock, value: pendingTasks.length, label: "Bekleyen Görev", color: "bg-purple-500/20", iconColor: "text-purple-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card border-border/30 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/check-in">
          <Card className="bg-card border-border/30 p-4 hover:border-primary/30 transition text-center group cursor-pointer">
            <Sun className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-foreground font-medium">Sabah Check-in</p>
          </Card>
        </Link>
        <Link to="/life-areas">
          <Card className="bg-card border-border/30 p-4 hover:border-primary/30 transition text-center group cursor-pointer">
            <Compass className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-foreground font-medium">Yaşam Alanı Gir</p>
          </Card>
        </Link>
        <Link to="/community">
          <Card className="bg-card border-border/30 p-4 hover:border-primary/30 transition text-center group cursor-pointer">
            <UsersRound className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-foreground font-medium">Toplulukta Paylaş</p>
          </Card>
        </Link>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-foreground/70">Genel İlerleme</p>
          <p className="text-sm text-primary font-medium">{progressPercent}%</p>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Faz 1</span><span>Faz 2</span><span>Faz 3</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="bg-card border-border/30 p-5">
          <h3 className="font-display text-lg text-foreground mb-2">Yaşam Alanı Dengesi</h3>
          {areaScores.some(s => s.score > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={areaScores}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-muted-foreground">Bugün henüz veri yok</p>
            </div>
          )}
        </Card>

        {/* Week Activity Heatmap */}
        <Card className="bg-card border-border/30 p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Haftalık Seri</h3>
          <div className="flex gap-2 justify-center mb-4">
            {weekActivity.map((active, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${active ? "bg-green-500/30 ring-1 ring-green-500/50" : "bg-secondary"}`}>
                  {active ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-muted-foreground/30" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{dayNames[i]}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">{weekActivity.filter(Boolean).length}/7 gün aktif</span>
          </div>

          {/* Today's Check-in Status */}
          <div className="mt-4 space-y-2">
            <Link to="/check-in" className="flex items-center justify-between p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${hasMorning ? "text-green-400" : "text-muted-foreground"}`} />
                <span className="text-xs text-foreground">Sabah</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${hasMorning ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {hasMorning ? "✓" : "Bekliyor"}
              </span>
            </Link>
            <Link to="/check-in" className="flex items-center justify-between p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${hasEvening ? "text-green-400" : "text-muted-foreground"}`} />
                <span className="text-xs text-foreground">Akşam</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${hasEvening ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {hasEvening ? "✓" : "Bekliyor"}
              </span>
            </Link>
          </div>
        </Card>
      </div>

      {/* AI Summary + Tasks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {latestAI && (
          <Card className={`bg-card border-border/30 p-5 ${latestAI.risk_level === "high" ? "border-destructive/30" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg text-foreground">AI Analiz Özeti</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded ml-auto ${latestAI.risk_level === "high" ? "bg-destructive/20 text-destructive" : latestAI.risk_level === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                {latestAI.risk_level === "high" ? "Yüksek Risk" : latestAI.risk_level === "medium" ? "Orta" : "Düşük"}
              </span>
            </div>
            <p className="text-sm text-foreground/80 line-clamp-3">{latestAI.summary}</p>
            <Link to="/progress" className="text-xs text-primary hover:underline mt-2 inline-block">Detayları Gör →</Link>
          </Card>
        )}

        <Card className="bg-card border-border/30 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg text-foreground">Yaklaşan Görevler</h3>
            <Link to="/tasks" className="text-xs text-primary hover:underline">Tümü</Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bekleyen görev yok 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map(st => (
                <div key={st.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-foreground flex-1 truncate">{st.tasks?.title || "Görev"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="bg-card border-border/30 p-5">
          <h3 className="font-display text-lg text-foreground mb-3">Son Aktiviteler</h3>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-foreground">{a.checkin_type === "morning" ? "☀️ Sabah" : "🌙 Akşam"} Check-in</span>
                <span className="text-muted-foreground text-xs ml-auto">{format(new Date(a.created_at), "d MMM HH:mm", { locale: tr })}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mentor Message */}
      {latestMessage && (
        <Card className="bg-card border-border/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Son Mentor Mesajı</h3>
          </div>
          <p className="text-sm text-foreground/70 line-clamp-2">{latestMessage.content}</p>
          <Link to="/messages" className="text-xs text-primary hover:underline mt-2 inline-block">Mesajlara Git →</Link>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
