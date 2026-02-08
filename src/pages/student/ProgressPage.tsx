import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ProgressPage = () => {
  const { user, profile } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: true }).limit(60).then(({ data }) => {
      setCheckins(data || []);
    });
    supabase.from("student_tasks").select("status").eq("user_id", user.id).then(({ data }) => {
      const total = data?.length || 0;
      const completed = data?.filter(t => t.status === "approved").length || 0;
      setTaskStats({ total, completed });
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
      <Card className="bg-card border-border/30 p-6">
        <h3 className="font-display text-xl text-foreground mb-4">24 Haftalık İlerleme</h3>
        <Progress value={progressPercent} className="h-3 bg-secondary mb-3" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Hafta {currentWeek}/{totalWeeks}</span>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {phases.map((p, i) => (
          <Card key={i} className={`border p-4 text-center ${p.active ? "bg-primary/10 border-primary/30" : "bg-card border-border/30"}`}>
            <p className={`font-display text-lg ${p.active ? "text-primary" : "text-muted-foreground"}`}>{p.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Hafta {p.weeks}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/30 p-4 text-center">
          <Flame className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{profile?.streak || 0}</p>
          <p className="text-xs text-muted-foreground">Gün Serisi</p>
        </Card>
        <Card className="bg-card border-border/30 p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{taskStats.completed}/{taskStats.total}</p>
          <p className="text-xs text-muted-foreground">Görev Tamamlama</p>
        </Card>
        <Card className="bg-card border-border/30 p-4 text-center">
          <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{checkinRate}%</p>
          <p className="text-xs text-muted-foreground">Check-in Oranı</p>
        </Card>
        <Card className="bg-card border-border/30 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-ember-glow mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{energyData.length > 0 ? energyData[energyData.length - 1].energy : "-"}</p>
          <p className="text-xs text-muted-foreground">Son Enerji</p>
        </Card>
      </div>

      {energyData.length > 0 && (
        <Card className="bg-card border-border/30 p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Enerji & Uyku Trendi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={energyData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Area type="monotone" dataKey="energy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Enerji" />
              <Area type="monotone" dataKey="sleep" stroke="hsl(var(--ember-glow))" fill="hsl(var(--ember-glow))" fillOpacity={0.1} strokeWidth={2} name="Uyku" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;
