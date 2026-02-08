import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, CheckCircle2, Calendar, Trophy, Star, Camera, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { motion } from "framer-motion";

const AREA_LABELS: Record<string, string> = {
  physical: "Fiziksel", mental: "Zihinsel", style: "Stil",
  environment: "Çevre", social: "Sosyal", career: "Kariyer", finance: "Finans",
};

const ACHIEVEMENTS = [
  { key: "streak_7", label: "7 Gün Serisi", icon: Flame, desc: "7 gün ard arda check-in", color: "text-orange-400" },
  { key: "streak_30", label: "30 Gün Serisi", icon: Flame, desc: "30 gün ard arda check-in", color: "text-red-400" },
  { key: "checkins_100", label: "100 Check-in", icon: CheckCircle2, desc: "Toplam 100 check-in tamamla", color: "text-green-400" },
  { key: "all_areas", label: "Tüm Alanlar", icon: Star, desc: "Bir günde 7 alanı da doldur", color: "text-yellow-400" },
  { key: "first_photo", label: "İlk Fotoğraf", icon: Camera, desc: "İlk fotoğraf kanıtını yükle", color: "text-pink-400" },
  { key: "task_master", label: "Görev Ustası", icon: Trophy, desc: "10 görevi tamamla", color: "text-purple-400" },
];

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
    { name: "The Foundation", weeks: "1-8", active: (profile?.current_phase || 1) >= 1 },
    { name: "The Pressure", weeks: "9-16", active: (profile?.current_phase || 1) >= 2 },
    { name: "The Tempering", weeks: "17-24", active: (profile?.current_phase || 1) >= 3 },
  ];
  const energyData = checkins.filter(c => c.energy_rating).map(c => ({
    date: c.checkin_date.slice(5), energy: c.energy_rating, sleep: c.sleep_rating,
  }));
  const uniqueDays = new Set(checkins.map(c => c.checkin_date)).size;
  const checkinRate = Math.min(100, Math.round((uniqueDays / 14) * 100));

  return (
    <div className="space-y-6">
      {/* 24 Week Progress */}
      <Card className="bg-card border-border/30 p-6">
        <h3 className="font-display text-xl text-foreground mb-4">24 Haftalık İlerleme</h3>
        <Progress value={progressPercent} className="h-3 bg-secondary mb-3" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Hafta {currentWeek}/{totalWeeks}</span>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>
      </Card>

      {/* Phase Timeline */}
      <div className="grid grid-cols-3 gap-3">
        {phases.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className={`border p-4 text-center ${p.active ? "bg-primary/10 border-primary/30" : "bg-card border-border/30"}`}>
              <p className={`font-display text-lg ${p.active ? "text-primary" : "text-muted-foreground"}`}>{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Hafta {p.weeks}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, value: profile?.streak || 0, label: "Gün Serisi", color: "text-orange-400" },
          { icon: CheckCircle2, value: `${taskStats.completed}/${taskStats.total}`, label: "Görev Tamamlama", color: "text-green-400" },
          { icon: Calendar, value: `${checkinRate}%`, label: "Check-in Oranı", color: "text-primary" },
          { icon: Zap, value: energyData.length > 0 ? energyData[energyData.length - 1].energy : "-", label: "Son Enerji", color: "text-yellow-400" },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border/30 p-4 text-center">
            <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Radar Chart - Life Area Balance */}
      {areaScores.some(s => s.score > 0) && (
        <Card className="bg-card border-border/30 p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Yaşam Alanı Dengesi (Son 7 Gün)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={areaScores}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="area" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Achievements */}
      <Card className="bg-card border-border/30 p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Başarı Rozetleri
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedAchievements.has(a.key);
            return (
              <div key={a.key} className={`p-3 rounded-lg text-center transition ${unlocked ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 opacity-50"}`}>
                <a.icon className={`w-6 h-6 mx-auto mb-1 ${unlocked ? a.color : "text-muted-foreground"}`} />
                <p className={`text-xs font-medium ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Energy Trend */}
      {energyData.length > 0 && (
        <Card className="bg-card border-border/30 p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Enerji & Uyku Trendi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={energyData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Area type="monotone" dataKey="energy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Enerji" />
              <Area type="monotone" dataKey="sleep" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} name="Uyku" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;
